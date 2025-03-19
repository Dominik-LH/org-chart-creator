/*  
    This file contains the logic for saving and loading the chart data.
    Ensure that these JS libraries are included:
    - idb (IndexedDB Promised)
*/

var autosaveActive = false; 
var currentFileHandle = null;
var chartName; 
// HTML elements
const pageContainer = document.getElementById("pages_container");
const title = document.getElementById('title');
const exportTitleSetting = document.getElementById('export_title_setting');

// Initialize file handling (open last opened file or Run welcome menu)
async function initializeFileLogic() {
    const fileHandle = await getFileHandleFromStorage();
    if (fileHandle) {
        try {
            const file = await fileHandle.getFile();
            loadChartFromFile(file);
            updateSaveStatus('saved');
            displayFileName(file.name);
            currentFileHandle = fileHandle;
        } catch (error) {
            switch (error.name) {
                case 'NotAllowedError':
                    console.warn('Failed to open the last opened file:', error);
                    displayError(translations[localStorage.getItem("language")]["error_file_access_denied"]);
                    break;
                case 'NotFoundError':
                    console.info('Failed to open the last opened file:', error);
                    displayInfo(translations[localStorage.getItem("language")]["error_file_not_found"]);
                    break;
                default:
                    console.error('Failed to open the last opened file:', error);
                    break;
            }
            openPopupById('welcome_menu');
        }
    } else {
        openPopupById('welcome_menu');
    }
}

// Load chart confirmation if there are unsaved changes
async function loadChart() {
    if (unsavedChangesButton.style.display !== 'none' || savingDisplay.style.display !== 'none') {
        if (await runDeleteConfirmation(translations[localStorage.getItem("language")]["confirm_override_text"], translations[localStorage.getItem("language")]["confirm_override_primary"], translations[localStorage.getItem("language")]["confirm_override_title"])) {
            loadChartInternal();
        }
    } else {
        loadChartInternal();
    }
}

// Internal function to load file from file picker
async function loadChartInternal() {
    reset();
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'OCC Files',
                accept: { 'application/json': ['.occ'] }
            }]
        });
        const file = await fileHandle.getFile();
        currentFileHandle = fileHandle;
        await saveFileHandleToStorage(fileHandle);
        loadChartFromFile(file);
        updateSaveStatus('saved');
        displayFileName(file.name);
        pageContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Failed to load Chart:', error);
    }
}

//Internal function to load the chart data from file
async function loadChartFromFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const jsonData = event.target.result;
        const data = JSON.parse(jsonData);
        data.pages.forEach(pageData => {
            new Page(pageData.title, pageData.subtitle, pageData.layerStart, pageData.layerIndicators, pageData.personalUnions);
        });
        data.positions.forEach(positionData => {
            new Position(positionData.positionId, positionData.pageId, positionData.text, positionData.responsiblePerson, positionData.positionType, positionData.func, positionData.proj, positionData.x_position, positionData.layer);
        });
        data.connections.forEach(connectionData => {
            new Connection(connectionData.positionId1, connectionData.positionId2, connectionData.type);
        });
        addHistoryEntry(); // Add initial history entry after loading the chart
    };
    reader.readAsText(file);
}

// Create a new chart with confirmation if there are unsaved changes
async function createNewChart() {
    if (unsavedChangesButton.style.display !== 'none' || savingDisplay.style.display !== 'none') {
        if (await runDeleteConfirmation(translations[localStorage.getItem("language")]["confirm_override_text"], translations[localStorage.getItem("language")]["confirm_override_primary"], translations[localStorage.getItem("language")]["confirm_override_title"])) {
            reset();
            saveChartAs();
            addHistoryEntry(); // Add initial history entry after creating a new chart
        }
    } else {
        reset();
        saveChartAs();
        addHistoryEntry(); // Add initial history entry after creating a new chart
    }
}

