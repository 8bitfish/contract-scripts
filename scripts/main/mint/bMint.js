const generateFish = require("../../../gen/generateFish");

function loadingAnimation(
  text = "",
  chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"],
  delay = 100,
) {
  let x = 0;

  return setInterval(function () {
    process.stdout.write(`\r${chars[x++]} ${text}`);
    x = x % chars.length;
  }, delay);
}

module.exports = async (fish, t, network) => {
  const s = [
    process.env.SPECIAL_1,
    process.env.SPECIAL_2,
    process.env.SPECIAL_3,
    process.env.SPECIAL_4,
  ].map((x) => Number(x));

  for (let i = 0; i < t; i += 1) {
    const tokenId = Number(await fish.totalSupply()) + 1;

    console.log("");

    let loader = loadingAnimation(
      `Generating fish with tokenId of ${tokenId} on ${network} network...`,
    );

    if (s.includes(tokenId)) {
      clearInterval(loader);
      return console.log(
        `\x1b[31mToken would override special edition token, please mint special token.\x1b[0m`,
      );
    } else {
      const { uriHash, uriUrl } = await generateFish(tokenId, network);

      const { tx } = await fish.mint(uriHash, uriUrl);

      clearInterval(loader);

      console.log(
        `\n\x1b[32m🌿 Successfully minted token \x1b[33m${tokenId}\x1b[32m with tx of \x1b[33m${tx}\x1b[0m`,
      );
    }
  }
  return t;
};
