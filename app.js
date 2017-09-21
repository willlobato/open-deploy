var inquirer = require('inquirer');

const fs = require('fs');
const extract = require('extract-zip');

const DIRECTORY = '/Users/willlobato/Projects/DEPLOY';
const PREFIX_TEMP = '_';

function extractFile(file, destination) {
    return new Promise(function(resolve, reject) {
        extract(file, {dir: destination}, function (err) {
            if(err) reject(err);
            resolve('ok');
        });
    });
}

async function openDeploy(directory, extension) {
    try {
        let files = fs.readdirSync(directory);
        files = files.filter(file => file.indexOf('.' + extension) > 0);
        for(let file of files) {
            let realPath = directory + '/' + file;
            if(!fs.lstatSync(realPath).isDirectory()) {
                let realPathOpen = directory + '/' + PREFIX_TEMP + file;
                if(!fs.existsSync(realPathOpen)) {
                    fs.mkdirSync(realPathOpen);
                    var success = await extractFile(realPath, realPathOpen);
                    if(success) {
                        fs.unlinkSync(realPath);
                        fs.renameSync(realPathOpen, realPath);
                        openDeploy(realPath, 'war');
                    }
                }    
            }
        }
    } catch(e) {
        console.error(e);
    }
}

async function main() {
    openDeploy(DIRECTORY, 'ear');
}

main();