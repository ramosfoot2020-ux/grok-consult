import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { LANGCHAIN_MODEL } from '@src/langchain/langchain.provider';
import {
  SummaryPointDto,
  SummaryWithCitationsDto,
} from '@src/summarization/dto/responses/summary.responses.dto';
import { SegmentDto, TranscriptionDto } from '@src/summarization/dto/transcription.dto';
import { TokenUsageCallbackHandler } from '@src/langchain/token-usage-callback';
import { TemplateEnum } from '@src/summarization/enums/template.enum';
import {
  reducePrompt,
  reducePromptStreaming,
  TEMPLATE_REGISTRY,
} from '@src/summarization/registry/summarization.registry';
import { LocaleEnum } from '@src/common/enums/locale.enum';
import { errorMessages } from '@src/common/error-messages';

type MapChainInput = { text: string; segments: SegmentDto[]; locale_instruction: string };
type ReduceChainInput = { summaries_text: string; locale_instruction: string };
type ChainOutput = Record<string, SummaryPointDto[]>;

@Injectable()
export class SummarizationService {
  private readonly mapChainCache = new Map<
    TemplateEnum,
    RunnableSequence<MapChainInput, ChainOutput>
  >();
  private readonly reduceChainCache = new Map<
    TemplateEnum,
    RunnableSequence<ReduceChainInput, ChainOutput>
  >();
  private readonly logger = new Logger(SummarizationService.name);

  constructor(@Inject(LANGCHAIN_MODEL) private model: ChatOpenAI) {}

  async generateCitedSummary(transcriptionDto: TranscriptionDto): Promise<SummaryWithCitationsDto> {
    const { segments, locale = LocaleEnum.EN, template = TemplateEnum.DEMO } = transcriptionDto;

    if (!segments || segments.length === 0) {
      return this.getEmptyResponseForTemplate(template);
    }

    const sortedSegments = [...segments].sort((a, b) => a.start_ms - b.start_ms);
    const fullTextWithIds = sortedSegments
      .map((seg) => `[${seg.start_ms}]: ${seg.text}`)
      .join('\n');

    const localeInstruction = this.getLocaleInstruction(locale);
    const chain = this.getMapChain(template);
    const tokenUsageCallback = new TokenUsageCallbackHandler();

    const result = await chain.invoke(
      { text: fullTextWithIds, segments: sortedSegments, locale_instruction: localeInstruction },
      { callbacks: [tokenUsageCallback] },
    );

    return {
      summary: result,
      usage: {
        promptTokens: tokenUsageCallback.promptTokens,
        completionTokens: tokenUsageCallback.completionTokens,
        totalTokens: tokenUsageCallback.totalTokens,
      },
    };
  }

  async combineSummaries(
    summaries: SummaryWithCitationsDto[],
    locale: LocaleEnum,
    template: TemplateEnum,
  ): Promise<SummaryWithCitationsDto> {
    if (!summaries || summaries.length === 0) {
      return this.getEmptyResponseForTemplate(template);
    }
    if (summaries.length === 1 && summaries[0]) {
      return summaries[0];
    }

    const combinedResult = await this._reduceCombineSummaries(summaries, locale, template);

    const totalUsage = {
      promptTokens:
        summaries.reduce((acc, s) => acc + (s.usage?.promptTokens || 0), 0) +
        (combinedResult.usage?.promptTokens || 0),
      completionTokens:
        summaries.reduce((acc, s) => acc + (s.usage?.completionTokens || 0), 0) +
        (combinedResult.usage?.completionTokens || 0),
      totalTokens:
        summaries.reduce((acc, s) => acc + (s.usage?.totalTokens || 0), 0) +
        (combinedResult.usage?.totalTokens || 0),
    };

    return {
      summary: combinedResult.summary,
      usage: totalUsage,
    };
  }

