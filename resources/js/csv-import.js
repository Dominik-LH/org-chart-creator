/*  
    This file contains all the logic to create a chart from a CSV import automatically
    Ensure that these JS libraries are included
    - PapaParse
*/

function importCSV(file) {
    Papa.parse(file, {
        header: true,
        encoding: "ISO-8859-1",
        complete: function (results) {
            const jsonData = results.data;
            groupPositions(jsonData);
        },
        error: function () {
            console.error("Error parsing CSV file");
        }
    });
}

function groupPositions(jsonData) {
    let groupedData = {};
    jsonData.forEach(pos => {
        if (pos.Bezeichnung) {
            const parts = pos.Bezeichnung.split('/');
            const mainKey = parts[0];
            const subKey = parts[1] ? parts[1][0] : null;

            if (!groupedData[mainKey]) {
                groupedData[mainKey] = {};
            }

            if (subKey) {
                if (!groupedData[mainKey][subKey]) {
                    groupedData[mainKey][subKey] = [];
                }
                groupedData[mainKey][subKey].push(pos);
            } else {
                if (!groupedData[mainKey]['undefined']) {
                    groupedData[mainKey]['undefined'] = [];
                }
                groupedData[mainKey]['undefined'].push(pos);
            }
        }
    });

    // Further subgroup if any subgroup has more than 9 elements
    Object.keys(groupedData).forEach(mainKey => {
        Object.keys(groupedData[mainKey]).forEach(subKey => {
            if (groupedData[mainKey][subKey].length > 9) {
                const furtherSubGroups = {};
                groupedData[mainKey][subKey].forEach(pos => {
                    const furtherSubKey = pos.Bezeichnung.split('/')[1][1];
                    if (!furtherSubGroups[furtherSubKey]) {
                        furtherSubGroups[furtherSubKey] = [];
                    }
                    furtherSubGroups[furtherSubKey].push(pos);
                });
                groupedData[mainKey][subKey] = furtherSubGroups;
            }
        });
    });

    console.log(groupedData);
    addImportedDataToView(groupedData);
}

