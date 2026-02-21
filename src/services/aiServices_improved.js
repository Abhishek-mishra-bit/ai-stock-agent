const OpenAI = require("openai");

class AIAnalysisService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeStock(stockData, technicalIndicators, historicalData = null) {
    // Validate required data
    if (!stockData || !technicalIndicators) {
      throw new Error("Stock data and technical indicators are required");
    }

    // Calculate price change percentage if not provided
    const percentChange =
      stockData.pChange ||
      stockData.percentChange ||
      (stockData.change / stockData.open) * 100 ||
      0;
    const currentPrice = stockData.price || stockData.lastPrice || 0;

    // Calculate additional metrics from historical data
    let priceMetrics = "";
    if (historicalData && historicalData.length > 0) {
      const closes = historicalData.map((d) => d.close);
      const dayLow = Math.min(...closes.slice(-5));
      const dayHigh = Math.max(...closes.slice(-5));
      const avg50Day =
        closes.length >= 5
          ? (closes.reduce((a, b) => a + b, 0) / closes.length).toFixed(2)
          : "N/A";

      priceMetrics = `
            5-Day Low: ₹${dayLow.toFixed(2)}
            5-Day High: ₹${dayHigh.toFixed(2)}
            Average Price (Period): ₹${avg50Day}
            `;
    }

