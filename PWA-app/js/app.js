function setDynamicMessage(msg){
  const dynamicContent = document.getElementById("dynamic-content");
  if(dynamicContent) {
    dynamicContent.innerHTML = `<p class="dynamic-placeholder">${msg}</p>`;
  }
}

function initializeNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const shortcutCards = document.querySelectorAll(".shortcut-card");

  navItems.forEach(item=>{
    item.addEventListener("click", ()=>{
      navItems.forEach(i=>i.classList.remove("is-active"));
      item.classList.add("is-active");
      const s=item.dataset.nav;
      if(s==="home") {
        window.location.href="/";
      }
  
      else setDynamicMessage(s+" coming soon...");
    });
  });

  shortcutCards.forEach(card=>{
    card.addEventListener("click", ()=>{
      const s=card.dataset.section;
      // Update status content (not the discussion dynamic content)
      const statusEl = document.getElementById("status-content");
      if (statusEl) {
        statusEl.innerHTML = `<p class="status-placeholder">${s} section coming soon...</p>`;
      } else {
        // Fallback: use dynamic content if status is missing
        setDynamicMessage(s+" section coming soon...");
      }
    });
  });
}

// Note: initializeNavigation is called by load-components.js after components load

// PWA SW registration
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("/service-worker.js");
  });
}
