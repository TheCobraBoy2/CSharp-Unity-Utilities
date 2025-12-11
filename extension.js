const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const packageJson = require("./package.json");

function folderPathToNamespace(folderPath) {
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    let relativePath = folderPath.replace(workspaceFolder, "").replace(/^\/+/, "").replace(/\//g, ".");
    relativePath = relativePath.replace(/[^a-zA-Z0-9_.]/g, "");
    return relativePath.length > 0 ? relativePath : "DefaultNamespace";
}

function activate(context) {
    const disposable = vscode.commands.registerCommand(
        "unityUtilities.newMonoBehaviour",
        async (fileUri) => {
            const scriptName = await vscode.window.showInputBox({
                prompt: "MonoBehaviour class name:",
                placeHolder: "MyNewScript"
            });
            if (!scriptName) return;

            const folderPath = fileUri.fsPath;
            const filePath = path.join(folderPath, scriptName + ".cs");

            const namespaceName = folderPathToNamespace(folderPath);

            // Get user-defined template from settings
            let template = vscode.workspace.getConfiguration("csharpUnityUtilities").get("template");

            // Replace placeholders
            template = template
                .replace(/{{CLASSNAME}}/g, scriptName)
                .replace(/{{NAMESPACE}}/g, namespaceName)
                .replace(/{{VERSION}}/g, packageJson.version)
                .replace(/{{DATE}}/g, new Date().toLocaleDateString());

            fs.writeFileSync(filePath, template);

            const doc = await vscode.workspace.openTextDocument(filePath);
            vscode.window.showTextDocument(doc);
        }
    );

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
