const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const xmlTagIdentifier = '/(<.[^(><.)]+>)/';
const fileExtension = '.html';
const parsedTagsList = ['h2'];
const lunrIndexTemplate = {
    location: 'h2',
    text: '',
    title: ''
};

const inverse = (input) => {
    let invertedObject = {};

    for(let key in input) {
        invertedObject[input[key]] = key;
    }

    return invertedObject;
}

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
   const content = fs.readFileSync(file).toString();
   parsedTagsList.forEach(tag => {
    const filter = new RegExp(`<${tag}(.*?)>(.*?)<\\/${tag}>`, 'g');
    const tagContent = content.match(filter).map(text => {
        return text.replace(new RegExp(`<\/?${tag}(.*?)>`, 'g'), '')
    });

    const searchIndexEntry = _.set(lunrIndexTemplate, inverse(lunrIndexTemplate)[tag], tagContent[0]);
   });
});
