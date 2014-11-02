import http = require('http');
var readline = require('readline');
var esprima = require('esprima');
var jsdiff = require('diff');
var fs = require('fs');
var domCompare = require('dom-compare').compare;
var dom = require('jsdom').jsdom
var urlParse = require('url').parse;
var mkpath = require('mkpath');
var requestClient = require('request');
var pathLib = require('path');

if (!(<any>String.prototype).startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
            return this.lastIndexOf(searchString, position) === position;
        }
    });
}

var config = {
    srcRoutePath: 'Examples/MailApp/MailApp/', //The root path of the source code. Anything altered above this is ignored
    
};

var port = 1337
http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:44844');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');

    var parsedUrl = urlParse(req.url, true);
    var path = parsedUrl.pathname;
    var query = parsedUrl.query;

    if (path == "/") {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World\n');
    }
    else if (path == "/api/getchanges") {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        var lastHistoryIndex = -1;
        if (query.lastCommit != null)
            for (var i = 0; i < updateHistory.length; i++) {
                if (updateHistory[i].Commit.toString().startsWith(query.lastCommit)) {
                    lastHistoryIndex = i;
                }
            }
        var updatesToDo = updateHistory.slice(lastHistoryIndex + 1);
        res.end(JSON.stringify(updatesToDo));
    }
    else if (path == "/api/notifypull") {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) {
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            var data = JSON.parse(body);
            rl.write('\nLoading new commit');
            loadCommit(data.head_commit.id);
            rl.write('\nLoading ' + data.commits.length + ' commits');
            data.commits.forEach((commit) => {
                rl.write('\nLoading commit');
                var commitUrl = commit.url.replace('github', 'raw.githubusercontent').replace('commit/', '') + '/';
                var previousCommitUrl = commitUrl;
                if (commit.added.length > 0) {
                    rl.write('\nAdded files');
                    currentUpdates.push({ updateType: 'page update', debug: 'Added file' });
                }
                commit.modified.forEach((file) => {
                    rl.write('\nModified file');
                    if (file.toLowerCase().startsWith(config.srcRoutePath.toLowerCase())) {
                        download(commitUrl + file, 'temp/' + file, () => {
                            download(previousCommitUrl, 'temp/' + file + '.old', () => {
                                rl.write('\nFile: ' + file + '\t, Extension: ' + pathLib.extname(file));
                                var type = extensionToType(pathLib.extname(file));
                                detectDifferences('temp/' + file + '.old', 'temp/' + file, type);
                                rl.write('\ndownloaded ' + file);
                            });
                        });
                    }
                });
            });
            // use POST

        });
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Received, thanks github :) BTW can I have a job?');
    }
    else if (path == '/api/latestcommit') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify({ Commit: updateHistory[updateHistory.length - 1].Commit }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("The resource you're looking for is unavailable");
    }
}).listen(port);
var download = function (url, dest, cb) {
    mkpath(pathLib.dirname(dest), () => {
        var file = fs.createWriteStream(dest);
        file.on('finish', () => {
            file.close(cb);
        });
        requestClient(url).pipe(file);
    });
}

var sockets = [];
var updateHistory = [];
var currentUpdates = [];

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
loadCommit('00000');


function extensionToType(extension) {
    switch (extension) {
        case ".js":
            return "javascript";
        case ".html":
            return "html";
        default:
            return "unknown";
    }
}
function findAllFunctions(parseTree, parent) {
    if (parseTree == null) return [];
    parseTree.parent = parent;
    var functions = [];
    if (parseTree.type == "FunctionDeclaration") {
        functions.push([,parseTree.id.name,parseTree.range,parseTree.loc]);
    }
    if (parseTree.type == "FunctionExpression") {
        var variable = parseTree.parent.expression.left;
        functions.push([variable.object.name, variable.property.name, parseTree.range, parseTree.loc]);
    }
    var thisNode = parseTree;
    if (parseTree.expression) {
        functions = functions
            .concat(findAllFunctions(parseTree.expression.left, parseTree))
            .concat(findAllFunctions(parseTree.expression.right, parseTree));
    }
    if (parseTree.body) {
        if (parseTree.body[0]) {//then it's an array
            for (var i = 0; i < parseTree.body.length; i++) {
                functions = functions.concat(findAllFunctions(parseTree.body[i], thisNode));
            }
        }
        else {
            functions = functions.concat(findAllFunctions(parseTree.body,thisNode));
        }
    }
    return functions;
}
function getChangedLines(diff) {
    var line = 0;
    var changedSections = [];
    for (var i = 0; i < diff.length; i++) {
        var curLine = line + (diff[i].value.split('\n').length - 1);
        if (diff[i].added) {
            changedSections.push([line+1, curLine+1]);
        }
        else if (diff[i].removed) {
            //do nothing
        }
        else
            line = curLine;
    }
    return changedSections;
}
function stageUpdate(f,code) {
    switch (f[0]) {
        case "Util":
            currentUpdates.push({ updateType: 'component update', component: 'utility', name: f[1], code:code });
            break;
        case "Controller":
            currentUpdates.push({ updateType: 'component update', component: 'controller', name: f[1], code: code });
            break;
        default:
            currentUpdates.push({ updateType: 'component update', component: f[0], name: f[1], code: code });
            break;
    }
}

