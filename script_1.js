
(function(){
  try{
    const test='__ls_test__';
    window.localStorage.setItem(test,test);
    window.localStorage.removeItem(test);
  }catch(e){
    console.warn('localStorage unavailable, using memory fallback');
    const mem={};
    Object.defineProperty(window,'localStorage',{
      value:{
        getItem:k=>mem[k]??null,
        setItem:(k,v)=>{mem[k]=String(v)},
        removeItem:k=>{delete mem[k]},
        clear:()=>{for(const k in mem)delete mem[k]}
      },
      configurable:true
    });
  }
})();
