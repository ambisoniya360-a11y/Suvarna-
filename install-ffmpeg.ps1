# Create destination directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "C:\Users\User\AppData\Local\ffmpeg"

# Copy contents
Copy-Item -Path "C:\Users\User\AppData\Local\Temp\WinGet\Gyan.FFmpeg.8.1.1\extracted\ffmpeg-8.1.1-full_build\*" -Destination "C:\Users\User\AppData\Local\ffmpeg" -Recurse -Force

# Add bin folder to user PATH if not already present
$newPath = "C:\Users\User\AppData\Local\ffmpeg\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -split ';' -notcontains $newPath) {
    [Environment]::SetEnvironmentVariable("Path", $currentPath + ";" + $newPath, "User")
    Write-Output "Successfully added ffmpeg to PATH"
} else {
    Write-Output "ffmpeg is already in PATH"
}
