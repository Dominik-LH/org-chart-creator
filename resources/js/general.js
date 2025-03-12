/*  
    This file contains general utility functions for the application.like ini.
*/
// Initialization function to set up the application
function init() {
    loadSettings(); // Load user settings
    initExport(); // Initialize export fonts
    updateSaveStatus('none'); // Initialize save status
    initializeFileLogic(); // Initialize file logic
}


// Event listener for keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey) {
        switch (event.key) {
            case 'ArrowLeft':
                addLeftConnection();
                break;
            case 'ArrowDown':
                addDownConnection();
                break;
            case 's':
                saveChart();
                break;
            case 'z':
                // Add your custom logic here
                break;
            case 'y':
                // Add your custom logic here
                break;
        }
    } else {
        switch (event.key) {
            case 'Escape':
                const openPopupsEsc = document.querySelectorAll('.popup_container[style*="display: block"]');
                if (openPopupsEsc.length > 0) {
                    const escButton = openPopupsEsc[0].querySelector('.popup_close');
                    if (escButton) {
                        escButton.click();
                    }
                }
                break;
        }
    }
});