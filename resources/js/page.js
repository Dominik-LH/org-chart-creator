/*  
    This File contains the Page class and related functions.
*/
//TODO feat multiple positions select 

var pagesArray = []; //Chart 
var pageIdCounter = 0; // Initialize pageIdCounter



class Page {
    pageId;
    title;
    subtitle;
    layerStart = 1;
    layerIndicators = [true, false, false, false, false, false, false, false, false, false];
    personalUnions;

    htmlElement;

    constructor(title, subtitle, layerStart, layerIndicators, personalUnions) {
        this.pageId = pageIdCounter++;
        if (title) this.title = title;
        if (subtitle) this.subtitle = subtitle;
        if (layerIndicators) this.layerIndicators = layerIndicators;
        if (personalUnions) this.personalUnions = personalUnions;
        if (layerStart) this.layerStart = parseInt(layerStart);
        this.display();
        this.addEventListener();
        pagesArray.push(this);
    }

    display() {
        // Create the HTML structure for the page
        let html = `
            <div class="page" id="${this.pageId}">
                <input type="text" placeholder="add Title by clicking here" class="page_title">
                <input type="text" placeholder="add Subtitle by clicking here" class="page_subtitle">
                <div class="canvas" id="canvas-${this.pageId}">
                    <div class="layer" id="layer-0"></div>
                    <div class="layer" id="layer-1"></div>
                    <div class="layer" id="layer-2"></div>
                    <div class="layer" id="layer-3"></div>
                    <div class="layer" id="layer-4"></div>
                    <div class="layer" id="layer-5"></div>
                    <div class="layer" id="layer-6"></div>
                    <div class="layer" id="layer-7"></div>
                    <div class="layer" id="layer-8"></div>
                    <div class="layer" id="layer-9"></div>
                    <div class="layer layer-last" id="layer-10"></div>
                </div>
                <div class="personal_unions" contenteditable="true">
                </div>
                <div class="page_footer">
                    <div class="legend">
                        <div class="legend_item">
                            <span class="line funct-line"></span> Funct. line
                        </div>
                        <div class="legend_item">
                            <span class="square lc-position"></span> LC position
                        </div>
                        <div class="legend_item">
                            <span class="square tl-position"></span> TL position
                        </div>
                        <div class="legend_item">
                            <span class="square project"></span> Project
                        </div>
                        <div class="legend_item">
                            <span class="square ec-expert"></span> EC / expert
                        </div>
                        <div class="legend_item">
                            <span class="square funct-integrated"></span> Funct. integrated
                        </div>
                    </div>
                    <img src="/resources/assets/img/LHG-logo.png" alt="Lufthansa Group Logo" width="190">
                </div>
            </div>
            `;
        pageContainer.insertAdjacentHTML("beforeend", html);
        this.htmlElement = document.getElementById(this.pageId);

        // Fill data if available
        if (this.title) {
            this.htmlElement.querySelector('.page_title').value = this.title;
        }
        if (this.subtitle) {
            this.htmlElement.querySelector('.page_subtitle').value = this.subtitle;
        }
        if (this.personalUnions) {
            this.htmlElement.querySelector('.personal_unions').innerHTML = this.personalUnions;
        }
        // Set layer indicators
        const layers = this.htmlElement.querySelectorAll('.layer');
        let counter = this.layerStart;
        layers[0].classList.add('layer-index-first');
        layers[0].setAttribute('data-index', `N${counter}`);
        for (let i = 1; i < this.layerIndicators.length; i++) {
            if (this.layerIndicators[i]) {
                counter++;
                layers[i].classList.add('layer-index');
                layers[i].setAttribute('data-index', `N${counter}`);
            }
        }
    }

    // Function to change the title of the page
    changeTitle(newTitle) {
        this.title = newTitle;
        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    }

    // Function to change the subtitle of the page
    changeSubtitle(newSubtitle) {
        this.subtitle = newSubtitle;
        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    }

    changeLayerIndicator(layerIndex) {
        const layers = this.htmlElement.querySelectorAll('.layer');
        const layer = layers[layerIndex];

        // Change the stating number
        if (layerIndex === 0) {
                if (this.layerStart < 4) {
                    this.layerStart++;
                } else {
                    this.layerStart = 1;
                }
            layer.setAttribute('data-index', `N${this.layerStart}`);
        } else {
            // toggleLayerIndicator
            if (this.layerIndicators[layerIndex]){
                layers[layerIndex].classList.remove('layer-index');
                this.layerIndicators[layerIndex] = false;
            } else {
                layers[layerIndex].classList.add('layer-index');
                this.layerIndicators[layerIndex] = true;
            }
        }

        // Correct Indicator Numbers
        let counter = this.layerStart;
        for (let i = 1; i < this.layerIndicators.length; i++) {
            if (this.layerIndicators[i]) {
                counter++;
                layers[i].classList.add('layer-index');
                layers[i].setAttribute('data-index', `N${counter}`);
            }
        }

        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    }


    /* Add event listeners */
    addEventListener() {
        this.addTitleEventListener();
        this.addSubtitleEventListener();
        this.addLayerEventListeners();
        this.addUnionsEventListener();
    }

