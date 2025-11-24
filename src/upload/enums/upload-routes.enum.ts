export enum FilesRouteEnum {
  COMPANY_AVATAR = 'company-avatars',
  MEETING_ATTACHMENT = 'meeting-attachments',
  MEETING_NOTES = 'meetings-notes',
  USER_AVATAR = 'user-avatars',
}

export type FilesRouteKey = keyof typeof FilesRouteEnum;