// Save chart to file
async function saveChart() {
    updateSaveStatus('saving');
    try {
        const data = {
            pages: pagesArray.map(page => ({
                title: page.title,
                subtitle: page.subtitle,
                layerStart: page.layerStart,
                layerIndicators: page.layerIndicators,
                personalUnions: page.personalUnions
            })),
            positions: positionsArray.map(position => ({
                positionId: position.positionId,
                pageId: position.pageId,
                text: position.text,
                responsiblePerson: position.responsiblePerson,
                positionType: position.positionType,
                func: position.func,
                proj: position.proj,
                x_position: position.x_position,
                layer: position.layer
            })),
            connections: connectionsArray.map(connection => ({
                positionId1: connection.positionId1,
                positionId2: connection.positionId2,
                type: connection.type
            }))
        };
        const jsonData = JSON.stringify(data);
        const blob = new Blob([jsonData], { type: "application/json" });

        if (currentFileHandle) {
            const writable = await currentFileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            const options = {
                types: [{
                    description: 'OCC Files',
                    accept: { 'application/json': ['.occ'] }
                }]
            };
            const handle = await window.showSaveFilePicker(options);
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            await saveFileHandleToStorage(handle);
            currentFileHandle = handle;
            displayFileName(handle.name);
        }
        updateSaveStatus('saved');
    } catch (error) {
        console.error('Failed to save file:', error);
        updateSaveStatus('unsaved');
    }
}


// Save chart as a new file
async function saveChartAs() {
    updateSaveStatus('saving');
    try {
        const data = {
            pages: pagesArray.map(page => ({
                title: page.title,
                subtitle: page.subtitle,
                layerStart: page.layerStart,
                layerIndicators: page.layerIndicators,
                personalUnions: page.personalUnions
            })),
            positions: positionsArray.map(position => ({
                positionId: position.positionId,
                pageId: position.pageId,
                text: position.text,
                responsiblePerson: position.responsiblePerson,
                positionType: position.positionType,
                func: position.func,
                proj: position.proj,
                x_position: position.x_position,
                layer: position.layer
            })),
            connections: connectionsArray.map(connection => ({
                positionId1: connection.positionId1,
                positionId2: connection.positionId2,
                type: connection.type
            }))
        };
        const jsonData = JSON.stringify(data);
        const blob = new Blob([jsonData], { type: "application/json" });

        // Prompt the user to choose a location to save the file
        const options = {
            types: [{
                description: 'OCC Files',
                accept: { 'application/json': ['.occ'] }
            }]
        };
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        await saveFileHandleToStorage(handle);
        currentFileHandle = handle;
        displayFileName(handle.name);
        updateSaveStatus('saved');
    } catch (error) {
        console.error('Failed to save file:', error);
        updateSaveStatus('unsaved');
    }
}


// Display the file name in the UI
function displayFileName(fileName) {
    title.innerText = fileName;
    exportTitleSetting.setAttribute('value', fileName.slice(0, -4));
    document.title = `${fileName}`;
    chartName = fileName.slice(0, -4);
}

//reset the page
function reset() {
    //reset id counter
    pageIdCounter = 0;
    //clean up the connections
    connectionsArray.forEach(con => {
        con.element.remove();
    });
    //reset arrays
    pagesArray = [];
    positionsArray = [];
    connectionsArray = [];
    //reset page container
    while (pageContainer.firstChild) {
        pageContainer.removeChild(pageContainer.firstChild);
    } 
    //reset history
    editHistory = [];
    editHistoryIndex = -1; 
}

function resetViewOnly(){
    //reset id counter
    pageIdCounter = 0;
    //clean up the connections
    connectionsArray.forEach(con => {
        con.element.remove();
    });
    //reset arrays
    pagesArray = [];
    positionsArray = [];
    connectionsArray = [];
    //reset page container
    while (pageContainer.firstChild) {
        pageContainer.removeChild(pageContainer.firstChild);
    } 
}

// Confirm exit if there are unsaved changes
window.onbeforeunload = confirmExit;
function confirmExit() {
    if (unsavedChangesButton.style.display !== 'none' || savingDisplay.style.display !== 'none') {
        return translations[localStorage.getItem("language")]["in_progress"];
    }
}

// Save file handle to IndexedDB
async function saveFileHandleToStorage(fileHandle) {
    const db = await idb.openDB('fileHandlesDB', 1, {
        upgrade(db) {
            db.createObjectStore('fileHandles');
        }
    });
    await db.put('fileHandles', fileHandle, 'currentFileHandle');
}

// Get file handle from IndexedDB
async function getFileHandleFromStorage() {
    const db = await idb.openDB('fileHandlesDB', 1, {
        upgrade(db) {
            db.createObjectStore('fileHandles');
        }
    });
    return await db.get('fileHandles', 'currentFileHandle');
}