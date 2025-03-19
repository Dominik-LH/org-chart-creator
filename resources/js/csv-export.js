/*  
    This file contains all the logic to create a CSV file from a chart automatically
    Ensure that these JS libraries are included
    - PapaParse
*/

//TODO auto override on Import

function exportToCSV() {
    const data = positionsArray.map(position => {
        const textParts = position.text ? position.text.split(' - ') : ['', ''];
        const abbreviation = textParts[0] || '';
        const explanation = textParts[1] || '';
        
        // Calculate the level
        const page = pagesArray.find(page => page.pageId === position.pageId);
        let level = page.layerStart;
        for (let i = 1; i <= position.layer; i++) {
            if (page.layerIndicators[i]) {
                level++;
            }
        }

        const responsiblePerson = position.responsiblePerson || '';
        return {
            Bezeichnung: abbreviation,
            Name: explanation,
            Level: `N${level}`,
            Leiter: responsiblePerson
        };
    });

    //create the csv with semicolon delimiter
    const csv = Papa.unparse(data, { delimiter: ';' });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', chartName + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}