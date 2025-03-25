/*
    This file contains all the logic used for exporting the pages to a PDF file.
    Currently, the slides get exported by creating images from the pages and adding these to a PDF file.
    Ensure that these JS libraries are included:
    - jsPDF
    - WebFontLoader
*/


// Load the custom font using WebFontLoader
function initExport() {
    WebFont.load({
        custom: {
            families: ['LufthansaHeadBold', 'LufthansaHeadLight', 'LufthansaText'],
            urls: ['resources/assets/stylesheets/general.css']
        },
        active: function () {
            // Register the fonts with jsPDF once they're loaded
            window.jspdf.jsPDF.API.events.push(['addFonts', function () {
                this.addFont('resources/assets/fonts/LufthansaHeadWeb-Bold.ttf', 'LufthansaHeadBold', 'normal');
                this.addFont('resources/assets/fonts/LufthansaHeadWeb-Light.ttf', 'LufthansaHeadLight', 'normal');
                this.addFont('resources/assets/fonts/LufthansaTextWeb-Regular.ttf', 'LufthansaText', 'normal');
            }]);
        }
    });
}

function exportPDF(withNames, title) {
    // Check if exporting is valid
    if (pagesArray.length === 0) {
        displayError("No content to export.");
        hideLoader();
        return;
    }

    //initialize the pdf
    const pdf = new window.jspdf.jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [960, 540],
    });

    //add title slide
    pdf.setTextColor(0, 35, 95);
    pdf.setFont('LufthansaHeadBold');

    pdf.setFillColor(235, 235, 235);
    pdf.rect(10, 30, 940, 480, "F");

    pdf.setFontSize(60);
    pdf.text(title, 30, 200, { align: "left" });

    pdf.setFontSize(20);
    pdf.text("LUFTHANSA GROUP", 960 - 20, 540 - 10, { align: "right" });



    //add pages
    pagesArray.forEach(page => {
        pdf.addPage();
        pdf.setTextColor(0, 35, 95);
        //add title
        pdf.setFontSize(27.5);
        pdf.setFont('LufthansaHeadBold');
        if (page.title) pdf.text(page.title, 25.5, 41.5, { align: "left" });

        //add subtitle
        if (page.subtitle) {
            pdf.setFontSize(18);
            pdf.setFont('LufthansaHeadLight');
            pdf.text(page.subtitle, 25.5, 60, { align: "left" });
        }

        //add page footer
        addPageFooter(pdf);

        //add layer indicators
        let indicatorNumber = page.layerStart;
        page.layerIndicators.forEach((layer, index) => {
            if (layer) {
                if (index !== 0) {
                    pdf.setDrawColor(0, 35, 95);
                    pdf.line(7, 83 - 11 + index * 42.87, 34.88, 83 - 11 + index * 42.87);
                }
                pdf.setFont('LufthansaHeadBold');
                pdf.setFontSize(16.5);

                pdf.text("N" + indicatorNumber, 20, 83.5 + index * 42.87, { align: 'center' });
                indicatorNumber++;
            }
        });

        //add personal union
        if (page.personalUnions) {
            let pu;
            pu = page.personalUnions.split('<div>').map(union => union.replace('</div>', '').trim());
            pu = pu.map(union => union.replace('&nbsp;', ''));
            pdf.setFont('LufthansaText');
            pdf.setFontSize(11.5);
            pdf.setTextColor(164, 164, 164);
            pu.reverse().forEach((union, index) => {
                pdf.text(union, 12.5, (540 - 19) - index * 10, { align: "left" });
            });
        }


        //add positions
        //add func int position background
        positionsArray.filter(position => position.pageId === page.pageId && position.func).forEach(position => {
            const x = 5 + position.x_position * (0.01 * 1280);
            const y = 70 + position.layer * 42.87;

            pdf.setFillColor(228, 228, 228);
            pdf.rect(x - 3.5, y - 3.5, 123.59 + 7, 36.55 + 7, "F");

        });
        positionsArray.filter(position => position.pageId === page.pageId).forEach(position => {
            //set style variables for position 
            const text = position.text;
            const resPer = position.responsiblePerson;

            var color;
            switch (position.positionType) {
                case "lc":
                    color = [0, 35, 95];
                    break;
                case "tl":
                    color = [98, 98, 98];
                    break;
                case "ec":
                    color = [0, 128, 0];
                    break;
                case "head":
                    color = [255, 255, 255];
                    break;
                default:
                    console.log("Error: Unknown position type");
            }

            var fillColor = [255, 255, 255];
            if (position.positionType === "head") fillColor = [0, 35, 95];

            const x = 5 + position.x_position * (0.01 * 1280);
            const y = 70 + position.layer * 42.87;

            if (position.proj) pdf.setLineDash([4, 2], 0);

            //draw position box
            pdf.setDrawColor(...color);
            pdf.setFillColor(...fillColor);
            pdf.rect(x, y, 123.59, 36.55, "FD");

            //draw text
            pdf.setFont('LufthansaText');
            pdf.setFontSize(11.5);
            pdf.setTextColor(...color);

            if (text) {
                const textParts = text.split(' - ');
                if (textParts.length > 1) {
                    pdf.setFont('LufthansaHeadBold');
                    pdf.text(textParts[0], x + 3, y + 9, { maxWidth: 113.59 });
                    pdf.setFont('LufthansaText');
                    const indent = " ".repeat(pdf.getTextWidth(textParts[0]) / 2);
                    pdf.text(indent + '  - ' + textParts.slice(1).join(' - '), x + 3, y + 9, { maxWidth: 113.59 });
                } else {
                    pdf.setFont('LufthansaHeadBold');
                    pdf.text(text, x + 3, y + 9, { maxWidth: 113.59 });
                }
            }

            if (withNames && resPer) {
                pdf.text(resPer, (x + 123.59 - 3), (y + 36.55 - 3), { align: "right" });
            }

            if (position.proj) pdf.setLineDash([]);

            //draw connections
            connectionsArray.filter(connection => position.positionId == connection.positionId1).forEach(connection => {
                console.log(connection);
                const position2 = positionsArray.find(position => position.positionId == connection.positionId2);
                const xConPos = 5 + position2.x_position * (0.01 * 1280);
                const yConPos = 70 + position2.layer * 42.87;
                pdf.setDrawColor(0, 35, 95);
                pdf.setLineWidth(0.5);
                if (connection.type === "down") {
                    const x1 = x + 123.59 / 2;
                    const y1 = y + 36.55;
                    const x2 = x1;
                    const y2 = y1 + 3.5;
                    const x3 = xConPos + 123.59 / 2;
                    const y3 = y2;
                    const x4 = x3;
                    const y4 = yConPos;
                    pdf.line(x1, y1, x2, y2);
                    pdf.line(x2, y2, x3, y3);
                    pdf.line(x3, y3, x4, y4);
                } else if (connection.type === "left") {
                    const x1 = x;
                    const y1 = y + 36.55 / 2;
                    const x2 = x1 - 3.5;
                    const y2 = y1;
                    const x3 = x2;
                    const y3 = yConPos + 36.55 / 2;
                    const x4 = xConPos;
                    const y4 = y3;
                    pdf.line(x1, y1, x2, y2);
                    pdf.line(x2, y2, x3, y3);
                    pdf.line(x3, y3, x4, y4);
                }
            });
        });

    });

    //hide loading animation
    hideLoader();

    //save the pdf
    pdf.save(title + ".pdf");

}



