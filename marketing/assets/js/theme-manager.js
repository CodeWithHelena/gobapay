// theme-manager.js - Include this in ALL pages
class ThemeManager {
    constructor() {
        this.currentTheme = this.getSavedTheme();
        this.init();
    }

    getSavedTheme() {
        return localStorage.getItem('theme') || 
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    init() {
        // Apply theme on page load
        this.applyTheme(this.currentTheme);
        
        // Setup event listeners
        this.setupDashboardToggle();
        this.setupSidebarToggle();
        
        // Listen for theme changes from other pages
        this.setupCrossPageListener();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        
        // Update all toggle icons on the page
        this.updateToggleIcons(theme);
        
        // Dispatch event for other components to listen to
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    }

    updateToggleIcons(theme) {
        // Update dashboard header toggle
        const dashboardToggle = document.getElementById('themeToggle');
        if (dashboardToggle) {
            const icon = dashboardToggle.querySelector('i');
            if (theme === 'dark') {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
        }

        // Update sidebar theme option icon
        const sidebarThemeOption = document.querySelector('.sidebar-theme-option');
        if (sidebarThemeOption) {
            const icon = sidebarThemeOption.querySelector('iconify-icon');
            if (icon) {
                icon.setAttribute('icon', theme === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold');
            }
        }
    }

    setupDashboardToggle() {
        const dashboardToggle = document.getElementById('themeToggle');
        if (dashboardToggle) {
            dashboardToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    setupSidebarToggle() {
        const sidebarThemeOption = document.querySelector('.sidebar-theme-option');
        if (sidebarThemeOption) {
            sidebarThemeOption.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupCrossPageListener() {
        // Listen for storage changes (when theme is changed in another tab/page)
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                this.applyTheme(e.newValue);
            }
        });

        // Listen for custom theme change events
        window.addEventListener('themeChanged', (e) => {
            if (e.detail !== this.currentTheme) {
                this.applyTheme(e.detail);
            }
        });
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
});