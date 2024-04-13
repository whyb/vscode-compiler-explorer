import * as vscode from 'vscode';
import { CompilerInstance, Filter, Tool, Library } from "../view/instance";

export class ExecuteParameter {
    args?: string[];
    stdin?: string;
};

export class CompilerOption {
    executorRequest?: boolean;
    skipAsm?: boolean;
}

export class CompileOptions {
    userArguments?: string;
    executeParameters?: ExecuteParameter;
    compilerOptions?: CompilerOption;
    filters?: Filter;
    tools?: Tool[];
    libraries?: Library[];

    static from(instance: CompilerInstance): CompileOptions {
        let options = new CompileOptions();
        options.userArguments = instance.options;
        options.filters = instance.filters;
        options.executeParameters = {
            args: instance.exec === "" ? undefined : instance.exec.split(" "),
            stdin: instance.stdin
        };
        return options;
    }
};

export class CompileRequest {
    source?: string;
    compiler?: string;
    options?: CompileOptions;
    lang: string = "c++";
    allowStoreCodeDebug: boolean = true;

    static async from(instance: CompilerInstance) {
        let request = new CompileRequest();
        request.source = await ReadSource(instance.inputFile);
        request.compiler = instance.compilerId;
        request.options = CompileOptions.from(instance);
        return request;
    }
}

export async function ReadSource(path: string): Promise<string> {
    if (path === "active") {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            return editor.document.getText();
        }

        vscode.window.showErrorMessage("No active editor found");
        return "";
    }

    const uri = vscode.Uri.file(path);
    console.log(uri);
    return await vscode.workspace.openTextDocument(uri).then(doc => doc.getText(), () => {
        const openDocuments = vscode.workspace.textDocuments;
        for (const doc of openDocuments) {
            if (doc.fileName === path) {
                return doc.getText();
            }
        }
        vscode.window.showErrorMessage("File not found: " + path);
        return "";
    });
}