const ctx = document.getElementById("balanceChart").getContext("2d");
let balanceChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [], // Placeholder for labels
    datasets: [
      {
        label: "Wallet Balance",
        data: [], // Placeholder for data
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 1,
        fill: false,
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "#fff" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#fff" },
      },
    },
    plugins: {
      legend: { display: false },
    },
  },
});

const data = {
  7: {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    values: [10, 20, 15, 30, 25, 35, 40],
  },
  30: {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    values: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50)),
  },
  60: {
    labels: Array.from({ length: 60 }, (_, i) => `Day ${i + 1}`),
    values: Array.from({ length: 60 }, () => Math.floor(Math.random() * 50)),
  },
  90: {
    labels: Array.from({ length: 90 }, (_, i) => `Day ${i + 1}`),
    values: Array.from({ length: 90 }, () => Math.floor(Math.random() * 50)),
  },
};

function updateChart(days) {
  balanceChart.data.labels = data[days].labels;
  balanceChart.data.datasets[0].data = data[days].values;
  balanceChart.update();
}

// Initialize chart with 7 days data
updateChart(7);
