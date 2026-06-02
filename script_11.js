
(function(){
  if(window.__v13CleanLeftNavOnly) return;
  window.__v13CleanLeftNavOnly = true;

  const FLOAT_SELECTORS = [
    '#v6FloatTools', '.v6-floating-tools',
    '#v7CommandBtn', '#v7MiniDock', '.v7-command-btn', '.v7-mini-dock',
    '#v8Dock', '#v9CleanDock', '#v10Dock', '#v11Dock',
    '#bottomNavSafe', '.bottom-nav', '.quick-dock', '.quickDock',
    '#aiFloatBtn', '.ai-float-btn'
  ];

  function hideFloatingOnly(){
    FLOAT_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if(!el.closest('#sideDrawer') && !el.closest('.side-drawer')){
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
          el.setAttribute('aria-hidden','true');
        }
      });
    });
  }

  function normalizeDrawer(){
    const menu = document.getElementById('drawerMenu');
    if(!menu) return;
    const seen = new Set();
    Array.from(menu.querySelectorAll('.drawer-item')).forEach(item => {
      const key = (item.dataset.view || item.textContent || '').trim().toLowerCase();
      if(!key) return;
      if(seen.has(key)) item.remove();
      else seen.add(key);
    });
  }

  function safePatchDrawerBuilder(){
    const fn = window.buildDrawerMenu;
    if(typeof fn !== 'function' || fn.__v13Wrapped) return;
    window.buildDrawerMenu = function(){
      const result = fn.apply(this, arguments);
      normalizeDrawer();
      hideFloatingOnly();
      return result;
    };
    window.buildDrawerMenu.__v13Wrapped = true;
  }

  function run(){
    safePatchDrawerBuilder();
    normalizeDrawer();
    hideFloatingOnly();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  setTimeout(run, 100);
  setTimeout(run, 800);
  setTimeout(run, 1800);
  new MutationObserver(run).observe(document.documentElement, {childList:true, subtree:true});
})();