  async *streamCombinedSummaries(
    summaries: SummaryWithCitationsDto[],
    locale: LocaleEnum,
    template: TemplateEnum,
  ): AsyncGenerator<string> {
    this.logger.debug(`[STREAM] Starting stream reduction for ${summaries.length} summaries.`);
    if (!summaries || summaries.length <= 1) {
      this.logger.debug('[STREAM] No summaries to reduce, ending stream.');
      return;
    }
    const summariesAsText = summaries
      .map(
        (s, index) =>
          `--- SUMMARY FROM SOURCE ${index + 1} ---\n${JSON.stringify(s.summary, null, 2)}`,
      )
      .join('\n\n');

    const localeInstruction = this.getLocaleInstruction(locale);

    const reduceChain = this.getStreamingReduceChain(template);
    const tokenUsageCallback = new TokenUsageCallbackHandler();

    this.logger.debug('[STREAM] Calling chain.stream()...');

    const stream = await reduceChain.stream(
      { summaries_text: summariesAsText, locale_instruction: localeInstruction },
      { callbacks: [tokenUsageCallback] },
    );

    for await (const chunk of stream) {
      this.logger.log(`[STREAM] Yielding chunk: ${chunk.replace(/\n/g, ' ')}`);
      yield chunk;
    }

    this.logger.debug(
      `[STREAM] Streaming reduce complete. Tokens: ${tokenUsageCallback.totalTokens}`,
    );
  }

  private async _reduceCombineSummaries(
    summaries: SummaryWithCitationsDto[],
    locale: LocaleEnum,
    template: TemplateEnum,
  ): Promise<SummaryWithCitationsDto> {
    this.logger.debug(`Reducing ${summaries.length} summaries into a global summary.`);

    const summariesAsText = summaries
      .map(
        (s, index) =>
          `--- SUMMARY FROM SOURCE ${index + 1} ---\n${JSON.stringify(s.summary, null, 2)}`,
      )
      .join('\n\n');

    const localeInstruction = this.getLocaleInstruction(locale);
    const reduceChain = this.getReduceChain(template);
    const tokenUsageCallback = new TokenUsageCallbackHandler();

    const result = await reduceChain.invoke(
      { summaries_text: summariesAsText, locale_instruction: localeInstruction },
      { callbacks: [tokenUsageCallback] },
    );

    return {
      summary: result,
      usage: {
        promptTokens: tokenUsageCallback.promptTokens,
        completionTokens: tokenUsageCallback.completionTokens,
        totalTokens: tokenUsageCallback.totalTokens,
      },
    };
  }

  private getMapChain(template: TemplateEnum): RunnableSequence<MapChainInput, ChainOutput> {
    if (this.mapChainCache.has(template)) {
      return this.mapChainCache.get(template)!;
    }
    const config = TEMPLATE_REGISTRY[template];
    if (!config) {
      throw new InternalServerErrorException(
        errorMessages.InternalServerErrorException.SUMMARIZATION_TEMPLATE_NOTFOUND(template),
      );
    }
    const structuredModel = this.model
      .bind({ functions: [config.schema], function_call: { name: config.schema.name } })
      .pipe(new JsonOutputFunctionsParser<ChainOutput>());
    const newChain = RunnableSequence.from<MapChainInput, ChainOutput>([
      config.prompt,
      structuredModel,
    ]);
    this.mapChainCache.set(template, newChain);
    return newChain;
  }

  private getReduceChain(template: TemplateEnum): RunnableSequence<ReduceChainInput, ChainOutput> {
    if (this.reduceChainCache.has(template)) {
      return this.reduceChainCache.get(template)!;
    }

    const config = TEMPLATE_REGISTRY[template];
    if (!config) {
      throw new InternalServerErrorException(
        errorMessages.InternalServerErrorException.SUMMARIZATION_TEMPLATE_NOTFOUND(template),
      );
    }

    const structuredModel = this.model
      .bind({ functions: [config.schema], function_call: { name: config.schema.name } })
      .pipe(new JsonOutputFunctionsParser<ChainOutput>());

    const newChain = RunnableSequence.from<ReduceChainInput, ChainOutput>([
      reducePrompt,
      structuredModel,
    ]);
    this.reduceChainCache.set(template, newChain);
    return newChain;
  }

  private getStreamingReduceChain(
    template: TemplateEnum,
  ): RunnableSequence<ReduceChainInput, string> {
    this.logger.debug(`Creating NEW streaming reduce chain for template: ${template}`);
    const newChain = RunnableSequence.from<ReduceChainInput, string>([
      reducePromptStreaming,
      this.model,
      new StringOutputParser(),
    ]);

    return newChain;
  }

  private getLocaleInstruction(locale: LocaleEnum): string {
    const languageMap = {
      en: 'You MUST write the summary in English.',
      ua: 'You MUST write the summary in Ukrainian.',
      ru: 'You MUST write the summary in Russian.',
    };
    return languageMap[locale] || languageMap.en;
  }

  private getEmptyResponseForTemplate(template: TemplateEnum): SummaryWithCitationsDto {
    const config = TEMPLATE_REGISTRY[template];
    return { summary: (config?.emptyResponse as ChainOutput) || {} };
  }
}
