module.exports = async (fish, token) => {
  const uri = await fish.tokenURI(token);
  return uri;
};
