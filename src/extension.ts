// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TextEditorEdit, TextEditor, Selection } from "vscode";

// import { StartFindAction, NextMatchFindAction } from 'vscode'//    'vs/editor/contrib/find/findController';

// Keybindings:
// https://code.visualstudio.com/api/references/contribution-points#contributes.keybindings
//
// Invoking commands:
// https://code.visualstudio.com/api/references/vscode-api#commands

var searchFor = "";
const out = vscode.window.createOutputChannel("MultiSearch");

const loadPreset = async (textEditor: TextEditor, edit: TextEditorEdit) => {
    const config = vscode.workspace.getConfiguration("multisearch");
    const fpSearchStrings: string = config.get("fileOfSearchStrings") ?? "";
    out.appendLine("fileOfSearchStrings: " + fpSearchStrings);

    if (fpSearchStrings === "") {
        vscode.window.showInformationMessage(
            "Can't load presets until you set up multisearch.fileOfSearchStrings (File > Preferences > Settings)"
        );
        return;
    }

    // TODO: How to detect invalid file path?
    const textSearchStrings = await vscode.workspace.fs.readFile(
        vscode.Uri.file(fpSearchStrings)
    );

    out.appendLine("textSearchStrings: " + textSearchStrings.toString());
    const searchStrings = JSON.parse(textSearchStrings.toString());

    let userInput = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        prompt: "What preset would you like to load?",
        placeHolder: "Use an abbreviation, like 2-1 for BIT 142's Lesson 1",
    });

    out.appendLine(
        "userInput: " + userInput // multisearch.fileOfSearchStrings
    );
};

const doSearch = async (textEditor: TextEditor, edit: TextEditorEdit) => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    //vscode.window.showInformationMessage('Hello World from Multisearch!');

    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const document = editor.document;
        const selection = editor.selection;

        // Get the word within the selection
        const documentText = document.getText();

        if (searchFor == "") {
            const range_wordAtPoint = document.getWordRangeAtPosition(
                editor.selection.active
            );
            if (!range_wordAtPoint) {
                vscode.window.showInformationMessage("No word at the cursor");
                return;
            }
            const offset_word_start = document.offsetAt(
                range_wordAtPoint.start
            );
            const offset_word_end = document.offsetAt(range_wordAtPoint.end);
            searchFor = documentText.substring(
                offset_word_start,
                offset_word_end
            );
        }

        var word_offset_try = documentText.indexOf(
            searchFor,
            document.offsetAt(selection.end)
        );
        if (word_offset_try == -1) {
            word_offset_try = documentText.indexOf(searchFor); // search from start of file (offset 0)
            if (word_offset_try == -1) {
                vscode.window.showInformationMessage(
                    "Word not found: " + searchFor
                );
                return;
            } else
                vscode.window.showInformationMessage(
                    "Wrapped search back to top of file"
                );
        }
        const word_offset = word_offset_try;
        const word_pos = document.positionAt(word_offset);
        const word_end_pos = document.positionAt(
            word_offset + searchFor.length
        );

        editor.selection = new Selection(word_pos, word_end_pos);
        editor.revealRange(
            new vscode.Range(word_pos, word_pos),
            vscode.TextEditorRevealType.InCenterIfOutsideViewport
        );
    }

    // vscode.window.showInformationMessage('END: ');
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    out.show();
    out.appendLine(
        'Congratulations, your extension "multisearch" is now active!'
    );

    let config = vscode.workspace.getConfiguration("multisearch");
    out.appendLine(
        "ACTIVATE: fileOfSearchStrings: " + config.get("fileOfSearchStrings") // multisearch.fileOfSearchStrings
    );

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    let disposable = vscode.commands.registerTextEditorCommand(
        "multisearch.loadPresetSearches",
        loadPreset
    );
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand(
        "multisearch.searchForwards",
        doSearch
    );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
