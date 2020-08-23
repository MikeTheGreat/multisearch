// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TextEditorEdit, TextEditor, Selection } from "vscode";
import { resolveCliPathFromVSCodeExecutablePath } from "vscode-test";
import { isUndefined } from "util";

// import { StartFindAction, NextMatchFindAction } from 'vscode'//    'vs/editor/contrib/find/findController';

// Keybindings:
// https://code.visualstudio.com/api/references/contribution-points#contributes.keybindings
//
// Invoking commands:
// https://code.visualstudio.com/api/references/vscode-api#commands

let searches: Array<string> = [];
const out = vscode.window.createOutputChannel("MultiSearch");

interface IPresetCollection {
    presets: Array<IPreset>;
}

interface IPreset {
    name: string;
    abbrev: string;
    numQuestions: string;
    searches: Array<string>;
}

interface ISearchArgs {
    acquire: boolean;
    direction: "forward" | "backward";
    which: number;
}

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

    // Detect an invalid file by trying to open if and catching the error
    vscode.workspace.fs.readFile(vscode.Uri.file(fpSearchStrings)).then(
        async (textSearchStrings: Uint8Array) => {
            out.appendLine(
                "textSearchStrings: " + textSearchStrings.toString()
            );
            const data: IPresetCollection = JSON.parse(
                textSearchStrings.toString()
            );

            let userInput = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                prompt: "What preset would you like to load?",
                placeHolder:
                    "Use an abbreviation, like 2-1 for BIT 142's Lesson 1",
            });

            out.appendLine(
                "userInput: " + userInput // multisearch.fileOfSearchStrings
            );

            if (isUndefined(userInput)) {
                vscode.window.showInformationMessage(
                    "Cancelling - no preset supplied"
                );
                return;
            }

            let matches = data.presets.filter(
                (objPreset: IPreset) =>
                    objPreset.abbrev.toLowerCase() ===
                        userInput?.toLowerCase() ||
                    objPreset.name.toLowerCase() === userInput?.toLowerCase()
            );

            out.appendLine("Num matches: " + matches.length);
            if (matches.length === 0) {
                vscode.window.showInformationMessage(
                    "Can't find a preset with that name or abbreviation!"
                );
                return;
            }
            out.appendLine("Matches: " + JSON.stringify(matches, null, 2));
            out.appendLine("Using this search set: " + matches[0].searches);
            searches = matches[0].searches;
        },
        (reason) => {
            // reading the file of presets failed
            vscode.window.showInformationMessage(
                "Can't read the file " + fpSearchStrings
            );
            out.appendLine("Can't read the file " + fpSearchStrings);
            out.appendLine(
                "Detailed error message:\n" + JSON.stringify(reason, null, 4)
            );
            return;
        }
    );
};

// Update the current slot of searches with the selection (if it exists)
// or else the word under the cursor, then call searchForwards
const searchForwardsForWordUnderCursor = async (
    textEditor: TextEditor,
    edit: TextEditorEdit,
    args: ISearchArgs
) => {
    debugger;
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        const range_wordAtPoint = document.getWordRangeAtPosition(
            editor.selection.active
        );
        if (!range_wordAtPoint) {
            vscode.window.showInformationMessage("No word at the cursor");
            return;
        }
        const offset_word_start = document.offsetAt(range_wordAtPoint.start);
        const offset_word_end = document.offsetAt(range_wordAtPoint.end);
        const documentText = document.getText();
        const searchFor = documentText.substring(
            offset_word_start,
            offset_word_end
        );

        const idxWhich = args.which as number;
        searches[idxWhich] = searchFor;
        return searchForwards(textEditor, edit, args);
    } else {
        vscode.window.showInformationMessage(
            "This command only works in an editor"
        );
        return;
    }
};

const searchForwards = async (
    textEditor: TextEditor,
    edit: TextEditorEdit,
    args: ISearchArgs
) => {
    // The code you place here will be executed every time your command is executed

    if (isUndefined(args) || !("which" in args)) {
        vscode.window.showInformationMessage(
            "Bad Keybinding: missing args: {which: 0} to specify which search to run"
        );
        return;
    }
    out.appendLine("args: " + JSON.stringify(args, null, 4));
    // Next, make sure we have something at that index:
    if (!(args["which"] in searches)) {
        vscode.window.showInformationMessage(
            "No search term in slot " +
                args["which"] +
                " - did you load a preset/search under the cursor?"
        );
        return;
    }
    const searchFor = searches[args.which];
    out.appendLine("Searching for: " + searchFor);

    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const document = editor.document;
        const selection = editor.selection;

        // Get the word within the selection
        const documentText = document.getText();

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

    out.appendLine("END OF MULTISEARCH.doSearch");
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
        searchForwards
    );
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand(
        "multisearch.searchForwardsForWordUnderCursor",
        searchForwardsForWordUnderCursor
    );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
