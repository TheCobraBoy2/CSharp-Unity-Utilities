import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildPath = path.join(__dirname, "..", "build");

// Ensure build folder exists
if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath, { recursive: true });
    console.log("Build folder created:", buildPath);
} else {
    console.log("Build folder already exists:", buildPath);
}

// Delete old .vsix files
const files = fs.readdirSync(buildPath);

files.forEach(file => {
    if (file.endsWith(".vsix")) {
        const filePath = path.join(buildPath, file);
        fs.unlinkSync(filePath);
        console.log("Deleted old VSIX file:", filePath);
    }
});
