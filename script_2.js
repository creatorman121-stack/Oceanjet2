
(function(){
  function makeMemoryStore(){
    const mem={};
    return {
      getItem:k=>Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null,
      setItem:(k,v)=>{mem[k]=String(v)},
      removeItem:k=>{delete mem[k]},
      clear:()=>{Object.keys(mem).forEach(k=>delete mem[k])},
      key:i=>Object.keys(mem)[i]||null,
      get length(){return Object.keys(mem).length}
    };
  }
  function protect(name){
    try{
      const t='__oj41_'+name+'__';
      window[name].setItem(t,t); window[name].removeItem(t);
    }catch(e){
      try{Object.defineProperty(window,name,{value:makeMemoryStore(), configurable:true});}catch(_){ }
    }
  }
  protect('localStorage');
  protect('sessionStorage');
  window.__oj41StorageSafe = true;
})();
