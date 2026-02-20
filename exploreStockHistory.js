const { NSELive } = require("nse-api-package");

// Search and validate stocks
async function findAndValidateStocks() {
  console.log("=".repeat(70));
  console.log("NSE STOCK FINDER & VALIDATOR");
  console.log("=".repeat(70));

  const nseLive = new NSELive();

  try {
    // Get all stocks from equityMaster
    console.log("\n📊 Fetching all NSE stocks from equityMaster...");
    const result = await nseLive.equityMaster();

    // Check the structure of the result
    console.log("\nResult structure:");
    console.log(`Type: ${typeof result}`);
    console.log(`Keys: ${Object.keys(result)}`);

    // equityMaster returns an object with data property
    let allStocks = result;
    if (result.data) {
      allStocks = result.data;
    }

    // If still not an array, get the first property that is an array
    if (!Array.isArray(allStocks)) {
      const firstKey = Object.keys(result)[0];
      console.log(`\nTrying key: ${firstKey}`);
      allStocks = result[firstKey];
    }

    if (!Array.isArray(allStocks)) {
      console.log("❌ Could not find array in response");
      console.log("Full response:", JSON.stringify(result).substring(0, 500));
      return;
    }

    console.log(`\n✅ SUCCESS! Found ${allStocks.length} stocks on NSE`);
    console.log("\n" + "=".repeat(70));
    console.log("FIRST 30 NSE STOCKS:");
    console.log("=".repeat(70));

    allStocks.slice(0, 30).forEach((stock, index) => {
      console.log(
        `${String(index + 1).padStart(2)}. ${stock.symbol.padEnd(15)} - ${stock.companyName}`,
      );
    });

    // Function to search for stock by symbol or name
    console.log("\n" + "=".repeat(70));
    console.log("STOCK SEARCH FEATURE");
    console.log("=".repeat(70));

    function searchStock(query) {
      const lowerQuery = query.toLowerCase();
      const results = allStocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(lowerQuery) ||
          stock.companyName.toLowerCase().includes(lowerQuery),
      );

      return results;
    }

    // Test searches
    const testQueries = ["ITC", "RELIAN", "INFY", "WIPRO", "BANK"];

    testQueries.forEach((query) => {
      const results = earchStock(query);
      console.log(`\n🔍 Search: "${query}"`);
      if (results.length > 0) {
        console.log(`   Found ${results.length} results:`);
        results.slice(0, 5).forEach((stock) => {
          console.log(`   ✓ ${stock.symbol.padEnd(15)} - ${stock.companyName}`);
        });
        if (results.length > 5) {
          console.log(`   ... and ${results.length - 5} more`);
        }
      } else {
        console.log(`   ❌ No results found`);
      }
    });

    // Save stock list to file
    console.log("\n" + "=".repeat(70));
    const fs = require("fs");
    const stockList = allStocks.map((s) => ({
      symbol: s.symbol,
      companyName: s.companyName,
      industry: s.industry,
      lastPrice: s.lastPrice,
    }));

    fs.writeFileSync("nseStockList.json", JSON.stringify(stockList, null, 2));

    console.log("✅ Complete stock list saved to: nseStockList.json");
    console.log(`Total stocks saved: ${stockList.length}`);
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
  }
}

findAndValidateStocks();
