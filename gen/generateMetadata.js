module.exports = async function generateMetadata({
  data: { tokenId, image, pattern, colors },
}) {
  return {
    description: `Mr. Number ${tokenId} is a unique algorithmically generated fish swimming around on the blockchain!`,
    image,
    name: `8BitFish #${tokenId}`,
    attributes: [
      {
        trait_type: "Pattern",
        value: pattern,
      },

      {
        trait_type: "Primary color",
        value: colors.primary.base,
      },
      {
        trait_type: "Secondary color",
        value: colors.secondary.base,
      },
      {
        display_type: "date",
        trait_type: "birthday",
        value: Date.now(),
      },
    ],
  };
};
