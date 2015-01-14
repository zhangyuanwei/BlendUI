window.onerror = function (msg, url, line) {
    alert("blend.js:\n" +
        "\terror:" + msg + "\n" +
        "\turl:" + url + "\n" +
        "\tline:" + line
    );
};
//require(["src/boost/layerTrigger", "src/boost/layerGroup"], function (layerTrigger, layerGroup) {
require(["src/boost/layerTrigger"], function (layerTrigger) {
    layerTrigger.init();
}, null, true);


//$(function () {
//TODO title 时间
document.addEventListener("blendready", function () {
    return;
    var $headers = $('[data-am-widget="header"]');
    var $titles = $('.am-header-title', $headers);
    if (!$titles.length) return;
    var layerId = lc_bridge.currentLayerId();
    var title = $.trim($titles.text());
    //alert(layerId + ":\"" + title + "\"");
    lc_bridge.layerSetHeader(layerId, JSON.stringify({
        'titleString': title,
        'titleBackgroundColor': "#ffffff",
        'titleForegroundColor': "#ff6600"
    }));
    //return apiFn('currentLayerId', arguments);
    //alert($titles.html());
    //lc_bridge.layerSetHeader();
    //layer.setHeader = function (layerId, options) {

    //layerId = layerId || layer.getCurrentId();
    //return apiFn('layerSetHeader', [
    //    layerId,
    //    JSON.stringify(options)
    //]);
    //};
});
//})

//document.addEventListener("layerShow", function (e) {
//    //console.log("layerShow:" + e.data);
//    alert("layerShow:" + e.data);
//}, false);


//document.addEventListener("layerLoadFinish", function (e) {
//    alert("layerLoadFinish:" + e.data);
//}, false);