function getTemplates(document) {
    return Array.prototype.slice.call(document.querySelectorAll('script[type*=template]'));    
}

function loadCommit(commitHash) {
    var newUpdate = { Commit: commitHash, Updates: [] };
    updateHistory.push(newUpdate);
    currentUpdates = newUpdate.Updates;
}
function detectDifferences(oldFile, newFile, type) {
    if (type == "javascript") {
        fs.readFile(oldFile, 'utf8', (err, oldData) => {
            fs.readFile(newFile, 'utf8', (err2, newData) => {
                if (err || err2) {
                    currentUpdates.push({ updateType: "page update", debug: err || err2 });
                }
                else {
                    var difference = jsdiff.diffLines(oldData, newData);
                    try {
                        var newCode = esprima.parse(newData, { loc: true, range: true });
                        var functions = findAllFunctions(newCode, null);
                        var changedLines = getChangedLines(difference);
                        functions = functions.filter((f) => {
                            return changedLines.some(cl=> cl[0] <= f[3].end.line && cl[1] >= f[3].start.line);
                        });
                        functions.forEach((f) => {
                            rl.write('\n' + JSON.stringify(f));
                            var code = newData.slice(f[2][0], f[2][1]);
                            stageUpdate(f,code);
                        });
                    }
                    catch (ex) {
                        currentUpdates.push({ updateType: 'page update', debug: ex });
                    }
                }
            });
        });
    }
    else if (type == "html") {
        fs.readFile(oldFile, 'utf8', (err, oldData) => {
            fs.readFile(newFile, 'utf8', (err2, newData) => {
                if (err || err2) {
                    currentUpdates.push({ updateType: "page update", debug: err || err2 });
                }
                else {
                    var oldDom = dom(oldData);
                    var newDom = dom(newData);
                    var oldTemplates = getTemplates(oldDom);
                    var newTemplates = getTemplates(newDom);
                    newTemplates.forEach(nt=> {
                        var matchOldTemplate = oldTemplates.filter(ot=> nt.id == ot.id)[0];
                        if (matchOldTemplate) {
                            if (matchOldTemplate.innerHTML.trim() != nt.innerHTML.trim()) {
                                currentUpdates.push({ updateType: 'component update', component: 'view', name: nt.id, code: nt.innerHTML});
                            }
                        }
                        else
                            currentUpdates.push({ updateType: 'component update', component: 'view', name: nt.id, code: nt.innerHTML, added: true });
                    });
                }
            });
        });
    }
    else {
        currentUpdates.push({ updateType: "page update", debug: 'Unknown type '+type });
    }
}


function commandResponse(command) {
    switch (command) {
        case "quit":
            rl.close();
            process.exit();
            return;
        case "push":
            sockets.forEach((s) => { rl.write('sending to client A'); });
            break;
        case "detect":
            detectDifferences("tests/util.js.old", "tests/util.js", "javascript");
            break;
        case "detectHtml":
            detectDifferences("tests/test.html.old", "tests/test.html", "html");
            break;
        case "outputChanges":
            rl.write('Changes:');
            currentUpdates.forEach((x) => rl.write(JSON.stringify(x)));
            break;
        case "outputChangesShort":
            rl.write('Changes:');
            currentUpdates.map((x) => x.updateType + ":" + x.name).forEach(x=> {
                rl.write(x);
            });
            break;
        default:
            break;
    }
    rl.question("Enter a command: ", commandResponse);
}
commandResponse(null);