"""Builds the OBS scene collection for the ClearedToCode overlays.

Writes two files next to the overlays folder:
  scene-template.json        paths use __CTC_DIR__ (SETUP.bat fills it in)
  ClearedToCode-OBS-v2.json  ready to import if the folder is C:\\ClearedToCode-OBS

Run:  python tools/build_scene_collection.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKEN = "__CTC_DIR__"
DEFAULT_DIR = "C:/ClearedToCode-OBS"
COLLECTION_NAME = "ClearedToCode v2"

W, H = 1920, 1080
MARGIN = 32
FOOTER_H = 56

# name -> (overlay file, width, height, restart timers when shown)
BROWSER = {
    "Backdrop": ("backdrop.html", W, H, False),
    "Brand": ("brand.html", 460, 96, False),
    "Latest events": ("events.html", 820, 96, False),
    "Chat (side)": ("chat.html", 420, 560, False),
    "Chat (wide)": ("chat.html", 656, 380, False),
    "Camera frame (small)": ("camera.html", 400, 300, False),
    "Camera frame (large)": ("camera.html", 656, 460, False),
    "Main screen frame": ("screen-frame.html", 1168, 708, False),
    "Taglines": ("taglines.html", 1168, 136, False),
    "Footer": ("footer.html", W, FOOTER_H, False),
    "Starting Soon screen": ("starting.html", W, H, True),
    "Be Right Back screen": ("brb.html", W, H, True),
    "Ending screen": ("ending.html", W, H, False),
    "Offline screen": ("offline.html", W, H, False),
}

CAPTURES = {
    "Webcam": ("dshow_input", {}),
    "Flight Sim capture": ("game_capture", {"capture_mode": "any_fullscreen", "capture_cursor": True}),
    "Main screen capture": ("monitor_capture", {"capture_cursor": True}),
}

EVENTS_X = W - MARGIN - BROWSER["Latest events"][1]
CHAT_SIDE_X = W - MARGIN - BROWSER["Chat (side)"][1]
FOOTER_Y = H - FOOTER_H
TOP_ROW = [("Brand", MARGIN, 28), ("Latest events", EVENTS_X, 28)]


def item(name, x, y, bounds=None, fit="inner", locked=False):
    """One scene item. bounds=(w, h) scales the source into that box."""
    it = {
        "name": name, "visible": True, "locked": locked, "rot": 0.0,
        "pos": {"x": x, "y": y}, "scale": {"x": 1.0, "y": 1.0},
        "align": 5, "bounds_type": 0, "bounds_align": 0,
        "bounds": {"x": 0.0, "y": 0.0},
        "crop_left": 0, "crop_top": 0, "crop_right": 0, "crop_bottom": 0,
        "group_item_backup": False, "scale_filter": "disable",
        "blend_method": "default", "blend_type": "normal", "private_settings": {},
    }
    if bounds:
        # 2 = fit inside the box, 3 = fill the box (cropped to its edges)
        it["bounds_type"] = 3 if fit == "fill" else 2
        it["bounds"] = {"x": float(bounds[0]), "y": float(bounds[1])}
        it["crop_to_bounds"] = fit == "fill"
    return it


def full_screen_scene(screen, with_chat=True):
    items = [item("Backdrop", 0, 0, locked=True), item(screen, 0, 0, locked=True)]
    if with_chat:
        items.append(item("Chat (side)", CHAT_SIDE_X, 148))
    items += [item("Brand", MARGIN, 28), item("Footer", 0, FOOTER_Y)]
    return items


SCENES = {
    "1 - Starting Soon": full_screen_scene("Starting Soon screen"),
    "2 - Hangar (Talk & Code)": [
        item("Backdrop", 0, 0, locked=True),
        item("Main screen capture", MARGIN + 8, 148 + 52, bounds=(1152, 648)),
        item("Main screen frame", MARGIN, 148),
        item("Webcam", 1232 + 8, 148 + 8, bounds=(640, 360), fit="fill"),
        item("Camera frame (large)", 1232, 148),
        item("Chat (wide)", 1232, 628),
        item("Taglines", MARGIN, 872),
        *[item(n, x, y) for n, x, y in TOP_ROW],
        item("Footer", 0, FOOTER_Y),
    ],
    "3 - Flight Sim (Live)": [
        item("Flight Sim capture", 0, 0, bounds=(W, H), locked=True),
        item("Webcam", MARGIN + 8, 708 + 8, bounds=(384, 216), fit="fill"),
        item("Camera frame (small)", MARGIN, 708),
        item("Chat (side)", CHAT_SIDE_X, 148),
        *[item(n, x, y) for n, x, y in TOP_ROW],
        item("Footer", 0, FOOTER_Y),
    ],
    "4 - Be Right Back": full_screen_scene("Be Right Back screen"),
    "5 - Ending Soon": full_screen_scene("Ending screen"),
    "6 - Offline": full_screen_scene("Offline screen", with_chat=False),
}


def source(name, kind, settings, **extra):
    s = {
        "name": name, "id": kind, "versioned_id": kind, "settings": settings,
        "mixers": 0, "sync": 0, "flags": 0, "volume": 1.0, "enabled": True,
        "muted": False, "hotkeys": {}, "private_settings": {},
    }
    s.update(extra)
    return s


def flt(name, kind, settings):
    return {"name": name, "id": kind, "versioned_id": kind, "settings": settings, "enabled": True}


def build(base):
    sources = []
    for name, (file, w, h, restart) in BROWSER.items():
        sources.append(source(name, "browser_source", {
            "is_local_file": True,
            "local_file": f"{base}/overlays/{file}",
            "width": w, "height": h,
            "fps_custom": False,
            "shutdown": False,
            "restart_when_active": restart,
            "reroute_audio": False,
        }))
    for name, (kind, settings) in CAPTURES.items():
        sources.append(source(name, kind, settings))
    for name, items in SCENES.items():
        for i, it in enumerate(items, 1):
            it["id"] = i
        sources.append(source(name, "scene", {"items": items, "id_counter": len(items)}))

    used = {it["name"] for items in SCENES.values() for it in items}
    defined = set(BROWSER) | set(CAPTURES)
    assert used == defined, f"unused or missing sources: {used ^ defined}"

    return {
        "name": COLLECTION_NAME,
        "current_scene": "1 - Starting Soon",
        "current_program_scene": "1 - Starting Soon",
        "scene_order": [{"name": n} for n in SCENES],
        "sources": sources,
        "DesktopAudioDevice1": source(
            "Desktop Audio", "wasapi_output_capture", {"device_id": "default"}, mixers=255),
        "AuxAudioDevice1": source(
            "Mic/Aux", "wasapi_input_capture", {"device_id": "default"}, mixers=255,
            filters=[
                flt("Noise Suppression", "noise_suppress_filter_v2", {"method": "rnnoise"}),
                flt("Compressor", "compressor_filter", {
                    "ratio": 4.0, "threshold": -18.0, "attack_time": 6,
                    "release_time": 60, "output_gain": 0.0}),
                flt("Limiter", "limiter_filter", {"threshold": -3.0, "release_time": 60}),
            ]),
        "groups": [],
        "quick_transitions": [],
        "saved_projectors": [],
        "transitions": [],
        "current_transition": "Fade",
        "transition_duration": 400,
        "preview_locked": False,
        "scaling_enabled": False,
    }


def write(path, data):
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    write(ROOT / "scene-template.json", build(TOKEN))
    write(ROOT / "ClearedToCode-OBS-v2.json", build(DEFAULT_DIR))
