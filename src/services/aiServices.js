const OpenAI = require("openai");

class AIAnalysisService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeStock(stockData, technicalSignals) {
    const prompt = `
            You are an expert stock market analyst specializing in Indian markets (NSE/BSE).
            
            Analyze the following stock data and provide a comprehensive investment report:
            
            Company: ${stockData.companyName}
            Symbol: ${stockData.symbol}
            Current Price: ₹${stockData.lastPrice}
            Today's Change: ${stockData.percentChange}
            
            Technical Analysis:
            - Signal: ${technicalSignals.signal}
            - Confidence: ${technicalSignals.confidence}%
            - Key Indicators: ${technicalSignals.reasons.join(", ")}
            
            Fundamental Data:
            - P/E Ratio: ${stockData.pe}
            - Market Cap: ${stockData.marketCap}
            - Sector: ${stockData.sector}
            - Industry: ${stockData.industry}
            
            Please provide:
            1. Executive Summary
            2. Technical Analysis Interpretation
            3. Fundamental Health Assessment
            4. Key Risks and Opportunities
            5. Investment Recommendation (with rationale)
            6. Suggested Entry/Exit Levels
            
            Note: This is for educational purposes only. Not investment advice.
        `;
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-5-nano",
        message: [
          {
            role: "system",
            content:
              "You are an Indian stock market expert with deep knowledge of NSE and BSE listed companies.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
      return {
        analysis: response.choices[0].message.content,
        technicalSummary: technicalSignals,
        timestamp: new Date(),
      };
    } catch (error) {
      console.log("Error during AI analysis: ", error);
      throw new Error("Failed to analyze stock data by aiServices");
    }
  }

  //generate sentiment analysis for news articles
  async analyzeNewsSentiment(newsArticles) {
    const prompt = `
            You are a financial news analyst specializing in Indian stock markets.
            
            Analyze the sentiment of the following news articles:
            
            ${newsArticles.map((article) => `- ${article.title}`).join("\n")}
            
            Please provide:
            1. Overall Sentiment (Positive, Negative, Neutral)
            2. Key Themes Identified
            3. Impact on Indian Markets (High/Medium/Low)
        `;
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-5-nano",
        message: [
          {
            role: "system",
            content:
              "You are a financial news analyst specializing in Indian stock markets.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
      return {
        sentiment: response.choices[0].message.content,
        timestamp: new Date(),
      };
    } catch (error) {
      console.log("Error during news sentiment analysis: ", error);
      throw new Error("Failed to analyze news sentiment");
    }
  }
}
