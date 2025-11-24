import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtUserGuard } from '@src/auth/guards/jwt-user.guard';
import { SummarizationService } from '@src/summarization/summarization.service';
import { TranscriptionDto } from '@src/summarization/dto/transcription.dto';
import { SummaryWithCitationsDto } from '@src/summarization/dto/responses/summary.responses.dto';
import { apiDescriptions } from '@src/common/api-descriptions';

@ApiTags('Summarization')
@Controller('summarization')
@ApiBearerAuth()
export class SummarizationController {
  constructor(private readonly summarizationService: SummarizationService) {}

  @Post()
  @UseGuards(JwtUserGuard)
  @ApiOperation({
    summary: apiDescriptions.summarization.createCitedSummary.summary,
  })
  @ApiOkResponse({
    description: apiDescriptions.summarization.createCitedSummary.description,
    type: SummaryWithCitationsDto,
  })
  async createCitedSummary(
    @Body() transcriptionDto: TranscriptionDto,
  ): Promise<SummaryWithCitationsDto> {
    return this.summarizationService.generateCitedSummary(transcriptionDto);
  }
}
