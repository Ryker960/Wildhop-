# WILDHOP VR — Quest 3S prototype

## Open it
1. Extract the ZIP.
2. Host the folder on an HTTPS static host (for example GitHub Pages).
3. Open the HTTPS page in Meta Quest Browser.
4. Press **ENTER VR** and allow the headset prompt.

A local `file://` open is not enough for WebXR. Quest WebXR requires a secure HTTPS origin (localhost is the usual development exception).

## Controls
- Quest: use your motion controllers; push your hands against solid scenery to move. Walk close to the lobby computer and press the controller select/trigger to open its browser.
- Desktop preview: WASD / arrow keys to move, mouse drag to look, E near the computer to interact.
- No teleporters are included.
- No controller vibration or haptics are used.

## Current prototype limits
- Hand locomotion is an early collision-ray prototype, not a finished Gorilla Tag physics implementation. Test on the Quest 3S and tune hand collision, body collision, momentum and climbing.
- The forest and computer stand are placeholders. Replace the temporary stump with the user's supplied model when available.
- The lobby browser uses an iframe. Google, YouTube, Steam and other sites may refuse embedding; **OPEN OUTSIDE** opens the current page in a normal browser tab. This is not the full Chrome desktop app and cannot run PC Steam games.
- The TrustedUser countdown is initialized to 100 seconds. Soundboard purchase price is 8,000 in-game currency.
- The browser UI is functional for address/search navigation, back/forward, refresh and external open. Site restrictions are controlled by each website.
- This is a single-player prototype. Multiplayer, voice, secure staff permissions, bans, reports, moderation actions, PlayFab authentication and persistent currency need a real backend and server-side validation. Do not put secret API keys or Discord webhook URLs in client files.
- The supplied Unity C# scripts need individual browser-native ports; Unity APIs, Photon, PlayFab and XR Interaction Toolkit do not run directly in a browser. Vibration-related script behavior is intentionally excluded.


## Added browser-native script ports
`js/ports/script-ports.js` now includes browser-side counterparts / integration classes for:
- HitSounds, BetterHitSounds
- Purchase, Red, Blue, Green, ColorScript, KeyboardColor
- XRHandController, XRHandL, ControllerDetector
- Disable, Enable, OnlyUp
- LeaderBoard, ReportButton, MuteButton, KickButton, kick, antikick
- EyeBlockCull, AddLetter, NameScript, BackspaceScript, ComputerTabs
- OfflineRig, TrustedUser (100-second default), AntiHandPhase
- LiveEvent, Blink, TalkingFace, DefaultNameManager
- SoundBoard (8,000 currency), GcsWasdMovement
- GCSLobbyTracker, Playfablogin, LocalModHandScanner
- FastIKFabric placeholder and LocalModTools permission gate

These are browser-native counterparts, not direct execution of Unity C#. Several depend on server APIs that are not connected in this prototype. PlayFab login/entitlements, multiplayer/lobby tracking, persistent purchases/currency, leaderboard, reports, kicks/bans, voice, and owner/staff permissions are deliberately fail-closed until a secure backend is configured. The original FastIKFabric snippet was incomplete, so its browser class is a placeholder pending rig details.

Not ported by design:
- `Vibrations.cs`: excluded because controller vibration was explicitly declined.
- `BestTeleport.cs`: excluded because teleporters were explicitly removed.
