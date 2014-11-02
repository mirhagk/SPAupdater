var updater;
function Start() {
    RefreshTemplates();
    updater = new Updater();
}
function RefreshTemplates() {
    ApplyTemplate('contentPanel');
    ApplyTemplate('navMenu', data);
    // ApplyTemplate('header', headers);
    ApplyTemplate('mailList', inboxValues);
    SetFocus('Inbox');
}

//function ShowContent() {
//    ApplyTemplate('navMenu', data);
//    // ApplyTemplate('header', headers);
//    ApplyTemplate('mailList', inboxValues);
//    SetFocus
//}

function Messages(id) {
    var template = document.getElementById('mailListTemplate');
    var target = document.getElementById('mailList');
    if (id.text == 'Inbox') {
        target.innerHTML = doT.template(template.innerHTML)(inboxValues);
        SetFocus('Inbox');
    } else if (id.text == 'Spam') {
        target.innerHTML = doT.template(template.innerHTML)(spamValues);
        SetFocus('Spam');
    } else {
        target.innerHTML = doT.template(template.innerHTML)(trashValues);
        SetFocus('Trash');
    }
}

function ApplyTemplate(id, data) {
    var template = document.getElementById(id + 'Template');
    var target = document.getElementById(id);
    target.innerHTML = doT.template(template.innerHTML)(data);
}
var data = {
    inboxes: ['Inbox', 'Spam', 'Trash']
};
// var headers = {
//     headings: ['Date', 'Subject', 'From', 'To']
// };
var inboxValues = {
    emails: [{date: 'Oct 31', subject: 'YHack is Today!', from: 'YHack', to: 'Me'}, 
    {date: 'Oct 30', subject: 'YHack is Tomorrow!', from: 'YHack', to: 'Me'},
    {date: 'Oct 30', subject: 'Your Spam Filter Sucks', from: 'Nigerian Prince', to: 'Me'},
    {date: 'Oct 29', subject: 'Beard Magazine No. 4', from: 'Beard Mag', to: 'Me'},
    {date: 'Oct 29', subject: 'YHack is 2 Days Away!', from: 'YHack', to: 'Me'},
    {date: 'Oct 28', subject: 'Midterm Cancelled', from: 'Professor X', to: 'Me'},
    {date: 'Oct 27', subject: 'Your Offer of Admission', from: 'Yale University', to: 'Me'},
    {date: 'Oct 26', subject: 'YHack is This Week!', from: 'YHack', to: 'Me'}]
};
var spamValues = {
    emails: [{date: 'Oct 29', subject: 'YOU WIN!', from: 'LOTTO69', to: 'Me'}, {date: 'Oct 28', subject: 'Male Enhancement?', from: 'Dr Oz', to: 'Me'}]
};
var trashValues = {
    emails: [{date: 'Oct 27', subject: 'Groupon Deals', from: 'Groupon', to: 'Me'}, {date: 'Oct 26', subject: 'Engineering Ethics TA Position', from: 'Laurie LeBlanc', to: 'Me'}, {date: 'Oct 25', subject: 'YouTube Subscription Updates', from: 'YouTube', to: 'Me'}, {date: 'Oct 25', subject: 'Updated Terms of Service: WE OWN YOUR SOUL', from: 'Facebook', to: 'Me'}]
};



function SetFocus(mailboxName) {
    var targets = document.getElementById('navMenu').getElementsByTagName('p');
    for (var i = 0; i < targets.length; i++) {
        targets[i].style.backgroundColor = "#F3F3F3";
        if (targets[i].parentNode.id == mailboxName)
            targets[i].style.backgroundColor = "#F9F9F9";
    }
}

Util = {};
Util.log = function (x) { console.log('foo'); }
//updater.UpdateComponent({componentType: 1, name:'log', code:'console.log("bar");'})