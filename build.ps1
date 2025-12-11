# Ensure we're in the correct directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Clean build directory
if (Test-Path "build") {
    Remove-Item "build" -Recurse -Force
}
New-Item -ItemPath "build" -ItemType Directory -Force

# Compile TypeScript
Write-Host "Compiling TypeScript..." -ForegroundColor Cyan
tsc

# Generate changelog
Write-Host "Generating changelog..." -ForegroundColor Cyan
npx auto-changelog -p --ignore-commit-pattern '^docs: auto-update$'

# Update README if needed
Write-Host "Updating README..." -ForegroundColor Cyan
node update-readme.js

# Git operations
Write-Host "Performing git operations..." -ForegroundColor Cyan
git add CHANGELOG.md README.md
git commit -m "docs: auto-update" | Out-Null

# Increment version
Write-Host "Incrementing version..." -ForegroundColor Cyan
npm version patch --no-git-tag-version
$version = (Get-Content .\package.json | ConvertFrom-Json).version

# Package extension
Write-Host "Packaging extension..." -ForegroundColor Cyan
vsce package --out build

# Commit version bump and push
git add package.json
git commit -m "chore: bump version to $version"
git tag "v$version"
git push origin main --follow-tags

# Generate release notes for this version only
Write-Host "Generating release notes..." -ForegroundColor Cyan
$releaseNotes = npx auto-changelog --unreleased-only --stdout --ignore-commit-pattern '^docs: auto-update$'
$releaseNotes | Out-File -FilePath "temp_release_notes.txt"

# Create GitHub release
Write-Host "Creating GitHub release..." -ForegroundColor Cyan
gh release create "v$version" (Get-ChildItem "build/*.vsix") --title "v$version" --notes-file temp_release_notes.txt

# Cleanup
Remove-Item temp_release_notes.txt -Force

Write-Host "Build complete! Version v$version has been released." -ForegroundColor Green