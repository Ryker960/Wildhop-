// WILDHOP VR PlayFab client bridge.
// Put your PlayFab Title ID in TITLE_ID. Never put a Secret Key in browser code.
const TITLE_ID = "PUT_YOUR_PLAYFAB_TITLE_ID_HERE";
const API = id => `https://${id}.playfabapi.com/Client`;

export class PlayFabBridge {
  constructor() {
    this.titleId = TITLE_ID;
    this.sessionTicket = null;
    this.playFabId = null;
    this.ready = false;
  }
  configured() {
    return Boolean(this.titleId && this.titleId !== "PUT_YOUR_PLAYFAB_TITLE_ID_HERE");
  }
  async request(path, body, authenticated = false) {
    const headers = {"Content-Type":"application/json"};
    if (authenticated && this.sessionTicket) headers["X-Authorization"] = this.sessionTicket;
    const response = await fetch(API(this.titleId) + path, {method:"POST",headers,body:JSON.stringify(body)});
    const json = await response.json();
    if (!response.ok || json.error) throw new Error(json.errorMessage || json.error || "PlayFab request failed");
    return json.data;
  }
  async login() {
    if (!this.configured()) throw new Error("Add your PlayFab Title ID in playfab.js first.");
    let customId = localStorage.getItem("wildhop_playfab_custom_id");
    if (!customId) {
      customId = "wildhop-" + (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now());
      localStorage.setItem("wildhop_playfab_custom_id", customId);
    }
    const data = await this.request("/LoginWithCustomID", {
      TitleId:this.titleId, CustomId:customId, CreateAccount:true
    });
    this.sessionTicket = data.SessionTicket;
    this.playFabId = data.PlayFabId;
    this.ready = true;
    return data;
  }
  async verifyStaff() {
    if (!this.ready) await this.login();
    const data = await this.request("/ExecuteCloudScript", {
      FunctionName:"getStaffProfile",
      FunctionParameter:{},
      GeneratePlayStreamEvent:false
    }, true);
    if (data.Error) throw new Error(data.Error.Message || "Staff verification failed");
    return data.FunctionResult || {role:"player",badges:[],canEnterVent:false,canUseHammers:false};
  }
  async moderate(action, targetPlayFabId, reason = "WILDHOP VR moderation") {
    if (!this.ready) await this.login();
    const data = await this.request("/ExecuteCloudScript", {
      FunctionName:"moderationAction",
      FunctionParameter:{action,targetPlayFabId,reason},
      GeneratePlayStreamEvent:true
    }, true);
    if (data.Error) throw new Error(data.Error.Message || "Moderation action failed");
    return data.FunctionResult;
  }
}
