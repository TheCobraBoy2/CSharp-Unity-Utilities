const fs = require("fs");
const path = require("path");

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));

const readmePath = path.join(__dirname, "README.md");
if (!fs.existsSync(readmePath)) {
    console.error("README.md not found!");
    process.exit(1);
}

let readme = fs.readFileSync(readmePath, "utf8");

const versionRegex = /(Version:\s*)([0-9]+\.[0-9]+\.[0-9]+)/;
if (versionRegex.test(readme)) {
    readme = readme.replace(versionRegex, `$1${packageJson.version}`);
} else {
    readme = `Version: ${packageJson.version}\n\n` + readme;
}

fs.writeFileSync(readmePath, readme, "utf8");
console.log(`README updated to version ${packageJson.version}`);
