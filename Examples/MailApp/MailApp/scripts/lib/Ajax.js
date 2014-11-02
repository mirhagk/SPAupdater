var Ajax;
(function (Ajax) {
    function Send(url, callback, method, data, sync) {
        var request = new XMLHttpRequest();
        request.open(method, url, sync);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                callback(request.responseText);
            }
        };
        if (method == 'POST') {
            request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        }
        request.send(JSON.stringify(data));
    }
    Ajax.Send = Send;
    function BuildUrl(base, params) {
        var query = [];
        for (var key in params) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
        return base + '?' + query.join('&');
    }
    function Post(url, callback, params, data, sync) {
        this.Send(BuildUrl(url, params), callback, 'POST', data, sync);
    }
    Ajax.Post = Post;
    function Get(url, callback, params, sync) {
        this.Send(BuildUrl(url, params), callback, 'GET', null, sync);
    }
    Ajax.Get = Get;
})(Ajax || (Ajax = {}));
//# sourceMappingURL=Ajax.js.map
