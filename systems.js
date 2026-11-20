export class Systems {
  constructor(world){this.world=world;this.elapsed=0;this.trustedSeconds=100;this.currency=0;this.soundboardPrice=8000;}
  init(){
    // All frame systems register with World; none replace the movement update loop.
    this.world.addUpdater(dt=>this.update(dt));
  }
  update(dt){
    this.elapsed+=dt;
    this.trustedSeconds=Math.max(0,this.trustedSeconds-dt);
    const daylight=(Math.sin(this.elapsed*.025)+1)*.5;
    this.world.scene.background.setRGB(.035+daylight*.42,.10+daylight*.48,.07+daylight*.38);
    this.world.scene.fog.color.copy(this.world.scene.background);
  }
  canBuySoundboard(balance){return balance>=this.soundboardPrice;}
  buySoundboard(balance){if(!this.canBuySoundboard(balance))return {ok:false,balance};return {ok:true,balance:balance-this.soundboardPrice};}
}