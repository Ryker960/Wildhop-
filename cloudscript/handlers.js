// Upload this file's handlers into PlayFab Game Manager > Automation > CloudScript.
// Assign roles/badges using trusted server-side User Internal Data in Game Manager.
// Never let the browser set its own role or badges.

handlers.getStaffProfile = function (args, context) {
  var result = server.GetUserInternalData({
    PlayFabId: currentPlayerId,
    Keys: ["wildhopRole", "wildhopBadges"]
  });
  var role = "player";
  var badges = [];
  if (result.Data && result.Data.wildhopRole && result.Data.wildhopRole.Value) {
    role = result.Data.wildhopRole.Value;
  }
  if (result.Data && result.Data.wildhopBadges && result.Data.wildhopBadges.Value) {
    try { badges = JSON.parse(result.Data.wildhopBadges.Value); } catch (e) { badges = []; }
  }
  var staff = role === "owner" || role === "moderator";
  return {
    playFabId: currentPlayerId,
    role: role,
    badges: badges,
    canEnterVent: staff,
    canUseHammers: staff
  };
};

handlers.moderationAction = function (args, context) {
  var actor = server.GetUserInternalData({
    PlayFabId: currentPlayerId,
    Keys: ["wildhopRole"]
  });
  var role = actor.Data && actor.Data.wildhopRole ? actor.Data.wildhopRole.Value : "player";
  if (role !== "owner" && role !== "moderator") {
    throw new Error("Only the owner and moderators can use moderation tools.");
  }
  if (!args || !args.targetPlayFabId || args.targetPlayFabId === currentPlayerId) {
    throw new Error("Choose a valid target player.");
  }
  if (args.action === "ban") {
    var ban = server.BanUsers({
      Bans: [{
        PlayFabId: args.targetPlayFabId,
        Reason: String(args.reason || "WILDHOP VR moderation").slice(0, 200)
      }]
    });
    return {ok:true,action:"ban",targetPlayFabId:args.targetPlayFabId,bans:ban.BanData};
  }
  if (args.action === "kick") {
    // PlayFab accounts alone do not provide a live-session kick endpoint.
    // Connect a multiplayer/session server and send its authenticated kick command here.
    throw new Error("Kick needs the multiplayer server/session system to be connected.");
  }
  throw new Error("Unknown moderation action.");
};
