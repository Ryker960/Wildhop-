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
    const path=this.addMesh(new THREE.BoxGeometry(5,.06,20),new THREE.MeshStandardMaterial({color:0xb5a276}),[0,-.01,4],false);
    // A low circular lobby platform.
    const pad=this.addMesh(new THREE.CylinderGeometry(8,8,.25,48),new THREE.MeshStandardMaterial({color:0x6b9b55}),[0,-.15,0]);
  }
  makeTree(x,z,s=1){
    const trunk=this.addMesh(new THREE.CylinderGeometry(.22*s,.34*s,2.6*s,8),new THREE.MeshStandardMaterial({color:0x68452a}),[x,1.3*s,z]);
    const crown=this.addMesh(new THREE.SphereGeometry(1.55*s,10,8),new THREE.MeshStandardMaterial({color:0x286b3d}),[x,3.0*s,z]);
    crown.scale.set(1,1.15,1);
  }
  makeForest(){
    const spots=[[-13,-10,1.1],[13,-12,1.3],[-16,8,1],[16,9,1.15],[-10,17,.8],[10,18,.9],[-22,-1,1.2],[22,0,1.2]];
    spots.forEach(p=>this.makeTree(...p));
    // Climbable low boulders.
    [[-5,0,-8],[6,0,-9],[-7,0,8],[8,0,8]].forEach(([x,y,z],i)=>{
      const rock=this.addMesh(new THREE.DodecahedronGeometry(1.6,0),new THREE.MeshStandardMaterial({color:i%2?0x77856c:0x667b60}),[x,1.1,z]);
      rock.scale.set(1.3,.8,1);
    });
  }
  makeLobbyComputer(){
    // Temporary stand-in prop; replace this with the user's stump model when supplied.
    const wood=new THREE.MeshStandardMaterial({color:0x76502e});
    const dark=new THREE.MeshStandardMaterial({color:0x17251c});
    const glow=new THREE.MeshStandardMaterial({color:0x4e9d67,emissive:0x1b512d,emissiveIntensity:.6});
    const stump=this.addMesh(new THREE.CylinderGeometry(1.05,1.2,2.0,12),wood,[0,1,-5]);
    stump.name='temporary computer stump';
    const stand=this.addMesh(new THREE.BoxGeometry(2.5,.18,.65),wood,[0,2.05,-5]);
    const monitor=this.addMesh(new THREE.BoxGeometry(2.25,1.45,.16),dark,[0,2.95,-5.18]);
    monitor.name='lobby computer monitor';
    const screen=this.addMesh(new THREE.PlaneGeometry(2.02,1.22),glow,[0,2.95,-5.085],false);
    screen.name='computer screen';
    this.computerPosition=new THREE.Vector3(0,1.6,-5);
    this.interactRadius=3.2;
  }
  addUpdater(fn){this.updaters.push(fn);}
  update(dt){for(const fn of this.updaters)fn(dt);}
}