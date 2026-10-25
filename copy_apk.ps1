$src = "C:\Users\wu\OneDrive\Desktop\Ethiopian-House-Rental - Copy\mobile\build\app\outputs\flutter-apk\app-release.apk"
$destDir = "C:\Users\wu\OneDrive\Desktop\Ethiopian-House-Rental - Copy\web\public\downloads"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$destFile = Join-Path $destDir "ethiopian-house-rental.apk"
Copy-Item -Path $src -Destination $destFile -Force
Write-Host "Successfully copied APK to $destFile"
Get-Item $destFile | Select-Object FullName, Length, LastWriteTime
