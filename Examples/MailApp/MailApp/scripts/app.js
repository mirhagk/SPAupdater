function Start() {
    ApplyTemplate('navBar', data);
}
function ApplyTemplate(id, data) {
    var template = document.getElementById(id + 'Template');
    var target = document.getElementById(id);
    target.innerHTML = doT.template(template.innerHTML)(data);
}
var data = {
    inboxes: ['Inbox', 'Sent', 'Trash']
};