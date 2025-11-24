export const getMeetingNoteByIdPopulate = (companyId: string) => {
  return {
    participantsInSystem: {
      select: {
        userId: true,
        meetingNoteId: true,
        status: true,
        user: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    },
    participantsOutSystem: true,
    author: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        userCompanies: {
          where: {
            companyId,
          },
          select: {
            role: true,
          },
        },
      },
    },
    assets: {
      select: {
        meetingAsset: true,
      },
    },
    shares: {
      select: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    },
    labels: {
      select: {
        label: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    recurringMeeting: true,
  };
};
