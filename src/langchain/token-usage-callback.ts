import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { LLMResult } from '@langchain/core/outputs';

export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export class TokenUsageCallbackHandler extends BaseCallbackHandler {
  name = 'TokenUsageCallbackHandler';

  promptTokens = 0;
  completionTokens = 0;
  totalTokens = 0;

  constructor() {
    super();
  }

  handleLLMEnd(output: LLMResult): void {
    const tokenUsage = output.llmOutput?.tokenUsage as TokenUsage | undefined;

    if (tokenUsage) {
      this.promptTokens += tokenUsage.promptTokens || 0;
      this.completionTokens += tokenUsage.completionTokens || 0;
      this.totalTokens += tokenUsage.totalTokens || 0;
    }
  }
}
