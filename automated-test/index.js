const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

/**
 * Main function to run automated test based on configuration file
 * @param {string} configPath - Path to the configuration JSON file
 */
async function runAutomatedTest(configPath) {
	// Load configuration
	const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

	// Initialize WebDriver
	const driver = await new Builder().forBrowser('chrome').build();

	try {
		console.log(`🚀 Starting test: ${config.name}`);
		// Navigate to base URL
		await driver.get(config.url);

		// Wait for page to load and then capture HTML structure
		await driver.sleep(5000);
		
		// Debug: Log the HTML structure to help identify selectors
		try {
			const pageSource = await driver.getPageSource();
			console.log('📋 Capturing form structure for debugging...');
			
			// Look for phone-related elements
			const phoneElements = await driver.findElements(By.xpath("//*[contains(text(), 'Phone') or contains(text(), 'phone') or contains(@placeholder, 'phone') or contains(@placeholder, 'Phone')]"));
			console.log(`Found ${phoneElements.length} phone-related elements`);
			
			// Look for all input elements
			const allInputs = await driver.findElements(By.css('input'));
			console.log(`Found ${allInputs.length} input elements`);
			
			for (let i = 0; i < allInputs.length; i++) {
				try {
					const input = allInputs[i];
					const type = await input.getAttribute('type');
					const placeholder = await input.getAttribute('placeholder');
					const ariaLabel = await input.getAttribute('aria-label');
					const ariaLabelledBy = await input.getAttribute('aria-labelledby');
					console.log(`Input ${i}: type="${type}", placeholder="${placeholder}", aria-label="${ariaLabel}", aria-labelledby="${ariaLabelledBy}"`);
				} catch (e) {
					console.log(`Input ${i}: Could not get attributes`);
				}
			}
		} catch (debugError) {
			console.log('Debug info collection failed:', debugError.message);
		}

		// Execute test steps
		for (const step of config.steps) {
			await executeStep(driver, step);
		}

		console.log(`✅ Test completed successfully: ${config.name}`);
	} catch (error) {
		console.error(`❌ Test failed: ${error.message}`);
		await takeScreenshot(driver, 'error');
	} finally {
		await driver.quit();
	}
}

/**
 * Execute a single test step based on its action type
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {Object} step - Step configuration object
 */
async function executeStep(driver, step) {
    switch (step.action) {
		case 'type':
			await handleTypeAction(driver, step);
            break;
		case 'click':
			await handleClickAction(driver, step);
			break;
		case 'navigate':
			await handleNavigateAction(driver, step);
			break;
		case 'loop_article':
			await handleLoopArticleAction(driver, step);
			break;
		case 'wait':
			await handleWaitAction(driver, step);
            break;

        default:
            throw new Error(`Unknown action: ${step.action}`);
    }
}

/**
 * Get the appropriate locator based on selector type
 * @param {string} selector - The selector string
 * @returns {By} Selenium By locator
 */
function getLocator(selector) {
  if (selector.startsWith('//') || selector.startsWith('(')) {
    return By.xpath(selector);
  } else {
    return By.css(selector);
  }
}

/**
 * Handle type action - input text into form fields
 */
async function handleTypeAction(driver, step) {
    const typeElement = await driver.wait(until.elementLocated(getLocator(step.selector)), 5000);
    
    if (step.format === 'iso_date') { 
        // Format date to ISO format for date inputs
        step.value = formatToIsoDate(step.value);
        await driver.executeScript("arguments[0].value = arguments[1];", typeElement, step.value);
    } else {
        // Regular text input
        await typeElement.sendKeys(String(step.value));
	}
}

/**
 * Handle click action - click on elements
 */
async function handleClickAction(driver, step) {
    const clickElement = await driver.wait(until.elementLocated(getLocator(step.selector)), 5000);
    await clickElement.click();
}

/**
 * Handle navigate action - navigate to different URLs
 */
async function handleNavigateAction(driver, step) {
    await driver.get(step.url);
}

/**
 * Handle wait action - pause execution for specified duration
 */
async function handleWaitAction(driver, step) {
    await driver.sleep(step.duration || 1000);
}

/**
 * Handle loop article action - process multiple articles with different statuses
 */
async function handleLoopArticleAction(driver, step) {
    // Load article data from JSON file
    const articleData = JSON.parse(fs.readFileSync(step.data, 'utf-8'));
    
    // Process each article in the data
    for (const article of articleData.rows) {
        await processArticle(driver, article, step);
    }
}

/**
 * Process a single article with all its steps and status-specific actions
 */
async function processArticle(driver, article, step) {
    // Execute each step for the article
    for (const stepItem of step.steps) {
        // Replace placeholder values with actual article data
        if (stepItem.name) {
            stepItem.value = article[stepItem.name];
        }

        // Execute the step
        await executeStep(driver, stepItem);

        // Handle status-specific actions after submit
        if (stepItem.description === 'sumbit' && step.status_actions) {
            await handleStatusActions(driver, article, step);
        }
    }
}

/**
 * Handle status-specific actions based on article status
 */
async function handleStatusActions(driver, article, step) {
    // Execute pending action for pending or public articles
	if (article.status === 'pending' || article.status === 'public') {
		await handleWaitAction(driver, step.status_actions['pending']);
        await executeStep(driver, step.status_actions['pending']);
        
        // Execute public action for public articles
		if (article.status === 'public' && step.status_actions['public']) {
			await handleWaitAction(driver, step.status_actions['public']);
            await executeStep(driver, step.status_actions['public']);
        }
    }
}

/**
 * Format input string to ISO date format
 */
function formatToIsoDate(input) {
	return input.replace(' ', 'T').replace(/\//g, '-');
}


/**
 * Take a screenshot and save it to file
 */
async function takeScreenshot(driver, name) {
	const image = await driver.takeScreenshot();
	fs.writeFileSync(`${name}.png`, image, 'base64');
}


// Main execution
const configName = process.argv[2] || 'ecommerce';
const configPath = path.join(__dirname, `${configName}.json`);
runAutomatedTest(configPath);