/*  
    This file contains the definition of the 'position' class.
    Ensure that these JS libraries are included:
    - interact.js
*/

var positionsArray = [];

const positionEditor = document.getElementById('position_settings_container');

class Position {
    positionId;
    pageId;
    text;
    responsiblePerson;
    positionType = 'lc';
    func = false;
    proj = false;
    x_position = 30;
    layer = 0;
    pageHtmlElement;
    htmlElement;
    editorHtmlElement;

    constructor(positionId, pageId, text, responsiblePerson, positionType, func, proj, x_position, layer) {
        if (positionId) {
            this.positionId = positionId;
        } else this.positionId = Date.now();
        this.pageId = parseInt(pageId);
        this.pageHtmlElement = document.getElementById(pageId);
        if (text) this.text = text;
        if (responsiblePerson) this.responsiblePerson = responsiblePerson;
        if (positionType) this.positionType = positionType;
        if (func) this.func = true;
        if (proj) this.proj = true;
        if (x_position) this.x_position = x_position;
        if (layer) this.layer = layer;
        this.display();
        this.addEventListener();
        this.htmlElement.positionInstance = this;
        positionsArray.push(this);
        document.getElementById('pages_container').addEventListener('scroll', () => this.hideEditor());

        // Add the click outside listener only once
        if (!Position.clickOutsideListenerAdded) {
            document.addEventListener('click', (event) => {
                positionsArray.forEach(position => {
                    if (!position.htmlElement.contains(event.target) && !position.editorHtmlElement.contains(event.target)) {
                        position.hideEditor();
                    }
                });
            });
            Position.clickOutsideListenerAdded = true;
        }
    }

    display() {
        let html = `
                    <div class="position lc" id="position-${this.positionId}">
                        <div class="position_text" contenteditable="true"><b>abbr -</b> expl.</div>
                        <input class="position_res_per" type="text" placeholder="responsible person">
                    </div>
                    `;
        // Set the position of the element and display it
        const layerElement = this.pageHtmlElement.querySelector(`#layer-${this.layer}`);
        const vwPosition = this.x_position; 
        layerElement.insertAdjacentHTML("beforeend", html);
        this.htmlElement = layerElement.querySelector(".position:last-child");
        this.htmlElement.style.transform = `translate(${vwPosition}vw, 0)`;
        // Set the text and responsible person 
        if (this.text) this.formatPositionText(this.text);
        if (this.responsiblePerson) this.htmlElement.querySelector('.position_res_per').value = this.responsiblePerson;
        //set the position types
        this.htmlElement.classList.toggle('func', this.func);
        this.htmlElement.classList.toggle('proj', this.proj);
        this.htmlElement.classList.add(this.positionType);
        //initialize the editor
        this.initializeEditor();
        // Initialize draggable functionality with interact.js
        var x = (this.x_position / 100) * window.innerWidth; var y = 0;
        interact(this.htmlElement)
            .draggable({
                //set the grid functionality an the x-axis
                modifiers: [
                    interact.modifiers.snap({
                        targets: [
                            interact.snappers.grid({ x: 10, y: 1 })
                        ],
                        range: Infinity,
                        relativePoints: [{ x: 0, y: 0 }]
                    })
                ],
                inertia: true
            })
            .on('dragstart', (event) => {
                event.target.style.zIndex = '50'; //set the z-index to the highest value
                //set the background color of all layers to show the snapping functionality
                document.querySelectorAll('.layer').forEach(layer => {
                    layer.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                });
            })
            .on('dragmove', (event) => {
                //update the x and y position of the element while dragging (dragmove)
                this.hideEditor();
                x += event.dx;
                y += event.dy;
                const vwX = (x / window.innerWidth) * 100;
                event.target.style.transform = 'translate(' + vwX + 'vw, ' + y + 'px)';
                updateConnection(this.positionId);
            })
            .on('dragend', (event) => {
                //reset the background color of all layers
                document.querySelectorAll('.layer').forEach(layer => {
                    layer.style.backgroundColor = 'transparent';
                });
                // Find the correct canvas to snap the position element to
                const canvas = Array.from(document.querySelectorAll('.canvas'));
                let closestCanvas = null;
                let minDistanceCan = Infinity;
                canvas.forEach(c => {
                    const rect = c.getBoundingClientRect();
                    const distance = Math.abs(event.clientY - (rect.top + rect.height / 2));
                    if (distance < minDistanceCan) {
                        minDistanceCan = distance;
                        closestCanvas = c;
                    }
                });

                // Find closest layers within the canvas
                const layers = Array.from(closestCanvas.querySelectorAll('.layer'));
                let closestLayer = null;
                let minDistancePos = Infinity;
                layers.forEach(layer => {
                    const rect = layer.getBoundingClientRect();
                    const distance = Math.abs(event.clientY - (rect.top + rect.height / 2));
                    if (distance < minDistancePos) {
                        minDistancePos = distance;
                        closestLayer = layer;
                    }
                });

                // Append the position element to the closest layer and update its position
                if (closestLayer) {
                    closestLayer.appendChild(event.target);
                    y = 0; //correct y-axis position 
                    //correct if the position is outside the canvas on x-axis
                    if (x < 41) x = 41;
                    if (x > closestLayer.getBoundingClientRect().width - event.target.getBoundingClientRect().width) {
                        x = closestLayer.getBoundingClientRect().width - event.target.getBoundingClientRect().width;
                    }
                    const vwX = (x / window.innerWidth) * 100;
                    event.target.style.transform = `translate(${vwX}vw, ${y}px)`;
                }
                updateConnection(this.positionId);
                this.updatePosition(closestCanvas.id.split('-')[1], closestLayer.id.split('-')[1], x);
                this.editorHtmlElement.relatedPositionElement = this.htmlElement;
            });
    }

