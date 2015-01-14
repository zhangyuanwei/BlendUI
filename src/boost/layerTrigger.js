define(["src/boost/sizzle", "src/boost/meta"], function (Sizzle, meta) {
    //define(["src/boost/zepto", "src/boost/meta"], function ($, meta) {
    "use strict";
    var LAYER_SELECTOR = "blend-layer-selector";
    var BACK_SELECTOR = "blend-back-selector";
    var PRELOAD_SELECTOR = "blend-preload-selector";

    var LAYER_CLASS = "blend-layer";
    var BACK_CLASS = "blend-back";
    var PRELOAD_CLASS = "blend-preload";

    function log() {
        var args = [].join.call(arguments, " ");
        //console.log("##[" + new Date() + "] Clouda: " + args + " ##");
        Blend.ui.fire("log", 0, args);
    }

    function findParentByTagName(element, tagName) {
        tagName = tagName.toUpperCase();
        while (element && element.nodeName != tagName) {
            element = element.parentNode;
        }
        return element;
    }

    function isDefaultPrevented(src) {
        return src.defaultPrevented ? src.defaultPrevented() : src.returnValue === false;
    }

    function getURL(url) {
        var elm = document.createElement("A");
        elm.href = url;
        return elm.href;
    }

    function openInLayer(options) {
        Blend.ui.fire("open", "0", options);
    }

    function layerBack() {
        //TODO 判断页面 history ???
        Blend.ui.fire("back", "0");
    }

    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

    function trim(text) {
        return text == null ?
            "" :
            (text + "").replace(rtrim, "");
    }

    var rclass = /\t\r\n\f/g;

    function hasClass(element, selector) {
        var className = " " + selector + " ";
        return (" " + element.className + " ").replace(rclass, " ").indexOf(className) >= 0;
    }

    function isLayerTrigger(element) {
        var selector = meta.get(LAYER_SELECTOR);
        //selector = ".am-navbar a";
        if (hasClass(element, LAYER_CLASS) || (selector && Sizzle.matchesSelector(element, selector))) {
            //if (hasClass(element, LAYER_CLASS) || (selector && $(element).is(selector))) {
            return true;
        }
        return false;
    }

    function isBackTrigger(element) {
        var selector = meta.get(BACK_SELECTOR);
        if (hasClass(element, BACK_CLASS) || (selector && Sizzle.matchesSelector(element, selector))) {
            //if (hasClass(element, BACK_CLASS) || (selector && $(element).is(selector))) {
            return true;
        }
        return false;
    }

    function isPreloadLayer(element) {
        var selector = meta.get(PRELOAD_SELECTOR);
        if (hasClass(element, PRELOAD_CLASS) || (selector && Sizzle.matchesSelector(element, selector))) {
            //if (hasClass(element, PRELOAD_CLASS) || (selector && $(element).is(selector))) {
            return true;
        }
        return false;
    }

    function preventDefault(event) {
        try {
            event.preventDefault();
            event.returnValue = false;
        } catch (e) {}
    }

    //var starTime = 0;

    //function layerTapHandler(event) {
    //    log("layerTapHandler");
    //    //starTime = +new Date();
    //    __layerTriggerHandler(event);
    //    //alert("tap");
    //    return false;
    //}

    //function layerTriggerHandler(event) {
    //    log("layerTriggerHandler");
    //    preventDefault(event);
    //}

    function layerTriggerHandler(event) {
        //alert("click:" + ((+new Date()) - starTime) + "ms");
        //log("layerTriggerHandler");

        var target;
        var href;
        var title;
        var options;

        if (isDefaultPrevented(event)) {
            //log("isDefaultPrevented");
            return;
        }

        target = findParentByTagName(event.target, "A");

        if (!target || !target.hasAttribute("href")) {
            return;
        }

        href = trim(target.getAttribute("href"));

        //判断是否是回退的触发器
        if (isBackTrigger(target)) {
            //log("isBackTrigger");
            preventDefault(event);
            layerBack();
        }

        //是否是Layer触发按键
        else if (isLayerTrigger(target)) {
            //log("isLayerTrigger");
            preventDefault(event);
            options = {
                //url: href
                url: target.href,
                preload: false
            };

            if (isPreloadLayer(target)) {
                //log("isPreloadLayer");
                options.preload = true;
            }

            if (target.hasAttribute("data-blend-title")) {
                options.titleString = target.getAttribute("data-blend-title");
                //if (target.hasAttribute("data-blend-title-bg")) {
                //    options.titleBackgroundColor = target.getAttribute("data-blend-title-bg");
                //}
                //if (target.hasAttribute("data-blend-title-fg")) {
                //    options.titleForegroundColor = target.getAttribute("data-blend-title-fg");
                //}
            }
            //log("openInLayer");
            openInLayer(options);
        }
    }

    //function setupLayerOptions(e) {
    //    //data-am-widget="header"
    //}

    var anchors;

    function setupPreloadLayers() {
        var index;
        var count;
        var element;
        var urls = [];
        var selector = meta.get(PRELOAD_SELECTOR);

        //log("[" + selector + "]", "[.am-navbar a]");
        //log(selector === ".am-navbar a");
        //log(encodeURIComponent(selector));

        anchors = document.getElementsByTagName("A");

        count = anchors.length;
        //log("setupPreloadLayers:", count);
        for (index = 0; index < count; index++) {
            element = anchors[index];
            if (!element || !element.hasAttribute("href")) {
                continue;
            }
            if (isPreloadLayer(element)) {
                urls.push(element.href);
            }
        }

        Blend.ui.fire("cache", "0", {
            urls: urls
        });
    }

    var inited = false;

    function init() {
        if (inited) {
            return;
        }
        inited = true;

        document.addEventListener("blendready", setupPreloadLayers, false);
        //document.addEventListener("blendready", setupLayerOptions, false);
        document.addEventListener("click", layerTriggerHandler, false);
        //$(document).on("tap", layerTapHandler);
        log(Blend.ui.getLayerId(), "inited");
    }

    return {
        init: init
    };
});
