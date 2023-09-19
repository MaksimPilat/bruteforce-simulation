import { ALPHABET, chartConfig } from "./config.js";

function generatePassword(passwordLength) {
  let password = "";

  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    password += ALPHABET[randomIndex];
  }

  return password;
}

function updateFrequencyDistribution(password) {
  const frequencyDistribution = {};

  for (const char of password) {
    if (frequencyDistribution[char]) frequencyDistribution[char]++;
    else frequencyDistribution[char] = 1;
  }

  const parent = document.getElementById("frequencyTaable");
  const frequencyTable = document.createElement("table");
  const tbody = document.createElement("tbody");
  const symbolRow = document.createElement("tr");
  const symbolHeaderCell = document.createElement("th");
  symbolHeaderCell.textContent = "Symbol";
  symbolRow.appendChild(symbolHeaderCell);

  for (const char in frequencyDistribution) {
    const symbolCell = document.createElement("td");
    symbolCell.textContent = char;
    symbolRow.appendChild(symbolCell);
  }

  const frequencyRow = document.createElement("tr");
  const frequencyHeaderCell = document.createElement("th");
  frequencyHeaderCell.textContent = "Frequency";
  frequencyRow.appendChild(frequencyHeaderCell);

  for (const char in frequencyDistribution) {
    const frequencyCell = document.createElement("td");
    frequencyCell.textContent = frequencyDistribution[char];
    frequencyRow.appendChild(frequencyCell);
  }

  tbody.appendChild(symbolRow);
  tbody.appendChild(frequencyRow);
  frequencyTable.appendChild(tbody);

  const existingTable = parent.querySelector("table");
  if (existingTable) existingTable.remove();
  parent.appendChild(frequencyTable);
}

function updateChart(chart, passwordLength, matchingTime) {
  chart.data.points.push({ x: passwordLength, y: matchingTime });
  chart.data.labels.push(passwordLength);
  chart.data.datasets[0].data.push(matchingTime);

  const groupedData = chart.data.points.reduce((result, item) => {
    if (!result[item.x]) {
      result[item.x] = { sum: 0, count: 0 };
    }
    result[item.x].sum += item.y;
    result[item.x].count++;

    return result;
  }, {});

  chart.data.datasets[1].data = Object.keys(groupedData).map((key) => {
    return {
      x: parseInt(key),
      y: groupedData[key].sum / groupedData[key].count,
    };
  });

  chart.update();
}

async function getMatchingTime(password, alphabet) {
  let worker;

  try {
    const response = await fetch("bruteforceWorker.js");
    const workerCode = await response.text();
    const blob = new Blob([workerCode], { type: "application/javascript" });
    worker = new Worker(URL.createObjectURL(blob));
  } catch (error) {
    console.error(error);
  }

  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      resolve(event.data.time);
      worker.terminate();
    };

    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };

    worker.postMessage({ password: password, alphabet: alphabet });
  });
}

const ctx = document.getElementById("passwordChart").getContext("2d");
const passwordChart = new Chart(ctx, chartConfig);
const generateBtn = document.getElementById("generate-btn");
const loader = document.getElementById("loader");

generateBtn.onclick = async () => {
  const passwordLength = parseInt(
    document.getElementById("passwordLength").value
  );
  const password = generatePassword(passwordLength);

  document.getElementById("password").textContent = password;
  updateFrequencyDistribution(password);
  document.getElementById("averageTime").textContent = "";

  try {
    generateBtn.disabled = true;
    loader.classList.toggle("hide");

    const matchingTime = await getMatchingTime(password, ALPHABET);

    generateBtn.disabled = false;
    loader.classList.toggle("hide");

    document.getElementById("averageTime").textContent =
      matchingTime.toFixed(2) + " (ms)";

    updateChart(passwordChart, password.length, matchingTime);
  } catch (error) {
    document.getElementById("averageTime").textContent = error;
    console.error(error);
  }
};
