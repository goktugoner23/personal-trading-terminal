const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const bodyParser = require("body-parser");
const { getBinancePositions, closeBinancePosition } = require("./positions");
const app = express();
const PORT = 3000;
const { UMFutures } = require("@binance/futures-connector");
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;
const umFuturesClient = new UMFutures(apiKey, apiSecret, {
  baseURL: "https://fapi.binance.com",
});

let cachedNews = [];

async function fetchLatestNews() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://news.treeofalpha.com", {
      waitUntil: "networkidle2",
    });

    const news = await page.evaluate(() => {
      const newsItems = [];
      document
        .querySelectorAll(".box.padding-smallest.rowToColumn")
        .forEach((element) => {
          const titleElement = element.querySelector(".contentTitle a");
          const dateElement = element.querySelector(".originTime");
          const link = titleElement ? titleElement.href : null;

          if (titleElement && dateElement && link) {
            newsItems.push({
              title: titleElement.innerText.trim(),
              date: dateElement.innerText.trim(),
              link: link,
            });
          }
        });
      return newsItems;
    });

    await browser.close();
    cachedNews = news;
    console.log("Updated cached news: ", cachedNews);
  } catch (error) {
    console.error("Error during scraping: ", error);
  }
}

// Initial fetch
fetchLatestNews();

// Periodically fetch news every 5 minutes
setInterval(fetchLatestNews, 300000);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(bodyParser.json());

app.get("/api/news", (req, res) => {
  console.log("Serving cached news");
  res.json(cachedNews);
});

app.get("/api/positions", async (req, res) => {
  try {
    const positions = await getBinancePositions();
    res.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/close-position", async (req, res) => {
  const { symbol, side, quantity } = req.body;
  if (!symbol || !side || !quantity) {
    res
      .status(400)
      .json({ error: "Missing 'symbol', 'side' or 'quantity' parameter" });
    return;
  }

  try {
    const response = await closeBinancePosition(symbol, side, quantity);
    res.json(response);
  } catch (error) {
    console.error(
      `Error closing position for ${symbol}:`,
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/buy", async (req, res) => {
  const { symbol, quantity } = req.body;

  try {
    const response = await umFuturesClient.newOrder(symbol, "BUY", "MARKET", {
      quantity,
    });

    if (response.status === 200) {
      res.json({
        success: true,
        message: `Successfully bought ${quantity} of ${symbol.toUpperCase()}`,
      });
    } else {
      res.json({ success: false, message: response.data.msg });
    }
  } catch (error) {
    console.error("Error buying coin:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error: Positions size might be too big",
      });
  }
});

app.post("/api/sell", async (req, res) => {
  const { symbol, quantity } = req.body;

  try {
    const response = await umFuturesClient.newOrder(symbol, "SELL", "MARKET", {
      quantity,
    });

    if (response.status === 200) {
      res.json({
        success: true,
        message: `Successfully sold ${quantity} of ${symbol.toUpperCase()}`,
      });
    } else {
      res.json({ success: false, message: response.data.msg });
    }
  } catch (error) {
    console.error("Error selling coin:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error: Positions size might be too big",
      });
  }
});

app.post("/api/close-position", async (req, res) => {
  const { symbol } = req.query;
  try {
    const positions = await umFuturesClient.getPositionRisk();
    const position = positions.find(
      (pos) => pos.symbol === symbol && pos.positionAmt !== 0
    );
    if (!position) {
      return res.status(400).json({ message: "Position not found" });
    }
    const side = position.positionAmt > 0 ? "SELL" : "BUY";
    const quantity = Math.abs(position.positionAmt);
    const response = await umFuturesClient.newOrder(symbol, side, "MARKET", {
      quantity,
    });
    res.json(response);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({
      message: error.message,
      data: error.response ? error.response.data : null,
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
