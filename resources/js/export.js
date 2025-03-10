/*
    This file contains all the logic used for exporting the pages to a PDF file.
    Currently, the slides get exported by creating images from the pages and adding these to a PDF file.
    Ensure that these JS libraries are included:
    - jsPDF
    - dom-to-image
    - WebFontLoader
*/
//TODO fix bug with leaderlines
const titleSlideImage = "resources/assets/img/title_slide_background.jpg";

// Load the custom font using WebFontLoader
function initExport() {
    WebFont.load({
        custom: {
            families: ['LufthansaHeadBold'],
            urls: ['/resources/assets/stylesheets/general.css']
        },
        active: function () {
            // Register the font with jsPDF once it's loaded
            window.jspdf.jsPDF.API.events.push(['addFonts', function () {
                this.addFont('resources/assets/fonts/LufthansaHeadWeb-Bold.ttf', 'LufthansaHeadBold', 'normal');
            }]);
        }
    });
}


// Export the content of the pages as a PDF file
function exportPDF(withNames, title) {
    const pages = document.querySelectorAll(".page");

    // Check if exporting is valid
    if (pages.length === 0) {
        displayError("No content to export.");
        hideLoader();
        return;
    }

    // Show loading animation for UX
    showLoader();
    setLoaderMessage('Preparing export');

    // Remove unwanted content
    let originalPlaceholders = [];
    const inputElements = document.querySelectorAll('input');
    inputElements.forEach((input, i) => {
        originalPlaceholders[i] = input.placeholder;
        input.placeholder = '';
    });

    let originalNamesDisplay = [];
    const nameElements = document.querySelectorAll('.position_res_per');
    if (!withNames) nameElements.forEach((element, i) => {
        originalNamesDisplay[i] = element.style.display;
        element.style.display = 'none';
    });

    // Convert the page to an image
    let pageImages = new Array(pages.length);
    let processedPages = 0;
    setLoaderMessage('Exporting pages');
    pages.forEach((page, index) => {
        domtoimage.toJpeg(page, { quality: 4 })
            .then(function (dataUrl) {
                pageImages[index] = dataUrl;
                processedPages++;
                if (processedPages === pages.length) {
                    // Re-add content
                    inputElements.forEach((input, i) => {
                        input.placeholder = originalPlaceholders[i];
                    });

                    if (!withNames) nameElements.forEach((element, i) => {
                        element.style.display = originalNamesDisplay[i];
                    });

                    exportLeaderLines(pageImages, title);
                }
            })
            .catch(function (error) {
                console.error('Error exporting page:', error);
                hideLoader();
            });
    });
}

function exportLeaderLines(pageImages, title) {
    setLoaderMessage('Exporting leader lines');
    const leaderLines = document.querySelectorAll('.leader-line');
    if (leaderLines.length === 0) {
        console.info('No leader lines to export.');
        createPDF(pageImages, title);
        return;
    }

    let leaderLineImages = new Array(leaderLines.length);
    let leaderLineXPosition = new Array(leaderLines.length);
    let leaderLineYPosition = new Array(leaderLines.length);
    let processedLines = 0;

    leaderLines.forEach((line, index) => {
        const svg = line;
        if (svg) {
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svg);

            // Add styles to the SVG
            const styles = `
                <style>
                    .leader-line-line-path {
                        stroke: #00235F; 
                        stroke-width: 1px; 
                    }
                </style>
            `;
            svgString = svgString.replace('<defs>', `${styles}<defs>`);

            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png', 1.0);

                leaderLineImages[index] = dataUrl;
                leaderLineXPosition[index] = line.style.left;
                leaderLineYPosition[index] = line.style.top;
                processedLines++;
                if (processedLines === leaderLines.length) {
                    createPDF(pageImages, title, leaderLineImages, leaderLineXPosition, leaderLineYPosition);
                }
            };
            img.onerror = function (error) {
                console.error('Error exporting leader line:', error);
                hideLoader();
            };
        } else {
            console.error('No SVG found in leader line:', line);
        }
    });
}

function createPDF(pageImages, title, leaderLineImages, leaderLineXPosition, leaderLineYPosition) {
    setLoaderMessage('Creating PDF');
    const width = 960;
    const height = 540;

    const pdf = new window.jspdf.jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [width, height],
    });

    addTitleSlideToPDF(pdf, title, width, height);

    pageImages.forEach((img, i) => {
        pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, width, height);
        //getting leaderlines of this page
        const page = document.querySelectorAll(".page")[i];
        const nextPage = document.querySelectorAll(".page")[i + 1];
        let linesOnPage = [];
        leaderLineYPosition.forEach((yPos, j) => {
            if (!nextPage && parseInt(yPos) >= page.getBoundingClientRect().top) {
                linesOnPage.push(leaderLineImages[j]);
                return;
            }
            if (parseInt(yPos) >= page.getBoundingClientRect().top && parseInt(yPos) <= nextPage.getBoundingClientRect().top) {
                linesOnPage.push(leaderLineImages[j]);
            }
        });
        //adding leaderlines of this page
        linesOnPage.forEach((line, k) => {
            let x = parseFloat(leaderLineXPosition[k+i]) - page.getBoundingClientRect().left;
            let y = parseFloat(leaderLineYPosition[k+i]) -  page.getBoundingClientRect().top;
            pdf.addImage(line, "JPEG", x, y);
        });
    });
    pdf.save(title + ".pdf");
    hideLoader();
}

function addTitleSlideToPDF(pdf, title, width, height) {
    pdf.addImage(titleSlideImage, "JPEG", 0, 0, width, height);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(50);
    pdf.setFont('LufthansaHeadBold');
    pdf.text(title, 40, 200, { align: "left" });
}