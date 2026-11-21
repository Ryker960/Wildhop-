# WILDHOP VR — PlayFab setup

1. Create a PlayFab title in the PlayFab Game Manager.
2. Copy its **Title ID** into `playfab.js`, replacing `PUT_YOUR_PLAYFAB_TITLE_ID_HERE`.
3. In Game Manager, upload `cloudscript/handlers.js` under Automation / CloudScript and publish it.
4. In the player's **User Internal Data**, set:
   - `wildhopRole` = `owner`, `moderator`, `trialModerator`, `betaTester`, `contentCreator`, or `player`
   - `wildhopBadges` = JSON array, e.g. `["metOwner"]`
5. Do not expose a PlayFab Secret Key in any browser file.

Permissions:
- owner + moderator: moderator vent and ban/kick tool display.
- trialModerator: Trial Moderator badge only; no vent or hammers.
- betaTester: Beta Tester badge.
- contentCreator: Content Creator badge.
- metOwner: Met the Owner badge when explicitly granted.

Ban is implemented as a server-side PlayFab ban. Kick is intentionally blocked until a multiplayer/session server exists; PlayFab account login by itself cannot remove a player from a live game session.