    addTitleEventListener() {
        const titleInput = this.htmlElement.querySelector(".page_title");
        let originalTitle = titleInput.value;
        titleInput.addEventListener("blur", (event) => {
            if (event.target.value !== originalTitle) {
                this.changeTitle(event.target.value);
                originalTitle = event.target.value;
            }
        });
        titleInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                titleInput.blur();
            }
        });
    }

    addSubtitleEventListener() {
        const subtitleInput = this.htmlElement.querySelector(".page_subtitle");
        let originalSubtitle = subtitleInput.value;
        subtitleInput.addEventListener("blur", (event) => {
            if (event.target.value !== originalSubtitle) {
                this.changeSubtitle(event.target.value);
                originalSubtitle = event.target.value;
            }
        });
        subtitleInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                subtitleInput.blur();
            }
        });
    }

    addLayerEventListeners() {
        const layers = this.htmlElement.querySelectorAll('.layer');
        layers.forEach((layer, index) => {
            layer.addEventListener('click', (event) => {
                const clickX = event.clientX - layer.getBoundingClientRect().left;
                if (clickX <= 50) {
                    this.changeLayerIndicator(index);
                }
            });

            layer.addEventListener('mouseenter', (event) => {
                const mouseX = event.clientX - layer.getBoundingClientRect().left;
                if (mouseX <= 50 && !layer.classList.contains('layer-index')) {
                    if (index === 0 || !this.layerIndicators.slice(0, index).includes(true)) {
                        layer.classList.add('layer-index-preview-first');
                    } else {
                        layer.classList.add('layer-index-preview');
                    }
                }
            });

            layer.addEventListener('mousemove', (event) => {
                const mouseX = event.clientX - layer.getBoundingClientRect().left;
                if (mouseX <= 50 && !layer.classList.contains('layer-index')) {
                    if (index === 0 || !this.layerIndicators.slice(0, index).includes(true)) {
                        layer.classList.add('layer-index-preview-first');
                        layer.classList.remove('layer-index-preview');
                    } else {
                        layer.classList.add('layer-index-preview');
                        layer.classList.remove('layer-index-preview-first');
                    }
                } else if (mouseX > 50) {
                    layer.classList.remove('layer-index-preview');
                    layer.classList.remove('layer-index-preview-first');
                }
            });

            layer.addEventListener('mouseleave', () => {
                layer.classList.remove('layer-index-preview');
                layer.classList.remove('layer-index-preview-first');
            });
        });
    }

    addUnionsEventListener() {
        const unionsDiv = this.htmlElement.querySelector(".personal_unions");
        let originalUnions = unionsDiv.innerHTML;
        unionsDiv.addEventListener("blur", (event) => {
            if (event.target.innerHTML !== originalUnions) {
                this.personalUnions = event.target.innerHTML;
                updateSaveStatus('unsaved');
                addHistoryEntry();
                if (autosaveActive) saveChart();
                originalUnions = event.target.innerHTML;
            }
        });
    }
}

// Function to add a new page
function addPage(noScroll) {
    new Page();  // Create a new page
    if (!noScroll) {
        pageContainer.scrollTo({ // Set the scroll of the pageContainer to the bottom
            top: pageContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
    updateSaveStatus('unsaved');
    addHistoryEntry();
    if (autosaveActive) saveChart();
}

// Function to add a page at a specific index
function addPageAtIndex(index) {
    addPage(true);
    reorderPages(pagesArray.length - 1, index);
}

// Function to delete a page at a specific index
function deletePageAtIndex(index) {
    if (index >= 0 && index < pagesArray.length) {
        const deletedPage = pagesArray[index];

        // Delete all positions of the page
        positionsArray.forEach(position => {
            if (position.pageId === deletedPage.pageId) {
                position.deletePosition(true);
            }
        });

        // Remove the page from the array and update pageIds
        deletedPage.htmlElement.remove();
        pagesArray.splice(index, 1);
        pagesArray.forEach((page, idx) => {
            page.pageId = idx;
            page.htmlElement.id = idx;
            page.htmlElement.querySelector('.canvas').id = `canvas-${idx}`;
        });

        // Update the pageIds of the positions
        positionsArray.forEach(position => {
            if (position.pageId > index) {
                position.pageId--;
            }
        });

        updateConnections();
        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    } else {
        console.error(`Invalid index ${index}`);
    }
}

// Function to reorder pages
function reorderPages(oldIndex, newIndex) {
    if (oldIndex >= 0 && oldIndex < pagesArray.length && newIndex >= 0 && newIndex < pagesArray.length) {

        const [movedPage] = pagesArray.splice(oldIndex, 1); // Remove the page from the array
        pagesArray.splice(newIndex, 0, movedPage); // Insert the page at the new index

        pagesArray.forEach((page, idx) => page.pageId = idx);   // Update pageIds

        //update the pageIds of the positions
        positionsArray.forEach(position => {
            if (position.pageId === oldIndex) {
                position.pageId = newIndex;
            } else if (oldIndex < newIndex && position.pageId > oldIndex && position.pageId <= newIndex) {
                position.pageId--;
            } else if (oldIndex > newIndex && position.pageId < oldIndex && position.pageId >= newIndex) {
                position.pageId++;
            }
        });

        // Update the View of the pages
        pagesArray.forEach((page, idx) => {
            pageContainer.appendChild(page.htmlElement);
            page.pageId = idx;
            page.htmlElement.id = idx;
            page.htmlElement.querySelector('.canvas').id = `canvas-${idx}`;
        });


        // Update the connections
        connectionsArray.forEach(conn => {
            conn.element.position();
        });

        updateConnections();
        updateSaveStatus('unsaved');
        addHistoryEntry();
        if (autosaveActive) saveChart();
    } else {
        console.error(`Invalid indices: oldIndex ${oldIndex}, newIndex ${newIndex}`);
    }
}
