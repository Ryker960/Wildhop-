import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class World {
  constructor(){
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x8bb7a0);
    this.scene.fog=new THREE.Fog(0x8bb7a0,22,75);
    this.collidables=[];
    this.updaters=[];
    this.raycaster=new THREE.Raycaster();
    this.makeLights(); this.makeGround(); this.makeForest(); this.makeLobbyComputer();
    this.makeModeratorVent(); this.makeStaffTools();
  }
  makeLights(){
    this.scene.add(new THREE.HemisphereLight(0xdfffea,0x31452d,2.0));
    const sun=new THREE.DirectionalLight(0xfff2d5,2.1);sun.position.set(-12,22,9);sun.castShadow=true;this.scene.add(sun);
  }
  addMesh(geo,mat,pos,collide=true){
    const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;this.scene.add(m);
    if(collide)this.collidables.push(m);return m;
  }
  makeGround(){
    const ground=this.addMesh(new THREE.BoxGeometry(100,1,100),new THREE.MeshStandardMaterial({color:0x527c43,roughness:1}),[0,-.55,0]);
    ground.name='ground';
    this.addMesh(new THREE.BoxGeometry(5,.06,20),new THREE.MeshStandardMaterial({color:0xb5a276}),[0,-.01,4],false);
    this.addMesh(new THREE.CylinderGeometry(8,8,.25,48),new THREE.MeshStandardMaterial({color:0x6b9b55}),[0,-.15,0]);
  }
  makeTree(x,z,s=1){
    this.addMesh(new THREE.CylinderGeometry(.22*s,.34*s,2.6*s,8),new THREE.MeshStandardMaterial({color:0x68452a}),[x,1.3*s,z]);
    const crown=this.addMesh(new THREE.SphereGeometry(1.55*s,10,8),new THREE.MeshStandardMaterial({color:0x286b3d}),[x,3.0*s,z]);
    crown.scale.set(1,1.15,1);
    const crown2=this.addMesh(new THREE.SphereGeometry(1.05*s,9,7),new THREE.MeshStandardMaterial({color:0x347c43}),[x-.65*s,3.45*s,z+.35*s],false);
  }
  makeForest(){
    const spots=[[-13,-10,1.1],[13,-12,1.3],[-16,8,1],[16,9,1.15],[-10,17,.8],[10,18,.9],[-22,-1,1.2],[22,0,1.2],[-28,-18,1.3],[28,-17,1.2],[-30,18,1.1],[29,20,1.35],[-5,-28,1.2],[8,30,1.25]];
    spots.forEach(p=>this.makeTree(...p));
    [[-5,0,-8],[6,0,-9],[-7,0,8],[8,0,8]].forEach(([x,y,z],i)=>{
      const rock=this.addMesh(new THREE.DodecahedronGeometry(1.6,0),new THREE.MeshStandardMaterial({color:i%2?0x77856c:0x667b60}),[x,1.1,z]);
      rock.scale.set(1.3,.8,1);
    });
    // Fern-like ground plants.
    for(let i=0;i<18;i++){
      const x=((i*17)%53)-26, z=((i*23)%57)-28;
      if(Math.abs(x)<5&&Math.abs(z)<8)continue;
      const plant=this.addMesh(new THREE.ConeGeometry(.45,1.1,5),new THREE.MeshStandardMaterial({color:i%2?0x397b3b:0x4e9147}),[x,.15,z],false);
      plant.rotation.z=(i%3-1)*.35;
    }
  }
  makeLobbyComputer(){
    const wood=new THREE.MeshStandardMaterial({color:0x76502e});
    const dark=new THREE.MeshStandardMaterial({color:0x17251c});
    const glow=new THREE.MeshStandardMaterial({color:0x4e9d67,emissive:0x1b512d,emissiveIntensity:.6});
    this.addMesh(new THREE.CylinderGeometry(1.05,1.2,2.0,12),wood,[0,1,-5]).name='temporary computer stump';
    this.addMesh(new THREE.BoxGeometry(2.5,.18,.65),wood,[0,2.05,-5]);
    this.addMesh(new THREE.BoxGeometry(2.25,1.45,.16),dark,[0,2.95,-5.18]).name='lobby computer monitor';
    this.addMesh(new THREE.PlaneGeometry(2.02,1.22),glow,[0,2.95,-5.085],false).name='computer screen';
    this.computerPosition=new THREE.Vector3(0,1.6,-5);
    this.interactRadius=3.2;
  }
  makeModeratorVent(){
    const metal=new THREE.MeshStandardMaterial({color:0x354b3c,roughness:.8});
    const dark=new THREE.MeshStandardMaterial({color:0x17251d});
    const glow=new THREE.MeshStandardMaterial({color:0x75c95b,emissive:0x244b1e});
    // A mossy service hatch tucked behind the large trees.
    this.addMesh(new THREE.BoxGeometry(4,.35,3),new THREE.MeshStandardMaterial({color:0x465f3d}),[0,.05,-23],false);
    this.addMesh(new THREE.BoxGeometry(2.8,.18,.2),metal,[0,1.05,-24.35],false);
    this.ventDoor=this.addMesh(new THREE.BoxGeometry(2.45,1.9,.16),dark,[0,1.05,-24.2],false);
    this.ventDoor.name='moderator vent security door';
    this.addMesh(new THREE.BoxGeometry(2.25,.08,.08),glow,[0,1.8,-24.08],false);
    const sign=this.addMesh(new THREE.BoxGeometry(2.2,.55,.12),dark,[0,2.35,-24.25],false);
    sign.name='MODERATOR VENT';
    const tunnel=this.addMesh(new THREE.BoxGeometry(3.2,2.8,7),metal,[0,1.3,-28],false);
    tunnel.material=metal;
    this.addMesh(new THREE.BoxGeometry(3.25,.15,7),new THREE.MeshStandardMaterial({color:0x293a30}),[0,-.05,-28],false);
    this.ventPosition=new THREE.Vector3(0,1.4,-22.8);
    this.ventInteractRadius=3.4;
    this.ventUnlocked=false;
  }
  makeStaffTools(){
    const makeHammer=(x,headColor,name)=>{
      const group=new THREE.Group();
      const handle=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.9,8),new THREE.MeshStandardMaterial({color:0x79502c}));
      handle.position.y=.45;group.add(handle);
      const head=new THREE.Mesh(new THREE.BoxGeometry(.72,.35,.42),new THREE.MeshStandardMaterial({color:headColor,metalness:.25,roughness:.5}));
      head.position.y=.92;group.add(head);group.position.set(x,.15,-4);group.visible=false;group.name=name;this.scene.add(group);return group;
    };
    this.banHammer=makeHammer(2.0,0xb83c36,'Ban Hammer');
    this.kickHammer=makeHammer(3.0,0xd18b32,'Kick Hammer');
  }
  setVentUnlocked(value){
    this.ventUnlocked=Boolean(value);
    if(this.ventDoor)this.ventDoor.visible=!this.ventUnlocked;
  }
  setStaffRole(role){
    const allowed=role==='owner'||role==='moderator';
    if(this.banHammer)this.banHammer.visible=allowed;
    if(this.kickHammer)this.kickHammer.visible=allowed;
  }
  addUpdater(fn){this.updaters.push(fn);}
  update(dt){for(const fn of this.updaters)fn(dt);}
}