function addPageFooter(pdf) {
    const top = 540 - 40;
    const left = 960 - 338;

    // Define elements (checkboxes, lines, filled boxes)
    const elements = [
        { type: "line", x: 0, y: 10, width: 7, label: "Funct. line" },
        { type: "box", x: 51, y: 10, label: "LC position" },
        { type: "box", x: 103, y: 10, label: "TL position", color: [98, 98, 98] },
        { type: "dashedBox", x: 0, y: 22, label: "Project" },
        { type: "box", x: 51, y: 22, label: "EC / expert", color: [0, 128, 0] },
        { type: "filled", x: 103, y: 22, label: "Funct. integrated" }
    ];

    // Draw elements
    elements.forEach(({ type, x, y, width, label, color }) => {
        if (type === "line") {
            pdf.setDrawColor(0, 35, 95);
            pdf.line(left + x, top + y + 3, left + x + width, top + y + 3);
        } else if (type === "box") {
            pdf.setDrawColor(...(color || [0, 35, 95]));
            pdf.rect(left + x, top + y, 7, 7);
        } else if (type === "dashedBox") {
            pdf.setDrawColor(...(color || [0, 35, 95]));
            pdf.setLineDash([1, 1], 0);
            pdf.rect(left + x, top + y, 7, 7);
            pdf.setLineDash([]);
        } else if (type === "filled") {
            pdf.setFillColor(228, 228, 228);
            pdf.rect(left + x, top + y, 7, 7, "F");
        }

        // Draw text next to element
        pdf.setFontSize(9);
        pdf.setFont('LufthansaHeadLight');
        pdf.setTextColor(0, 0, 0);
        pdf.text(label, left + x + 11, top + y + 6);
    });

    // Add Lufthansa Group text
    pdf.setFont('LufthansaHeadBold');
    pdf.setTextColor(0, 35, 95);
    pdf.setFontSize(21);
    pdf.text("LUFTHANSA GROUP", 960 - 9.6, 540 - 15.8, { align: "right" });
}