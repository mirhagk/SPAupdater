var updater;
function Start() {
    RefreshTemplates();
    updater = new Updater();
}
function RefreshTemplates() {
    ApplyTemplate('navMenu', data);
    ApplyTemplate('header', headers);
    ApplyTemplate('mailList', inboxValues);
}

function Messages(id) {
    var template = document.getElementById('mailListTemplate');
    var target = document.getElementById('mailList');
    if (id.text == 'Inbox')
        target.innerHTML = doT.template(template.innerHTML)(inboxValues);
    else if (id.text == 'Spam')
        target.innerHTML = doT.template(template.innerHTML)(spamValues);
    else
        target.innerHTML = doT.template(template.innerHTML)(trashValues);
}

function ApplyTemplate(id, data) {
    var template = document.getElementById(id + 'Template');
    var target = document.getElementById(id);
    target.innerHTML = doT.template(template.innerHTML)(data);
}
var data = {
    inboxes: ['Inbox', 'Spam', 'Trash']
};
var headers = {
    headings: ['Date', 'Subject', 'From', 'To']
};
var inboxValues = {
    emails: [{date: 'October 31, 2014', subject: 'YHack Today!', from: 'YHack', to: 'Me'}, {date: 'October 30, 2014', subject: 'YHack Tomorrow!', from: 'YHack', to: 'Me'}]
};
var spamValues = {
    emails: [{date: 'October 31, 2014', subject: 'YOU WIN!', from: 'LOTTO69', to: 'Me'}, {date: 'October 30, 2014', subject: 'Male Enhancement?', from: 'Dr Oz', to: 'Me'}]
};
var trashValues = {
    emails: [{date: 'October 31, 2014', subject: 'Groupon Deals', from: 'Groupon', to: 'Me'}]
};

Util = {};
Util.log = function (x) { console.log('foo'); }
//updater.UpdateComponent({componentType: 1, name:'log', code:'console.log("bar");'})