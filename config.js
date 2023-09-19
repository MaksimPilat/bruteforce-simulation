const chartConfig = {
  data: {
    labels: [],
    datasets: [
      {
        label: "Matching time",
        data: [],
        backgroundColor: "rgb(159, 159, 159, .2)",
        type: "bar",
      },
      {
        label: "Average time",
        data: [],
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 2,
        type: "line",
      },
    ],
    points: [],
  },
  options: {
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Password length",
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Time (ms)",
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y || 0;
            const datasetLabel = context.dataset.label || "";
            return datasetLabel + ": " + value.toFixed(2);
          },
        },
      },
    },
  },
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz1234567890";

export { chartConfig, ALPHABET };
