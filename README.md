# WILDHOP VR — Quest 3S browser prototype

## Publish and open it
1. Keep all files in this repository's top-level folder (the same folder as this README).
2. In GitHub, open **Settings → Pages** and publish from the `main` branch and `/(root)`.
3. Open the published HTTPS site in **Meta Quest Browser** on the Quest 3S.
4. Press **ENTER VR** and accept the headset prompt.

Do not open the page as a local `file://` URL. WebXR requires a secure HTTPS page (localhost is the usual development exception).

## Files in this repository
- `index.html` — page markup and entry point
- `style.css` — page and browser styling
- `main.js` — Three.js startup and ENTER VR button
- `world.js` — prototype forest/lobby scene
- `movement.js` — early arm-push movement prototype
- `browser.js` — lobby computer browser panel
- `systems.js` — prototype timers and currency helpers
- `README.md` — these instructions

All JavaScript and CSS files listed above are in the repository root. The page references them using root-relative paths.

## Controls
- Quest: use the motion controllers; move your hands against solid scenery to test the early push locomotion. Walk near the lobby computer and press the controller trigger/select to open its browser.
- Desktop preview: WASD / arrow keys to move, mouse drag to look, E near the computer to interact.
- No teleporters or controller vibration/haptics are included.

## Prototype limits
- Hand locomotion is an early collision-ray prototype, not finished Gorilla Tag physics. Hand/body collision, climbing, momentum and controller testing still need work.
- The forest and computer stand are placeholders. Replace the temporary stump when the supplied model is ready.
- The lobby browser uses an iframe. Google, YouTube, Steam and other sites may block embedding; use **OPEN OUTSIDE** when a site refuses to display. This is not a full desktop Chrome browser and cannot run PC Steam games.
- The TrustedUser countdown helper starts at 100 seconds. The soundboard purchase helper uses an 8,000 in-game currency price.
- This is currently a single-player prototype. Multiplayer, voice, secure staff permissions, bans, reports, moderation actions, PlayFab authentication and persistent currency need a real backend and server-side validation. Do not put secret API keys or Discord webhook URLs in client files.
- Unity C# scripts do not run directly in a browser; each needs a complete browser-native port. This repository's current root files are the working prototype files, not a complete port of every Unity script.
