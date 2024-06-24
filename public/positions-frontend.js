let positions = []; // Global variable to store fetched positions

async function fetchPositions() {
  try {
    const response = await fetch("/api/positions");
    const data = await response.json();
    console.log("Fetched positions:", data);

    if (Array.isArray(data)) {
      positions = data; // Store positions data
      displayPositions(data);
    } else {
      console.error("Positions data is not an array:", data);
    }
  } catch (error) {
    console.error("Error fetching positions:", error);
  }
}

function displayPositions(positions) {
  const positionsContainer = document.getElementById("positions-content"); // Updated ID
  positionsContainer.innerHTML = ""; // Clear previous positions

  positions.forEach((position) => {
    if (parseFloat(position.positionAmt) !== 0) {
      const positionElement = document.createElement("div");
      positionElement.classList.add("position");

      const markPrice = parseFloat(position.markPrice);
      const entryPrice = parseFloat(position.entryPrice);
      const positionAmt = parseFloat(position.positionAmt);
      const unrealizedProfit = (markPrice - entryPrice) * positionAmt;
      const pnl = unrealizedProfit.toFixed(2);
      const roi = (
        (unrealizedProfit / (entryPrice * positionAmt)) *
        100
      ).toFixed(2);

      positionElement.innerHTML = `
        <div>${position.symbol}</div>
        <div>$${entryPrice.toFixed(2)}</div>
        <div>${positionAmt} ${position.symbol}</div>
        <div>$${markPrice.toFixed(2)}</div>
        <div>${pnl} USD (${roi}%)</div>
        <div>$${parseFloat(position.liquidationPrice).toFixed(2)}</div>
        <button class="close-position-button" onclick="closePosition('${
          position.symbol
        }', ${positionAmt})">Close Position</button>
      `;

      if (unrealizedProfit < 0) {
        positionElement
          .querySelector(".close-position-button")
          .classList.add("loss");
      } else {
        positionElement
          .querySelector(".close-position-button")
          .classList.add("profit");
      }

      positionsContainer.appendChild(positionElement);
    }
  });
}

async function closePosition(symbol) {
  try {
    const position = positions.find((pos) => pos.symbol === symbol);
    const quantity = Math.abs(position.positionAmt); // Ensure quantity is positive
    console.log(`Closing position for ${symbol} with size ${quantity}`);

    let response;
    if (position.positionAmt > 0) {
      // Long position, need to sell to close
      response = await fetch("/api/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol, quantity }),
      });
    } else if (position.positionAmt < 0) {
      // Short position, need to buy to close
      response = await fetch("/api/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol, quantity }),
      });
    } else {
      throw new Error("Quantity is zero, cannot close position.");
    }

    const result = await response.json();
    console.log("Close position response:", result);

    if (response.ok) {
      alert(`Successfully closed position for ${symbol.toUpperCase()}`);
      fetchPositions(); // Refresh positions
    } else {
      alert(
        `Failed to close position for ${symbol.toUpperCase()}: ${
          result.message
        }`
      );
    }
  } catch (error) {
    console.error("Error closing position:", error);
    alert(`FUCK to close position for ${symbol.toUpperCase()}`);
  }
}

function handleSubmit() {
  return true; // Allow form submission
}

async function buyCoin(event) {
  event.preventDefault();
  const symbol = document.getElementById("coin").value;
  const quantity = document.getElementById("amount").value;

  try {
    const response = await fetch(`/api/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol, quantity }),
    });

    const result = await response.json();
    console.log("Buy response:", result);

    if (response.ok) {
      alert(`Successfully bought ${quantity} of ${symbol.toUpperCase()}`);
      document.getElementById("tradeForm").submit(); // Submit the form to reload the page
    } else {
      alert(`Failed to buy ${symbol.toUpperCase()}: ${result.message}`);
    }
  } catch (error) {
    console.error("Error buying coin:", error);
    alert(`FUCK to buy ${symbol.toUpperCase()}`);
    document.getElementById("tradeForm").submit(); // Submit the form to reload the page
  }
}

async function sellCoin(event) {
  event.preventDefault();
  const symbol = document.getElementById("coin").value;
  const quantity = document.getElementById("amount").value;

  try {
    const response = await fetch(`/api/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol, quantity }),
    });

    const result = await response.json();
    console.log("Sell response:", result);

    if (response.ok) {
      alert(`Successfully sold ${quantity} of ${symbol.toUpperCase()}`);
      document.getElementById("tradeForm").submit(); // Submit the form to reload the page
    } else {
      alert(`Failed to sell ${symbol.toUpperCase()}: ${result.message}`);
    }
  } catch (error) {
    console.error("Error selling coin:", error);
    alert(`FUCK to sell ${symbol.toUpperCase()}`);
    document.getElementById("tradeForm").submit(); // Submit the form to reload the page
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchPositions();
  const buyButton = document.getElementById("buyButton");
  const sellButton = document.getElementById("sellButton");

  if (buyButton) {
    buyButton.addEventListener("click", buyCoin);
  }

  if (sellButton) {
    sellButton.addEventListener("click", sellCoin);
  }
});
