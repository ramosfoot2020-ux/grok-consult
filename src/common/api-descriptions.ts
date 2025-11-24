export const apiDescriptions = {
  auth: {
    registration: {
      summary: 'Register a new user',
      description: 'User successfully registered.',
    },
    login: {
      summary: 'Log in a user',
      description: 'User successfully logged in and returns JWT tokens.',
    },
    logout: {
      summary: 'Log out a user',
      description: 'User successfully logged out.',
    },
    refreshToken: {
      summary: 'Refresh authentication tokens',
      description: 'Tokens successfully refreshed.',
    },
    sendOtp: {
      summary: "Send a one-time password (OTP) to the user's email",
      description: 'OTP has been sent successfully.',
    },
    verifyOtp: {
      summary: 'Verify a one-time password (OTP)',
      description: 'OTP is valid.',
    },
    verifyEmail: {
      summary: 'Verify user email with an OTP',
      description: 'Email has been verified successfully.',
    },
    resetPassword: {
      summary: 'Reset user password using an OTP',
      description: 'Password has been reset successfully.',
    },
    setPassword: {
      summary: 'Set a new password for the authenticated user',
      description: 'Password has been set successfully.',
    },
    changeCompany: {
      summary: 'Change the active company for the user',
      description: 'Company changed successfully, new tokens issued.',
    },
    changePassword: {
      summary: 'Change the password for the authenticated user',
      description: 'Password has been changed successfully.',
    },
  },
  companies: {
    createCompany: {
      summary: 'Create a new company',
      description: 'The company has been successfully created.',
    },
    changeCompanyName: {
      summary: 'Change the name of a company',
      description: 'The company name has been successfully updated.',
    },
    getPresignedUrl: {
      summary: 'Get a presigned URL for an avatar upload',
      description:
        'Step 1 of the upload process. Returns a secure presigned URL for a direct S3 upload, the final URL of the object, and a unique filename for confirmation.',
    },
    confirmUpload: {
      summary: 'Confirm a successful avatar upload',
      description:
        "Step 2 of the upload process. Confirms the file has been uploaded to S3. The backend verifies the file, deletes the old avatar, and updates the company's avatar URL.",
    },
  },
  users: {
    me: {
      summary: 'Get current user profile information',
      description: 'Returns the authenticated user profile.',
    },
    updateMe: {
      summary: 'Update current user profile information',
      description: 'Returns the updated user profile.',
    },
    getAvatarUploadUrl: {
      summary: 'Get a presigned URL for an avatar upload',
      description:
        'Step 1 of the upload process. Returns a secure presigned URL for a direct S3 upload, the final URL of the object, and a unique filename for confirmation.',
    },
    confirmAvatarUpload: {
      summary: 'Confirm a successful avatar upload',
      description:
        "Step 2 of the upload process. Confirms the file has been uploaded to S3. The backend verifies the file, deletes the old avatar, and updates the user's avatar URL.",
    },
  },
  meetingNotes: {
    createMeetingNote: {
      summary: 'Create a new meeting note.',
      description: 'Return created meeting note.',
    },
    getMeetingNoteById: {
      summary: 'Get meeting note by id.',
      description: 'Return meeting note by id.',
    },
    getAllMeetingNotes: {
      summary: 'Get all meeting notes.',
      description: 'Return all meeting notes.',
    },
    deleteMeetingNote: {
      summary: 'Delete meeting note.',
      description: 'Return success: true if meeting note was deleted.',
    },
    updateMeetingNote: {
      summary: 'Update a meeting note.',
      description: 'Return updated meeting note.',
    },
    updateRecurringMeetingChain: {
      summary: 'Bulk update meeting notes in a recurring chain',
      description: 'Return success: true if meetings in a recurring chain was updated.',
    },
    deleteRecurringMeetingChain: {
      summary: 'Delete meeting notes in a recurring chain.',
      description: 'Return success: true if meetings in a recurring chain was deleted.',
    },
    generatePresignedUrl: {
      summary: 'Generate a presigned URL to upload a meeting asset',
      description: 'The presigned URL was successfully generated.',
    },
    getAssetAccessUrl: {
      summary: 'Get a presigned URL to access a meeting asset',
      description: 'The presigned URL to access the asset was successfully generated.',
    },
    togglePublicSharing: {
      summary: 'Toggle public sharing for a meeting note',
      description: 'Returns the public URL if sharing is enabled, or null if disabled.',
    },
    generateSummaryFromAsset: {
      summary: 'Generate AI summary from a meeting asset',
      description:
        "Generates a Tiptap-formatted summary from an asset's transcription and updates the meeting note.",
    },
    getStructuredTranscriptionByAssetId: {
      summary: 'Get structured transcription for a meeting asset',
      description: 'Returns the transcription as an array of segments.',
    },
  },
  meetingComments: {
    getMeetingComments: {
      summary: 'Get all meeting comments.',
      description: 'Return all meeting comments.',
    },
    createMeetingComment: {
      summary: 'Create a new meeting comment.',
      description: 'Return created meeting comment.',
    },
    updateMeetingComment: {
      summary: 'Update a meeting comment.',
      description: 'Return updated meeting comment.',
    },
    replyMeetingComment: {
      summary: 'Create reply for comment.',
      description: 'Return replied meeting comment.',
    },
    deleteMeetingComment: {
      summary: 'Delete meeting comment.',
      description: 'Return success: true if meeting comment was deleted.',
    },
  },
  invites: {
    createEmailInvite: {
      summary: 'Create a reusable invite link',
      description: 'Invite has been successfully created.',
    },
    createEmailLinkInvite: {
      summary: 'Accept an email invite and register',
      description: 'Returns the invite details by its ID.',
    },
    acceptEmailInvite: {
      summary: 'Accept a link invite and register',
      description: 'User has successfully accepted the invite and joined the company.',
    },
    acceptEmailExistInvite: {
      summary: 'Accept a link invite of existing user',
      description: 'User has successfully accepted the invite and joined the company.',
    },
    acceptLinkInvite: {
      summary: 'Accept a link invite to join a company',
      description: 'User has successfully accepted the link invite and joined the company.',
    },
    getAllInvites: {
      summary: 'Get all invites for the authenticated user',
      description: 'Returns a list of all invites associated with the user.',
    },
    refreshInvite: {
      summary: 'Refresh invite and resend email (from status REJECTED OR EXPIRED)',
      description: 'Invite refreshed and email sent',
    },
    deleteInvite: {
      summary: 'Delete (Recall by Owner or Manager) a reusable invite link if status PENDING',
      description: 'Invite has been successfully deleted.',
    },
  },
  labels: {
    create: {
      summary: 'Create a new label for the company',
      description: 'Label has been successfully created.',
    },
    findAll: {
      summary: 'Get all labels for the company',
      description: 'Returns all labels for the company.',
    },
    findOne: {
      summary: 'Get a single label by ID',
      description: 'Returns the label with the specified ID.',
    },
    update: {
      summary: 'Update a label by ID',
      description: 'Returns the updated label.',
    },
    remove: {
      summary: 'Delete a label by ID',
      description: 'Returns success: true if the label was deleted.',
    },
  },
  summarization: {
    createCitedSummary: {
      summary: 'Generate a cited summary from a transcription',
      description:
        'Accepts a transcription JSON object, processes it, and returns a structured summary where each point is linked back to the original text segments.',
    },
  },
};
