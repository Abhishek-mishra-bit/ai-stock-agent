require("dotenv").config();
const { NSELive, NSEArchive } = require("nse-api-package");
const axios = require("axios");
const { default: YahooFinance } = require("yahoo-finance2");

class NSEService {
  constructor() {
    this.nseLive = new NSELive();
    this.nseArchive = new NSEArchive();
    this.yahooFinance = new YahooFinance();
  }

  //getting real time stock quote or data
  async getStockQuote(symbol) {
    try {
      const data = await this.nseLive.stockQuote(symbol);
      //   console.log("Raw stock quote data for symbol: ", symbol, data);
      return {
        symbol: data.info.symbol,
        companyName: data.info.companyName,
        industry: data.info.industry,
        price: data.priceInfo.lastPrice,
        open: data.priceInfo.open,
        close: data.priceInfo.close,
        change: data.priceInfo.change,
        pChange: data.priceInfo.pChange,
        dayLow: data.priceInfo.intraDayHighLow.min,
        dayHigh: data.priceInfo.intraDayHighLow.max,
        vwap: data.priceInfo.vwap,
        volume: data.preOpenMarket.totalTradedVolume,
        totalBuyQuantity: data.preOpenMarket.totalBuyQuantity,
        totalSellQuantity: data.preOpenMarket.totalSellQuantity,
        industryInfo: data.industryInfo,
        weekHighLow: data.priceInfo.weekHighLow,
        timeStamp: new Date(),
      };
    } catch (error) {
      console.log("Error fetching stock quote for symbol: ", symbol, error);
      throw new Error("Failed to fetch stock quote");
    }
  }

  //getting market indices
  async getMarketIndices() {
    try {
      const indices = await this.nseLive.allIndices();
      return indices.data.filter((index) =>
        ["NIFTY 50", "NIFTY BANK", "NIFTY IT", "NIFTY AUTO"].includes(
          index.index,
        ),
      );
    } catch (error) {
      console.log("Error fetching market indices: ", error);
      throw new Error("Failed to fetch market indices");
    }
  }

  async getHistoricalData(symbol = "ITC", days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Add .NS suffix for Indian stocks if not already present
      const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
      
      const queryOptions = { period1: startDate, period2: endDate };
      const result = await this.yahooFinance.historical(yahooSymbol, queryOptions);
      
      console.log("Raw historical data for symbol: ", symbol, result);
      
      // Format the response
      return result.map((entry) => ({
        date: entry.date,
        open: entry.open,
        high: entry.high,
        low: entry.low,
        close: entry.close,
        volume: entry.volume,
      }));
    } catch (error) {
      console.log("Error fetching historical data for symbol: ", symbol, error);
      throw new Error("Failed to fetch historical data");
    }
  }
}

module.exports = NSEService;
