const inquirer = require('inquirer');
const fs       = require('fs');
const extract  = require('extract-zip');
var CLI        = require('clui');
var Spinner  = CLI.Spinner;

const DIRECTORY = '/Users/willlobato/Projects/DEPLOY';
const PREFIX_TEMP = '_';
const ALL_PACKAGES = 'ALL PACKAGES';
const TYPE_PACKAGE = {
    EAR: 'ear',
    WAR: 'war'
}

function extractFile(file, destination) {
    return new Promise(function(resolve, reject) {
        extract(file, {dir: destination}, function (err) {
            if(err) reject(err);
            resolve('ok');
        });
    });
}

function listPackage(directory, extension) {
    let files = fs.readdirSync(directory);
    files = files.filter(file => file.indexOf('.' + extension) > 0);
    return files;
}

function getFilesToProcess(directory, extension, parameter) {
    let files = [];
    if(parameter == ALL_PACKAGES) {
        files = listPackage(directory, extension);
    } else {
        files = [parameter];
    }
    return files;
}

async function openPackage(directory, extension, status, parameter = ALL_PACKAGES) {
    try {
        let files = getFilesToProcess(directory, extension, parameter);
        for(let file of files) {
            let realPath = directory + '/' + file;
            if(!fs.lstatSync(realPath).isDirectory()) {
                let realPathOpen = directory + '/' + PREFIX_TEMP + file;
                if(!fs.existsSync(realPathOpen)) {
                    fs.mkdirSync(realPathOpen);
                    status.message(`Extracting ${file} ...`);
                    var success = await extractFile(realPath, realPathOpen);
                    if(success) {
                        fs.unlinkSync(realPath);
                        fs.renameSync(realPathOpen, realPath);
                        openPackage(realPath, TYPE_PACKAGE.WAR, status);
                    }
                }    
            }
        }
        status.stop();
    } catch(e) {
        status.stop();
        console.error(e);
    }
}

async function main() {
    let question = {
        type: 'list',
        name: 'file',
        message: 'Which files do you want to open the packages?',
        default: ALL_PACKAGES,
        choices: [ALL_PACKAGES],
    };

    let packages = listPackage(DIRECTORY, 'ear');

    question.choices = question.choices.concat(packages);

    inquirer.prompt(question)
    .then(function(answer) {
        let status = new Spinner('Iniciando', ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
        status.start();
        openPackage(DIRECTORY, 'ear', status, answer.file);
    });

}

main();