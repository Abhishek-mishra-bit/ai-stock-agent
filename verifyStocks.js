const { NSELive } = require("nse-api-package");
const NSEService = require("./src/services/nseService");

// Comprehensive list of popular NSE stocks
const popularNSEStocks = [
  // NIFTY 50 Top Companies
  {
    symbol: "RELIANCE",
    companyName: "Reliance Industries Limited",
    sector: "Energy",
  },
  {
    symbol: "TCS",
    companyName: "Tata Consultancy Services Limited",
    sector: "IT",
  },
  { symbol: "INFY", companyName: "Infosys Limited", sector: "IT" },
  { symbol: "WIPRO", companyName: "Wipro Limited", sector: "IT" },
  { symbol: "ITC", companyName: "ITC Limited", sector: "FMCG" },
  { symbol: "SBIN", companyName: "State Bank of India", sector: "Banking" },
  { symbol: "HDFC", companyName: "HDFC Bank Limited", sector: "Banking" },
  {
    symbol: "MARUTI",
    companyName: "Maruti Suzuki India Limited",
    sector: "Automobiles",
  },
  {
    symbol: "BAJAJ-AUTO",
    companyName: "Bajaj Auto Limited",
    sector: "Automobiles",
  },
  {
    symbol: "BHARTIARTL",
    companyName: "Bharti Airtel Limited",
    sector: "Telecom",
  },

  // More popular stocks
  { symbol: "JSWSTEEL", companyName: "JSW Steel Limited", sector: "Steel" },
  { symbol: "TATASTEEL", companyName: "Tata Steel Limited", sector: "Steel" },
  {
    symbol: "SUNPHARMA",
    companyName: "Sun Pharmaceutical Industries Limited",
    sector: "Pharma",
  },
  {
    symbol: "ULTRACEMCO",
    companyName: "UltraTech Cement Limited",
    sector: "Cement",
  },
  {
    symbol: "ADANIGREEN",
    companyName: "Adani Green Energy Limited",
    sector: "Energy",
  },
  {
    symbol: "ONGC",
    companyName: "Oil and Natural Gas Corporation Limited",
    sector: "Energy",
  },
  {
    symbol: "POWERGRID",
    companyName: "Power Grid Corporation of India Limited",
    sector: "Power",
  },
  {
    symbol: "LT",
    companyName: "Larsen & Toubro Limited",
    sector: "Engineering",
  },
  { symbol: "NESTLEIND", companyName: "Nestle India Limited", sector: "FMCG" },
  {
    symbol: "BRITANNIA",
    companyName: "Britannia Industries Limited",
    sector: "FMCG",
  },
];

async function verifyAndBuildStockList() {
  console.log("=".repeat(70));
  console.log("NSE STOCK VERIFICATION & SEARCH");
  console.log("=".repeat(70));

  const nseLive = new NSELive();

  // Verify which stocks are available
  console.log("\n🔍 Verifying popular NSE stocks...\n");

  const verifiedStocks = [];
  const invalidStocks = [];

  for (const stock of popularNSEStocks) {
    try {
      // Try to get stock quote
      const quote = await nseLive.stockQuote(stock.symbol);
      if (quote && quote.info && quote.info.symbol) {
        verifiedStocks.push({
          ...stock,
          currentPrice: quote.priceInfo?.lastPrice || 0,
          verified: true,
        });
        console.log(`✅ ${stock.symbol.padEnd(15)} - ${stock.companyName}`);
      }
    } catch (error) {
      invalidStocks.push(stock.symbol);
      console.log(
        `❌ ${stock.symbol.padEnd(15)} - Not found (${error.message.substring(0, 30)}...)`,
      );
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("SUMMARY:");
  console.log("=".repeat(70));
  console.log(`✅ Verified Stocks: ${verifiedStocks.length}`);
  console.log(`❌ Invalid Stocks: ${invalidStocks.length}`);

  // Save verified list
  const fs = require("fs");
  fs.writeFileSync(
    "verifiedNSEStocks.json",
    JSON.stringify(verifiedStocks, null, 2),
  );
  console.log(`\n📁 Verified stocks list saved to: verifiedNSEStocks.json`);

  // Search functionality
  console.log("\n" + "=".repeat(70));
  console.log("STOCK SEARCH FEATURE");
  console.log("=".repeat(70));

  function searchStocks(query) {
    const lowerQuery = query.toLowerCase();
    return verifiedStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(lowerQuery) ||
        stock.companyName.toLowerCase().includes(lowerQuery) ||
        stock.sector.toLowerCase().includes(lowerQuery),
    );
  }

  // Test searches
  const testQueries = ["ITC", "BANK", "IT", "Steel", "RELIAN"];

  testQueries.forEach((query) => {
    const results = searchStocks(query);
    console.log(`\n🔎 Searching: "${query}"`);
    if (results.length > 0) {
      console.log(`Found ${results.length} result(s):`);
      results.forEach((stock) => {
        console.log(
          `  ✓ ${stock.symbol.padEnd(15)} - ${stock.companyName.padEnd(40)} [${stock.sector}]`,
        );
      });
    } else {
      console.log(`  No results found`);
    }
  });

  console.log("\n" + "=".repeat(70));
  console.log("HOW TO FIND CORRECT SYMBOL:");
  console.log("=".repeat(70));
  console.log(`
1. Check verifiedNSEStocks.json file for all available stocks
2. Use the search feature above to find stocks by name or sector
3. If a stock is not in the list, it may not be available or might be delisted

Example:
  Wrong: "RELIAN" → Correct: "RELIANCE"
  Wrong: "INFOSYS" → Correct: "INFY"
  Wrong: "BANK" → Correct: "SBIN" or "HDFC"
  `);
}

verifyAndBuildStockList();
