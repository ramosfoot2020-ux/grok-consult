export const authorMeetingCommentsPopulate = {
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  },
};

export const selectMeetingCommentsPopulate = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  resolved: true,
  from: true,
  to: true,
  editorDataCommentId: true,
  type: true,
  ...authorMeetingCommentsPopulate,
};
