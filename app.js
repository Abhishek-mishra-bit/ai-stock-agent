require("dotenv").config();
const axios = require("axios");

async function getStock(symbol) {
  const res = await axios.get(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
  );
  return res.data;
}

// console.log(getStock("AAPL"));

//can you please use it for itc
// no result is printed because the function is asynchronous and we are not awaiting its result. To fix this, we can use an async function to call getStock and await its result. Here's how you can do it:
async function main() {
  const stockData = await getStock("ITC");
  console.log(stockData);
}
main();

//what it means: { c: 0, d: null, dp: null, h: 0, l: 0, o: 0, pc: 0, t: 0 }  i am not able to undestand this
//{ c: 0, d: null, dp: null, h: 0, l: 0, o: 0, pc: 0, t: 0 }
