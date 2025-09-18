const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

/**
 * Replace template placeholders with actual data values
 * @param {Object} template - The template configuration
 * @param {Object} data - The data to replace placeholders with
 * @returns {Object} - Configuration with replaced values
 */
function replaceTemplateValues(template, data) {
  const configStr = JSON.stringify(template);
  let replacedStr = configStr;
  
  // Replace all {{key}} placeholders with actual values
  Object.keys(data).forEach(key => {
    const placeholder = `{{${key}}}`;
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
    replacedStr = replacedStr.replace(regex, data[key]);
  });
  
  return JSON.parse(replacedStr);
}

/**
 * Get locator based on selector type
 * @param {string} selector - CSS selector or XPath
 * @returns {Object} - Selenium locator
 */
function getLocator(selector) {
  if (selector.startsWith('//') || selector.startsWith('(')) {
    return By.xpath(selector);
  }
  return By.css(selector);
}

/**
 * Execute a single test step
 * @param {Object} driver - WebDriver instance
 * @param {Object} step - Test step configuration
 */
async function executeStep(driver, step) {
  console.log(`Executing step: ${step.action}`);
  
  switch (step.action) {
    case 'type':
      await handleTypeAction(driver, step);
      break;
    case 'click':
      await handleClickAction(driver, step);
      break;
    case 'wait':
      await handleWaitAction(driver, step);
      break;
    case 'navigate':
      await handleNavigateAction(driver, step);
      break;
    default:
      console.warn(`Unknown action: ${step.action}`);
  }
}

/**
 * Handle type action
 * @param {Object} driver - WebDriver instance
 * @param {Object} step - Step configuration
 */
async function handleTypeAction(driver, step) {
  try {
    const element = await driver.wait(until.elementLocated(getLocator(step.selector)), 10000);
    await element.clear();
    await element.sendKeys(step.value);
    console.log(`✓ Typed '${step.value}' into ${step.selector}`);
  } catch (error) {
    console.error(`✗ Failed to type into ${step.selector}: ${error.message}`);
    throw error;
  }
}

/**
 * Handle click action
 * @param {Object} driver - WebDriver instance
 * @param {Object} step - Step configuration
 */
async function handleClickAction(driver, step) {
  try {
    const element = await driver.wait(until.elementLocated(getLocator(step.selector)), 10000);
    await element.click();
    console.log(`✓ Clicked ${step.selector}`);
  } catch (error) {
    console.error(`✗ Failed to click ${step.selector}: ${error.message}`);
    throw error;
  }
}

/**
 * Handle wait action
 * @param {Object} driver - WebDriver instance
 * @param {Object} step - Step configuration
 */
async function handleWaitAction(driver, step) {
  await driver.sleep(step.duration);
  console.log(`✓ Waited ${step.duration}ms`);
}

/**
 * Handle navigate action
 * @param {Object} driver - WebDriver instance
 * @param {Object} step - Step configuration
 */
async function handleNavigateAction(driver, step) {
  await driver.get(step.url);
  console.log(`✓ Navigated to ${step.url}`);
}

/**
 * Run a single test with specific data
 * @param {Object} driver - WebDriver instance
 * @param {Object} template - Test template
 * @param {Object} testData - Data for this test iteration
 * @param {number} iteration - Current iteration number
 */
async function runSingleTest(driver, template, testData, iteration) {
  console.log(`\n🚀 Starting test iteration ${iteration + 1} with data:`, testData);
  
  try {
    // Replace template placeholders with actual data
    const config = replaceTemplateValues(template, testData);
    
    // Navigate to the form URL
    await driver.get(config.url);
    
    // Execute all steps
    for (const step of config.steps) {
      await executeStep(driver, step);
    }
    
    console.log(`✅ Test iteration ${iteration + 1} completed successfully!`);
    return { success: true, data: testData };
    
  } catch (error) {
    console.error(`❌ Test iteration ${iteration + 1} failed:`, error.message);
    return { success: false, data: testData, error: error.message };
  }
}

/**
 * Run continuous testing with multiple data sets
 * @param {string} templatePath - Path to template configuration
 * @param {string} dataPath - Path to test data
 * @param {Object} options - Testing options
 */
async function runContinuousTest(templatePath, dataPath, options = {}) {
  const {
    headless = false,
    delayBetweenTests = 2000,
    stopOnFirstFailure = false,
    maxIterations = null
  } = options;
  
  // Load template and test data
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
  const testDataFile = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const testDataArray = testDataFile.google_form_test_data;
  
  // Limit iterations if specified
  const dataToTest = maxIterations ? testDataArray.slice(0, maxIterations) : testDataArray;
  
  console.log(`📊 Starting continuous testing with ${dataToTest.length} data sets`);
  console.log(`Template: ${templatePath}`);
  console.log(`Data: ${dataPath}`);
  
  // Initialize WebDriver
  const chromeOptions = require('selenium-webdriver/chrome').Options;
  const options_chrome = new chromeOptions();
  
  if (headless) {
    options_chrome.addArguments('--headless');
  }
  options_chrome.addArguments('--disable-web-security', '--disable-features=VizDisplayCompositor');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options_chrome)
    .build();
  
  const results = [];
  
  try {
    for (let i = 0; i < dataToTest.length; i++) {
      const result = await runSingleTest(driver, template, dataToTest[i], i);
      results.push(result);
      
      // Stop on first failure if option is enabled
      if (!result.success && stopOnFirstFailure) {
        console.log('🛑 Stopping tests due to failure (stopOnFirstFailure = true)');
        break;
      }
      
      // Wait between tests (except for the last one)
      if (i < dataToTest.length - 1) {
        console.log(`⏳ Waiting ${delayBetweenTests}ms before next test...`);
        await driver.sleep(delayBetweenTests);
      }
    }
    
  } finally {
    await driver.quit();
  }
  
  // Print summary
  printTestSummary(results);
  
  return results;
}

/**
 * Print test execution summary
 * @param {Array} results - Array of test results
 */
function printTestSummary(results) {
  console.log('\n📈 TEST EXECUTION SUMMARY');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach((result, index) => {
      console.log(`  ${index + 1}. Data: ${JSON.stringify(result.data)}`);
      console.log(`     Error: ${result.error}`);
    });
  }
  
  console.log('=' .repeat(50));
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node continuous_test.js <template_file> <data_file> [options]');
    console.log('\nExample:');
    console.log('  node continuous_test.js google_form_template.json test_data.json');
    console.log('\nOptions (as JSON string):');
    console.log('  --options \'{"headless": true, "maxIterations": 3, "stopOnFirstFailure": false}\'');
    process.exit(1);
  }
  
  const templatePath = path.join(__dirname, args[0]);
  const dataPath = path.join(__dirname, args[1]);
  
  // Parse options if provided
  let options = {};
  const optionsIndex = args.indexOf('--options');
  if (optionsIndex !== -1 && args[optionsIndex + 1]) {
    try {
      options = JSON.parse(args[optionsIndex + 1]);
    } catch (error) {
      console.error('Invalid options JSON:', error.message);
      process.exit(1);
    }
  }
  
  runContinuousTest(templatePath, dataPath, options)
    .then(results => {
      const failedCount = results.filter(r => !r.success).length;
      process.exit(failedCount > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  runContinuousTest,
  replaceTemplateValues,
  runSingleTest
};