    //update the position of the element
    updatePosition(pageId, layer, x_position) {
        this.pageId = parseInt(pageId);
        this.layer = layer;
        this.x_position = (x_position / window.innerWidth) * 100; // Store x_position in vw units
        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    }

    //change the type of the position (LT, TL, EC, HEAD) or set the functional integrated or project 
    changeType(type) {
        if(type == "head"){
            this.htmlElement.classList.remove('func');
            this.func = false;
            this.htmlElement.classList.remove('proj');
            this.proj = false;
        }
        this.htmlElement.classList.remove(this.positionType);
        this.htmlElement.classList.add(type);
        this.positionType = type;
        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    }
    toggleFunc(isChecked) {
        this.func = isChecked;
        this.htmlElement.classList.toggle('func', isChecked);
        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    }
    toggleProj(isChecked) {
        this.proj = isChecked;
        this.htmlElement.classList.toggle('proj', isChecked);
        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    }

    //delete the position
    deletePosition() {
        removeAssociatedConnections(this.positionId);
        this.htmlElement.remove();
        positionsArray = positionsArray.filter(pos => pos != this);
        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    }
    
    formatPositionText(text) {
        const positionText = this.htmlElement.querySelector('.position_text');
        const textParts = text ? text.split(' - ') : ['', ''];
        const abbreviation = textParts[0] || '';
        const explanation = textParts[1] || '';
        if (explanation) positionText.innerHTML = `<b>${abbreviation}</b> - ${explanation}`;
        else positionText.innerHTML = `<b>${abbreviation}</b>`;
    }

    //event listeners for the position element
    addEventListener() {
        //event listeners for the title and responsible person change
        this.htmlElement.querySelector('.position_text').addEventListener('input', (event) => {
            this.text = event.target.innerText;
            updateSaveStatus('unsaved');
            addHistoryEntry();
            if (autosaveActive) saveChart();
        });
        this.htmlElement.querySelector('.position_res_per').addEventListener('input', (event) => {
            this.responsiblePerson = event.target.value;
            updateSaveStatus('unsaved');
            addHistoryEntry();
            if (autosaveActive) saveChart();
        });
        //event listeners for the editor
        this.addEditorEventListeners();
        // Bold the first word of the position text
        const positionText = this.htmlElement.querySelector('.position_text');
        positionText.addEventListener('blur', () => {
            this.formatPositionText(positionText.innerText);
        });

    }

    /* Editor functionality */
    addEditorEventListeners() {
        // Show editor on click
        this.htmlElement.addEventListener('click', (event) => {
            if (selectionInProgress) return; // Prevent showing editor if selection is in progress
            event.stopPropagation(); // Prevent the click event from propagating to the document
            this.editorHtmlElement.relatedPositionElement = this.htmlElement;
            this.displayEditor();
        });
    }

