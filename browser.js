export class LobbyBrowser {
  constructor(){
    this.panel=document.querySelector('#browser');
    this.address=document.querySelector('#address');
    this.frame=document.querySelector('#webview');
    this.history=[];this.index=-1;
    document.querySelector('#address-form').addEventListener('submit',e=>{e.preventDefault();this.navigate(this.address.value);});
    document.querySelector('#close-browser').addEventListener('click',()=>this.hide());
    document.querySelector('#back').addEventListener('click',()=>this.go(-1));
    document.querySelector('#forward').addEventListener('click',()=>this.go(1));
    document.querySelector('#refresh').addEventListener('click',()=>{try{this.frame.contentWindow.location.reload();}catch{this.frame.src=this.frame.src;}});
    document.querySelector('#outside').addEventListener('click',()=>this.openOutside());
    document.querySelector('#home').addEventListener('click',()=>this.navigate('https://www.google.com'));
    window.addEventListener('wildhop:computer-interact',()=>this.toggle());
  }
  normalize(raw){
    let value=raw.trim();if(!value)return 'https://www.google.com';
    if(!value.includes(' ')&&/^(https?:\/\/|[\w-]+\.[a-z]{2,})/i.test(value))return /^https?:\/\//i.test(value)?value:'https://'+value;
    return 'https://www.google.com/search?q='+encodeURIComponent(value);
  }
  navigate(raw){
    const url=this.normalize(raw);this.address.value=url;this.frame.src=url;
    this.history=this.history.slice(0,this.index+1);this.history.push(url);this.index=this.history.length-1;
  }
  go(delta){const next=this.index+delta;if(next<0||next>=this.history.length)return;this.index=next;this.address.value=this.history[next];this.frame.src=this.history[next];}
  openOutside(){const url=this.normalize(this.address.value);window.open(url,'_blank','noopener,noreferrer');}
  show(){this.panel.hidden=false;}
  hide(){this.panel.hidden=true;}
  toggle(){this.panel.hidden?this.show():this.hide();}
}