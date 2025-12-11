$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

$pack = Get-Content "../package.json" -Raw | ConvertFrom-Json
$packVer = $pack.version

if (Test-Path "build") {
    Remove-Item "build" -Recurse -Force
}
New-Item -Path "build" -ItemType Directory -Force

Write-Host "Compiling TypeScript..." -ForegroundColor Cyan
tsc

Write-Host "Generating changelog..." -ForegroundColor Cyan
npx auto-changelog -p --ignore-commit-pattern '^docs: auto-update$'

Write-Host "Performing git operations..." -ForegroundColor Cyan
git add CHANGELOG.md README.md
git commit -m "docs: auto-update" | Out-Null

Write-Host "Incrementing version..." -ForegroundColor Cyan
npm version patch
$version = (Get-Content ..\package.json | ConvertFrom-Json).version

Write-Host "Packaging extension..." -ForegroundColor Cyan
vsce package --out build

git push origin main --follow-tags

Write-Host "Generating release notes..." -ForegroundColor Cyan
$releaseNotes = npx auto-changelog --package --commit-limit false --starting-version $packVer --stdout --ignore-commit-pattern '^docs: auto-update$'
$releaseNotes | Out-File -FilePath "temp_release_notes.txt"

Write-Host "Creating GitHub release..." -ForegroundColor Cyan
gh release create "v$version" (Get-ChildItem "build/*.vsix") --title "v$version" --notes-file temp_release_notes.txt

Remove-Item temp_release_notes.txt -Force

Write-Host "Build complete! Version v$version has been released." -ForegroundColor Green