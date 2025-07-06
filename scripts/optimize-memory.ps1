# Memory Optimization for Next.js on Windows
# This script helps optimize memory usage during builds on Windows

Write-Host "Optimizing memory for Next.js build..." -ForegroundColor Green

# Get system memory info
$totalMemory = Get-WmiObject -Class Win32_ComputerSystem | Select-Object -ExpandProperty TotalPhysicalMemory
$totalMemoryGB = [math]::Round($totalMemory / 1GB, 2)

Write-Host "Total system memory: $totalMemoryGB GB" -ForegroundColor Yellow

# Set recommended memory based on available memory
if ($totalMemoryGB -ge 16) {
    $recommendedMemory = 8192
} elseif ($totalMemoryGB -ge 8) {
    $recommendedMemory = 6144
} elseif ($totalMemoryGB -ge 4) {
    $recommendedMemory = 4096
} else {
    $recommendedMemory = 2048
}

Write-Host "Recommended max-old-space-size: $recommendedMemory MB" -ForegroundColor Yellow

# Clean up directories
Write-Host "Cleaning up build artifacts..." -ForegroundColor Green

$dirsToClean = @(".next", "out", "node_modules\.cache")

foreach ($dir in $dirsToClean) {
    if (Test-Path $dir) {
        Write-Host "Cleaning $dir..." -ForegroundColor Blue
        try {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
            Write-Host "Cleaned $dir" -ForegroundColor Green
        } catch {
            Write-Host "Warning: Could not clean $dir - $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# Set environment variables for current session
$env:NODE_OPTIONS = "--max-old-space-size=$recommendedMemory"
Write-Host "Set NODE_OPTIONS to: $env:NODE_OPTIONS" -ForegroundColor Green

# Memory usage tips
Write-Host ""
Write-Host "Memory Optimization Tips:" -ForegroundColor Cyan
Write-Host "1. Close unnecessary applications during builds" -ForegroundColor White
Write-Host "2. Use npm run build:memory-safe for large builds" -ForegroundColor White
Write-Host "3. Consider using webpack instead of turbopack if memory issues persist" -ForegroundColor White
Write-Host "4. Monitor Task Manager during builds" -ForegroundColor White

Write-Host ""
Write-Host "Memory optimization completed!" -ForegroundColor Green
Write-Host "You can now run: npm run build" -ForegroundColor Yellow
