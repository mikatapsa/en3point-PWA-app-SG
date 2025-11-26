// Load HTML components
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
    const html = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  } catch (error) {
    console.error('Error loading component:', error);
  }
}

// Load header and bottom nav on page load
async function loadAllComponents() {
  await loadComponent('header-placeholder', '/components/header.html');
  await loadComponent('bottom-nav-placeholder', '/components/bottom-nav.html');
  
  // Initialize navigation after components are loaded
  if (typeof initializeNavigation === 'function') {
    initializeNavigation();
  }
}

document.addEventListener('DOMContentLoaded', loadAllComponents);
