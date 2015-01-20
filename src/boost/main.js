window.onerror = function (msg, url, line) {
    alert("blend.js:\n" +
        "\terror:" + msg + "\n" +
        "\turl:" + url + "\n" +
        "\tline:" + line
    );
};

require(["src/boost/layerTrigger"], function (layerTrigger) {
    layerTrigger.init();
}, null, true);
