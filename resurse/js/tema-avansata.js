class ThemeManager {    constructor() {
        console.log('Theme Manager initializing...');
        this.themes = ['light', 'dark', 'blue'];
        
        this.handleThemeChange = this.handleThemeChange.bind(this);
        
        this.currentTheme = this.loadTheme();
        console.log('Loaded theme:', this.currentTheme);
        this.initializeTheme();
        this.setupEventListeners();
    }// incarca tema din localStorage
    loadTheme() {
        const savedTheme = localStorage.getItem('tema-avansata');
        return this.themes.includes(savedTheme) ? savedTheme : 'light';
    }
    
    // Salveaza tema în localStorage
    saveTheme(theme) {
        localStorage.setItem('tema-avansata', theme);
    }    
    applyTheme(theme) {
        console.log('Applying theme:', theme);
        console.log('Current body classes before:', document.body.className);
        
        try {
            document.body.classList.remove(...this.themes);
            console.log('Removed theme classes');
            
            if (theme !== 'light') {
                document.body.classList.add(theme);
                console.log(`Added class '${theme}' to body`);
            }
            
            console.log('Current body classes after:', document.body.className);
            
            this.currentTheme = theme;
            this.saveTheme(theme);
            
            console.log('Theme applied successfully!');
        } catch (error) {
            console.error('Error applying theme:', error);
        }
    }

    initializeTheme() {
        this.applyTheme(this.currentTheme);
        this.updateRadioButtons();
    }

    updateRadioButtons() {
        const radioButton = document.querySelector(`input[name="theme-selector"][value="${this.currentTheme}"]`);        if (radioButton) {
            radioButton.checked = true;
        }
    }
    
    // Configurează event listeners pentru radio buttons
    setupEventListeners() {
        // Așteaptă ca DOM-ul să fie încărcat complet
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            // DOM-ul este deja încărcat, încearcă să atașezi event-urile
            setTimeout(() => this.bindEvents(), 100);
        }
    }    handleThemeChange(e) {
        console.log('Radio button change detected! New value:', e.target.value);
        console.log('Is checked:', e.target.checked);
        if (e.target.checked) {
            console.log('Applying theme because radio is checked');
            this.applyTheme(e.target.value);
        }
    }
    
    bindEvents() {
        console.log('Trying to bind theme events...');
        const radioButtons = document.querySelectorAll('input[name="theme-selector"]');
        console.log('Found radio buttons:', radioButtons.length);
        
        if (radioButtons.length === 0) {
            console.log('No radio buttons found, retrying in 500ms...');
            setTimeout(() => this.bindEvents(), 500);
            return;
        }
        
        radioButtons.forEach(radio => {
            console.log('Adding event listener to radio button with value:', radio.value);
            
            radio.addEventListener('change', this.handleThemeChange);
            console.log('Event listener successfully added to radio button:', radio.id);
        });
        
        console.log('Theme events bound successfully!');
    }

    setTheme(theme) {
        if (this.themes.includes(theme)) {
            this.applyTheme(theme);
            this.updateRadioButtons();
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

console.log('Script tema-avansata.js loaded');

// Check if DOM is ready or wait for it
function initThemeManager() {
    console.log('Initializing theme manager...');
    const themeManager = new ThemeManager();
    
    // Expune managerul global pentru debugging sau folosire externă
    window.themeManager = themeManager;
    console.log('Theme manager created and exposed globally');
    
    // Optional: Add a global test function 
    window.testTheme = function(theme) {
        console.log('Manual theme change test to:', theme);
        themeManager.setTheme(theme);
    };
}

// Initialize when DOM is ready to ensure all elements are available
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeManager);
} else {
    initThemeManager();
}