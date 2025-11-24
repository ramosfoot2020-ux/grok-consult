export const getAllMeetingNotesPopulate = (companyId: string) => {
  return {
    id: true,
    name: true,
    type: true,
    startDate: true,
    endDate: true,
    authorId: true,
    companyId: true,
    area: true,
    participantsOutSystem: true,
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
    isHidden: true,
    duration: true,
    interactionStatus: true,
    location: true,
    additionalBlocks: true,
    additionalBlocksAfter: true,
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
          take: 1,
        },
      },
    },
    assets: {
      select: {
        meetingAsset: {
          select: {
            id: true,
            type: true,
            fileName: true,
            transcription: true,
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
