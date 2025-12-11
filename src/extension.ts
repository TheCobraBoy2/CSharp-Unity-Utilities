import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import packageJson from "../package.json";

function folderPathToNamespace(folderPath: string): string {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspaceFolder) return "DefaultNamespace";

    let relativePath = path.relative(workspaceFolder, folderPath);
    relativePath = relativePath.split(path.sep).join(".");
    relativePath = relativePath.replace(/[^a-zA-Z0-9_.]/g, "");
    return relativePath.length > 0 ? relativePath : "DefaultNamespace";
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        "unityUtilities.newMonoBehaviour",
        async (fileUri: vscode.Uri) => {
            if (!fileUri) {
                vscode.window.showErrorMessage("Please right-click on a folder in the Explorer.");
                return;
            }
            const scriptName = await vscode.window.showInputBox({
                prompt: "MonoBehaviour class name:",
                placeHolder: "MyNewScript"
            });
            if (!scriptName) return;

            const folderPath = fileUri.fsPath;
            const filePath = path.join(folderPath, `${scriptName}.cs`);

            const namespaceName = folderPathToNamespace(folderPath);

            let template = vscode.workspace.getConfiguration("csharpUnityUtilities").get<string>("template");

            if (!template) {
                template = `// Auto-generated MonoBehaviour
// Version: {{VERSION}}, Created: {{DATE}}
using UnityEngine;

namespace {{NAMESPACE}}
{
    public class {{CLASSNAME}} : MonoBehaviour
    {
        void Start() { }
        void Update() { }
    }
}`;
            }

            template = template
                .replace(/{{CLASSNAME}}/g, scriptName)
                .replace(/{{NAMESPACE}}/g, namespaceName)
                .replace(/{{VERSION}}/g, packageJson.version)
                .replace(/{{DATE}}/g, new Date().toLocaleDateString());

            try {
                fs.writeFileSync(filePath, template);
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to create file: ${err}`);
                return;
            }

            const doc = await vscode.workspace.openTextDocument(filePath);
            vscode.window.showTextDocument(doc);
            vscode.window.showInformationMessage(`Created MonoBehaviour: ${scriptName}`);
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
