/*  
    This File contains popup logic for handling various popup interactions and open/closing popups
*/

// HTML elements
const fileInput = document.getElementById('file_input');
const overlay = document.getElementById('popup_overlay');
const errorDiv = document.getElementById('import_error_message');
const errorDivColumn = document.getElementById('import_error_message_columns');
const importButton = document.getElementById('import_button');
const infoDisplay = document.getElementById("message_display");

var countOpenPopups = 0;

/* Event listeners */
document.addEventListener('DOMContentLoaded', function () {
    // Show mobile warning if screen width is less than 768px
    if (window.innerWidth < 768) {
        openPopupById('mobile_warning');
    }
});

// Function to open a popup by its ID
function openPopupById(popupId) {
    const popup = document.getElementById(popupId);
    if (popup && overlay) {
        popup.style.display = 'block';
        overlay.style.display = 'block';
        if (countOpenPopups >= 1) {
            popup.style.zIndex = (countOpenPopups + 1) * 1000;
            overlay.style.zIndex = countOpenPopups * 1000;
        }
        countOpenPopups++;
        if (popupId === 'page_menu') {
            setTimeout(displaySmallPages, 0); // Call displaySmallPages after showing the popup
        }
    } else console.warn("Popup or overlay not found. Unable to open this popup");
}

// Function to close a popup by its ID
function closePopupById(popupId) {
    const popup = document.getElementById(popupId);
    if (popup && overlay) {
        popup.style.display = 'none';
        if (countOpenPopups == 1) overlay.style.display = 'none';
        if (countOpenPopups > 1) {
            overlay.style.zIndex = 997;
        }
        countOpenPopups--;
        if (popupId === 'page_menu') {
            document.getElementById('small_pages_container').innerHTML = ''; // Clear small pages container
        }
    } else console.warn("Popup or overlay not found. Unable to close this popup");
}

// Function to run delete confirmation popup
async function runDeleteConfirmation(message, actionMessage, title) {
    /*
    Example usage:
    async function test() {
        if (await runDeleteConfirmation()) {
            // Perform delete action
        } 
    }
    */
    if (event.shiftKey) {
        return true;
    }
    return new Promise((resolve) => {
        openPopupById('delete_warning');
        if (message) document.getElementById('delete_warning_message').innerText = message;
        if (actionMessage) document.querySelector('#delete_warning .warning_button').innerText = actionMessage;
        if (title) document.getElementById('delete_warning_title').innerText = title;

        const deleteButton = document.querySelector('#delete_warning .warning_button');
        const cancelButton = document.querySelector('#delete_warning .secondary_button');
        const closeButton = document.querySelector('#delete_warning .popup_close');

        const handleDelete = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            deleteButton.removeEventListener('click', handleDelete);
            cancelButton.removeEventListener('click', handleCancel);
            closeButton.removeEventListener('click', handleCancel);
            closePopupById('delete_warning');
        };

        deleteButton.addEventListener('click', handleDelete);
        cancelButton.addEventListener('click', handleCancel);
        closeButton.addEventListener('click', handleCancel);
    });
}

// Function to call CSV validation action
function call_validateImport() {
    const file = fileInput.files[0];
    if (file) {
        validateImport(file).then(isValid => {
            if (isValid) {
                validateColumns(file).then(isValid => {
                    if (isValid) {
                        errorDiv.style.display = 'none';
                        errorDivColumn.style.display = 'none';
                        importButton.disabled = false;
                        importButton.classList.replace('primary_button_disabled', 'primary_button');
                    } else  {
                        errorDiv.style.display = 'none';
                        errorDivColumn.style.display = 'block';
                        importButton.disabled = true;
                        importButton.classList.replace('primary_button', 'primary_button_disabled');
                    }
                });
            } else {
                errorDiv.style.display = 'block';
                errorDivColumn.style.display = 'none';
                importButton.disabled = true;
                importButton.classList.replace('primary_button', 'primary_button_disabled');
            }
        }).catch(() => {
            errorDiv.style.display = 'block';
            errorDivColumn.style.display = 'none';
            importButton.disabled = true;
            importButton.classList.replace('primary_button', 'primary_button_disabled');
        });
    } else {
        errorDiv.style.display = 'block';
        errorDivColumn.style.display = 'none';
        importButton.disabled = true;
        importButton.classList.replace('primary_button', 'primary_button_disabled');
    }
}

// Function to call import CSV action
function call_importCSV() {
    const file = fileInput.files[0];
    importCSV(file);
    fileInput.value = '';
    closePopupById('import_menu');
}

// Function to call export PDF action
function call_exportPDF(withNames, title) {
    closePopupById('export_menu_pdf');
    showLoader();
    exportPDF(withNames, title);
}

function call_exportPpxt(withNames, title) {
    closePopupById('export_menu_ppxt');
    showLoader();
    exportPPTX(withNames, title);
}


// Function to call create new chart action
function call_createNewChart() {
    createNewChart();
    closePopupById('welcome_menu');
}

// Function to call load chart action
function call_loadChart() {
    loadChart();
    closePopupById('welcome_menu');
}

