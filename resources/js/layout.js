/*  
    This File contains the logic to correctly display all the content and call actions in other files
*/

// Get references to DOM elements
const loader = document.getElementById('loader');
const loadOverlay = document.getElementById('loader_overlay');
const loaderMessage = document.getElementById('loader_message');

const unsavedChangesButton = document.getElementById('unsaved_changes_button');
const savedChangesDisplay = document.getElementById('saved_changes_display');
const savingDisplay = document.getElementById('saving_display');

const headerMenuItemFile = document.getElementById('header_menu_item_file');
const headerFileMenu = document.getElementById('header_file_menu');
const headerMenuItemEdit = document.getElementById('header_menu_item_edit');
const headerEditMenu = document.getElementById('header_edit_menu');
const headerMenuItemSettings = document.getElementById('header_menu_item_settings');
const headerSettingsMenu = document.getElementById('header_settings_menu');
const headerMenuItemHelp = document.getElementById('header_menu_item_help');
const headerHelpMenu = document.getElementById('header_help_menu');
const menus = [headerFileMenu, headerEditMenu, headerSettingsMenu, headerHelpMenu];

const darkThemeToggle = document.getElementById('dark_theme_setting');
const autosaveToggle = document.getElementById('autosave_setting');


const root = document.documentElement;

/* loading overlay */
// Show the loading overlay
function showLoader() {
    if (loader && loadOverlay) {
        loader.style.display = 'block';
        loadOverlay.style.display = 'block';
        loaderMessage.style.display = 'block';
    } else console.warn("Loader or overlay not found. Unable to show loader");
}

// Set the message in the loading overlay
function setLoaderMessage(message) {
    if (loaderMessage) loaderMessage.innerText = message;
}

// Hide the loading overlay
function hideLoader() {
    if (loader && loadOverlay) {
        setLoaderMessage('');
        loader.style.display = 'none';
        loadOverlay.style.display = 'none';
        loaderMessage.style.display = 'none';
    } else console.warn("Loader or overlay not found. Unable to hide loader");
}

/* message display logic */
// Display a message with a fade-in and fade-out effect
function displayMessage(message, color) {
    infoDisplay.innerHTML = message;
    // Set styles
    infoDisplay.style.display = 'block';
    infoDisplay.style.opacity = 0;
    infoDisplay.style.color = color;

    const fadeInEffect = setInterval(function () { // Fade in effect
        if (infoDisplay.style.opacity < 1) {
            infoDisplay.style.opacity = parseFloat(infoDisplay.style.opacity) + 0.1;
        } else {
            clearInterval(fadeInEffect);
        }
    }, 100);

    setTimeout(function () { // Fade out effect
        const fadeOutEffect = setInterval(function () {
            if (infoDisplay.style.opacity > 0) {
                infoDisplay.style.opacity -= 0.1;
            } else {
                clearInterval(fadeOutEffect);
                infoDisplay.style.display = 'none';
            }
        }, 100);
    }, 5000);
}

// Display an informational message
function displayInfo(message) {
    displayMessage(message, 'var(--text-color)');
}

// Display a warning message
function displayWarning(message) {
    displayMessage(message, 'orange');
}

// Display an error message
function displayError(message) {
    displayMessage(message, 'red');
}

/* unsaved changes button */
// Update the save status display
function updateSaveStatus(status) {
    if (status === 'saved') {
        unsavedChangesButton.style.display = 'none';
        savingDisplay.style.display = 'none';
        savedChangesDisplay.style.display = 'block';
    } else if (status === 'unsaved') {
        savingDisplay.style.display = 'none';
        savedChangesDisplay.style.display = 'none';
        unsavedChangesButton.style.display = 'block';
    } else if (status === 'saving') {
        unsavedChangesButton.style.display = 'none';
        savedChangesDisplay.style.display = 'none';
        savingDisplay.style.display = 'block';
    } else if (status === 'none') {
        unsavedChangesButton.style.display = 'none';
        savedChangesDisplay.style.display = 'none';
        savingDisplay.style.display = 'none';
    } else console.warn("Invalid save status. Unable to update save status");
}

