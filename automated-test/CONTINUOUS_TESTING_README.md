# Continuous Testing Setup for Google Forms

This setup enables you to run automated tests with multiple data sets for comprehensive form testing.

## Files Overview

### Core Files
- `continuous_test.js` - Enhanced automation script with data-driven testing
- `google_form_template.json` - Template configuration with placeholders
- `test_data.json` - Test data sets for multiple iterations
- `run_continuous_tests.bat` - Batch script for easy test execution

### Template System
The template uses `{{placeholder}}` syntax to replace values dynamically:
- `{{name}}` - Person's name
- `{{birth_date}}` - Birth date
- `{{phone}}` - Phone number
- `{{address}}` - Address
- `{{graduation_date}}` - Graduation date

## Quick Start

### Method 1: Using Batch Script (Recommended)
```bash
# Double-click or run from command line
run_continuous_tests.bat
```

### Method 2: Command Line
```bash
# Run all test data
node continuous_test.js google_form_template.json test_data.json

# Run with options
node continuous_test.js google_form_template.json test_data.json --options '{"maxIterations": 3}'
```

## Testing Options

### Available Options
```json
{
  "headless": false,           // Run browser in headless mode
  "delayBetweenTests": 2000,   // Milliseconds between test iterations
  "stopOnFirstFailure": false, // Stop testing on first failure
  "maxIterations": null        // Limit number of test iterations
}
```

### Example Commands

#### Run First 3 Tests Only
```bash
node continuous_test.js google_form_template.json test_data.json --options '{"maxIterations": 3}'
```

#### Run in Headless Mode
```bash
node continuous_test.js google_form_template.json test_data.json --options '{"headless": true}'
```

#### Stop on First Failure
```bash
node continuous_test.js google_form_template.json test_data.json --options '{"stopOnFirstFailure": true}'
```

#### Combined Options
```bash
node continuous_test.js google_form_template.json test_data.json --options '{"headless": true, "maxIterations": 2, "delayBetweenTests": 1000}'
```

## Adding New Test Data

### Edit test_data.json
```json
{
  "google_form_test_data": [
    {
      "name": "New Person",
      "birth_date": "01/01/1990",
      "phone": "0901111111",
      "address": "New Address, City",
      "graduation_date": "01/01/2025"
    }
  ]
}
```

### Date Format
- Use DD/MM/YYYY format for dates
- Example: "15/03/1990" for March 15, 1990

## Customizing Form Template

### Modify google_form_template.json
1. Update selectors if form structure changes
2. Add new fields with `{{placeholder}}` syntax
3. Modify step sequence as needed

### Example: Adding New Field
```json
{
  "action": "type",
  "selector": "input[aria-labelledby='new_field_id']",
  "value": "{{new_field_value}}"
}
```

## Test Results

The script provides detailed output:
- ✅ Successful test iterations
- ❌ Failed test iterations with error details
- 📈 Summary with success rate
- 📊 Failed test details for debugging

### Sample Output
```
📊 Starting continuous testing with 5 data sets
🚀 Starting test iteration 1 with data: {"name": "John Smith", ...}
✓ Typed 'John Smith' into input[type='text']
✅ Test iteration 1 completed successfully!

📈 TEST EXECUTION SUMMARY
==================================================
Total Tests: 5
✅ Successful: 4
❌ Failed: 1
Success Rate: 80.0%
```

## Troubleshooting

### Common Issues

1. **Selector Not Found**
   - Form structure may have changed
   - Update selectors in template file
   - Use browser dev tools to find correct selectors

2. **Date Format Issues**
   - Ensure dates are in DD/MM/YYYY format
   - Check if form expects different date format

3. **Timeout Errors**
   - Increase wait times in template
   - Check internet connection
   - Form may be loading slowly

### Debug Mode
Add debug information by modifying the script:
```javascript
console.log('Current step:', step);
console.log('Current data:', testData);
```

## Best Practices

1. **Test Data Variety**
   - Include edge cases (long names, special characters)
   - Test different date ranges
   - Vary address formats

2. **Selector Reliability**
   - Use stable selectors (aria-labelledby, data attributes)
   - Avoid CSS classes that might change
   - Test selectors in browser console first

3. **Error Handling**
   - Use `stopOnFirstFailure: false` for comprehensive testing
   - Review failed test details for patterns
   - Update selectors based on failure analysis

4. **Performance**
   - Use headless mode for faster execution
   - Adjust `delayBetweenTests` based on form response time
   - Limit iterations during development

## Integration with CI/CD

### Example GitHub Actions
```yaml
name: Form Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: node continuous_test.js google_form_template.json test_data.json --options '{"headless": true}'
```

## Advanced Usage

### Custom Test Data Sources
Modify the script to load data from:
- CSV files
- Database queries
- API responses
- Environment variables

### Parallel Testing
Run multiple browser instances for faster execution:
```javascript
// Example: Run tests in parallel batches
const batchSize = 3;
const batches = chunkArray(testData, batchSize);
```

### Reporting
Integrate with reporting tools:
- Generate HTML reports
- Send results to monitoring systems
- Create test artifacts for CI/CD

For more advanced customizations, modify the `continuous_test.js` file according to your specific needs.