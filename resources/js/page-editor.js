/*  
    This file contains logic for the page editor: displaying and editing action calls.
    Ensure that these JS libraries are included:
    - html2canvas
    - Dragula
*/
const pagesContainer = document.getElementById('pages_container');
const smallPagesContainer = document.getElementById('small_pages_container');
var drake;

// Function to display small versions of the pages
function displaySmallPages() {
    const pages = pagesContainer.querySelectorAll('.page');
    smallPagesContainer.innerHTML = ''; // Clear existing small pages

    pages.forEach((page, i) => {
        // Clone the page
        const clonedPage = page.cloneNode(true);
        clonedPage.classList.add('small_page');
        clonedPage.setAttribute('data-index', i);

        // add the page to the small pages container in a wrapper
        const smallPageWrapper = document.createElement('div');
        smallPageWrapper.className = 'small_page_wrapper';
        smallPageWrapper.appendChild(clonedPage);
        smallPagesContainer.appendChild(smallPageWrapper);

        // Add delete button to the top right corner of the page
        const deleteButton = document.createElement('div');
        deleteButton.className = 'delete_button';
        deleteButton.innerHTML = '<img src="resources/assets/icons/Delete.svg" alt="delete" width="20" height="20">';
        deleteButton.onclick = () => call_deletePageAtIndex(Array.from(pages).indexOf(page));
        smallPageWrapper.appendChild(deleteButton);
    });

    // Add drag and drop functionality to the small pages
    if(drake) drake.destroy();
    drake = dragula([smallPagesContainer], {
    }).on('drag', (el) => {
        el.style.cursor = 'grabbing';
    }).on('drop', (el, target) => {
        el.style.cursor = 'grab';
        const newIndex = Array.prototype.indexOf.call(target.children, el);
        const oldIndex = parseInt(el.querySelector('.small_page').getAttribute('data-index'), 10);
        call_reorderPages(oldIndex, newIndex);
    });
}

// Function to delete a page at a specific index
async function call_deletePageAtIndex(index) {
    if (await runDeleteConfirmation("This action cannot be undone!", "Delete Page", "Delete whole Page?")) {
        deletePageAtIndex(index);
        const wrapper = smallPagesContainer.querySelectorAll('.small_page_wrapper');
        if (index < wrapper.length) {
            smallPagesContainer.removeChild(wrapper[index]);
        }

        // Update the onclick handlers for the remaining pages
        wrapper.forEach((smallPageWrapper, i) => {
            smallPageWrapper.querySelector('.small_page').setAttribute('data-index', i);
            smallPageWrapper.querySelector('.delete_button').onclick = () => call_deletePageAtIndex(i);
        });
    }
}

// Function to reorder pages after drag and drop
function call_reorderPages(oldIndex, newIndex) {
    const wrapper = smallPagesContainer.querySelectorAll('.small_page_wrapper');
    // Update the onclick handlers for the remaining pages
    wrapper.forEach((smallPageWrapper, i) => {
        smallPageWrapper.querySelector('.small_page').setAttribute('data-index', i);
        smallPageWrapper.querySelector('.delete_button').onclick = () => call_deletePageAtIndex(i);
    });
    reorderPages(oldIndex, newIndex);
}
