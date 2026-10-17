# ClearedToCode OBS overlays (v2)

A clean rebuild of the ClearedToCode stream setup: 6 scenes, live chat and alerts, and a matching look across every screen. Your old scene collection stays in OBS, so you can switch back at any time.

## Set up (about 5 minutes)

1. **Close OBS.**
2. **Put this folder at `C:\ClearedToCode-OBS`.** Any other location works too, as long as you do step 3.
3. **Double-click `SETUP.bat`.** It points the scenes at this folder and copies your old hangar background (`hangar-clean.png`) in. If Windows shows a warning, click *More info → Run anyway*.
4. **Import into OBS:** open OBS and choose **Scene Collection → Import**. Click **…**, pick `ClearedToCode-OBS-v2.json`, then click **Import**. Then choose **Scene Collection → ClearedToCode v2**.
5. **Pick your devices** (double-click each source):
   - **Webcam**: choose your camera.
   - **Flight Sim capture**: this captures any full-screen game. If MSFS runs in a window, set *Mode* to *Capture specific window* and pick Microsoft Flight Simulator.
   - **Main screen capture**: shows your main monitor (for coding). Pick a different monitor here if needed.
6. **Make it yours:** open `config.js` in Notepad and set your Twitch channel, name, footer messages and schedule. Save it, then right-click any browser source and choose **Refresh**.

Check that **Settings → Video → Base (Canvas) Resolution** is **1920x1080**. The layout is built for that size.

## Scenes

| Scene | What it's for |
|---|---|
| 1 - Starting Soon | Countdown (5 min by default) with a pre-flight checklist and live chat |
| 2 - Hangar (Talk & Code) | Screen share, big camera, chat, and the Develop / Enhance / Elevate cards |
| 3 - Flight Sim (Live) | Full-screen MSFS with a small camera, chat and the alert bar |
| 4 - Be Right Back | "Away for" timer and chat |
| 5 - Ending Soon | Thank-you screen and chat |
| 6 - Offline | Offline screen and your schedule |

## What changed from the old setup

- **One job per scene.** Before, the Starting, Live, BRB, Ending and Offline cards were all stacked on top of your main scene at once. Each one now has its own scene.
- **Live instead of pictures.** Chat, latest sub, cheer and raid were static images. They now update live from your Twitch channel, and new ones pop up as an alert. Deleted chat messages disappear too.
- **Added the parts that were missing:** webcam, game capture, screen capture, desktop audio, and your mic. The mic has noise suppression, a compressor and a limiter, so your voice stays clear and never clips. You can turn any of these off under the mic's *Filters*.
- **Removed** the "Reference – Original image" scene and the sample camera picture.
- **Locked the backgrounds** so you can't drag them by accident. Everything else can still be moved.

## Followers and donations

Twitch only shares new followers with tools you log into, so this overlay can't show them by itself. If you use StreamElements or Streamlabs, copy your **Alert Box URL** from their site. In OBS, add it as a **Browser** source (1920 x 1080) at the top of scenes 2 and 3.

## Folder contents

- `config.js`: all your text, handles and colours.
- `overlays/`: the overlay pages OBS loads.
- `assets/hangar.png`: your background photo. Without it, a built-in dark background is used.
- `SETUP.bat`, `scene-template.json`, `ClearedToCode-OBS-v2.json`: the OBS scene files.
- `tools/build_scene_collection.py`: rebuilds the scene files if you change the layout in code.
