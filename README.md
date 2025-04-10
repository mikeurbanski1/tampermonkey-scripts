# Mike Urbanski's Tampermonkey scripts

Welcome to my repo of (eventually) various scripts for the wonderful extension [Tampermonkey](https://www.tampermonkey.net/).

## Repo structure

```
/
|-- scripts -> source code for different scripts / sites
|-- dist    -> build / bundled scripts that can be referenced directly in a TM userscript, as well as a userscript file that you can add to your Tampermonkey extension.
```

These are built using typescript and bundled into a single file using esbuild. Is this overkill? Absolutely. But you haven't lived until you've developed Tampermonkey scripts in typescript with auto-reloading. I also understand that this obfuscates the built script and may cause concerns about blindly importing it into your browser. That is why I have also provided file checksums and build instructions below, to allow you to build from source yourself or just verify that the distribution file matches.

## Installing a script

1. Browse to the `dist/<script>` directory for the script you want. 
2. In your Tampermonkey extension dashboard, add a new script.

![Click the tampermonkey extension and select "create user script"](docs/images/tampermonkey-new-script.png)

3. Copy the contents of `dist/<script>/script.user.js` into the editor. This script will reference the latest version from the `dist` directory. See below to pin a version.

## Local setup

