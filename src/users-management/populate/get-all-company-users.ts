export const getAllCompanyUsers = {
  role: true,
  createdAt: true,
  nickname: true,
  blockedAt: true,
  removedAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
    },
  },
};
