## Features

-   Does the things the normal search (commonly Ctrl/Cmd+f3) does
-   Keeps N slots in an array, where _every slot can do the normal search things_
-   Can load arrays (called "preset searches", or "presets")

## Requirements

You'll need VSCode to run this.

## Extension Settings

This extension contributes the following settings:

-   `multisearch.fileOfSearchStrings`: "Full path to JSON file containing search strings to preload"

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
            "searches": ["Heading", "SubHeading"]
        }
    ]
}
```

## Known Issues

None yet.

This is a personal / passion project so please be kind when you file issues!

## Release Notes

### 1.0.0

Initial release of MultiSearch
