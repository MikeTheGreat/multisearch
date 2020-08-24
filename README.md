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

You'll probably want to bind more keys to search for stuff. I took the liberty of replacing the F3 searches already, but if you wanted to load the preset file with Ctrl+F1 and then change F4 to behave similarly to F3 you could put the following into your `keybinding.json` file ([which you can open by following the advice on this page](https://code.visualstudio.com/docs/getstarted/keybindings#_advanced-customization)):

```json
[
    {
        "key": "Ctrl+f1",
        "command": "multisearch.loadPresetSearches"
    },
    {
        "key": "f4",
        "command": "multisearch.doSearch",
        "args": {
            "which": 1, // Search for the search term in slot 1 of the searches array
            "direction": "forward" // search from the top of the file towards the bottom, wrapping if needed
        }
    },
    {
        "key": "Shift+f4",
        "command": "multisearch.doSearch",
        "args": {
            "which": 1,
            "direction": "backward"
        }
    },
    {
        "key": "Ctrl+f4",
        "command": "multisearch.doSearch",
        "args": {
            "acquire": true,
            "which": 1,
            "direction": "forward"
        }
    },
    {
        "key": "Ctrl+Shift+f4",
        "command": "multisearch.doSearch",
        "args": {
            "acquire": true, // search for the word under the cursor, replacing this slot
            "which": 1, // store the word into slot 1 (it's a JS array, so you can use as many slots as you want)
            // (by default the extension binds F3 to slot 0)
            "direction": "backward" // search from the bottom of the file towards the top, wrapping if needed
        }
    }
]
```

## Known Issues

None yet.

This is a personal / passion project so please be kind when you file issues!

## Release Notes

### 1.0.0

Initial release of MultiSearch
