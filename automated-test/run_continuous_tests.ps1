# Google Form Continuous Testing PowerShell Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Google Form Continuous Testing Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Available test scenarios:" -ForegroundColor Yellow
Write-Host "1. Run all test data (5 iterations)"
Write-Host "2. Run first 3 test data only"
Write-Host "3. Run in headless mode (all data)"
Write-Host "4. Run with stop-on-first-failure"
Write-Host "5. Run first 2 iterations (quick test)"
Write-Host "6. Custom options"
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host "Running all test data..." -ForegroundColor Green
        node continuous_test.js google_form_template.json test_data.json
    }
    "2" {
        Write-Host "Running first 3 test iterations..." -ForegroundColor Green
        $options = '{"maxIterations": 3}'
        node continuous_test.js google_form_template.json test_data.json --options $options
    }
    "3" {
        Write-Host "Running in headless mode..." -ForegroundColor Green
        $options = '{"headless": true}'
        node continuous_test.js google_form_template.json test_data.json --options $options
    }
    "4" {
        Write-Host "Running with stop-on-first-failure..." -ForegroundColor Green
        $options = '{"stopOnFirstFailure": true}'
        node continuous_test.js google_form_template.json test_data.json --options $options
    }
    "5" {
        Write-Host "Running first 2 iterations (quick test)..." -ForegroundColor Green
        $options = '{"maxIterations": 2}'
        node continuous_test.js google_form_template.json test_data.json --options $options
    }
    "6" {
        Write-Host "Enter custom options as JSON string:" -ForegroundColor Yellow
        Write-Host "Example: {\"headless\": true, \"maxIterations\": 3}" -ForegroundColor Gray
        $customOptions = Read-Host "Options"
        node continuous_test.js google_form_template.json test_data.json --options $customOptions
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Test execution completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"