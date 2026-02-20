const NSEService = require("./src/services/nseService");
const TechnicalAnalysisService = require("./src/services/technicalService");

async function testTechnicalIndicators() {
  const nseService = new NSEService();
  const technicalService = new TechnicalAnalysisService();

  try {
    console.log("=== Testing Technical Indicators ===\n");

    // Get historical data for last 200 trading days (need ~440 calendar days)
    console.log(
      "1. Fetching historical data for RELIANCE (200 trading days)...",
    );
    const historicalData = await nseService.getHistoricalData("INFY", 200);
    console.log(`✓ Got ${historicalData.length} trading days of data\n`);

    // Extract closing prices
    const closePrices = historicalData.map((entry) => entry.close);
    console.log("Sample prices:", closePrices.slice(-5));
    console.log("\n");

    // Test SMA (Simple Moving Average)
    console.log("2. Testing SMA (Simple Moving Average)...");
    const sma20 = technicalService.calculateSMA(closePrices, 20);
    const sma50 = technicalService.calculateSMA(closePrices, 50);
    // Only calculate SMA200 if we have enough data
    let sma200 = [];
    if (closePrices.length >= 200) {
      sma200 = technicalService.calculateSMA(closePrices, 200);
      console.log(`✓ SMA 200: ${sma200[sma200.length - 1].toFixed(2)}`);
    } else {
      console.log(
        `⚠ SMA 200: Not enough data (need 200 days, have ${closePrices.length})`,
      );
    }
    console.log(`✓ SMA 20: ${sma20[sma20.length - 1].toFixed(2)}`);
    console.log(`✓ SMA 50: ${sma50[sma50.length - 1].toFixed(2)}`);
    console.log("\n");

    // Test EMA (Exponential Moving Average)
    console.log("3. Testing EMA (Exponential Moving Average)...");
    const ema12 = technicalService.calculateEMA(closePrices, 12);
    const ema26 = technicalService.calculateEMA(closePrices, 26);
    if (ema12.length > 0 && ema26.length > 0) {
      console.log(`✓ EMA 12: ${ema12[ema12.length - 1].toFixed(2)}`);
      console.log(`✓ EMA 26: ${ema26[ema26.length - 1].toFixed(2)}\n`);
    } else {
      console.log("⚠ Not enough data for EMA calculation\n");
    }

    // Test RSI (Relative Strength Index)
    console.log("4. Testing RSI (Relative Strength Index)...");
    const rsi = technicalService.calculateRSI(closePrices, 14);
    if (rsi.length > 0) {
      console.log(`✓ RSI Value: ${rsi[rsi.length - 1].toFixed(2)}`);
      if (rsi[rsi.length - 1] < 30) {
        console.log("  → Stock is OVERSOLD\n");
      } else if (rsi[rsi.length - 1] > 70) {
        console.log("  → Stock is OVERBOUGHT\n");
      } else {
        console.log("  → Stock is NEUTRAL\n");
      }
    } else {
      console.log("⚠ Not enough data for RSI\n");
    }

    // Test MACD (Moving Average Convergence Divergence)
    console.log("5. Testing MACD (Moving Average Convergence Divergence)...");
    const macd = technicalService.calculateMACD(closePrices);
    if (macd.length > 0) {
      const lastMACD = macd[macd.length - 1];
      console.log(`✓ MACD Line: ${lastMACD.MACD.toFixed(2)}`);
      console.log(`✓ Signal Line: ${lastMACD.signal.toFixed(2)}`);
      console.log(`✓ Histogram: ${lastMACD.histogram.toFixed(2)}`);
      if (lastMACD.MACD > lastMACD.signal) {
        console.log("  → MACD is BULLISH\n");
      } else {
        console.log("  → MACD is BEARISH\n");
      }
    } else {
      console.log("⚠ Not enough data for MACD\n");
    }

    // Generate Trading Signal
    console.log("6. Generating Trading Signal...");
    const currentPrice = closePrices[closePrices.length - 1];

    // Only generate signal if we have valid SMA200
    if (sma200.length > 0) {
      const signal = technicalService.generateSignal({
        rsi: rsi,
        macd: macd,
        sma50: sma50,
        sma200: sma200,
        currentPrice: currentPrice,
      });

      console.log(`✓ Signal: ${signal.signal}`);
      console.log(`✓ Confidence: ${signal.confidence}%`);
      console.log(`✓ Reasons: ${signal.reasons.join(", ")}`);
      console.log(`✓ Timestamp: ${signal.timestamp}\n`);
    } else {
      console.log(
        "⚠ Cannot generate complete signal - need 200 days of data for SMA200\n",
      );
    }

    console.log("=== All Technical Indicators Working! ===");
  } catch (error) {
    console.error("❌ Error during test:", error.message);
  }
}

testTechnicalIndicators();
