import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ChatOpenAI } from '@langchain/openai';

// Unique token to identify our provider
export const LANGCHAIN_MODEL = 'LANGCHAIN_MODEL';

export const LangChainProvider: Provider = {
  provide: LANGCHAIN_MODEL,
  useFactory: (configService: ConfigService) => {
    return new ChatOpenAI({
      apiKey: configService.get<string>('OPENAI_API_KEY'),
      model: 'gpt-4o-mini',
      maxTokens: 2350,
      frequencyPenalty: 0.2,
      temperature: 0.5,
      maxRetries: 2,
      timeout: 60_000,
    });
  },
  inject: [ConfigService],
};
