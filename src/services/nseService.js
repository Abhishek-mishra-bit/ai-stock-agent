require("dotenv").config();
const { NSELive, NSEArchive } = require("nse-api-package");
const axios = require("axios");
const stockHistory = require("@imdr/nse-stock-history");

class NSEService {
  constructor() {
    this.nseLive = new NSELive();
    this.nseArchive = new NSEArchive();
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

  async getHistoricalData(symbol = "ITC", tradingDays = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();

      // Multiply by 2 to account for weekends (5 trading days per 7 calendar days)
      // Also add extra for Indian holidays
      const calendarDaysNeeded = Math.ceil(tradingDays * 2.2);
      startDate.setDate(endDate.getDate() - calendarDaysNeeded);

      // No .NS suffix needed - it's built for NSE
      const options = {
        symbol: symbol,
        resolution: "1d", // Daily data
        startTimestamp: startDate.getTime(), // Timestamp in milliseconds
        endTimestamp: endDate.getTime(),
        onlyClose: false, // Get full OHLCV
      };

      const data = await stockHistory(options);

      // Format the response to match your existing structure
      // The package returns arrays: { t: timestamps, o: opens, h: highs, l: lows, c: closes, v: volumes }
      const formattedData = data.t.map((timestamp, index) => ({
        date: new Date(timestamp), // Convert timestamp to Date object
        open: data.o?.[index],
        high: data.h?.[index],
        low: data.l?.[index],
        close: data.c[index],
        volume: data.v?.[index],
      }));

      console.log(
        `Requested ${tradingDays} trading days (${calendarDaysNeeded} calendar days), got ${formattedData.length} trading days`,
      );
      return formattedData;
    } catch (error) {
      console.log("Error fetching historical data for symbol: ", symbol, error);
      throw new Error("Failed to fetch historical data");
    }
  }
}

module.exports = NSEService;
