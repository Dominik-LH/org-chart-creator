/*  
    This file contains logic for the page editor: displaying and editing action calls.
    Ensure that these JS libraries are included:
    - html2canvas
    - Dragula
*/

const pagesContainer = document.getElementById('pages_container');
const smallPagesContainer = document.getElementById('small_pages_container');
const pages = pagesContainer.getElementsByClassName('page');

// Function to display small versions of the pages
function displaySmallPages() {
    if (pages.length === 0) return;
    for (let i = 0; i < pages.length; i++) {
        html2canvas(pages[i], { scale: 0.2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/jpeg", 0.8); // Change to JPEG with quality 0.8
            const smallPageWrapper = document.createElement('div');
            smallPageWrapper.className = 'small_page_wrapper';

            const smallPage = document.createElement('div');
            smallPage.className = 'small_page';
            const img = document.createElement('img');
            img.src = imgData;
            img.style.width = '200px';
            img.style.height = 'calc(200px * 9/16)';
            smallPage.appendChild(img);

            // Add delete button to the top right corner
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete_button';
            deleteButton.innerHTML = '<img src="resources/assets/icons/Delete.svg" alt="delete" width="20" height="20">';
            deleteButton.onclick = () => call_deletePageAtIndex(i);
            smallPage.appendChild(deleteButton);

            // Show delete button only on hover
            smallPage.onmouseover = () => deleteButton.style.display = 'block';
            smallPage.onmouseout = () => deleteButton.style.display = 'none';
            deleteButton.style.display = 'none';

            smallPage.setAttribute('data-index', i);
            smallPageWrapper.appendChild(smallPage);

            // Add div between pages
            const spacerDiv = document.createElement('div');
            spacerDiv.className = 'spacer_div';
            spacerDiv.style.height = 'calc(200px * 9/16)';
            spacerDiv.style.width = '10px';
            spacerDiv.style.position = 'relative';

            const addSvg = document.createElement('img');
            addSvg.src = 'resources/assets/icons/add_page_between.svg';
            addSvg.style.cursor = 'pointer';
            addSvg.style.position = 'absolute';
            addSvg.style.top = '50%';
            addSvg.style.left = '50%';
            addSvg.style.transform = 'translate(-50%, -50%)';
            addSvg.style.display = 'none';
            addSvg.onclick = () => call_addPageAtIndex(i + 1);

            spacerDiv.appendChild(addSvg);
            smallPageWrapper.appendChild(spacerDiv);

            removeOneSmallPagesLoader();
            smallPagesContainer.appendChild(smallPageWrapper);

            // Show add SVG only on hover over spacer div
            spacerDiv.onmouseover = () => addSvg.style.display = 'block';
            spacerDiv.onmouseout = () => addSvg.style.display = 'none';
            spacerDiv.style.display = 'flex';
            spacerDiv.style.alignItems = 'center';
            spacerDiv.style.justifyContent = 'center';
        });
    }
    initializeDragAndDrop();
}

// Function to initialize drag and drop functionality
function initializeDragAndDrop() {
    const smallPagesContainer = document.getElementById('small_pages_container');
    const drake = dragula([smallPagesContainer], {
        moves: (el, container, handle) => handle.tagName === 'IMG' && handle.parentElement.classList.contains('small_page')
    }).on('drag', (el) => {
        el.querySelector('.small_page').classList.add('dragging');
    }).on('dragend', (el) => {
        el.querySelector('.small_page').classList.remove('dragging');
    }).on('drop', (el, target, source, sibling) => {
        el.querySelector('.small_page').classList.remove('dragging');
        const newIndex = Array.prototype.indexOf.call(target.children, el);
        const oldIndex = parseInt(el.querySelector('.small_page').getAttribute('data-index'), 10);
        call_reorderPages(oldIndex, newIndex);
    });
}

