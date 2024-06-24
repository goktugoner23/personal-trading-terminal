const { UMFutures } = require("@binance/futures-connector");
require("dotenv").config();

const binanceApiKey = process.env.BINANCE_API_KEY;
const binanceApiSecret = process.env.BINANCE_API_SECRET;

const umFuturesClient = new UMFutures(binanceApiKey, binanceApiSecret, {
  baseURL: "https://fapi.binance.com",
});

async function getBinancePositions() {
  try {
    const response = await umFuturesClient.getPositionInformationV2();
    return response.data;
  } catch (error) {
    console.error("Error fetching positions from Binance:", error);
    return [];
  }
}

async function closeBinancePosition(symbol) {
  try {
    const positions = await getBinancePositions();
    const position = positions.find((p) => p.symbol === symbol);
    const positionAmt = parseFloat(position.positionAmt);

    if (positionAmt === 0) {
      throw new Error(`No open position for symbol ${symbol}`);
    }

    const side = positionAmt > 0 ? "SELL" : "BUY";
    const quantity = Math.abs(positionAmt);
    const response = await umFuturesClient.newOrder(symbol, side, "MARKET", {
      quantity,
    });

    console.log(`Position for ${symbol} closed:`, response);
    return response;
  } catch (error) {
    console.error(`Error closing position for ${symbol}:`, error);
    throw error;
  }
}

module.exports = { getBinancePositions, closeBinancePosition };
