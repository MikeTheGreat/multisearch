## Features

-   Does the things the normal search (commonly Ctrl/Cmd+f3) does
-   Keeps N slots in an array, where _every slot can do the normal search things_
-   Can load arrays (called "preset searches", or "presets")

## Requirements

You'll need VSCode to run this.

## Extension Settings

This extension contributes the following settings:

-   `multisearch.fileOfSearchStrings`: "Full path to JSON file containing search strings to preload"

### JSON file of pre-set search terms

The JSON file should be set up similar to this:

```json
{
    "presets": [
        {
            "name": "Project 1, Task 1",
            "abbrev": "1-1",
            "numQuestions": "N/A",
            "searches": ["allMdx", "results", "return"]
        },
        {
            "name": "Project 2, Task 3",
            "abbrev": "2-3",
            "numQuestions": "N/A",
            "searches": ["Heading", "Sub.*Heading"]
        }
    ]
}
```

You can load the preset searches using `multisearch.loadPresetSearches` command - when prompted you can type in either the full name (exactly as written but case-INsensitive) or the abbrev(iation) (also exactly as written written but case IN-sensitive ).

The individual search patterns can be regular expressions (e.g., "Sub.\*Heading").

In the case of the preset for "Project 1, Task 1", above, the search term "allMdx" will be stored into slot zero ( 0 ), "results" into 1, and "return" into 2. You can then pass the slot as an argument to a command to search for whichever result you're interested in (keybinding examples are listed below)

### Keybinding examples

This extension doesn't replace any keybindings 'out of the box'; you'll probably want to bind keys to search for stuff.
You probably also want to replace a bunch of keys with search functions to search for stuff, and then set them back to their 'normal' functions after.
The following example config can be added to your `keybinding.json` file ([which you can open by following the advice on this page](https://code.visualstudio.com/docs/getstarted/keybindings#_advanced-customization)), so that the following keybindings are in effect:

-   Ctrl+F1: Load the preset file with and then choose which preset to use
-   Ctrl+Shift+f1: Toggle search mode on (this sets multisearch.rebindkeys to be true) and off so that all the numerous other keybindings take effect (or don't take effect)

-   f2 : Search forwards
-   Shift+f2: Search backwards
-   Ctrl+f2: Search forwards for whatever the current selection is (if no selection, then for the word at the cursor)
-   Ctrl+Shift+f2: Search backwards for whatever the current selection is (if no selection, then for the word at the cursor)

f2 uses slot 0 in the multisearch array, f3 uses slot 1, f4 uses 2, and f5 uses 3

```json
[
    {
        "key": "Ctrl+f1",
        "command": "multisearch.loadPresetSearches"
    },
    {m
        "key": "Ctrl+Shift+f1",
        "command": "multisearch.searchModeOn",
        "when": "multisearch.rebindKeys == false"
    },
    {
        "key": "Ctrl+Shift+f1",
        "command": "multisearch.searchModeOff",
        "when": "multisearch.rebindKeys == true"
    },
    // When search mode is active, take over a whole bunch of keys:
    {
        "key": "f2",
        "command": "multisearch.doSearch",
        "args": {
            "which": 0,
            "direction": "forward"
        },
        "when": "multisearch.rebindKeys == true"
    },
    {
        "key": "Shift+f2",
        "command": "multisearch.doSearch",
        "args": {
            "which": 0,
            "direction": "backward"
        },
        "when": "multisearch.rebindKeys == true"
    },
    {
        "key": "Ctrl+f2",
        "command": "multisearch.doSearch",
        "args": {
            "acquire": true,
            "which": 0,
            "direction": "forward"
        },
        "when": "multisearch.rebindKeys == true"
    },
    {
        "key": "Ctrl+Shift+f2",
        "command": "multisearch.doSearch",
        "args": {
            "acquire": true,
            "which": 0,
            "direction": "backward"
        },
        "when": "multisearch.rebindKeys == true"
    }
]
```

## Known Issues

None yet.

This is a personal / passion project so please be kind when you file issues!

## Release Notes

### 1.0.0

Initial release of MultiSearch
