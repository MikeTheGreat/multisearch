## Features

-   Enables you to do the things the normal search (commonly Ctrl/Cmd+f3) does, but now with as many other keys as you'd like. You can now rebind Ctrl/Cmd+f2, f4, f5, or whatever else you'd like to use
-   Includes a way to toggle `multisearch.searchMode` on and off, so that you can rebind a whole bunch of keys _but only when you're actually searching for stuff_
-   Internally, the search terms are kept inside slots in an array, where; you can use as many slots as you'd like. This means you can have as many search terms as you'd like.
-   Can load a file containing an array of things to search for. In fact, the file can store many sets of search terms, where each individual set is called "preset searches", or "presets". This way you can quickly search for several different things (using f2, f3, f4, or whatever keys you've bound) and then load up a different preset to seamlessly switch to searching for a different set of things (using the same keys).

## Requirements

You'll need VSCode to run this.

Having a JSON file of preset searches can be handy but is not required. See below for an example of this file.

## Extension Settings

This extension contributes the following settings:

-   `multisearch.fileOfSearchStrings`: "Full path to JSON file containing search strings to preload"

This extension contributes the following context settings, which you can use in the `where` clause in your `keybinding.json` file:

-   `multisearch.searchMode`: Set to `true` when we're in search mode (which is a good time to replace a whole bunch of keys to make searching more convenient) or set to `false` (which is a good way to then disable the search keybindings, returning those keys to their normal roles)

### JSON file of pre-set search terms

The JSON file should be set up similar to this:

```json
{
    "presets": [
        {
            "name": "Project 1, Task 1",
            "abbrev": "1-1",
            "msgWhenLoaded": "Don't forget to do A, B, C",
            "searches": ["allMdx", "results", "return"]
        },
        {
            "name": "Project 2, Task 3",
            "abbrev": "2-3",
            "msgWhenLoaded": "Don't forget to do X, Y, Z",
            "searches": ["Heading", "Sub.*Heading"]
        }
    ]
}
```

Here's a quick explanation of each field that you'll find in each preset object:

-   **name** is the human-readable name. It'll be shown to the user when this preset is loaded, etc
-   **abbrev** is a short, easy to type string. Intended to make it easy to use `loadPresetSearches` command
-   **msgWhenLoaded** _OPTIONAL_ If present, this message will be shown when this preset is loaded
-   **searches** is an array of strings to search for. These individual search patterns can be regular expressions (e.g., "Sub.\*Heading").

You can load the preset searches using `multisearch.loadPresetSearches` command - when prompted you can type in either the full name (exactly as written but case-INsensitive) or the abbrev(iation) (also exactly as written written but case IN-sensitive ).

In the case of the preset for "Project 1, Task 1", above, the search term "allMdx" will be stored into slot zero ( 0 ), "results" into 1, and "return" into 2. You can then pass the slot as the `which` argument to a command to search for whichever search term you're interested in (keybinding examples are listed below)

### Keybinding examples

This extension doesn't replace any keybindings 'out of the box'; you'll have to bind keys on your own to search for stuff.

You'll probably want to replace a bunch of keys with search functions to search for stuff, and then set them back to their 'normal' functions after.
The following example config can be added to your `keybinding.json` file ([which you can open by following the advice on this page](https://code.visualstudio.com/docs/getstarted/keybindings#_advanced-customization)), so that the following keybindings are in effect:

-   Ctrl+f1: Load the preset file with and then choose which preset to use
-   Ctrl+Shift+f1: Toggle search mode on (this sets `multisearch.searchMode` to be true) and off so that all the numerous other keybindings take effect (or don't take effect)
-   f2 : Search forwards
-   Shift+f2: Search backwards
-   Ctrl+f2: Search forwards for whatever the current selection is (if no selection, then for the word at the cursor)
-   Ctrl+Shift+f2: Search backwards for whatever the current selection is (if no selection, then for the word at the cursor)

In this example, f2 uses slot 0 in the multisearch array (determined by our choice for the `which` argument to each keybinding).

```json
[
    {
        "key": "Ctrl+f1",
        "command": "multisearch.loadPresetSearches"
    },
    {m
        "key": "Ctrl+Shift+f1",
        "command": "multisearch.searchModeOn",
        "when": "multisearch.searchMode == false"
    },
    {
        "key": "Ctrl+Shift+f1",
        "command": "multisearch.searchModeOff",
        "when": "multisearch.searchMode == true"
    },
    // When search mode is active, take over a whole bunch of keys:
   {
        "key": "f2",
        "command": "multisearch.SearchForward",
        "args": {
            "which": 0
        },
        "when": "multisearch.searchMode == true"
    },
    {
        "key": "Shift+f2",
        "command": "multisearch.SearchBackward",
        "args": {
            "which": 0
        },
        "when": "multisearch.searchMode == true"
    },
    {
        "key": "Ctrl+f2",
        "command": "multisearch.AcquireThenSearchForward",
        "args": {
            "which": 0
        },
        "when": "multisearch.searchMode == true"
    },
    {
        // This shows how to use the 'doSearch' command
        // instead of the AcquireThenSearchBackwards command:
        "key": "Ctrl+Shift+f2",
        "command": "multisearch.doSearch",
        "args": {
            "acquire": true,
            "which": 0,
            "direction": "backward"
        },
        "when": "multisearch.searchMode == true"
    }
]
```

## Known Issues

None yet.

This is a personal / passion project so please be kind when you file issues!

## Release Notes

These are documented in [the CHANGELOG.md](CHANGELOG.md)
