"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const package_json_1 = __importDefault(require("../package.json"));
function folderPathToNamespace(folderPath) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspaceFolder)
        return "DefaultNamespace";
    let relativePath = path.relative(workspaceFolder, folderPath);
    relativePath = relativePath.split(path.sep).join(".");
    relativePath = relativePath.replace(/[^a-zA-Z0-9_.]/g, "");
    return relativePath.length > 0 ? relativePath : "DefaultNamespace";
}
function activate(context) {
    const disposable = vscode.commands.registerCommand("unityUtilities.newMonoBehaviour", async (fileUri) => {
        if (!fileUri) {
            vscode.window.showErrorMessage("Please right-click on a folder in the Explorer.");
            return;
        }
        const scriptName = await vscode.window.showInputBox({
            prompt: "MonoBehaviour class name:",
            placeHolder: "MyNewScript"
        });
        if (!scriptName)
            return;
        const folderPath = fileUri.fsPath;
        const filePath = path.join(folderPath, `${scriptName}.cs`);
        const namespaceName = folderPathToNamespace(folderPath);
        let template = vscode.workspace.getConfiguration("csharpUnityUtilities").get("template");
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
            .replace(/{{VERSION}}/g, package_json_1.default.version)
            .replace(/{{DATE}}/g, new Date().toLocaleDateString());
        try {
            fs.writeFileSync(filePath, template);
        }
        catch (err) {
            vscode.window.showErrorMessage(`Failed to create file: ${err}`);
            return;
        }
        const doc = await vscode.workspace.openTextDocument(filePath);
        vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage(`Created MonoBehaviour: ${scriptName}`);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map