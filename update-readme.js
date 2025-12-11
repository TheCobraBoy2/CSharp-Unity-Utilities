const fs = require("fs");
const packageJson = require("./package.json");

let readme = fs.readFileSync("README.md", "utf8");
readme = readme.replace(/{{VERSION}}/g, packageJson.version);
fs.writeFileSync("README.md", readme);

console.log("README updated to version " + packageJson.version);