    initializeEditor() {
        // Check if the global position editor already exists
        if (!document.querySelector('.position_settings_container')) {
            let html = `
            <div class="position_settings_container">
                <div class="position_settings">
                    <select id="position_type_select">
                        <option value="lc">LC</option>
                        <option value="tl">TL</option>
                        <option value="ec">EC</option>
                        <option value="head">HEAD</option>
                    </select>
                    <div>
                        <input type="checkbox" id="func" class="toggle-switch">    
                        <label for="func">Funct. int.</label>
                    </div>
                    <div>
                        <input type="checkbox" id="project" class="toggle-switch">    
                        <label for="project">Project</label>
                    </div>
                    <img src="/resources/assets/icons/delete.svg" alt="delete" class="delete_position">
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            this.editorHtmlElement = document.querySelector('.position_settings_container');
    
            // Add event listeners for editor actions
            this.editorHtmlElement.querySelector('#position_type_select').addEventListener('change', (event) => {
                const positionElement = this.editorHtmlElement.relatedPositionElement;
                if (positionElement) {
                    const positionInstance = positionElement.positionInstance;
                    positionInstance.changeType(event.target.value);
                }
            });
            this.editorHtmlElement.querySelector('#func').addEventListener('change', (event) => {
                const positionElement = this.editorHtmlElement.relatedPositionElement;
                if (positionElement) {
                    const positionInstance = positionElement.positionInstance;
                    positionInstance.toggleFunc(event.target.checked);
                }
            });
            this.editorHtmlElement.querySelector('#project').addEventListener('change', (event) => {
                const positionElement = this.editorHtmlElement.relatedPositionElement;
                if (positionElement) {
                    const positionInstance = positionElement.positionInstance;
                    positionInstance.toggleProj(event.target.checked);
                }
            });
            this.editorHtmlElement.querySelector('.delete_position').addEventListener('click', (event) => {
                const positionElement = this.editorHtmlElement.relatedPositionElement;
                if (positionElement) {
                    const positionInstance = positionElement.positionInstance;
                    positionInstance.deletePosition();
                    this.hideEditor(); // Hide the editor after deleting the position
                }
            });
        } else {
            this.editorHtmlElement = document.querySelector('.position_settings_container');
        }
    }
    
    displayEditor() {
        this.editorHtmlElement.style.display = 'block';
        const rect = this.editorHtmlElement.relatedPositionElement.getBoundingClientRect();
        const vwLeft = (rect.left / window.innerWidth) * 100;
        const top = rect.top + window.scrollY; // Use window.scrollY to account for the scroll position
        this.editorHtmlElement.style.top = `calc(${top}px - 7.5vh)`;
        this.editorHtmlElement.style.left = `calc(${vwLeft}vw - 3.4vw)`;
        this.editorHtmlElement.style.position = 'absolute';
        this.editorHtmlElement.style.zIndex = '1000';
        // Update the editor to show the current values of the position
        this.editorHtmlElement.querySelector('#position_type_select').value = this.positionType;
        this.editorHtmlElement.querySelector('#func').checked = this.func || false;
        this.editorHtmlElement.querySelector('#project').checked = this.proj || false;
    }

    hideEditor() {
        this.editorHtmlElement.style.display = 'none';
    }

    

}
function addPosition() {

    // Find the current page
    const pages = document.querySelectorAll('.page');
    //check if a page exists
    if (pages.length === 0) {
        displayWarning('Please add a page first');
        return;
    }
    let currentPage = null;
    let minDistance = Infinity;

    const screenMiddleY = window.scrollY + window.innerHeight / 2;


    pages.forEach(page => {
        const rect = page.getBoundingClientRect();
        const pageMiddleY = rect.top + rect.height / 2 + window.scrollY;
        const distance = Math.abs(screenMiddleY - pageMiddleY);
        if (distance < minDistance) {
            minDistance = distance;
            currentPage = page;
        }
    });

    const newPosition = new Position(null, currentPage.id);
    updateSaveStatus('unsaved');
    addHistoryEntry();
    // Scroll to the page if the new position is outside of the screen
    const newPositionRect = newPosition.htmlElement.getBoundingClientRect();
    if (newPositionRect.top < 0 || newPositionRect.bottom > window.innerHeight) {
        currentPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (autosaveActive) saveChart();
}
