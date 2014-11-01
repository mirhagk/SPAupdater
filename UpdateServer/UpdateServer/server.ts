import http = require('http');
var readline = require('readline');
var esprima = require('esprima');
var jsdiff = require('diff');
var fs = require('fs')

var port = 1337
http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:44844');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);

var sockets = [];
var updates = [];

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
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
            updates.push({ updateType: 'component update', component: 'utility', name: f[1], code:code });
            break;
    }
}

function detectDifferences(oldFile, newFile, type) {
    if (type == "javascript") {
        fs.readFile(oldFile, 'utf8', (err, oldData) => {
            fs.readFile(newFile, 'utf8', (err2, newData) => {
                if (err || err2) {
                    updates.push(['page update']);
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
                        updates.push(['page update']);
                    }
                }
            });
        });
    }
    else {
        updates.push(["page update"]);
    }
}


function commandResponse(command) {
    switch (command) {
        case "quit":
            rl.close();
            process.exit();
            return;
        case "push":
            break;
        case "detect":
            detectDifferences("tests/util.js.old", "tests/util.js", "javascript");
            break;
        case "outputChanges":
            rl.write('Changes:');
            updates.forEach((x) => rl.write(JSON.stringify(x)));
            break;
        default:
            break;
    }
    rl.question("Enter a command: ", commandResponse);
}
commandResponse(null);