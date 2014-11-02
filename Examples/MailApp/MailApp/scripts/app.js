var updater;
function Start() {
    RefreshTemplates();
    Messages({ text: 'Inbox' });
    updater = new Updater();
    updater.updatePageNotification = function (numberOfUpdates) {
        ApplyTemplate('notificationBox', { numberOfUpdates: numberOfUpdates });
    }
}
function RefreshTemplates() {
    //ApplyTemplate('about');
    ApplyTemplate('contentPanel');
    ApplyTemplate('navMenu', data);
    // ApplyTemplate('header', headers);
    ApplyTemplate('mailList', inboxValues);
    Messages();
    //SetFocus('Inbox');
}

//function ShowContent() {
//    ApplyTemplate('navMenu', data);
//    // ApplyTemplate('header', headers);
//    ApplyTemplate('mailList', inboxValues);
//    SetFocus
//}
var mailbox;
function Messages(id) {
    mailbox = id && id.text || mailbox;
    var template = document.getElementById('mailListTemplate');
    var target = document.getElementById('mailList');
    if (mailbox == 'Inbox') {
        target.innerHTML = doT.template(template.innerHTML)(inboxValues);
        SetFocus('Inbox');
    } else if (mailbox == 'Spam') {
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
    emails: [{date: 'Oct 31', subject: 'YHack is Today!', from: 'YHack', to: 'Me', message:'Today is finally the day!\nYHack 2014 begins today. What will this do? Let\'s find out.'}, 
    {date: 'Oct 30', subject: 'YHack is Tomorrow!', from: 'YHack', to: 'Me', message:'GET HYPE! YHack is tomorrow!'},
    {date: 'Oct 30', subject: 'Your Spam Filter Sucks', from: 'Nigerian Prince', to: 'Me', message:'GIVE ME YOUR CREDIT CARD INFO AND I WILL GIVE YOU $1,000,000.00 USD THANK YOU'},
    {date: 'Oct 29', subject: 'Beard Magazine No. 4', from: 'Beard Mag', to: 'Me', message:'Inside this issue: Top 10 Sexiest Beards of 2014, How to Groom Your Beard, Filler Content, bacon'},
    {date: 'Oct 29', subject: 'YHack is 2 Days Away!', from: 'YHack', to: 'Me', message:'We\'re getting closer! Are you ready? YOU BETTER BE.'},
    {date: 'Oct 28', subject: 'Midterm Cancelled', from: 'Professor X', to: 'Me', message:'Attention Class, the midterm has been cancelled because you are all incompetent bums. Good job.'},
    {date: 'Oct 27', subject: 'Your Offer of Admission', from: 'Yale University', to: 'Me', message:'Congratulations! You have been accepted to Yale! Just kidding!!!! lol'},
    {date: 'Oct 26', subject: 'YHack is This Week!', from: 'YHack', to: 'Me', message:'Attention Hackers, YHack 2014 is this week! Make sure you have your passport and stuff. Or nah.'}]
};
var spamValues = {
    emails: [{date: 'Oct 29', subject: 'YOU WIN!', from: 'LOTTO69', to: 'Me', message: 'Consgratulaiton friend u have w0n teh lotterey u get 5million dollhairs gg'},
    {date: 'Oct 28', subject: 'Male Enhancement?', from: 'Dr Oz', to: 'Me', message: 'Gain 1-3 inches overnight! Because you need it. Seriously. You\'re never getting anywhere in life with that.'}]
};
var trashValues = {
    emails: [{date: 'Oct 27', subject: 'Groupon Deals', from: 'Groupon', to: 'Me', message: 'DEALS DEALS DEALS DEALS DEALS DEALS GROUPON YEAAAAHHHHHHH! You are getting this email because you subscribed to our emails. To unsubscribe, click here.'},
    {date: 'Oct 26', subject: 'Engineering Ethics TA Position', from: 'Laurie LeBlanc', to: 'Me', message: 'You\'ve never taken this course but would you be interested in TAing for the term? No? Wow, come on. Please? Let me know!'},
    {date: 'Oct 25', subject: 'YouTube Subscription Updates', from: 'YouTube', to: 'Me', message: 'lolcats, lolcats, lolcats, sm0sh, lolcats, ctfxc, br0cup, catz, kitties, kittens, caturday, white girls talking about stuff, tech reviews, Key and Peele'},
    {date: 'Oct 25', subject: 'Updated Terms of Service: WE OWN YOUR SOUL', from: 'Facebook', to: 'Me', message: 'We\'ve updated our Terms of Service and Privacy Policy to reflect new features we\'re testing (starting in the U.S.) to allow you to buy merchandise from some of the most popular names on Twitter, without leaving the Twitter experience.\nThe Terms of Service update introduces terms covering the use of our commerce offerings. The new terms also describe your relationship with merchandise sellers, including their responsibility for order fulfillment, shipping and returns.\nAnd since you\'ll need to provide certain information to make a purchase, such as a credit card number and shipping address, the Privacy Policy update includes new sections on that information. You\'ll also see provisions relating to commerce services that we\'ll be testing in the future, like special offers you can redeem at select stores using your credit card.\nWe\'ve also updated the Privacy Policy to clarify how other parts of our services work, including:\n•   That we may request additional account information to help us prevent spam, fraud or abuse.\n•   The broad audiences that receive public user profile information and public Tweets, including search engines, developers and publishers.\n•   The types of non-private or non-personal information that is shared with others, including reports to advertisers about the performance of their advertising campaigns.\n•   How we collect certain types of information, including location information (such as through IP address or nearby access points), and information when you install another application through Twitter.\n•   That we may share data with our corporate affiliates consistent with our respective privacy policies, for example, if you use your Twitter credentials to login to Vine, our short looping video service, or to provide better ads through MoPub, our mobile-focused advertising exchange.\nWe\'ve always got more exciting product news coming, so keep your eye on the Official Twitter Blog or follow @twitter for the latest. Thanks for using Twitter!\n— The Twitter Team'}]
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