/*settings*/
// Theme
function setDarkTheme(bool) {
    if (!bool) {
        root.classList.replace('dark_theme','light_theme');
        localStorage.setItem('theme', 'light_theme');
    } else {
        root.classList.replace('light_theme', 'dark_theme');
        localStorage.setItem('theme', 'dark_theme');
    }
    // Ensure the class is applied correctly
    if (bool && !root.classList.contains('dark_theme')) {
        root.classList.add('dark_theme');
    } else if (!bool && !root.classList.contains('light_theme')) {
        root.classList.add('light_theme');
    }
}

function loadThemePreference() {
    const theme = localStorage.getItem('theme');
    if (theme) {
        setDarkTheme(theme === 'dark_theme');
        if (darkThemeToggle) {
            darkThemeToggle.checked = theme === 'dark_theme';
        }
    } else {
        setDarkTheme(false);
        if (darkThemeToggle) {
            darkThemeToggle.checked = false;
        }
    }
}

//autosave
function setAutosave(bool) {
    autosaveActive = bool;
    if(bool){
        localStorage.removeItem('autosave');
        saveChart();
    } else localStorage.setItem('autosave', bool);
}

function loadAutosavePreference() {
    const autosave = localStorage.getItem('autosave');
    if (autosave !== null) {
        autosaveActive = autosave === 'true';
        if (autosaveToggle) {
            autosaveToggle.checked = autosaveActive;
        }
    } else {
        autosaveActive = true;
        if (autosaveToggle) {
            autosaveToggle.checked = true;
        }
    }
}

// Show or hide names on the chart
function hideNames(bool) {
    if (bool) {
        document.querySelectorAll('.position_res_per').forEach(element => {
            element.style.display = 'none';
        });
    } else {
        document.querySelectorAll('.position_res_per').forEach(element => {
            element.style.display = 'block';
        });
    }
}


// show or hide placeholder
function hidePlaceholder(bool) {
    if (bool) {
        console.log('hide');
        document.querySelectorAll('input').forEach(element => {
            element.setAttribute('data-placeholder', element.getAttribute('placeholder'));
            element.removeAttribute('placeholder');
        });
    } else {
        console.log('show');
        document.querySelectorAll('input').forEach(element => {
            element.setAttribute('placeholder', element.getAttribute('data-placeholder'));
            element.removeAttribute('data-placeholder');
        });
    }
}

// Load all settings (theme and autosave)
function loadSettings() {
    loadThemePreference();
    loadAutosavePreference();
}



/*header submenu*/
// Open a submenu
function openMenu(submenu, headerMenuItem) {
    menus.forEach(menu => {
        if (menu.id !== submenu) {
            menu.style.display = 'none';
        }
    });
    var menu = document.getElementById(submenu);
    if (menu) {
        menu.style.display = 'block';
    } else console.warn("Menu not found. Unable to open menu");
    if (headerMenuItem) {
        headerMenuItem.style.borderBottom = '2px solid var(--primary-color)';
    }
}

// Close a submenu
function closeMenu(submenu, headerMenuItem) {
    var menu = document.getElementById(submenu);
    if (menu) {
        menu.style.display = 'none';
    } else console.warn("Menu not found. Unable to close menu");
    if (headerMenuItem) {
        headerMenuItem.style.borderBottom = '2px solid transparent';
    }
}

// Add event listeners to menu items
const menuItems = [
    { item: headerMenuItemFile, menu: headerFileMenu },
    { item: headerMenuItemEdit, menu: headerEditMenu },
    { item: headerMenuItemSettings, menu: headerSettingsMenu },
    { item: headerMenuItemHelp, menu: headerHelpMenu }
];

menuItems.forEach(({ item, menu }) => {
    item.addEventListener('mouseover', function () {
        openMenu(menu.id, item);
    });
    item.addEventListener('mouseleave', function () {
        setTimeout(function () {
            if (!menu.matches(':hover')) {
                closeMenu(menu.id, item);
            }
        }, 100);
    });
    menu.addEventListener('mouseleave', function () {
        closeMenu(menu.id, item);
    });
});