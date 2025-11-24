export const findManyCompany = {
  id: true,
  companyId: true,
  role: true,
  userId: true,
  nickname: true,
  blockedAt: true,
  removedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailConfirmed: true,
      featureUpdates: true,
      createdAt: true,
      updatedAt: true,
      blockedAt: true,
      deletedAt: true,
      avatar: true,
    },
  },
  groups: {
    select: {
      userGroup: {
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
        },
      },
    },
  },
};
