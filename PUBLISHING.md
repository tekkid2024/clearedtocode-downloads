# Publishing a release

## A new version of an existing app

1. Build the installer as usual.
2. Make its checksum file (PowerShell, in the folder with the file):
   `Get-FileHash .\<file> -Algorithm SHA256 | ForEach-Object { "$($_.Hash.ToLower())  <file>" } > SHA256SUMS.txt`
3. On GitHub open **Releases > Draft a new release** in this repository.
4. **Tag**: `<app-id>-v<version>`, exactly. The app id is the folder name
   under `apps/`. Examples: `airline-hub-v1.1.2`, `vantage-v1.0.9`,
   `flightdeck-bridge-v2.2.0`. A tag that does not match is ignored.
5. **Title**: `<App name> <version>`. Write what's new in the description.
6. Attach the installer, `SHA256SUMS.txt`, and the manual if it changed.
   Each file can be up to 2 GB.
7. Publish. Within a minute the *Update catalog* action refreshes
   `catalog.json`, the table in `README.md` and the app's page. The website
   picks up the new version from `catalog.json`.

Tick **Set as a pre-release** for a beta: it is listed on the app's page but
never offered as the latest download. Deleting or editing a release also
refreshes the catalog.

## A new app

1. Create `apps/<app-id>/app.json` (copy one of the others). Use a short,
   lowercase id with dashes; it becomes the start of every release tag.
   `order` sets its position in the list.
2. Optionally write `apps/<app-id>/README.md`. If you don't, a basic page is
   made for you. Keep the generated block at the bottom intact.
3. Commit to `main`, then publish its first release as above.

## Editing descriptions

Edit `apps/<app-id>/app.json` or the hand-written part of the app's
`README.md` straight on GitHub. Text between the `catalog:start` and
`catalog:end` markers is regenerated, so changes there are overwritten.

To regenerate by hand: **Actions > Update catalog > Run workflow**, or locally
`node scripts/build-catalog.mjs` (Node 20+).

## Getting projects from your PC onto GitHub

`tools/push-pc-projects.ps1` puts every project folder under one parent
folder onto GitHub as a private repository (or pushes unpushed commits for
ones already there). Run it once without `-Go` to see the plan, then with it:

```powershell
.\tools\push-pc-projects.ps1 -Root "$HOME\source\repos"
.\tools\push-pc-projects.ps1 -Root "$HOME\source\repos" -Go
```

It skips projects with uncommitted changes or files that look like secrets
and lists them so you can deal with them by hand. Built installers still go
to this repository's Releases as described above.
