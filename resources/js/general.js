/*  
    This file contains general utility functions for the application.
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
    if (event.ctrlKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        addLeftConnection();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'ArrowDown') {
        event.preventDefault();
        addDownConnection();
    }
});
