module.exports = async (fish) => {
  const withdraw = await fish.withdrawFunds();
  console.log(withdraw);
  return console.log(`Withdrew funds.`);
};
