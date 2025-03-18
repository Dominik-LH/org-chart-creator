/*  
    This file contains the definition of the 'Connection' class. And the logic to connect positions.
    Ensure that these JS libraries are included:
    - leaderline.js
*/ 
//TODO fix left connection not connecting correctly if the positions arent on the same x axis
var connectionsArray = [];

class Connection {
    positionId1;
    positionId2;
    type;
    element;

    constructor(positionId1, positionId2, type) {
        this.positionId1 = positionId1;
        this.positionId2 = positionId2;
        this.type = type;
        if (type == 'down') {
            this.element = this.initiateDownConnection(positionId1, positionId2);
        } else if (type == 'left') {
            this.element = this.initiateLeftConnection(positionId1, positionId2);
        }
        connectionsArray.push(this);
    }

    initiateDownConnection(position1, position2) {
        return new LeaderLine(
            document.getElementById('position-' + position1),
            document.getElementById('position-' + position2), {
                color: 'var(--static_primary-color)',
                size: 1,
                endPlug: 'behind',
                path: 'grid',
                startSocket: 'bottom',
                endSocket: 'top',
                startSocketGravity: [0, 0],
                endSocketGravity: [0, 0]
            }
        );
    }

    initiateLeftConnection(position1, position2) {
        return new LeaderLine(
            document.getElementById('position-' + position1),
            document.getElementById('position-' + position2), {
                color: 'var(--primary-color)',
                size: 1,
                endPlug: 'behind',
                path: 'grid',
                startSocket: 'left',
                endSocket: 'left',
                startSocketGravity: [-5, -5],
                endSocketGravity: [-5, -5]
            }
        );
    }

}

function addDownConnection() {
    addConnection('down');
}

function addLeftConnection() {  
    addConnection('left');
}

async function addConnection(type) {
    displayInfo(translations[localStorage.getItem("language")]['select_positions_for_connect']);
    const selectedPositionId1 = await selectPosition();
    const selectedPositionId2 = await selectPosition();
    const existingConnection = connectionsArray.find(conn => 
        (conn.positionId1 == selectedPositionId1 && conn.positionId2 == selectedPositionId2) ||
        (conn.positionId1 == selectedPositionId2 && conn.positionId2 == selectedPositionId1)
    );
    if (existingConnection && existingConnection.type == type) {
        displayInfo(translations[localStorage.getItem("language")]['removing_connection']);
        existingConnection.element.remove();
        connectionsArray = connectionsArray.filter(conn => conn != existingConnection);
    } else if (existingConnection && existingConnection.type != type){
        displayInfo(translations[localStorage.getItem("language")]['changing_connection']);
        existingConnection.element.remove();
        connectionsArray = connectionsArray.filter(conn => conn != existingConnection);
        new Connection(selectedPositionId1, selectedPositionId2, type);
    } else new Connection(selectedPositionId1, selectedPositionId2, type);
    resetSelectionFeedback(selectedPositionId1);
    resetSelectionFeedback(selectedPositionId2);
    updateSaveStatus('unsaved');
    addHistoryEntry();
    if (autosaveActive) saveChart();
}

let selectionInProgress = false;

function selectPosition() {
    return new Promise((resolve, reject) => {
        selectionInProgress = true;
        const positions = document.querySelectorAll('.position');
        positions.forEach(position => {
            if (!position.classList.contains('selected')) position.classList.add('selectable'); // Highlight selectable positions
            position.style.pointerEvents = 'auto'; // Ensure positions are clickable
            const children = position.querySelectorAll('*');
            children.forEach(child => {
                child.style.pointerEvents = 'none'; // Disable clicks inside the position
            });
        });

        const onClick = function(event) {
            if (event.target.classList.contains('position') && !event.target.classList.contains('selected')) {
                positions.forEach(pos => {
                    pos.removeEventListener('click', onClick);
                    pos.classList.remove('selectable'); // Remove highlight from selectable positions
                    pos.style.pointerEvents = ''; // Re-enable clicks inside the position
                    const children = pos.querySelectorAll('*');
                    children.forEach(child => {
                        child.style.pointerEvents = ''; // Re-enable clicks inside the position
                    });
                });
                event.target.classList.add('selected');
                document.removeEventListener('click', outsideClickListener);
                selectionInProgress = false;
                resolve(event.target.id.split('-')[1]);
            }
        };

        const outsideClickListener = function(event) {
            if (!event.target.closest('.position')) {
                positions.forEach(pos => {
                    pos.removeEventListener('click', onClick);
                    pos.classList.remove('selectable'); // Remove highlight from selectable positions
                    pos.style.pointerEvents = ''; // Re-enable clicks inside the position
                    const children = pos.querySelectorAll('*');
                    children.forEach(child => {
                        child.style.pointerEvents = ''; // Re-enable clicks inside the position
                    });
                });
                document.removeEventListener('click', outsideClickListener);
                displayInfo(translations[localStorage.getItem("language")]['selection_cancel']);
                selectionInProgress = false;
                reject('Selection cancelled');
            }
        };

        setTimeout(() => {
            document.addEventListener('click', outsideClickListener);
        }, 0);

        positions.forEach(position => {
            position.addEventListener('click', onClick);
        });
    });
}

function resetSelectionFeedback(position) {
    document.getElementById('position-' + position).classList.remove('selected');
}



// Remove all connections associated with a position when it is deleted
function removeAssociatedConnections(positionId) {
    connectionsArray.forEach(element => {
        if(element.positionId1 == positionId || element.positionId2 == positionId) {
            element.element.remove(); 
            //remove the Connection object from the array
            connectionsArray = connectionsArray.filter(conn => conn != element);
        }
    });
}

//update all connections associated with a position when it is moved
function updateConnection(positionId) {
    connectionsArray.forEach(element => {
        if(element.positionId1 == positionId || element.positionId2 == positionId) {
            element.element.position();
        }
    });
}

//update all connections when a page is moved
function updateConnections() {
    connectionsArray.forEach(element => {
        element.element.position();
    });
}

// Adjust SVG positions on scroll
let lastScrollTop = 0;

function adjustSVGPositions() {
    const container = document.getElementById('pages_container');
    const scrollTop = container.scrollTop;
    const deltaY = scrollTop - lastScrollTop;

    document.querySelectorAll('.leader-line').forEach(svg => {
        const currentTransform = svg.getAttribute('transform') || 'translate(0, 0)';
        const translateValues = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        const currentX = parseFloat(translateValues[1]);
        const currentY = parseFloat(translateValues[2]);
        svg.setAttribute('transform', `translate(${currentX}, ${currentY - deltaY})`);
    });

    lastScrollTop = scrollTop;
}

document.getElementById('pages_container').addEventListener('scroll', adjustSVGPositions);

document.getElementById('pages_container').addEventListener('scroll', () => {
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        document.querySelectorAll('.leader-line').forEach(svg => {
            svg.setAttribute('transform', 'translate(0, 0)');
        });
        connectionsArray.forEach(element => {
            element.element.position();
        });
    }, 100);
});