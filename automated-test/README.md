# Dynamic Selenium WebDriver Testing Framework
## Features
- Single dynamic function for automated testing
- Selenium WebDriver integration in JavaScript
- JSON-driven test configurations
- Multi-sector support (E-commerce, Healthcare, Social Media, Google Forms)
- Template system for new configurations
- Error handling with screenshots

## Setup
1. Install dependencies:
```bash
npm install

## Usage
### Basic Command
```bash
node index.js {json_file_name}
```

### Examples
```bash
# Run admin CMS article batch processing
node index.js admin_cms_article_batch

# Run single admin CMS article test
node index.js admin_cms_article

# Run Google Form automation
node index.js google_form
```

## Action Types
### 1. `type` - Input Data
Enter text into input fields, textareas, and other form elements.
**Syntax:**
```json
{
  "action": "type",
  "selector": "input[type='text']",
  "value": "Value to input",
  "format": "iso_date" // optional
}
```

**Supported Formats:**
- `iso_date`: Converts date format to ISO (YYYY-MM-DDTHH:mm:ss)


### 2. `click` - Mouse Click
Click on web page elements.

**Syntax:**
```json
{
  "action": "click",
  "selector": "button[type='submit']"
}
```

### 3. `navigate` - Navigation
Navigate to a different URL.

**Syntax:**
```json
{
  "action": "navigate",
  "url": "https://example.com/new-page"
}
```

### 4. `wait` - Wait
Pause execution for a specified duration.

**Syntax:**
```json
{
  "action": "wait",
  "duration": 3000
}
```

### 5. `loop_article` - Batch Data Processing
Process multiple articles/data from JSON files.

**Syntax:**
```json
{
  "action": "loop_article",
  "data": "article_data.json",
  "steps": [
    {
      "action": "type",
      "selector": "input[name='title']",
      "value": "{{title}}"
    },
    {
      "action": "click",
      "selector": "button[type='submit']"
    }
  ],
  "status_actions": {
    "pending": {
      "action": "click",
      "selector": ".status-pending"
    },
    "public": {
      "action": "click", 
      "selector": ".status-public"
    }
  }
}
```

## Selector Types
### By Tag
```json
"selector": "input"
"selector": "button"
"selector": "div"
```

### By Class
```json
"selector": ".button.button-blue"
"selector": ".form-control"
"selector": ".navbar-nav"
```

### By ID
```json
"selector": "#submit-btn"
"selector": "#username"
"selector": "#main-content"
```

### By Attribute
```json
"selector": "input[type='text']"
"selector": "button[type='submit']"
"selector": "a[href='#']"
"selector": "input[placeholder='Enter email']"
```

### By Position
```json
"selector": "div:nth-child(2) > ul > li > a"
"selector": "tr:nth-child(3) > td:nth-child(2)"
"selector": "ul > li:first-child"
```

### Combined Selectors
```json
"selector": "input[type='date'][aria-labelledby='i11']"
"selector": ".form-group input[required]"
"selector": "#container .item:not(.disabled)"
```

## Additional Actions
The current setup provides basic actions, but you may need to add custom actions for specific website requirements.

### Example: Adding a Custom Action
If you need to handle a specific scenario not covered by existing actions, you can implement your own:

**Example - Custom `scroll` action:**
```json
{
  "action": "scroll",
  "selector": ".target-element",
  "behavior": "smooth"
}
```

**Implementation in your code:**
```javascript
// Add this to your action handler
case 'scroll':
  const element = await driver.findElement(By.css(action.selector));
  await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth'});", element);
  break;
```

**Note:** Custom actions must be implemented in the source code to be functional.

## Troubleshooting
### Common Issues
- **Element not found**: Check selector accuracy and page loading time
- **Timeout errors**: Increase wait duration or add explicit waits
- **Browser crashes**: Ensure ChromeDriver compatibility with Chrome version




- **Configuration Overview**

##　In the JSON configuration file, you can customize the steps to simulate user actions on different websites. Each step represents an action a user would perform while interacting with the site.

- **How to Customize**

##　Adjust Steps: Modify the steps in the JSON file to match the actions you want the user to take on the website.
## Website-Specific Changes: If you're working with a particular website, you'll need to adjust the steps to fit that site’s layout and actions.

## For example, the google_form.json file is designed to work with Google Forms and doesn’t require a login.

## The admin-cms-article.json file is an example configuration that includes a set of steps for creating an article. It’s meant to serve as a reference to help you understand how to structure similar actions.