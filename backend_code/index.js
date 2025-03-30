require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Correct import
const playwright = require("playwright");
const { chromium } = require("playwright");
const vm = require("vm");
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyByio0O1U-MIUAd97Z4I1cRXwsf6sEZsxA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log("Google Generative AI initialized successfully.");

// Endpoint to interact with Playwright automation scripts
app.post("/api/interact", async (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: "Command is required." });
  }

  try {
    const prompt = `You are an AI Playwright script generator. Given a natural language command, generate a JavaScript automation script that:
- Uses "use strict"; at the beginning.
- Wraps the script inside an async function with name run().
- Uses Playwright to automate browser actions.
- Do NOT add any require statements. Remember IMPORT NOTHING 
- Assume chromium is already defined and always keep { headless: false }.
- Infers the website, login credentials, and actions from the input text.
- Logs in if credentials are mentioned.
- Performs the specified action (e.g., searching, clicking, extracting HTML).
- Waits for elements to load and handles errors.
- Keep the code in a try-catch block and return error on any interruption.
- Outputs only valid JavaScript code with **no explanations**.
-Do not close the browser and remember to call this run function.
Command: "${command}"

Output:`; 
    const response = await model.generateContent(prompt);
    const script = response?.response?.text();

    if (!script) {
      return res.status(500).json({ error: "Failed to generate automation script." });
    }
    console.log("before")
    const aiGeneratedScript = `
    "use strict"; 
    return (async () => { 
      const browser = await chromium.launch({ headless: false }); 
      const page = await browser.newPage(); 
      await page.goto('https://www.youtube.com/'); 
      console.log('YouTube page opened successfully!'); 
      // Keep browser open for testing
      await new Promise(resolve => setTimeout(resolve, 5000)); 
    })();
  `;
  await executeScript(script);
    console.log("after")
    res.status(200).json({ message: "Command executed successfully.", script });
  } catch (error) {
    console.error("Error in /api/interact:", error.message);
    res.status(500).json({ error: error.message || "Failed to execute command." });
  }
});

async function executeScript(script) {
  try {
    const cleanedScript = script.replace(/```javascript|```/g, "").trim();
    console.log("Executing script:\n", cleanedScript);

    // // Wrapping AI-generated script inside an async function
    const scriptFunction = new Function(
      "chromium",
      `"use strict"; 
      return (async (chromium) => { 
        try { 
          ${cleanedScript} 
        } catch (err) { 
          console.error("Script error:", err); 
          return { success: false, error: err.message }; // Return error response instead of crashing
        } 
      })(chromium);`
    );
    console.log("Executing script:\n", cleanedScript);
    // const { chromium } = require("playwright");
    return await scriptFunction(chromium);
  } catch (error) {
    console.error("Error while executing the script:", error.message);
    throw error;
  }
}
// Endpoint to extract data from a URL based on a query
app.post("/api/extract", async (req, res) => {
  const { url, query } = req.body;

  if (!url || !query) {
    return res.status(400).json({ error: "URL and query are required." });
  }

  try {
    const prompt = `You are an AI Playwright script generator. Given a natural language command, generate a JavaScript automation script that:
- Uses Playwright to automate browser actions.
- Infers the website, login credentials, and user actions from the input text.
- Logs in if credentials are mentioned.
- Performs the specified action (e.g., searching, clicking, navigating).
- Extracts and returns HTML if required.
- Waits for elements to load and handles errors.
- Outputs only valid JavaScript code with no explanations.

Command: "${command}"

Output:`; 
    const response = await model.generateContent(prompt);
    const script = response?.response?.text();

    if (!script) {
      return res.status(500).json({ error: "Failed to generate extraction script." });
    }

    res.status(200).json({ data: null, script });

  } catch (error) {
    console.error("Error in /api/extract:", error.message);
    res.status(500).json({ error: error.message || "Failed to extract data." });
  }
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
