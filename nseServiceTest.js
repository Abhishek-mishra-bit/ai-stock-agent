const NSEService = require("./src/services/nseService");

async function runtest() {
  const nseService = new NSEService();
  try {
    console.log("Fetching stock quote for ITC...");
    const stockQuote = await nseService.getStockQuote("ITC");
    console.log("Stock Quote for ITC: ", stockQuote);

    console.log("\n Fetching market indices...");
    const marketIndices = await nseService.getMarketIndices();
    console.log("Market Indices: ", marketIndices);

    console.log("\n Fetching historical data for ITC...");
    const history = await nseService.getHistoricalData("ITC", 30);
    console.log("Historical Data for ITC: ", history);
  } catch (err) {
    console.error("Error during test: ", err);
  }
}

runtest();
