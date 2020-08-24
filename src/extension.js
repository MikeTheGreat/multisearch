// MultiSearch: Enable an array of search terms, keyboard shortcuts to search for them,
// and the ability to load the terms in from a JSON file
//
// Copyright (C) 2020 Mike Panitz

//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.

//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <https://www.gnu.org/licenses/>.
import * as vscode from "vscode";

import { TextEditorEdit, TextEditor, Selection } from "vscode";
import { resolveCliPathFromVSCodeExecutablePath } from "vscode-test";
import { isUndefined } from "util";

// Keybindings:
// https://code.visualstudio.com/api/references/contribution-points#contributes.keybindings

let searches: Array<string> = [];
// const out = vscode.window.createOutputChannel("MultiSearch");

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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    //out.appendLine("In activate");

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // out.show();

    let config = vscode.workspace.getConfiguration("multisearch");
    // out.appendLine(
    //     "File containing search string presets: " +
    //         config.get("fileOfSearchStrings")
    // );

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    let disposable = vscode.commands.registerTextEditorCommand(
        "multisearch.loadPresetSearches",
        loadPreset
    );
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand(
        "multisearch.doSearch",
        doSearch
    );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

const loadPreset = async (textEditor: TextEditor, edit: TextEditorEdit) => {
    // out.appendLine("In loadPreset!");
    const config = vscode.workspace.getConfiguration("multisearch");
    const fpSearchStrings: string = config.get("fileOfSearchStrings") ?? "";
    // out.appendLine("fileOfSearchStrings: " + fpSearchStrings);

    if (fpSearchStrings === "") {
        vscode.window.showInformationMessage(
            "Can't load presets until you set up multisearch.fileOfSearchStrings (File > Preferences > Settings)"
        );
        return;
    }

    // Detect an invalid file by trying to open if and catching the error
    vscode.workspace.fs.readFile(vscode.Uri.file(fpSearchStrings)).then(
        async (textSearchStrings: Uint8Array) => {
            // out.appendLine(
            //     "textSearchStrings: " + textSearchStrings.toString()
            // );
            const data: IPresetCollection = JSON.parse(
                textSearchStrings.toString()
            );

            let userInput = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                prompt: "What preset would you like to load?",
                placeHolder:
                    "Use an abbreviation, like 2-1 for BIT 142's Lesson 1",
            });

            // out.appendLine(
            //     "userInput: " + userInput // multisearch.fileOfSearchStrings
            // );

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

            // out.appendLine("Num matches: " + matches.length);
            if (matches.length === 0) {
                vscode.window.showInformationMessage(
                    "Can't find a preset with that name or abbreviation!"
                );
                return;
            }
            // out.appendLine("Matches: " + JSON.stringify(matches, null, 2));
            // out.appendLine("Using this search set: " + matches[0].searches);
            searches = matches[0].searches;

            console.log("Loaded presets from " + fpSearchStrings);
        },
        (reason) => {
            // reading the file of presets failed
            vscode.window.showInformationMessage(
                "Can't read the file " + fpSearchStrings
            );
            // out.appendLine("Can't read the file " + fpSearchStrings);
            // out.appendLine(
            //     "Detailed error message:\n" + JSON.stringify(reason, null, 4)
            // );
            console.log("Did NOT load presets from " + fpSearchStrings);
            return;
        }
    );
};

const doSearch = async (
    textEditor: TextEditor,
    edit: TextEditorEdit,
    args: ISearchArgs
) => {
    // out.appendLine("In doSearch!");

    if (isUndefined(args) || !("which" in args)) {
        vscode.window.showInformationMessage(
            "Bad Keybinding: missing 'args: {which: 0}' to specify which search to run"
        );
        return;
    }
    // out.appendLine("args: " + JSON.stringify(args, null, 4));
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage(
            "This command only works in an editor"
        );
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const documentText = document.getText();

    let startSearchAt: number;
    switch (args.direction) {
        case "forward":
            startSearchAt = document.offsetAt(selection.end);
            break;
        case "backward":
            startSearchAt = document.offsetAt(selection.start) - 1;
            break;
        default:
            vscode.window.showInformationMessage(
                "Unsupported search direction: " + args.direction
            );
            return;
    }

    // If we're searching for the word under the cursor
    // then go get that word (error if none)
    // set the current searches slot to be that word
    // then continue on to the rest of the search stuff
    if (args.acquire) {
        const range_wordAtPoint = document.getWordRangeAtPosition(
            editor.selection.active
        );
        if (!range_wordAtPoint) {
            vscode.window.showInformationMessage("No word at the cursor");
            return;
        }
        const offset_word_start = document.offsetAt(range_wordAtPoint.start);
        const offset_word_end = document.offsetAt(range_wordAtPoint.end);

        const searchFor = documentText.substring(
            offset_word_start,
            offset_word_end
        );

        const idxWhich = args.which as number;
        searches[idxWhich] = searchFor;

        if (args.direction === "forward") startSearchAt = offset_word_end;
        else if (args.direction === "backward")
            startSearchAt = offset_word_start - 1;
    }

    // At this point we either acquired a search term
    // or else we're hoping that there's already one in searches:

    if (!(args["which"] in searches)) {
        vscode.window.showInformationMessage(
            "No search term in slot " +
                args["which"] +
                " - did you load a preset/search under the cursor?"
        );
        return;
    }
    const searchFor = searches[args.which];
    // out.appendLine("Searching for: " + searchFor);

    let word_offset_try: number = 0;
    if (args.direction === "forward")
        word_offset_try = documentText.indexOf(searchFor, startSearchAt);
    else if (args.direction === "backward") {
        word_offset_try = documentText.lastIndexOf(searchFor, startSearchAt);

        // if the cursor was in the word while searching backwards we'll start
        // by highlighting the word we're in.  Inconsistently the 'forwards'
        // search when the cursor is in the word will NOT highlight the current word
        // So if we're going backwards and the cursor is already on a match
        // then re-search to find the one previous to the one we're on right now.
        if (
            word_offset_try <= startSearchAt &&
            word_offset_try + searchFor.length >= startSearchAt
        )
            word_offset_try = documentText.lastIndexOf(
                searchFor,
                word_offset_try - 1
            );
    }

    if (word_offset_try == -1) {
        let whichEnd: string = "top";

        if (args.direction === "forward") {
            whichEnd = "top";
            word_offset_try = documentText.indexOf(searchFor);
        } else if (args.direction === "backward") {
            whichEnd = "bottom";
            word_offset_try = documentText.lastIndexOf(searchFor);
        }
        // search from start of file (offset 0)
        if (word_offset_try == -1) {
            vscode.window.showInformationMessage(
                "Word not found: " + searchFor
            );
            return;
        } else
            vscode.window.showInformationMessage(
                "Wrapped search back to " + whichEnd + " of file"
            );
    }
    const word_offset = word_offset_try;
    const word_pos = document.positionAt(word_offset);
    const word_end_pos = document.positionAt(word_offset + searchFor.length);

    editor.selection = new Selection(word_pos, word_end_pos);
    editor.revealRange(
        new vscode.Range(word_pos, word_pos),
        vscode.TextEditorRevealType.InCenterIfOutsideViewport
    );

    // out.appendLine("END OF MULTISEARCH.doSearch");
};
