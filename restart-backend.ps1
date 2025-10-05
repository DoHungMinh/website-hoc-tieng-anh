# Restart Backend Server Script
# This script kills the process on port 5002 and restarts the backend

Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Cyan

# Try to find and kill process on port 5002
try {
    $connection = Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess
        Write-Host "Found process on port 5002 (PID: $processId)" -ForegroundColor Yellow
        
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Process stopped" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "No process found on port 5002" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Could not kill process: $_" -ForegroundColor Yellow
}

# Navigate to backend and start
Write-Host "`n🚀 Starting backend server..." -ForegroundColor Cyan
Set-Location -Path "backend"
npm start
