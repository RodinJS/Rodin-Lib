const ajax = {};
ajax.x = function () {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {
        }
    }
    return xhr;
};

ajax.send = function (url, callback, method, data, async, responseType) {
    if (async === undefined) {
        async = true;
    }
    var x = ajax.x();
    if (responseType) {
        x.responseType = responseType;
    }
    x.open(method, url, async);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            if (responseType === 'arraybuffer') {
                callback(x.response);
            } else {
                callback(x.responseText);
            }
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    //x.setRequestHeader('Access-Control-Allow-Origin', '*');
    x.send(data)
};

ajax.get = function (url, data, callback, async, responseType) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async, responseType)
};

ajax.post = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), async)
};

/**
 * Load obj file with material (.mtl) and textures (if exist on material)
 * @param URL {string} absolute or relative path for .obj file
 * @param callback {Function} callback function that receives mesh as param.
 */
export const loadFile = (URL, data, callback, method = "post") => {

    if (method.toLowerCase() === "get") {
        ajax.get(URL, data, callback, true)
    } else if (method.toLowerCase() === "post") {
        ajax.post(URL, data, callback, true)
    } else if (method.toLowerCase() === "arraybuffer") {
        ajax.get(URL, data, callback, true, 'arraybuffer');
    }

};
