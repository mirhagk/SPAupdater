function Start() {
    ApplyTemplate('navMenu', data);
    ApplyTemplate('header', headers);
    ApplyTemplate('mailList', jsonValues);
    var updater = new Updater();
    updater.RegisterWebSocket();
}
function ApplyTemplate(id, data) {
    var template = document.getElementById(id + 'Template');
    var target = document.getElementById(id);
    target.innerHTML = doT.template(template.innerHTML)(data);
}
var data = {
    inboxes: ['Inbox', 'Sent', 'Trash']
};
var headers = {
    headings: ['Date', 'Subject', 'From', 'To']
};
var jsonValues = {
    emails: [{date: 'October 31, 2014', subject: 'YHack Today!', from: 'YHack', to: 'Me'}, {date: 'October 30, 2014', subject: 'YHack Tomorrow!', from: 'YHack', to: 'Me'}]
};