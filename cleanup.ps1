# delete-js.ps1
$baseDir = "./src"  # Change this if needed

if (Test-Path $baseDir) {
    Get-ChildItem -Path $baseDir -Recurse -Include *.js | Remove-Item -Force
    Write-Host "All .js files deleted from $baseDir"
} else {
    Write-Host "Directory '$baseDir' does not exist."
}
