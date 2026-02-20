// inspectYahooFinance.js
const yf = require("yahoo-finance2").default;

console.log("Available methods in yahoo-finance2:");
console.log(Object.getOwnPropertyNames(yf));
console.log("\nAvailable functions:");
console.log(Object.keys(yf));
