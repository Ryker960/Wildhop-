import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {World} from './world.js';
import {GorillaLocomotion} from './movement.js';
import {LobbyBrowser} from './browser.js';
import {Systems} from './systems.js';
import {installScriptPorts} from './ports/script-ports.js';

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.xr.enabled=true;
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);

const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,150);
camera.position.set(0,1.65,4);
const world=new World();
const movement=new GorillaLocomotion(renderer,camera,world);
movement.init();
const browser=new LobbyBrowser();
const systems=new Systems(world);systems.init();
const scriptPorts=installScriptPorts({movement,browser,systems});
window.WILDHOP.scriptPorts=scriptPorts;

document.querySelector('#enter-vr').addEventListener('click',async()=>{
  if(!navigator.xr){alert('WebXR is not available in this browser. Open this HTTPS page in the Meta Quest Browser.');return;}
  try{
    const supported=await navigator.xr.isSessionSupported('immersive-vr');
    if(!supported){alert('Immersive VR is not supported here. Open this page on your Quest 3S.');return;}
    const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});
    await renderer.xr.setSession(session);
  }catch(err){alert('Could not start VR: '+err.message);}
});
movement.onHint=msg=>{document.querySelector('#hint').textContent=msg;};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
renderer.setAnimationLoop((time,frame)=>{
  const dt=Math.min(.05,renderer.info.render.frame?1/60:1/60);
  movement.update(dt);
  world.update(dt);
  renderer.render(world.scene,camera);
});
