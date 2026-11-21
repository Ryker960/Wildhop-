import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class GorillaLocomotion {
  constructor(renderer,camera,world){
    this.renderer=renderer;this.camera=camera;this.world=world;
    this.prevHands=[new THREE.Vector3(),new THREE.Vector3()];
    this.handReady=[false,false];this.playerOffset=new THREE.Vector3();this.baseReferenceSpace=null;
    this.raycaster=new THREE.Raycaster();this.handRadius=.13;this.desktopVelocity=new THREE.Vector3();
    this.keys={};this.onHint=()=>{};
  }
  init(){
    window.addEventListener('keydown',e=>{this.keys[e.code]=true;if(e.code==='KeyE')this.tryInteract();});
    window.addEventListener('keyup',e=>this.keys[e.code]=false);
    let dragging=false,lastX=0,lastY=0;
    window.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,iframe,form'))return;dragging=true;lastX=e.clientX;lastY=e.clientY;});
    window.addEventListener('pointerup',()=>dragging=false);
    window.addEventListener('pointermove',e=>{if(!dragging||this.renderer.xr.isPresenting)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;this.camera.rotation.order='YXZ';this.camera.rotation.y-=dx*.004;this.camera.rotation.x=Math.max(-1.3,Math.min(1.3,this.camera.rotation.x-dy*.004));});
    this.renderer.xr.addEventListener('sessionstart',()=>{
      this.baseReferenceSpace=this.renderer.xr.getReferenceSpace();this.playerOffset.set(0,0,0);this.handReady=[false,false];
    });
    this.renderer.xr.addEventListener('sessionend',()=>{this.baseReferenceSpace=null;});
    this.renderer.xr.addEventListener('sessionstart',()=>this.bindXRInputs());
    // Controller trigger/select interacts with the nearby lobby computer or moderator vent.
    this.xrControllers=[this.renderer.xr.getController(0),this.renderer.xr.getController(1)];
    this.xrControllers.forEach(controller=>{controller.addEventListener('select',()=>this.tryInteract());this.world.scene.add(controller);});
    this.bindXRInputs();
  }
  bindXRInputs(){
    const session=this.renderer.xr.getSession();if(!session)return;
    const sources=Array.from(session.inputSources||[]);
    for(const source of sources){
      if(source.gamepad){
        const index=source.handedness==='left'?0:1;
        this.controllerSources=this.controllerSources||[];this.controllerSources[index]=source;
      }
    }
    if(!this.inputsChangeHandler){this.inputsChangeHandler=()=>this.bindXRInputs();session.addEventListener('inputsourceschange',this.inputsChangeHandler);}
  }
  tryInteract(){
    const p=this.camera.getWorldPosition(new THREE.Vector3());
    if(this.world.ventPosition&&p.distanceTo(this.world.ventPosition)<this.world.ventInteractRadius){
      window.dispatchEvent(new CustomEvent('wildhop:vent-interact'));
      return;
    }
    if(this.world.computerPosition&&p.distanceTo(this.world.computerPosition)<this.world.interactRadius){
      window.dispatchEvent(new CustomEvent('wildhop:computer-interact'));
    } else this.onHint('Move closer to the lobby computer or moderator vent to interact.');
  }
  setReferenceOffset(){
    if(!this.baseReferenceSpace||!this.renderer.xr.isPresenting)return;
    const transform=new XRRigidTransform({x:-this.playerOffset.x,y:-this.playerOffset.y,z:-this.playerOffset.z});
    this.renderer.xr.setReferenceSpace(this.baseReferenceSpace.getOffsetReferenceSpace(transform));
  }
  update(dt){if(this.renderer.xr.isPresenting){this.updateXRHands();return;}this.updateDesktop(dt);}
  updateXRHands(){
    const session=this.renderer.xr.getSession();if(!session)return;
    const frame=this.renderer.xr.getFrame();if(!frame)return;
    const ref=this.renderer.xr.getReferenceSpace();if(!ref)return;
    const sources=Array.from(session.inputSources||[]).filter(s=>s.gripSpace);
    sources.forEach(source=>{
      const index=source.handedness==='left'?0:1;
      const pose=frame.getPose(source.gripSpace,ref);if(!pose)return;
      const p=pose.transform.position;const current=new THREE.Vector3(p.x,p.y,p.z);
      if(this.handReady[index]){
        const delta=current.clone().sub(this.prevHands[index]);const len=delta.length();
        if(len>.012&&len<.35){
          this.raycaster.set(this.prevHands[index],delta.clone().normalize());this.raycaster.far=len+this.handRadius;
          const hits=this.raycaster.intersectObjects(this.world.collidables,true);
          if(hits.length){this.playerOffset.sub(delta);this.setReferenceOffset();}
        }
      }
      this.prevHands[index].copy(current);this.handReady[index]=true;
    });
  }
  updateDesktop(dt){
    const speed=5;
    const forward=new THREE.Vector3(0,0,-1).applyQuaternion(this.camera.quaternion);forward.y=0;forward.normalize();
    const right=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion);right.y=0;right.normalize();
    const move=new THREE.Vector3();
    if(this.keys.KeyW||this.keys.ArrowUp)move.add(forward);
    if(this.keys.KeyS||this.keys.ArrowDown)move.sub(forward);
    if(this.keys.KeyD||this.keys.ArrowRight)move.add(right);
    if(this.keys.KeyA||this.keys.ArrowLeft)move.sub(right);
    if(move.lengthSq())this.camera.position.add(move.normalize().multiplyScalar(speed*dt));
    if(this.keys.Space)this.camera.position.y=Math.min(3,this.camera.position.y+speed*dt);
    if(this.keys.ShiftLeft)this.camera.position.y=Math.max(1,this.camera.position.y-speed*dt);
  }
}
