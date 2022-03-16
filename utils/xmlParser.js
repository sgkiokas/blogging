const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const _ = require('lodash');

const H2_TAG = 'h2';
const P_TAG = 'p';
const LOCATION = 'location';
const TEXT = 'text';
const TITLE = 'title';

const fileExtension = '.html';
const parsedTagsList = [H2_TAG, P_TAG];
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

const inputFiles = findFilesInDir('configuration/', fileExtension);

inputFiles.forEach(file => {
    const fileToDOM = new JSDOM(fs.readFileSync(file).toString());

    parsedTagsList.forEach(tag => {
        fileToDOM.window.document.querySelectorAll(tag).forEach(individualEntry => {
            if (tag === H2_TAG) {
                _.set(lunrIndexTemplate, LOCATION, individualEntry.textContent);
                _.set(lunrIndexTemplate, TITLE, individualEntry.getAttribute('id'));
            } else {
                if (individualEntry.getAttribute('data-selector') !== null) {
                    _.set(lunrIndexTemplate, TEXT, individualEntry.textContent);
                }
            }
        })
    });
});
