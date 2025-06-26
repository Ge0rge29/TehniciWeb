// Menu fix to ensure hamburger menu works correctly on all devices
document.addEventListener('DOMContentLoaded', function() {
    // Get hamburger menu checkbox
    const menuCheckbox = document.getElementById('ch-menu');
    const menuList = document.querySelector('ul.meniu');
    
    // Only ensure z-index is set correctly, let CSS handle the rest
    if (menuCheckbox && menuList) {
        // Set z-index once to ensure menu appears above other elements
        menuList.style.zIndex = '9999998';
        
        // Clear any inline styles that might interfere with CSS
        menuList.style.display = '';
        menuList.style.opacity = '';
        menuList.style.visibility = '';
        
        console.log('Menu initialized - CSS will handle show/hide'); // DEBUG
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (menuCheckbox && menuCheckbox.checked) {
            // Check if click is outside of menu
            let clickedElement = event.target;
            let insideMenu = false;
            
            // Traverse up to see if click was inside menu
            while (clickedElement) {
                if (clickedElement === menuList || clickedElement.id === 'hamburger') {
                    insideMenu = true;
                    break;
                }
                clickedElement = clickedElement.parentNode;
            }
            
            if (!insideMenu) {
                menuCheckbox.checked = false;
            }
        }
    });
});
