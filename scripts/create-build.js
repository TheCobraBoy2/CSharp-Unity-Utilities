import * as fs from "fs";
import * as path from "path";

const buildPath = path.join(__dirname, "..", "build");

if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
    console.log("Build folder created.");
} else {
    console.log("Build folder already exists.");
}
