import { RolesEnum } from '@src/users/enums/roles.enum';

export const errorMessages = {
  BadRequestException: {
    USER_WITH_EMAIL_IS_ALREADY_EXISTS: (email: string) =>
      `User with email ${email} already exists.`,
    INVALID_CREDENTIALS: () => `Invalid credentials.`,
    INVALID_REFRESH_TOKEN: () => `Invalid refresh token.`,
    INVALID_OTP: () => `Invalid OTP.`,
    USER_PRIVACY_AGREEMENT_ALREADY_EXISTS: () => `User privacy agreement already exists.`,
    INVITE_DATE_IS_EXPIRED: () => `Invite date is expired.`,
    INVITE_ALREADY_ACCEPTED: () => `Invite already accepted.`,
    INVITE_ALREADY_SENDED: () => `Invite already sended.`,
    USER_ALREADY_LINKED: () => `User already linked to this company.`,
    CANNOT_CHANGE_COMPANY: () => `Cannot change company.`,
    CANNOT_CHANGE_ROLE_FOR_USER_FROM_OTHER_COMPANY: () =>
      `Cannot change role for user from other company.`,
    CANNOT_CHANGE_ROLE_FOR_YOURSELF: () => `Cannot change role for yourself.`,
    USER_ALREADY_HAS_THIS_ROLE: (role: RolesEnum) => `User already has this role: ${role}.`,
    CANNOT_BLOCK_YOURSELF: () => `Cannot block yourself.`,
    CANNOT_UNBLOCK_YOURSELF: () => `Cannot unblock yourself.`,
    CANNOT_BLOCK_USER_FROM_OTHER_COMPANY: () => `Cannot block user from other company.`,
    USER_ALREADY_BLOCKED: () => `User already blocked.`,
    USER_ALREADY_UNBLOCKED: () => `User already unblocked.`,
    CANNOT_UNBLOCK_USER_FROM_OTHER_COMPANY: () => `Cannot unblock user from other company.`,
    CANNOT_UPDATE_USER_DATA_FROM_OTHER_COMPANY: () => `Cannot update user data from other company.`,
    CANNOT_CHANGE_OWN_DATA: () => `Cannot change own data.`,
    CANNOT_CHANGE_OWNER_DATA: () => `Cannot change owner data.`,
    CANNOT_CHANGE_DATA_OF_DIFFERENT_USER: () => 'Cannot change data of different user.',
    INVITE_EMAIL_NOT_MATCH: () => `Invite email not match.`,
    INVITE_CANNOT_REFRESH: () =>
      'Invite can be refreshed only when its status is REJECTED or EXPIRED.',
    INVITE_CANNOT_REFRESH_NO_EMAIL: () => 'Invite without email cannot be refreshed.',
    CANNOT_UPDATE_INFO_OF_OTHER_COMPANY: () => `Cannot update info of other company.`,
    CAN_NOT_DELETE_MEETING_NOTE_OWNED_BY_OTHER: () => `Can not delete meeting note owned by other.`,
    CAN_NOT_DELETE_RECURRING_OWNED_BY_OTHER: () => `Can not delete recurring owned by other.`,
    COMPANY_NAME_ALREADY_USED: () => `Company name already used.`,
    USER_NOT_HAVE_ROLE: () => `User not have role.`,
    DONT_HAVE_ACCESS: () => `Don't have access`,
    LABEL_NAME_ALREADY_EXISTS: () => `Label name already exists.`,
    USERS_GROUP_NAME_ALREADY_EXISTS: () => `Users group name already exists.`,
    LABEL_NOT_EXISTS: () => `Label not exists.`,
    NO_ASSETS_WITH_VALID_TRANSCRIPTION: () => `No assets with a valid transcription were found.`,
    INVALID_DATES: () => `Invalid startDate or endDate`,
    INVALID_STARTDATE_PERIOD: () => `Invalid startDatePeriod`,
    INVALID_ENDDATE_PERIOD: () => `Invalid endDatePeriod`,
    INCORRECT_PERIOD_DATES: () => `startDatePeriod must be before endDatePeriod`,
    FAILED_CREATE_RECURRING: () => `Failed to create recurring chain`,
    FAILED_UPDATE_RECURRING: () => `Failed to update recurring chain`,
    INCORRECT_CREATE_RECURRING: () =>
      `Recurring meetings created but no meeting notes were returned`,
    UNSUPPORTED_FREQUENCY: () => `Unsupported recurrence frequency`,
    INVALID_RRULE_OPTIONS: () => `Invalid RRule options`,
    USERS_ALREADY_IN_COMPANY: (emails: string[]) =>
      `These users are already members of this current space: ${emails.join(', ')}`,
  },
  NotFoundException: {
    USER_NOT_FOUND: (ids?: string[]) => `Users not found. ${ids ? `IDs: ${ids.join(', ')}` : ''}`,
    COMPANY_NOT_FOUND: () => `Company not found.`,
    INVITE_NOT_FOUND: () => `Invite not found.`,
    LOCATION_NOT_FOUND: () => `Location not found.`,
    MEETING_NOTE_NOT_FOUND: () => `Meeting note not found.`,
    FILE_STORAGE_NOT_FOUND: () => `File storage not found.`,
    LABEL_NOT_FOUND: () => `Label not found.`,
    USERS_GROUP_NOT_EXISTS: () => `Users group not exists.`,
    MEETING_COMMENTS_NOT_FOUND: () => `Comment not found`,
    PARENT_MEETING_COMMENTS_NOT_FOUND: () => `Parent comment not found`,
    NO_FIELDS_TO_UPDATE: () => `No fields to update`,
    RECURRING_MEETING_NOT_FOUND: () => `Recurring meeting not found or access denied.`,
    NO_MEETINGS_FOUND: () =>
      `No meeting notes found for this recurring meeting or for provided period.`,
    NO_OCCURRENCES_TO_CREATE_MEETINGS: () =>
      `No occurrences generated for given recurring settings`,
  },
  ForbiddenException: {
    USER_BLOCKED: () => `User blocked.`,
    USER_DELETED: () => `User deleted.`,
    USER_EMAIL_NOT_CONFIRMED: () => `User email not confirmed.`,
    USER_NOT_ALLOWED_MEETING_NOTE: () => `You do not have permission to access this meeting note.`,
    USER_NOT_ALLOWED: () => `You do not have permission to access this resource.`,
    //Access denied. Registration is restricted to authorized email domains.
    REGISTRATION_EMAIL_NOT_ALLOWED: () =>
      `Access denied. Registration or Log in is restricted to authorized emails.`,
    USER_NOT_ALLOWED_MEETING_COMMENT: () => `Not your comment`,
  },
  InternalServerErrorException: {
    SUMMARIZATION_FAILED: () => `Summarization failed due to an internal error.`,
    SUMMARIZATION_TEMPLATE_NOTFOUND: (temlapte?: string) =>
      `Summarization template ${temlapte} not found.`,
  },
};
