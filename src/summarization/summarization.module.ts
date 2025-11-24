import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LangChainProvider } from '../langchain/langchain.provider';

import { SummarizationController } from './summarization.controller';
import { SummarizationService } from './summarization.service';

@Module({
  imports: [ConfigModule],
  controllers: [SummarizationController],
  providers: [SummarizationService, LangChainProvider],
  exports: [SummarizationService],
})
export class SummarizationModule {}
