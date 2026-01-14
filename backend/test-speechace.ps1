# Test Speechace API with PowerShell
$apiKey = "10aVYSlQ02QoQfzbzSuMFh/LijulCOxb/jf4upG2nDu/etq3VLi1BLDEfc9obrSNVofw09vJwM0blfjqUrz1JgCIJr9/Xfxvv4A1I19EZtR/lnKbmlzdF/okj2qDEM4G"
$audioPath = "E:\github\hyteam\website-hoc-tieng-anh\backend\temp\audio\cloudinary-mp3-695d2d8f98f8851605b5bb38-0-1768378992045.mp3"
$text = "I like to travel around the world"
$userId = "test-user-123"

Write-Host "API Key: $($apiKey.Substring(0,20))..."
Write-Host "Audio file: $audioPath"
Write-Host "File size: $((Get-Item $audioPath).Length) bytes"

# Create form data
$form = @{
    key = $apiKey
    text = $text
    user_audio_file = Get-Item -Path $audioPath
    dialect = "en-us"
    user_id = $userId
}

Write-Host "`nSending request to Speechace..."

try {
    $response = Invoke-RestMethod -Uri "https://api2.speechace.com/api/scoring/text/v0.5/json" `
        -Method Post `
        -Form $form `
        -TimeoutSec 30
    
    Write-Host "Success!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}
