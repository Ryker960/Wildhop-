import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {World} from './world.js';
import {GorillaLocomotion} from './movement.js';
import {LobbyBrowser} from './browser.js';
import {Systems} from './systems.js';

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
const systems=new Systems(world);
systems.init();

// Expose the running prototype without assuming a global already exists.
window.WILDHOP=window.WILDHOP||{};
window.WILDHOP.world=world;
window.WILDHOP.movement=movement;
window.WILDHOP.browser=browser;
window.WILDHOP.systems=systems;

const vrButton=document.querySelector('#enter-vr');
vrButton.addEventListener('click',async()=>{
  if(!navigator.xr){
    alert('WebXR is not available in this browser. Open this HTTPS page in the Meta Quest Browser.');
    return;
  }
  // requestSession must be called directly from the button gesture.
  // Waiting for isSessionSupported() first can lose the browser's user activation.
  try{
    const session=await navigator.xr.requestSession('immersive-vr',{
      optionalFeatures:['local-floor','bounded-floor','hand-tracking']
    });
    await renderer.xr.setSession(session);
  }catch(err){
    alert('Could not start VR: '+(err?.message||String(err))+' Make sure you are using the Meta Quest Browser over HTTPS.');
  }
});
movement.onHint=msg=>{document.querySelector('#hint').textContent=msg;};
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
renderer.setAnimationLoop((time,frame)=>{
  const dt=1/60;
  movement.update(dt);
  world.update(dt);
  renderer.render(world.scene,camera);
});
