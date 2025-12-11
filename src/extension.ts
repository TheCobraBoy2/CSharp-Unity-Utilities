import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getTemplate, fillTemplate, TemplateType } from "./templates";

function folderPathToNamespace(folderPath: string): string {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspaceFolder) return "DefaultNamespace";

    let relativePath = path.relative(workspaceFolder, folderPath);
    relativePath = relativePath.split(path.sep).join(".");
    relativePath = relativePath.replace(/[^a-zA-Z0-9_.]/g, "");
    return relativePath.length > 0 ? relativePath : "DefaultNamespace";
}

export function activate(context: vscode.ExtensionContext) {
    function createNewFileCommand(
        commandId: string,
        templateType: TemplateType,
        prompt: string,
        placeHolder: string,
        successLabel?: string
    ) {
        return vscode.commands.registerCommand(commandId, async (fileUri: vscode.Uri) => {
            if (!fileUri) {
                vscode.window.showErrorMessage("Please right-click on a folder in the Explorer.");
                return;
            }

            const name = await vscode.window.showInputBox({ prompt, placeHolder });
            if (!name) return;

            const folderPath = fileUri.fsPath;
            const filePath = path.join(folderPath, `${name}.cs`);

            const namespaceName = folderPathToNamespace(folderPath);
            const template = fillTemplate(getTemplate(templateType), name, namespaceName);

            try {
                await fs.promises.writeFile(filePath, template);
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to create file: ${err}`);
                return;
            }

            const doc = await vscode.workspace.openTextDocument(filePath);
            vscode.window.showTextDocument(doc);
            vscode.window.showInformationMessage(`${successLabel ?? prompt}: ${name}`);
        });
    }

    const monoBehaviour = createNewFileCommand(
        "unityUtilities.newMonoBehaviour",
        TemplateType.MonoBehavior,
        "MonoBehaviour class name:",
        "NewMonoBehaviourScript",
        "MonoBehaviour"
    );

    const classCommand = createNewFileCommand(
        "unityUtilities.newClass",
        TemplateType.Class,
        "Class name:",
        "NewClass",
        "Class"
    );

    const enumCommand = createNewFileCommand(
        "unityUtilities.newEnum",
        TemplateType.Enum,
        "Enum name:",
        "NewEnum",
        "Enum"
    );

    const interfaceCommand = createNewFileCommand(
        "unityUtilities.newInterface",
        TemplateType.Interface,
        "Interface name:",
        "NewInterface",
        "Interface"
    );

    const structCommand = createNewFileCommand(
        "unityUtilities.newStruct",
        TemplateType.Struct,
        "Struct name:",
        "NewStruct",
        "Struct"
    );

    context.subscriptions.push(
        monoBehaviour,
        classCommand,
        enumCommand,
        interfaceCommand,
        structCommand
    );
}

export function deactivate() {}
