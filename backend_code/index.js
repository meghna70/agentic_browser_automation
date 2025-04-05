require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer"); 
const { exec } = require("child_process"); 
const fs = require("fs"); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PROXY = process.env.PROXY || ""; 

app.post("/api/interact", async (req, res) => {
  const { browserType, command } = req.body;

  if (!browserType || !command) {
    return res.status(400).json({ error: "Browser type and command are required." });
  }

  try {
    const executionResult = browserType === "firefox"
      ? await executeFirefox(command)
      : await executeChrome(command);

    res.status(200).json({ message: "Command executed successfully.", executionResult });
  } catch (error) {
    console.error("Error in /api/interact:", error.message);
    res.status(500).json({ error: error.message || "Failed to execute command." });
  }
});

app.post("/api/extract", async (req, res) => {
  const { browserType, url, query } = req.body;

  if (!browserType || !url || !query) {
    return res.status(400).json({ error: "Browser type, URL, and query are required." });
  }

  try {
    const executionResult = browserType === "firefox"
      ? await extractDataFirefox(url, query)
      : await extractDataChrome(url, query);

    res.status(200).json({ data: executionResult });
  } catch (error) {
    console.error("Error in /api/extract:", error.message);
    res.status(500).json({ error: error.message || "Failed to extract data." });
  }
});

async function executeChrome(command) {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome", // Adjust for Windows/Mac
    headless: false,
    args: PROXY ? [`--proxy-server=${PROXY}`] : [],
  });
  
  const page = await browser.newPage();
  await page.goto(command.url);
  console.log("Navigated to", command.url);

  return "Success: Chrome Automation Complete!";
}

async function executeFirefox(command) {
  return new Promise((resolve, reject) => {
    exec(`firefox ${command.url}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Firefox execution failed: ${stderr}`);
      } else {
        resolve(`Firefox opened: ${stdout}`);
      }
    });
  });
}

async function extractDataChrome(url, query) {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: PROXY ? [`--proxy-server=${PROXY}`] : [],
  });

  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(query);

  const result = await page.evaluate((query) => {
    return document.querySelector(query)?.innerText || "No data found";
  }, query);

  await browser.close();
  return result;
}

async function extractDataFirefox(url, query) {
  return new Promise((resolve, reject) => {
    exec(`firefox ${url}`, async (error) => {
      if (error) {
        reject(`Firefox execution failed: ${error.message}`);
      } else {
        resolve(`Data extraction from Firefox started for ${query}`);
      }
    });
  });
}

async function loadBrowserExtensions(browserType) {
  if (browserType === "chrome") {
    return puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      headless: false,
      args: [
        "--disable-extensions-except=/path/to/extension",
        "--load-extension=/path/to/extension",
      ],
    });
  } else {
    return "Firefox extensions need manual installation.";
  }
}

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
