import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import packageJson from "../package.json";

export const templates = {
    classTemplate: `// ----------------------------------------- 
// Script: {{CLASSNAME}} 
// Namespace: {{NAMESPACE}} 
// C# Unity Utils Version: {{VERSION}} 
// Created: {{DATE}} 
// ------------------------------------------

namespace {{NAMESPACE}} {
     public class {{CLASSNAME}}
     {

     }
}`,
    monoBehaviourTemplate: `// ----------------------------------------- 
// Script: {{CLASSNAME}} 
// Namespace: {{NAMESPACE}} 
// C# Unity Utils Version: {{VERSION}} 
// Created: {{DATE}} 
// ------------------------------------------

using UnityEngine;

namespace {{NAMESPACE}} {
     public class {{CLASSNAME}} : MonoBehaviour
     {
       void Start() { }

       void Update() { }
     }
}`,
    enumTemplate: `// ----------------------------------------- 
// Script: {{CLASSNAME}} 
// Namespace: {{NAMESPACE}} 
// C# Unity Utils Version: {{VERSION}} 
// Created: {{DATE}} 
// ------------------------------------------

namespace {{NAMESPACE}} {
     public enum {{CLASSNAME}}
     {

     }
}`,
    interfaceTemplate: `// ----------------------------------------- 
// Script: {{CLASSNAME}} 
// Namespace: {{NAMESPACE}} 
// C# Unity Utils Version: {{VERSION}} 
// Created: {{DATE}} 
// ------------------------------------------

namespace {{NAMESPACE}} {
     public interface {{CLASSNAME}}
     {

     }
}`,
    structTemplate: `// ----------------------------------------- 
// Script: {{CLASSNAME}} 
// Namespace: {{NAMESPACE}} 
// C# Unity Utils Version: {{VERSION}} 
// Created: {{DATE}} 
// ------------------------------------------

using UnityEngine;

namespace {{NAMESPACE}} {
     public struct {{CLASSNAME}}
     {

     }
}`
}

export enum TemplateType {
    Class = "classTemplate",
    MonoBehavior = "monoBehaviourTemplate",
    Enum = "enumTemplate",
    Interface = "interfaceTemplate",
    Struct = "structTemplate"
}

export const getUserDefinedTemplate = (type: TemplateType) : string | undefined => {
    return vscode.workspace.getConfiguration("csharpUnityUtilities").get<string>(type);
}

export const getTemplate = (type: TemplateType) : string => {
    return getUserDefinedTemplate(type) || templates[type];
}

export const fillTemplate = (templateStr: string, className: string, namespaceName: string) : string => {
    return templateStr
                .replace(/{{CLASSNAME}}/g, className)
                .replace(/{{NAMESPACE}}/g, namespaceName)
                .replace(/{{VERSION}}/g, packageJson.version)
                .replace(/{{DATE}}/g, new Date().toLocaleDateString());
}