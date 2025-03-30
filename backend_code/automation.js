const { chromium } = require('playwright');

/**
 * Automates browser actions based on commands.
 * @param {Array} commands - Array of commands with type, selector, and value.
 */
const automateBrowser = async (commands) => {
    const browser = await chromium.launch({ headless: false }); // Use headless: true for silent execution
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        for (const command of commands) {
            switch (command.action) {
                case 'navigate':
                    await page.goto(command.url);
                    break;

                case 'type':
                    await page.fill(command.selector, command.value);
                    break;

                case 'click':
                    await page.click(command.selector);
                    break;

                case 'waitFor':
                    await page.waitForSelector(command.selector);
                    break;

                default:
                    throw new Error(`Unsupported action: ${command.action}`);
            }
        }
    } catch (error) {
        console.error('Automation Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
};

module.exports = automateBrowser;
