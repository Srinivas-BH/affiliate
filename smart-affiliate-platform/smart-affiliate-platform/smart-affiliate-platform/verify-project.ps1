#!/usr/bin/env powershell
# DIS-CYRA - Project Verification Script

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "DIS-CYRA - Project Verification" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "d:\Affiliate\smart-affiliate-platform"
$checks = @()

# Check Node.js
Write-Host "ENVIRONMENT CHECK" -ForegroundColor Yellow
$nodeVersion = node -v 2>$null
$npmVersion = npm -v 2>$null

if ($nodeVersion) {
    Write-Host "OK Node.js: $nodeVersion" -ForegroundColor Green
    $checks += "Node.js: PASS"
} else {
    Write-Host "FAIL Node.js: NOT INSTALLED" -ForegroundColor Red
    $checks += "Node.js: FAIL"
}

if ($npmVersion) {
    Write-Host "OK npm: $npmVersion" -ForegroundColor Green
    $checks += "npm: PASS"
} else {
    Write-Host "FAIL npm: NOT INSTALLED" -ForegroundColor Red
    $checks += "npm: FAIL"
}

Write-Host ""
Write-Host "BACKEND FILES CHECK" -ForegroundColor Yellow

$backendFiles = @(
    "server.js",
    ".env",
    "package.json",
    "controllers/authController.js",
    "models/User.js",
    "routes/authRoutes.js"
)

$backendMissing = 0
foreach ($file in $backendFiles) {
    $fullPath = Join-Path $projectRoot "backend" $file
    if (Test-Path $fullPath) {
        Write-Host "  OK $file" -ForegroundColor Green
    } else {
        Write-Host "  FAIL $file (MISSING)" -ForegroundColor Red
        $backendMissing++
    }
}

if ($backendMissing -eq 0) {
    Write-Host "OK All critical backend files present" -ForegroundColor Green
    $checks += "Backend Files: PASS"
} else {
    Write-Host "FAIL $backendMissing backend files missing" -ForegroundColor Red
    $checks += "Backend Files: FAIL"
}

Write-Host ""
Write-Host "FRONTEND FILES CHECK" -ForegroundColor Yellow

$frontendFiles = @(
    "package.json",
    "src/App.js",
    "src/pages/LoginPage.js",
    "src/context/AuthContext.js"
)

$frontendMissing = 0
foreach ($file in $frontendFiles) {
    $fullPath = Join-Path $projectRoot "frontend" $file
    if (Test-Path $fullPath) {
        Write-Host "  OK $file" -ForegroundColor Green
    } else {
        Write-Host "  FAIL $file (MISSING)" -ForegroundColor Red
        $frontendMissing++
    }
}

if ($frontendMissing -eq 0) {
    Write-Host "OK All critical frontend files present" -ForegroundColor Green
    $checks += "Frontend Files: PASS"
} else {
    Write-Host "FAIL $frontendMissing frontend files missing" -ForegroundColor Red
    $checks += "Frontend Files: FAIL"
}

Write-Host ""
Write-Host "DEPENDENCIES CHECK" -ForegroundColor Yellow

$backendNodeModules = Test-Path (Join-Path $projectRoot "backend" "node_modules")
$frontendNodeModules = Test-Path (Join-Path $projectRoot "frontend" "node_modules")

if ($backendNodeModules) {
    Write-Host "OK Backend node_modules installed" -ForegroundColor Green
    $checks += "Backend Dependencies: PASS"
} else {
    Write-Host "FAIL Backend node_modules NOT INSTALLED" -ForegroundColor Red
    Write-Host "   Run: cd backend; npm install" -ForegroundColor Yellow
    $checks += "Backend Dependencies: FAIL"
}

if ($frontendNodeModules) {
    Write-Host "OK Frontend node_modules installed" -ForegroundColor Green
    $checks += "Frontend Dependencies: PASS"
} else {
    Write-Host "FAIL Frontend node_modules NOT INSTALLED" -ForegroundColor Red
    Write-Host "   Run: cd frontend; npm install" -ForegroundColor Yellow
    $checks += "Frontend Dependencies: FAIL"
}

Write-Host ""
Write-Host "ENVIRONMENT CONFIGURATION CHECK" -ForegroundColor Yellow

$envPath = Join-Path $projectRoot "backend" ".env"
if (Test-Path $envPath) {
    Write-Host "OK .env file exists" -ForegroundColor Green
    $checks += "Environment Config: PASS"
} else {
    Write-Host "FAIL .env file not found" -ForegroundColor Red
    $checks += "Environment Config: FAIL"
}

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($checks | Where-Object { $_ -match "PASS" }).Count
$failed = ($checks | Where-Object { $_ -match "FAIL" }).Count

Write-Host "Results:" -ForegroundColor White
Write-Host "  OK Passed: $passed" -ForegroundColor Green
Write-Host "  FAIL Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "PROJECT VERIFICATION SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Green
    Write-Host "  1. Start Backend:  cd backend; npm run dev" -ForegroundColor White
    Write-Host "  2. Start Frontend: cd frontend; npm start" -ForegroundColor White
    Write-Host "  3. Open Browser:   http://localhost:3000" -ForegroundColor White
} else {
    Write-Host "Fix the above errors before starting" -ForegroundColor Red
}

Write-Host ""
