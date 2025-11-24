import { MeetingTypes } from '@prisma/client';

import { TemplateEnum } from '@src/summarization/enums/template.enum';

export const meetingTypeToTemplateMap: Record<MeetingTypes, TemplateEnum> = {
  [MeetingTypes.DAILY]: TemplateEnum.DAILY,
  [MeetingTypes.KICKOFF]: TemplateEnum.KICKOFF,
  [MeetingTypes.DEMO]: TemplateEnum.DEMO,
  [MeetingTypes.REQUIREMENTS_GATHERING]: TemplateEnum.REQUIREMENTS_GATHERING,
};

export const mapMeetingTypeToTemplateEnum = (meetingType: MeetingTypes): TemplateEnum => {
  const template = meetingTypeToTemplateMap[meetingType];
  if (!template) {
    return TemplateEnum.DAILY;
  }
  return template;
};
