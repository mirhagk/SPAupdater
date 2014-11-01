module Ajax {
    export function Send(url, callback, method, data, sync) {
        var request = new XMLHttpRequest();
        request.open(method, url, sync);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                callback(request.responseText)
            }
        };
        if (method == 'POST') {
            request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        }
        request.send(JSON.stringify(data));

    }
    function BuildUrl(base: string, params?: any[]): string {
        var query = [];
        for (var key in params) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
        return base + '?' + query.join('&');
    }
    export function Post(url, callback, params?, data?, sync?) {
        this.Send(BuildUrl(url, params), callback, 'POST', data, sync);
    }
    export function Get(url, callback, params?, sync?) {
        this.Send(BuildUrl(url, params), callback, 'GET', null, sync)
    }
} 