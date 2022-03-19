const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const H2_TAG = 'h2';
const P_TAG = 'p';
const LOCATION = 'location';
const TEXT = 'text';
const TITLE = 'title';

const fileExtension = '.html';
const lunrIndexTemplate = {
    [LOCATION]: '',
    [TEXT]: '',
    [TITLE]: ''
};

const findFilesInDir = (startPath, filter) => {
    let results = [];

    if (fs.existsSync(startPath)) {
        let files = fs.readdirSync(startPath);

        results = files
            .map((file) => path.join(startPath, file))
            .filter((file) => {
                let fileStat = fs.lstatSync(file);
                return file !== fileStat.isDirectory() && file.indexOf(filter) >= 0;
            });
    }

    return results;
};

const inputFiles = findFilesInDir(process.env.LOOKUP_DIRECTORY, fileExtension);

inputFiles.forEach(file => {
    const fileToDOM = new JSDOM(fs.readFileSync(file).toString());
    const searchIndeces = [];
    let P_index = 0;

    fileToDOM.window.document.querySelectorAll(H2_TAG).forEach(individualEntry => {
        const searchIndex = {...lunrIndexTemplate,
            [LOCATION]: individualEntry.textContent,
            [TITLE]: individualEntry.getAttribute('id'),
            [TEXT]: P_index };

        searchIndeces.push(searchIndex);
        P_index++;
    });

    P_index = 0;
    fileToDOM.window.document.querySelectorAll(P_TAG).forEach(individualEntry => {
        if (individualEntry.getAttribute('data-selector')) {
            const pTagContent = individualEntry.textContent;

            if (pTagContent && searchIndeces[P_index]) {
                searchIndeces[P_index][TEXT] = pTagContent;
                P_index++;
            }
        }
    });
});
