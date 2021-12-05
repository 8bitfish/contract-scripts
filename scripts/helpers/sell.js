var childProc = require("child_process");

function SellingTabs() {
  for (let i = 101; i < 201; i++) {
    childProc.exec(
      `open -a "Google Chrome" https://opensea.io/assets/matic/0x1f80cf75e123435133749ec26678fbb1e199e10c/${i}/sell`,
    );
  }
}

SellingTabs();
