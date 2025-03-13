var editHistory = [];
var editHistoryIndex = -1;
const MAX_HISTORY = 50; // Maximum number of history entries
function undo() {
    if (editHistoryIndex <= 0) { // Change the condition to <= 0
        displayInfo("Nothing to undo");
        return;
    }
    editHistoryIndex--;
    const data = JSON.parse(editHistory[editHistoryIndex]);
    // Apply the data to restore the state
    resetViewOnly();
    data.pages.forEach(pageData => {
        new Page(pageData.title, pageData.subtitle, pageData.layerStart, pageData.layerIndicators, pageData.personalUnions);
    });
    data.positions.forEach(positionData => {
        new Position(positionData.positionId, positionData.pageId, positionData.text, positionData.responsiblePerson, positionData.positionType, positionData.func, positionData.proj, positionData.x_position, positionData.layer);
    });
    data.connections.forEach(connectionData => {
        new Connection(connectionData.positionId1, connectionData.positionId2, connectionData.type);
    });
    
    updateSaveStatus('unsaved');
    if (autosaveActive) saveChart();
}

function redo() {
    if (editHistoryIndex >= editHistory.length - 1) { // Change the condition to >= editHistory.length - 1
        displayInfo("Nothing to redo");
        return;
    }
    editHistoryIndex++;
    const data = JSON.parse(editHistory[editHistoryIndex]);
    // Apply the data to restore the state
    resetViewOnly();
    data.pages.forEach(pageData => {
        new Page(pageData.title, pageData.subtitle, pageData.layerStart, pageData.layerIndicators, pageData.personalUnions);
    });
    data.positions.forEach(positionData => {
        new Position(positionData.positionId, positionData.pageId, positionData.text, positionData.responsiblePerson, positionData.positionType, positionData.func, positionData.proj, positionData.x_position, positionData.layer);
    });
    data.connections.forEach(connectionData => {
        new Connection(connectionData.positionId1, connectionData.positionId2, connectionData.type);
    });

    updateSaveStatus('unsaved');
    if (autosaveActive) saveChart();
}

function addHistoryEntry() {
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

    editHistoryIndex++;
    editHistory[editHistoryIndex] = JSON.stringify(data);
    editHistory = editHistory.slice(0, editHistoryIndex + 1);
    
    // Ensure the history does not exceed MAX_HISTORY
    if (editHistory.length > MAX_HISTORY) {
        editHistory.shift();
        editHistoryIndex--;
    }
}