# 🧹 Clean Up Test Files - Before Git Commit

Write-Host "🧹 CLEANING UP TEST FILES..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$filesDeleted = 0
$errors = 0

# Function to delete file safely
function Remove-FileSafely {
    param($path)
    try {
        if (Test-Path $path) {
            Remove-Item -Force $path -ErrorAction Stop
            Write-Host "✅ Deleted: $path" -ForegroundColor Green
            return 1
        }
    } catch {
        Write-Host "❌ Error deleting $path : $_" -ForegroundColor Red
        return 0
    }
    return 0
}

Write-Host "📁 Cleaning Root Directory..." -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

# Root directory test files
$rootFiles = @(
    "test-ielts-scoring.js",
    "test-week-endpoint.js",
    "test-week-logic.js",
    "debug-week-simple.js",
    "migrate-users.js"
)

foreach ($file in $rootFiles) {
    $filesDeleted += Remove-FileSafely $file
}

Write-Host ""
Write-Host "📁 Cleaning Backend Directory..." -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

# Backend test files
$backendFiles = @(
    "backend\test-ai-ielts.js",
    "backend\test-smtp.js",
    "backend\test-webhook.js",
    "backend\testLogin.js",
    "backend\checkUsers.js"
)

foreach ($file in $backendFiles) {
    $filesDeleted += Remove-FileSafely $file
}

Write-Host ""
Write-Host "📁 Cleaning Backend Subdirectories..." -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

# Backend additional test files
$backendSubFiles = @(
    "backend\check-enrollment-issues.js"
)

foreach ($file in $backendSubFiles) {
    $filesDeleted += Remove-FileSafely $file
}

Write-Host ""
Write-Host "📁 Cleaning Frontend Test Files..." -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

# Frontend test HTML files
$frontendFiles = @(
    "frontend\public\test.html",
    "frontend\public\test-statistics.html",
    "frontend\src\test-api.html"
)

foreach ($file in $frontendFiles) {
    $filesDeleted += Remove-FileSafely $file
}

Write-Host ""
Write-Host "📁 Removing Demo/Unused Directories..." -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

# PayosWebhookDemo (demo code, không cần)
if (Test-Path "PayosWebhookDemo") {
    try {
        Remove-Item -Recurse -Force "PayosWebhookDemo" -ErrorAction Stop
        Write-Host "✅ Deleted directory: PayosWebhookDemo" -ForegroundColor Green
        $filesDeleted++
    } catch {
        Write-Host "❌ Error deleting PayosWebhookDemo: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎉 CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "📊 Files/Folders Deleted: $filesDeleted" -ForegroundColor Cyan
Write-Host ""

# Verify remaining files
Write-Host "📋 Remaining JavaScript files in root:" -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*.js" -ErrorAction SilentlyContinue | Select-Object Name, Length | Format-Table

Write-Host "📋 Remaining JavaScript files in backend root:" -ForegroundColor Yellow  
Get-ChildItem -Path backend -Filter "*.js" -ErrorAction SilentlyContinue | Select-Object Name, Length | Format-Table

Write-Host "✅ Project is clean and ready for Git commit!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "  1. git status" -ForegroundColor White
Write-Host "  2. git add ." -ForegroundColor White
Write-Host "  3. git commit -m 'Clean up test files and improve AI IELTS generation'" -ForegroundColor White
Write-Host "  4. git push" -ForegroundColor White
