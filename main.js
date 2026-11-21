import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {World} from './world.js';
import {GorillaLocomotion} from './movement.js';
import {LobbyBrowser} from './browser.js';
import {Systems} from './systems.js';
import {PlayFabBridge} from './playfab.js';

const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(1);renderer.setSize(innerWidth,innerHeight);renderer.xr.enabled=true;
renderer.xr.setReferenceSpaceType('local-floor');renderer.xr.setFramebufferScaleFactor(0.8);renderer.shadowMap.enabled=false;
document.body.appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,150);camera.position.set(0,1.65,4);
const world=new World();
const movement=new GorillaLocomotion(renderer,camera,world);movement.init();
const browser=new LobbyBrowser();const systems=new Systems(world);systems.init();
const playfab=new PlayFabBridge();
window.WILDHOP=window.WILDHOP||{};
Object.assign(window.WILDHOP,{world,movement,browser,systems,playfab});

const staffStatus=document.querySelector('#staff-status');
const staffBadges=document.querySelector('#staff-badges');
const staffTools=document.querySelector('#staff-tools');
async function verifyStaff(){
  staffStatus.textContent='Checking PlayFab account…';
  try{
    const profile=await playfab.verifyStaff();
    const role=profile.role||'player';
    const labels={owner:'Owner',moderator:'Moderator',trialModerator:'Trial Moderator',betaTester:'Beta Tester',contentCreator:'Content Creator'};
    const badgeNames=(profile.badges||[]).map(b=>b==='metOwner'?'Met the Owner':b);
    if(role==='owner')badgeNames.unshift('Owner');
    if(role==='moderator')badgeNames.unshift('Moderator');
    if(role==='trialModerator')badgeNames.unshift('Trial Moderator');
    if(role==='betaTester')badgeNames.unshift('Beta Tester');
    if(role==='contentCreator')badgeNames.unshift('Content Creator');
    staffStatus.textContent='Verified: '+(labels[role]||'Player');
    staffBadges.textContent='Badges: '+(badgeNames.length?badgeNames.join(' · '):'none');
    staffTools.textContent=profile.canUseHammers?'Ban Hammer + Kick Hammer unlocked':'Staff tools locked';
    world.setStaffRole(role);
    world.setVentUnlocked(Boolean(profile.canEnterVent));
    movement.onHint=profile.canEnterVent?'Staff verified. The moderator vent is unlocked.':'You do not have moderator vent access.';
  }catch(error){
    staffStatus.textContent=error.message;
    staffBadges.textContent='Badges: unavailable';
    staffTools.textContent='Staff tools locked';
    world.setStaffRole('player');world.setVentUnlocked(false);
  }
}
document.querySelector('#staff-verify').addEventListener('click',verifyStaff);
window.addEventListener('wildhop:vent-interact',()=>{
  if(world.ventUnlocked){movement.onHint('Moderator vent unlocked. Walk through the open hatch.');}
  else {movement.onHint('Verifying staff access…');verifyStaff();}
});
const vrButton=document.querySelector('#enter-vr');
vrButton.addEventListener('click',async()=>{
  if(!navigator.xr){alert('WebXR is not available in this browser. Open this HTTPS page in the Meta Quest Browser.');return;}
  try{const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});await renderer.xr.setSession(session);}
  catch(err){alert('Could not start VR: '+(err?.message||String(err))+' Make sure you are using the Meta Quest Browser over HTTPS.');}
});
movement.onHint=msg=>{document.querySelector('#hint').textContent=msg;};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
renderer.setAnimationLoop(()=>{const dt=1/60;movement.update(dt);world.update(dt);renderer.render(world.scene,camera);});
if(playfab.configured())verifyStaff();
