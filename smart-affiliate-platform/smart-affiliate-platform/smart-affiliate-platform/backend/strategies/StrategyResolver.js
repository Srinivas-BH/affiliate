const { detectPlatform } = require("../utils/detectPlatform");
const AmazonStrategy = require("./AmazonStrategy");
const NonApiStrategy = require("./NonApiStrategy");
const MeeshoStrategy = require("./MeeshoStrategy");

/**
 * Strategy Resolver - Detects platform and returns appropriate strategy
 */
class StrategyResolver {
  static getStrategy(affiliateLink) {
    const platform = detectPlatform(affiliateLink);

    switch (platform) {
      case "AMAZON":
        return new AmazonStrategy();
      case "MEESHO":
        return new MeeshoStrategy();
      case "FLIPKART":
      case "MYNTRA":
      case "OTHER":
      default:
        return new NonApiStrategy();
    }
  }
}

module.exports = StrategyResolver;