    const prompt = `
You are an expert stock market analyst specializing in Indian markets (NSE/BSE).

COMPANY DATA:
Name: ${stockData.companyName || "N/A"}
Symbol: ${stockData.symbol || "N/A"}
Current Price: ₹${currentPrice}
Today's Change: ${percentChange.toFixed(2)}%
Daily Low: ₹${stockData.dayLow || "N/A"}
Daily High: ₹${stockData.dayHigh || "N/A"}
52 Week Low: ₹${stockData.weekHighLow?.min || "N/A"}
52 Week High: ₹${stockData.weekHighLow?.max || "N/A"}
Volume: ${stockData.volume || "N/A"}
Buy Quantity: ${stockData.totalBuyQuantity || "N/A"}
Sell Quantity: ${stockData.totalSellQuantity || "N/A"}
P/E Ratio: ${stockData.pe || "N/A"}
Market Cap: ${stockData.marketCap || "N/A"}
Sector: ${stockData.industryInfo?.sector || stockData.sector || "N/A"}
Industry: ${stockData.industryInfo?.industry || stockData.industry || "N/A"}
${priceMetrics}

TECHNICAL ANALYSIS:
Signal: ${technicalIndicators.signal}
Confidence Level: ${technicalIndicators.confidence}%
Key Indicators: ${technicalIndicators.reasons?.join(", ") || "N/A"}
Timestamp: ${technicalIndicators.timestamp || new Date()}

Please provide a detailed analysis covering:
1. **Executive Summary** - Brief overview of the stock
2. **Technical Analysis** - Interpretation of signals and indicators
3. **Price Action** - Support/resistance levels and momentum
4. **Risk Assessment** - Key risks and concerns
5. **Opportunities** - Positive catalysts and growth potential
6. **Recommendation** - BUY/HOLD/SELL with clear rationale
7. **Price Targets** - Suggested entry/exit levels

Format your response clearly with headers and keep it concise but comprehensive.
Note: This analysis is for educational purposes only. Not financial advice.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content:
              "You are an expert Indian stock market analyst with deep knowledge of NSE/BSE companies, technical analysis, and fundamental research.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 1,
        max_completion_tokens: 1500,
      });

      // Extract content from response
      let analysisContent = "";
      if (
        response.choices &&
        response.choices[0] &&
        response.choices[0].message
      ) {
        analysisContent = response.choices[0].message.content || "";
      }

      // Fallback if content is empty
      if (!analysisContent || analysisContent.trim() === "") {
        analysisContent = `
Stock Analysis for ${stockData.companyName}:

**Executive Summary:**
${stockData.companyName} (${stockData.symbol}) is currently trading at ₹${currentPrice}, showing a change of ${percentChange.toFixed(2)}%.

**Technical Analysis:**
Current Signal: ${technicalIndicators.signal}
Confidence Level: ${technicalIndicators.confidence}%
Key Indicators: ${technicalIndicators.reasons.join(", ")}

**Company Details:**
Sector: ${stockData.industryInfo?.sector || "N/A"}
Industry: ${stockData.industryInfo?.industry || "N/A"}
P/E Ratio: ${stockData.pe || "N/A"}
Market Cap: ${stockData.marketCap || "N/A"}

**Recommendation:**
Based on technical indicators, the stock shows a ${technicalIndicators.signal} signal with ${technicalIndicators.confidence}% confidence.

Note: This is a technical analysis summary. Please consult with a financial advisor for investment decisions.
        `;
      }

      return {
        analysis: analysisContent,
        stockSummary: {
          symbol: stockData.symbol,
          companyName: stockData.companyName,
          currentPrice: currentPrice,
          percentChange: percentChange.toFixed(2),
        },
        technicalSummary: technicalIndicators,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error during AI stock analysis:", error.message);
      throw new Error(
        "Failed to analyze stock data. Please check your OpenAI API key and try again.",
      );
    }
  }

  // Generate sentiment analysis for news articles
  async analyzeNewsSentiment(newsArticles) {
    if (!newsArticles || newsArticles.length === 0) {
      throw new Error("News articles array is required");
    }

    const articlesText = newsArticles
      .map(
        (article) =>
          `Title: ${article.title}\nContent: ${article.content || "N/A"}`,
      )
      .join("\n\n");

    const prompt = `
You are a financial news analyst specializing in Indian stock markets.

Analyze the sentiment of the following news articles related to stocks/markets:

${articlesText}

Please provide:
1. **Overall Sentiment** - POSITIVE, NEGATIVE, or NEUTRAL (with percentage confidence)
2. **Key Themes** - Main topics and their sentiment impact
3. **Market Impact** - HIGH, MEDIUM, or LOW impact on Indian markets
4. **Affected Sectors** - Which sectors are most affected
5. **Action Items** - Recommended investor responses

Keep analysis concise but insightful.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content:
              "You are a financial news analyst specializing in Indian stock markets and market sentiment analysis.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 1,
        max_completion_tokens: 800,
      });

      let sentimentContent = "";
      if (
        response.choices &&
        response.choices[0] &&
        response.choices[0].message
      ) {
        sentimentContent = response.choices[0].message.content || "";
      }

      if (!sentimentContent || sentimentContent.trim() === "") {
        sentimentContent =
          "Unable to analyze sentiment at this time. Please try again.";
      }

      return {
        sentiment: sentimentContent,
        articleCount: newsArticles.length,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error during news sentiment analysis:", error.message);
      throw new Error(
        "Failed to analyze news sentiment. Please check your OpenAI API key.",
      );
    }
  }

  // Generate market outlook
  async generateMarketOutlook(marketIndices, trendingStocks) {
    if (!marketIndices || marketIndices.length === 0) {
      throw new Error("Market indices data is required");
    }

    const indicesText = marketIndices
      .map(
        (index) =>
          `${index.index}: ${index.last} (${index.percentChange}%) | P/E: ${index.pe}`,
      )
      .join("\n");

    const trendingText = trendingStocks
      ? trendingStocks
          .map(
            (stock) => `${stock.symbol}: ₹${stock.price} (${stock.pChange}%)`,
          )
          .join("\n")
      : "No trending data available";

    const prompt = `
You are an Indian market strategist. Based on the following market data, provide a market outlook:

Market Indices:
${indicesText}

Trending Stocks:
${trendingText}

Provide:
1. Market Trend - Bullish, Bearish, or Neutral
2. Key Drivers - What's driving the market
3. Sector Rotation - Which sectors are in focus
4. Risk Factors - Major risks to watch
5. Portfolio Strategy - Recommended approach for investors

Keep it actionable and data-driven.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert Indian stock market strategist and analyst.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 1,
        max_completion_tokens: 1000,
      });

      let outlookContent = "";
      if (
        response.choices &&
        response.choices[0] &&
        response.choices[0].message
      ) {
        outlookContent = response.choices[0].message.content || "";
      }

      if (!outlookContent || outlookContent.trim() === "") {
        outlookContent = "Market outlook analysis unavailable at this time.";
      }

      return {
        outlook: outlookContent,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error generating market outlook:", error.message);
      throw new Error("Failed to generate market outlook.");
    }
  }
}

module.exports = AIAnalysisService;
