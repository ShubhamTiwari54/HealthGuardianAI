export const Router = {
  routes: {},
  currentRoute: null,

  register(path, view) {
    this.routes[path] = view;
  },

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error("Router container not found!");
      return;
    }

    const handleRoute = () => {
      let hash = window.location.hash || '#/dashboard';
      
      // Basic route match
      let view = this.routes[hash];
      if (!view) {
        // Fallback to Dashboard view
        view = this.routes['#/dashboard'];
        hash = '#/dashboard';
      }

      this.currentRoute = hash;
      
      // Update Active Navigation Item in Sidebar
      document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === hash) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Render View
      container.innerHTML = view.render();
      
      // Trigger lifecycle afterRender hook
      if (view.afterRender) {
        view.afterRender();
      }

      // Re-trigger Lucide icon loading
      if (window.lucide) {
        window.lucide.createIcons();
      }

      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
    
    // Initial call
    handleRoute();
  }
};
