export const userGroupWithDetailsPopulate = {
  include: {
    members: {
      include: {
        userCompany: {
          select: {
            id: true,
            nickname: true,
            userId: true,
            role: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    },
    createdBy: {
      select: {
        id: true,
        nickname: true,
        userId: true,
        role: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    },
  },
};
