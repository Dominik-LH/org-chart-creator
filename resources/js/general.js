/*  
    This file contains general utility functions for the application.like ini.
*/
//TODO clean up unused assets
// Initialization function to set up the application
function init() {
    console.log('Initializing application...');
    loadSettings(); // Load user settings
    initExport(); // Initialize export fonts
    updateSaveStatus('none'); // Initialize save status
    initializeFileLogic(); // Initialize file logic
}

// Flag to prevent undo/redo spamming
let isUndoRedoAllowed = true;

// Function to reset the undo/redo flag
function resetUndoRedoFlag() {
    isUndoRedoAllowed = true;
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
                event.preventDefault();
                saveChart();
                break;
            case 'z':
                if (isUndoRedoAllowed) {
                    undo();
                    isUndoRedoAllowed = false;
                    setTimeout(resetUndoRedoFlag, 100); 
                } else console.log('undo spam not allowed');
                break;
            case 'y':
                if (isUndoRedoAllowed) {
                    redo();
                    isUndoRedoAllowed = false;
                    setTimeout(resetUndoRedoFlag, 100); 
                } else console.log('redo spam not allowed');
                break;
            case 'p':
                event.preventDefault();
                openPopupById('export_menu')
                break;
            case 'o':
                event.preventDefault();
                loadChart()
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