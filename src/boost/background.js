document.write('<script src="http://weinre123.duapp.com/target/target-script-min.js#background"><\/script>');
window.onerror = function (msg, url, line) {
    alert("background.js:\n" +
        "\terror:" + msg + "\n" +
        "\turl:" + url + "\n" +
        "\tline:" + line
    );
};
//Blend.ui.ready(function (blend) {
document.addEventListener("blendready", function () {
    "use strict";

    function log() {
        //return;
        var args = [].join.call(arguments, " ");
        console.log("##[" + (+new Date()) + "] Clouda: " + args + " ##");
        //alert("Clouda: " + args + " ##");
    }

    var id = 0;
    var ID_PREFIX = "__id_";

    function getId() {
        var newId = ID_PREFIX + ++id;
        return newId;
    }

    var cacheMap = {};

    function cache(url, id) {
        var layer;
        if (!cacheMap.hasOwnProperty(url)) {
            layer = new Blend.ui.Layer({
                id: id || getId(),
                url: url,
                fx: "none",
                duration: 0,
                active: false
            });
            cacheMap[url] = layer;
            //layer.paint();
        }
        return cacheMap[url];
    }

    //缓存页面
    Blend.ui.on("cache", function (e) {
        //log("cache(" + JSON.stringify(e.data, null, 2) + ")");
        log("cache:" + JSON.stringify(e.data));
        var refid = e.detail;
        var options = e.data;
        var urls = options.urls;

        var count;
        var index;
        var url;
        var layer;

        count = urls.length;
        for (index = 0; index < count; index++) {
            url = urls[index];
            cache(url);
        }
    });

    var loading = false;
    //点击跳转
    Blend.ui.on("open", function (e) {
        //log("open(" + JSON.stringify(e.data, null, 2) + ")");
        log("open:" + JSON.stringify(e.data));
        if (loading) {
            return;
        }
        var refid = e.detail;
        var data = e.data;
        var options;
        var layer;
        if (data.preload && cacheMap.hasOwnProperty(data.url)) {
            layer = cacheMap[data.url];
        } else {
            options = {
                id: getId(),
                titleString: data.titleString,
                parent: refid,
                url: data.url,
                active: false,
                duration: 300
            };
            layer = new Blend.ui.Layer(options);
            if (data.preload) {
                cacheMap[data.url] = layer;
            }
        }
        layer.in();
    });

    //回退到上层页面
    Blend.ui.on("back", function (e) {
        //log("back(" + JSON.stringify(e.data, null, 2) + ")");
        log("back:" + JSON.stringify(e.data));
        var refid = e.detail;
        var options = e.data;
        Blend.ui.layerBack();
    });

    Blend.ui.on("log", function (e) {
        log(e.data);
    });

    function getURL(url) {
        var elm = document.createElement("A");
        elm.href = url;
        return elm.href;
    }

    var env = Blend.ui.getEnv();
    var APP_URL = env.APP_URL;
    //APP_URL = "testcase.html?" + +new Date();
    var indexLayer = cache(getURL(APP_URL), "0");
    indexLayer.in();
}, false);
//});
