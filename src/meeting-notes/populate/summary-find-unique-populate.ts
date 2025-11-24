export const summaryFindUniquePopulate = {
  assets: {
    include: {
      meetingAsset: {
        include: {
          summary: true,
        },
      },
    },
  },
};
