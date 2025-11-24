export const createCompanyPopulate = (companyId: string) => ({
  users: {
    select: {
      id: true,
      userId: true,
      companyId: true,
      role: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          avatar: true,
          userCompanies: {
            where: {
              companyId,
            },
          },
        },
      },
    },
  },
});
