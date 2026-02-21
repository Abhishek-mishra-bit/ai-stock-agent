const NSEService = require("./src/services/nseService");
const TechnicalAnalysisService = require("./src/services/technicalService");
const AIAnalysisService = require("./src/services/aiServices_improved");

async function testCompleteAnalysis() {
  console.log("=".repeat(70));
  console.log("COMPLETE STOCK ANALYSIS PIPELINE TEST");
  console.log("=".repeat(70));

  const nseService = new NSEService();
  const technicalService = new TechnicalAnalysisService();
  const aiService = new AIAnalysisService();

  try {
    const symbol = "ITC";
    console.log(`\n📊 Analyzing: ${symbol}\n`);

    // STEP 1: Get Real-time Stock Quote
    console.log("▶ STEP 1: Fetching Stock Quote...");
    const stockQuote = await nseService.getStockQuote(symbol);
    console.log(`✅ Got stock quote: ₹${stockQuote.price}`);

    // STEP 2: Get Market Indices
    console.log("\n▶ STEP 2: Fetching Market Indices...");
    const marketIndices = await nseService.getMarketIndices();
    console.log(`✅ Got ${marketIndices.length} market indices`);

    // STEP 3: Get Historical Data (200 trading days)
    console.log("\n▶ STEP 3: Fetching Historical Data (200 trading days)...");
    const historicalData = await nseService.getHistoricalData(symbol, 200);
    console.log(`✅ Got ${historicalData.length} trading days of data`);

    // STEP 4: Calculate Technical Indicators
    console.log("\n▶ STEP 4: Calculating Technical Indicators...");
    const closePrices = historicalData.map((entry) => entry.close);

    const sma50 = technicalService.calculateSMA(closePrices, 50);
    const sma200 =
      closePrices.length >= 200
        ? technicalService.calculateSMA(closePrices, 200)
        : [];
    const rsi = technicalService.calculateRSI(closePrices, 14);
    const macd = technicalService.calculateMACD(closePrices);

    console.log(`✅ Calculated:`);
    console.log(`   - SMA 50: ${sma50[sma50.length - 1].toFixed(2)}`);
    if (sma200.length > 0)
      console.log(`   - SMA 200: ${sma200[sma200.length - 1].toFixed(2)}`);
    console.log(`   - RSI: ${rsi[rsi.length - 1].toFixed(2)}`);
    console.log(
      `   - MACD: ${macd[macd.length - 1].MACD.toFixed(2)} (Signal: ${macd[macd.length - 1].signal.toFixed(2)})`,
    );

    // STEP 5: Generate Trading Signal
    console.log("\n▶ STEP 5: Generating Trading Signal...");
    const signal = technicalService.generateSignal({
      rsi: rsi,
      macd: macd,
      sma50: sma50,
      sma200: sma200.length > 0 ? sma200 : [],
      currentPrice: closePrices[closePrices.length - 1],
    });

    console.log(`✅ Signal: ${signal.signal}`);
    console.log(`   Confidence: ${signal.confidence}%`);
    console.log(`   Reasons: ${signal.reasons.join(", ")}`);

    // STEP 6: AI Analysis
    console.log("\n▶ STEP 6: Running AI Analysis...");
    console.log("   (This may take 10-20 seconds...)");

    const aiAnalysis = await aiService.analyzeStock(
      stockQuote,
      signal,
      historicalData,
    );

    console.log("\n✅ AI ANALYSIS COMPLETE:\n");
    console.log("=".repeat(70));
    console.log(aiAnalysis.analysis);
    console.log("=".repeat(70));

    // STEP 7: Generate Market Outlook (Optional)
    console.log(
      "\n▶ STEP 7: Generating Market Outlook (Optional - may use API)...",
    );
    try {
      const marketOutlook = await aiService.generateMarketOutlook(
        marketIndices,
        [stockQuote],
      );
      console.log("\n✅ MARKET OUTLOOK:\n");
      console.log("=".repeat(70));
      console.log(marketOutlook.outlook);
      console.log("=".repeat(70));
    } catch (error) {
      console.log(`⚠️  Skipped market outlook: ${error.message}`);
    }

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("ANALYSIS SUMMARY");
    console.log("=".repeat(70));
    console.log(`
Stock: ${aiAnalysis.stockSummary.symbol} - ${aiAnalysis.stockSummary.companyName}
Current Price: ₹${aiAnalysis.stockSummary.currentPrice}
Change: ${aiAnalysis.stockSummary.percentChange}%

Technical Signal: ${aiAnalysis.technicalSummary.signal}
Confidence: ${aiAnalysis.technicalSummary.confidence}%

Indicators Analyzed: ${aiAnalysis.technicalSummary.reasons.join(", ")}

Analysis Timestamp: ${aiAnalysis.timestamp}
    `);
  } catch (error) {
    console.error(
      "\n❌ Error during analysis:",
      error.message,
      "\n",
      error.stack,
    );
  }
}

testCompleteAnalysis();