function addImportedDataToView(jsonData) {
    Object.keys(jsonData).forEach(mainKey => {
        if (jsonData[mainKey].undefined) {
            //create new Page
            let layerStart = parseInt(jsonData[mainKey].undefined[0].Level.slice(-1));
            let currPage = new Page(jsonData[mainKey].undefined[0].Bezeichnung, null, layerStart, null, null);
            //add header to page
            let currPosText = jsonData[mainKey].undefined[0].Bezeichnung + " - " + jsonData[mainKey].undefined[0].Name;
            let headerPos = new Position(null, currPage.pageId, currPosText, jsonData[mainKey].undefined[0].Leiter, 'head', false, false, 33, 0);
            //add direct positions and subheader to page
            Object.keys(jsonData[mainKey]).forEach((subKey, j) => {
                if(j%7===0 && j!=0) {
                    //create new Page
                    layerStart = parseInt(jsonData[mainKey].undefined[0].Level.slice(-1));
                    currPage = new Page(mainKey+" 2", null, layerStart, null, null);
                    //add header to page
                    currPosText = jsonData[mainKey].undefined[0].Bezeichnung + " - " + jsonData[mainKey].undefined[0].Name;
                    headerPos = new Position(null, currPage.pageId, currPosText, jsonData[mainKey].undefined[0].Leiter, 'head', false, false, 33, 0); 
                }
                if(j>6)j = (j % 7)+1;
                if (j % 2) left = 28 - (j * 5.3) + 5.3;
                else left = 28 + (j * 5.3);
                if (jsonData[mainKey][subKey][0]) {
                    let prevPos = null;
                    jsonData[mainKey][subKey].forEach((pos, i) => {
                        if (subKey != 'undefined') {
                            let currPos = new Position(parseInt(Date.now().toString() + i.toString()), currPage.pageId, pos.Bezeichnung + " - " + pos.Name, pos.Leiter, 'lc', false, false, left, i + 1);
                            if (i === 0) new Connection(headerPos.positionId, currPos.positionId, 'down')
                            if (prevPos) new Connection(prevPos.positionId, currPos.positionId, 'left')
                            prevPos = currPos;
                        }
                    });

                } else {
                    pos = jsonData[mainKey][subKey].undefined[0];
                    let currPos = new Position(parseInt(Date.now().toString() + j.toString()), currPage.pageId, pos.Bezeichnung + " - " + pos.Name, pos.Leiter, 'lc', false, false, left, 1);
                    new Connection(headerPos.positionId, currPos.positionId, 'down')
                    //add the subHeaders extraPage
                    const currSubPage = new Page(pos.Bezeichnung, null, parseInt(pos.Level.slice(-1)), null, null);
                    let subPos = jsonData[mainKey][subKey].undefined[0];
                    let subHeaderPos = new Position(null, currSubPage.pageId, subPos.Bezeichnung + " - " + subPos.Name, subPos.Leiter, 'lc', false, false, 33, 0);
                    Object.keys(jsonData[mainKey][subKey]).forEach((pos, l) => {
                        if (pos != 'undefined') {
                            if (l % 2) subLeft = 28 - (l * 5.3) + 5.3;
                            else subLeft = 28 + (l * 5.3);
                            let prevSubPos = null;
                            jsonData[mainKey][subKey][pos].forEach((subPos, k) => {
                                let currSubPos = new Position(parseInt(Date.now().toString() + k.toString()), currSubPage.pageId, subPos.Bezeichnung + " - " + subPos.Name, subPos.Leiter, 'lc', false, false, subLeft, k + 1);
                                if (k === 0) new Connection(subHeaderPos.positionId, currSubPos.positionId, 'down')
                                if (prevSubPos) new Connection(prevSubPos.positionId, currSubPos.positionId, 'left')
                                prevSubPos = currSubPos;
                            });
                        }
                    });
                }
            });
        } else {
           
            Object.keys(jsonData[mainKey]).forEach(subKey => {
                if (Array.isArray(jsonData[mainKey][subKey])) {
                    //add page 
                    let layerStart = parseInt(jsonData[mainKey][subKey][0].Level.slice(-1));
                    let currPage = new Page(jsonData[mainKey][subKey][0].Bezeichnung, null, layerStart, null, null);
                    //add header to page
                    let currPosText = jsonData[mainKey][subKey][0].Bezeichnung + " - " + jsonData[mainKey][subKey][0].Name;
                    let headerPos = new Position(null, currPage.pageId, currPosText, jsonData[mainKey][subKey][0].Leiter, 'head', false, false, 33, 1);
                    //add positions to page
                    jsonData[mainKey][subKey].forEach((pos, i) => {
                        if (i > 0){
                            if (i % 2) left = 28 - (i * 5.3) + 5.3;
                            else left = 28 + (i * 5.3);
                            let currPos = new Position(parseInt(Date.now().toString() + i.toString()), currPage.pageId, pos.Bezeichnung + " - " + pos.Name, pos.Leiter, 'lc', false, false, left, 2);
                            new Connection(headerPos.positionId, currPos.positionId, 'down')
                        }
                       
                    });	
                } else {
                    addImportedDataToView(jsonData[mainKey]);
                }
            });
        }
    });


    updateSaveStatus('unsaved');
    if (autosaveActive) saveChart();
}


/* CSV validation before import */
function validateImport(file) {
    return new Promise((resolve) => {
        Papa.parse(file, {
            complete: function (results) {
                if (results.errors.length) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            },
            error: function () {
                resolve(false);
            }
        });
    });
}

function validateColumns(file) {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            complete: function (results) {
                const requiredColumns = ['Bezeichnung', 'Leiter', 'Name', 'Level'];
                const fileColumns = results.meta.fields;

                const isValid = requiredColumns.every(col => fileColumns.includes(col));
                resolve(isValid);
            },
            error: function () {
                resolve(false);
            }
        });
    });
}
