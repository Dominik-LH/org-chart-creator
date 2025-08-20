/*
    This file contains all the logic used for exporting the pages to a powerpoint file.
    Ensure that these JS libraries are included:
    - PptxGenJS
*/

function exportPPTX(withNames, title) {
    // Check if exporting is valid
    if (pagesArray.length === 0) {
        displayError("No content to export.");
        hideLoader();
        return;
    }

    // Initialize the PowerPoint presentation
    const pptx = new PptxGenJS();
    pptx.author = "Lufthansa Group - Org Chart Creator";
    pptx.company = "Lufthansa Group";
    pptx.title = title;
    //layout Default 10 x 5.625 inches
    const x_multiplier = (10 / 100);
    const y_multiplier = (5.625 / 100);

    //set default fonts
    pptx.theme = { headFontFace: "Lufthansa Head Global Bold" };
    pptx.theme = { bodyFontFace: "Lufthansa Text" };

    // Add title slide
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, {
        x: 0.1, y: 0.5, w: 9.8, h: 4.5,
        fill: "F3F3F3"
    });
    slide.addText(title, {
        x: 0.35, y: 1.2, w: 9, h: 1,
        fontSize: 36, bold: true, color: "00235F", fontFace: "Lufthansa Head Global Bold"
    });
    slide.addText("LUFTHANSA GROUP", {
        x: 7, y: 5, w: 2.5, h: 0.5,
        fontSize: 14, color: "00235F", align: "right", fontFace: "Lufthansa Head Global Bold"
    });

    // Add pages
    pagesArray.forEach(page => {
        const slide = pptx.addSlide();

        // Add title
        slide.addText(page.title, {
            x: (2 * x_multiplier) - 0.02, y: (1.5 * y_multiplier)+0.03, w: 9, h: 0.5,
            fontSize: 14.5, color: "00235F", fontFace: "Lufthansa Head Global Bold"
        });

        // Add subtitle
        slide.addText(page.subtitle, {
            x: (2 * x_multiplier)- 0.02 , y: (3.5 * y_multiplier)+0.15, w: 9, h: 0.5,
            fontSize: 10.5, color: "00235F", fontFace: "Lufthansa Head Global Light"
        });


        // Add layer indicators
        let indicatorNumber = page.layerStart;
        page.layerIndicators.forEach((layer, index) => {
            if (layer) {
                slide.addText("N" + indicatorNumber, {
                    x: -0.02, y: 0.6 + index * 0.4475, w: 0.44, h: 0.5,
                    fontSize: 9, color: "00235F", fontFace: "Lufthansa Head Global Bold", align: "center"   
                });
                if (index != 0) {
                    slide.addShape(pptx.ShapeType.line, {
                        line: { color: "00235F", width: 0.5},
                        x: 0.055, y: 0.73 + index * 0.4475, w: 0.28, h: 0
                    });
                }
                indicatorNumber++;
            }
        });

        // Add personal unions
        if (page.personalUnions) {
            let putxt;
            let pu = page.personalUnions.split('<div>').map(union => union.replace('</div>', '').trim());
            pu = pu.map(union => union.replace('&nbsp;', ''));
            pu.reverse().forEach((union, i) => {
                if (i !== pu.length - 1) {
                    putxt = putxt ? putxt + union + "\n" : union + "\n";
                } else {
                    putxt = putxt ? putxt + union : union;
                }
            });
            
            textheight = pu.length * 0.17;   
            slide.addText(putxt, {
                x: 0.05, y:5.625 -0.1 - textheight, w: 1.5, h: textheight,
                fontSize: 8, color: "A4A4A4", fontFace: "Lufthansa Text"
            });

        }
        

        // Add positions
        positionsArray.filter(position => position.pageId === page.pageId).forEach(position => {
            const x =  position.x_position * x_multiplier * 1.2;
            const y =  position.layer * 0.5 + 1.5;

            const colorMap = {
                "lc": "00235F",
                "tl": "626262",
                "ec": "008000",
                "head": "FFFFFF"
            };
            const fillColor = position.positionType === "head" ? "00235F" : "FFFFFF";
            const color = colorMap[position.positionType] || "000000";

            // Add rectangle
            slide.addShape(pptx.ShapeType.rect, {
                fill: fillColor, line: { color },
                x: x, y: y, w: 1.265, h: 0.355,    
            });
            

            // Add text inside the rectangle
            slide.addText(position.text || "", {
                x: x-0.05, y: y, w: 1.365,     
                align: "left",
                fontSize: 8, color, fontFace: "Lufthansa Text"
            });

            // Add responsible person to the rectangle
            if (withNames && position.responsiblePerson) {
                slide.addText(position.responsiblePerson, {
                    x: x + 0.1, y: y + 0.4, w: 1.3, h: 0.2,
                    fontSize: 8, color, fontFace: "Lufthansa Text"
                });
            }
        });
    });

    // Hide loading animation
    hideLoader();

    // Save the PowerPoint file
    pptx.writeFile({ fileName: title + ".pptx" });
}

