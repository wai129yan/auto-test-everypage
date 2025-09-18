@echo off
echo ========================================
echo Google Form Continuous Testing Script
echo ========================================
echo.

echo Available test scenarios:
echo 1. Run all test data (5 iterations)
echo 2. Run first 3 test data only
echo 3. Run in headless mode (all data)
echo 4. Run with stop-on-first-failure
echo 5. Custom options
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo Running all test data...
    node continuous_test.js google_form_template.json test_data.json
) else if "%choice%"=="2" (
    echo Running first 3 test iterations...
    node continuous_test.js google_form_template.json test_data.json --options "{\"maxIterations\": 3}"
) else if "%choice%"=="3" (
    echo Running in headless mode...
    node continuous_test.js google_form_template.json test_data.json --options "{\"headless\": true}"
) else if "%choice%"=="4" (
    echo Running with stop-on-first-failure...
    node continuous_test.js google_form_template.json test_data.json --options "{\"stopOnFirstFailure\": true}"
) else if "%choice%"=="5" (
    echo Enter custom options as JSON string:
    set /p custom_options="Options: "
    node continuous_test.js google_form_template.json test_data.json --options "%custom_options%"
) else (
    echo Invalid choice. Exiting...
    exit /b 1
)

echo.
echo Test execution completed!
pause