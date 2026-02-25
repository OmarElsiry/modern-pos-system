Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PWD "build\icon.png"
$destPath = Join-Path $PWD "build\icon.ico"

if (-not (Test-Path $sourcePath)) {
    Write-Host "Error: Source file not found at $sourcePath"
    exit 1
}

try {
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    
    $size = 256
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($img, 0, 0, $size, $size)
    
    $iconHandle = $bmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
    
    $fileStream = New-Object System.IO.FileStream $destPath, 'Create'
    $icon.Save($fileStream)
    $fileStream.Close()
    
    $icon.Dispose()
    $graph.Dispose()
    $bmp.Dispose()
    $img.Dispose()
    
    Write-Host "Success: Created icon at $destPath"
    exit 0
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
    exit 1
}