// Function to add a new page at a specific index
function call_addPageAtIndex(index) {
    addPageAtIndex(index);
    const smallPagesContainer = document.getElementById('small_pages_container');
    const smallPageWrapper = document.createElement('div');
    smallPageWrapper.className = 'small_page_wrapper';

    const newPagePlaceholder = document.createElement('div');
    newPagePlaceholder.className = 'small_page';
    const newPageImg = document.createElement('img');
    newPageImg.src = 'resources/assets/img/small_new_page.jpg';
    newPageImg.style.width = '200px';
    newPageImg.style.height = 'calc(200px * 9/16)';
    newPagePlaceholder.appendChild(newPageImg);

    // Add delete button to the top right corner
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete_button';
    deleteButton.innerHTML = '<img src="resources/assets/icons/Delete.svg" alt="delete" width="20" height="20">';
    deleteButton.onclick = () => call_deletePageAtIndex(index);
    newPagePlaceholder.appendChild(deleteButton);

    // Show delete button only on hover
    newPagePlaceholder.onmouseover = () => deleteButton.style.display = 'block';
    newPagePlaceholder.onmouseout = () => deleteButton.style.display = 'none';
    deleteButton.style.display = 'none';

    newPagePlaceholder.setAttribute('data-index', index);
    smallPageWrapper.appendChild(newPagePlaceholder);

    const spacerDiv = document.createElement('div');
    spacerDiv.className = 'spacer_div';
    spacerDiv.style.height = 'calc(200px * 9/16)';
    spacerDiv.style.width = '10px';
    spacerDiv.style.position = 'relative';

    const addSvg = document.createElement('img');
    addSvg.src = 'resources/assets/icons/add_page_between.svg';
    addSvg.style.cursor = 'pointer';
    addSvg.style.position = 'absolute';
    addSvg.style.top = '50%';
    addSvg.style.left = '50%';
    addSvg.style.transform = 'translate(-50%, -50%)';
    addSvg.style.display = 'none';
    addSvg.onclick = () => call_addPageAtIndex(index + 1);

    spacerDiv.appendChild(addSvg);
    smallPageWrapper.appendChild(spacerDiv);

    const smallPages = smallPagesContainer.getElementsByClassName('small_page_wrapper');

    if (index <= smallPages.length) {
        smallPagesContainer.insertBefore(smallPageWrapper, smallPages[index]);
    } else {
        smallPagesContainer.appendChild(smallPageWrapper);
    }


    // Add hover effect for spacer div
    spacerDiv.onmouseover = () => addSvg.style.display = 'block';
    spacerDiv.onmouseout = () => addSvg.style.display = 'none';
}

// Function to delete a page at a specific index
async function call_deletePageAtIndex(index) {
    if (await runDeleteConfirmation("This action cannot be undone!", "Delete Page", "Delete whole Page?")) {
        deletePageAtIndex(index);
        const smallPagesContainer = document.getElementById('small_pages_container');
        const smallPages = smallPagesContainer.getElementsByClassName('small_page_wrapper');
        if (index < smallPages.length) {
            smallPagesContainer.removeChild(smallPages[index]);
        }

        // Update the onclick handlers for the remaining pages and spacers
        for (let i = index; i < smallPages.length; i++) {
            const smallPage = smallPages[i].querySelector('.small_page');
            smallPage.setAttribute('data-index', i);
            smallPage.querySelector('.delete_button').onclick = () => call_deletePageAtIndex(i);
            const spacerDiv = smallPages[i].querySelector('.spacer_div');
            spacerDiv.querySelector('img').onclick = () => call_addPageAtIndex(i + 1);
        }
    }
}

// Function to reorder pages after drag and drop
function call_reorderPages(oldIndex, newIndex) {
    const smallPagesContainer = document.getElementById('small_pages_container');
    const smallPages = smallPagesContainer.getElementsByClassName('small_page');
    for (let i = 0; i < smallPages.length; i++) {
        smallPages[i].setAttribute('data-index', i);
    }
    reorderPages(oldIndex, newIndex);
}

// Function to show loading animation for small pages
function showSmallPagesLoader() {
    smallPagesContainer.innerHTML = '';
    for (let i = 0; i < pages.length; i++) {
        const loaderBox = document.createElement('div');
        loaderBox.className = 'loader_box';
        loaderBox.style.width = '200px';
        loaderBox.style.height = 'calc(200px * 9/16)';
        smallPagesContainer.appendChild(loaderBox);
    }
}

// Function to remove one loading animation box
function removeOneSmallPagesLoader() {
    const loaderBoxes = smallPagesContainer.getElementsByClassName('loader_box');
    if (loaderBoxes.length > 0) {
        smallPagesContainer.removeChild(loaderBoxes[0]);
    }
}
