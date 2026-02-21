const technicalIndicators = require("technicalindicators");

class TechnicalAnalysisService {
  // Calculate Simple Moving Average (SMA)
  calculateSMA(prices, period = 20) {
    return technicalIndicators.SMA.calculate({
      period: period,
      values: prices,
    });
  }

  // Calculate Exponential Moving Average (EMA)
  calculateEMA(prices, period = 20) {
    return technicalIndicators.EMA.calculate({
      period: period,
      values: prices,
    });
  }

  // Calculate Relative Strength Index (RSI)
  calculateRSI(prices, period = 14) {
    return technicalIndicators.RSI.calculate({
      period: period,
      values: prices,
    });
  }

  // Calculate Moving Average Convergence Divergence (MACD)
  calculateMACD(prices) {
    return technicalIndicators.MACD.calculate({
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      values: prices,
    });
  }

  //generating trading sinals based on technical indicators
  generateSignal(indicators) {
    const { rsi, macd, sma50, sma200, currentPrice } = indicators;

    let bullishScore = 0;
    let bearishScore = 0;
    let reasons = [];

    // 1. RSI Analysis
    const lastRSI = rsi[rsi.length - 1];
    if (lastRSI < 30) {
      bullishScore += 30;
      reasons.push("Oversold (RSI)");
    } else if (lastRSI > 70) {
      bearishScore += 30;
      reasons.push("Overbought (RSI)");
    }

    // 2. MACD Analysis (Check the latest object)
    const lastMACD = macd[macd.length - 1];
    if (lastMACD.MACD > lastMACD.signal) {
      bullishScore += 25;
      reasons.push("MACD Bullish Crossover");
    } else {
      bearishScore += 25;
      reasons.push("MACD Bearish Crossover");
    }

    // 3. Trend Analysis
    const lastSMA50 = sma50[sma50.length - 1];
    const lastSMA200 =
      sma200 && sma200.length > 0 ? sma200[sma200.length - 1] : null;

    if (lastSMA200) {
      if (currentPrice > lastSMA50 && currentPrice > lastSMA200) {
        bullishScore += 25;
        reasons.push("Above Golden Cross/Trend");
      } else if (currentPrice < lastSMA50 && currentPrice < lastSMA200) {
        bearishScore += 25;
        reasons.push("Below Death Cross/Trend");
      }
    } else {
      // If SMA200 not available, only check SMA50
      if (currentPrice > lastSMA50) {
        bullishScore += 15;
        reasons.push("Above 50-day MA");
      } else {
        bearishScore += 15;
        reasons.push("Below 50-day MA");
      }
    }

    // Determine Final Signal
    let finalSignal = "HOLD";
    let totalConfidence = 0;

    if (bullishScore > bearishScore && bullishScore > 40) {
      finalSignal = "BUY";
      totalConfidence = bullishScore;
    } else if (bearishScore > bullishScore && bearishScore > 40) {
      finalSignal = "SELL";
      totalConfidence = bearishScore;
    }

    return {
      signal: finalSignal,
      confidence: Math.min(100, totalConfidence),
      reasons,
      timestamp: new Date(),
    };
  }
}

module.exports = TechnicalAnalysisService;
