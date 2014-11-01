import http = require('http');
var io = require('socket.io')(http);
var readline = require('readline');
var esprima = require('esprima');
var jsdiff = require('diff');
var fs = require('fs');
var domCompare = require('dom-compare').compare;
var dom = require('jsdom').jsdom

var port = 1337
http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:44844');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');
    if (req.url.trim()=="/") {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World\n');
    }
}).listen(port);

var sockets = [];
var updateHistory = [];
var currentUpdates = [];

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
loadCommit(null);

io.set('origins', '*:*');
io.on('connection', function (socket) {
    rl.write('a user connected');
    sockets.push(socket);
});
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
                    currentUpdates.push({ updateType: "page update" });
                }
                else {
                    var difference = jsdiff.diffLines(oldData, newData);
                    try {
                        var newCode = esprima.parse(newData, { loc: true, range: true });
                        var functions = findAllFunctions(newCode, null);
                        var changedLines = getChangedLines(difference);
                        rl.write('\n' + JSON.stringify(difference));
                        rl.write('\n' + JSON.stringify(changedLines));
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
                        currentUpdates.push({ updateType: 'page update' });
                    }
                }
            });
        });
    }
    else if (type == "html") {
        fs.readFile(oldFile, 'utf8', (err, oldData) => {
            fs.readFile(newFile, 'utf8', (err2, newData) => {
                if (err || err2) {
                    currentUpdates.push({ updateType: "page update" });
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
                    var compareResults = domCompare(oldDom, newDom);
                    var difference = compareResults.getDifferences();
                    rl.write(JSON.stringify(difference));
                }
            });
        });
    }
    else {
        currentUpdates.push({ updateType: "page update" });
    }
}


function commandResponse(command) {
    switch (command) {
        case "quit":
            rl.close();
            process.exit();
            return;
        case "push":
            io.emit('update page', 'hey, update the page');
            sockets.forEach((s) => { rl.write('sending to client A'); s.emit('update page', ''); });
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
        default:
            break;
    }
    rl.question("Enter a command: ", commandResponse);
}
commandResponse(null);