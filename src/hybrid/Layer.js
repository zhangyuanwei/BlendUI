/**
 * @file Layer.js
 * @path hybrid/Layer.js
 * @extends Control
 * @desc Layer类，内含一个web容器，可以放置在手机屏幕的任何位置，动画可自定义
 * @author clouda-team(https://github.com/clouda-team)
 */
define(
    function (require) {
        var blend = require('./blend');
        var lib = require('../common/lib');
        var runtime = require('./runtime');
        var Control = require('./Control');
        var layerApi = runtime.layer;
        // var __time = 0;
        var getBasePath = function (link) {
            var a = document.createElement('a');
            a.href = link;
            return a.href;
        };
        // 注册全局layer事件
        blend.ready(function () {
            // layer注册事件
            try {
                // 如是runtime环境，调用runtime接口 需要删除启动画面
                // window.nuwa_runtime && nuwa_runtime.removeSplashScreen();
                layerApi.on('in', function (event) {
                    var layer = blend.get(event.data);
                    if (layer && layer.onshow) {
                        layer.onshow();
                    }
                });

                layerApi.on('replace', function (event) {
                    var url = event.data;
                    location.replace(url);
                });
            } catch (e) {
                console.log(e.message);
            }
        });

        /**
         * Layer 初始化参数;
         * @constructor
         * @param {Object} options 有创建独立layer所需要的条件
         * @param {string} options.url 页面url;
         * @param {string} [options.dom] 创建的layer内容;
         * @param {string} [options.id] layer实例id
         * @param {string} [options.top] layer距离屏幕top的坐标
         * @param {string} [options.left] layer距离屏幕left的坐标
         * @param {string} [options.width] layer像素宽度，默认全屏
         * @param {string} [options.height] layer像素高度，默认全屏
         * @param {boolean} [options.active] 是否立即激活
         * @param {boolean} [options.reverse] =true 动画是否反向
         * @param {string} [options.fx] "none" 无动画
         * @param {string} [options.fx] "slide" 默认从右往左，出场从左往右
         * @param {string} [options.fx] "pop" 弹出
         * @param {string} [options.fx] "fade" 透明度渐显
         * @param {number} [options.duration] 动画持续时间s
         * @param {string} [options.timingFn] 动画时间线函数@todo
         * @param {string} [options.cover] 是否覆盖效果，默认是推拉效果@todo
         * @param {Function} [options.afterrender] webview容器render成功的回调
         * @param {Function} [options.onload] webview页面onload的回调
         * @param {Function} [options.changeUrl] webview url改变的回调
         * @param {Function} [options.onshow] layer被唤起时会触发此事件
         * @param {Function} [options.onhide] layer被隐藏时会触发此事件
         * @param {boolean} [options.pullToRefresh] 是否支持下拉刷新
         * @param {string} [options.ptrIcon] 下拉时显示的图标。
         * @param {string} [options.ptrText] 下拉时显示的文字。
         * @param {string} [options.ptrColor] 文字颜色@todo
         * @param {Function} [options.ptrFn] 下拉刷新回调@todo
         * @return {Layer} this
         */
        var Layer = function (options) {
            options = options || {};
            if (options.url) {
                options.url = getBasePath(options.url);
            }
            Control.call(this, options);
            // console.info('Time createLayer:' + (__time = +new Date()));
            this._init(options);
            return this;
        };

        // 继承control类;
        lib.inherits(Layer, Control);

        Layer.prototype.constructor = Layer;

        /**
         * 实例初始化,根据传参数自动化实例方法调用, 私有方法;
         * @private
         * @param {Object} options 创建layer的初始化参数
         * @return {Layer} layer实例
         */
        Layer.prototype._init = function (options) {
            var me = this;
            // 处理options值;
            if (!(options.url || options.dom)) {
                throw new Error('Layer必须指定url或者dom内容');;
            }
            this.originalUrl = options.url;
            // 监听事件
            this._initEvent();

            this.render();

            if (options.subLayer) {
                layerApi.setLayout(me.id, {
                    top: me.top,
                    left: me.left,
                    bottom: me.bottom,
                    right: me.right,
                    width: me.width,
                    height: me.height
                });
            }

            options.active && this.in();

            return this;
        };

        // 默认属性
        Layer.prototype.type = 'layer';


        /**
         * loading状态出现的时间
         *
         * @cfg {Number} loadingTime 毫秒ms;
         */
        Layer.prototype.maxLoadingTime = 800;


        /**
         * @cfg {Boolean} autoStopLoading 是否自动停止loading;
         */
        Layer.prototype.autoStopLoading = true;

        /**
         * @cfg {Boolean} fixed;
         */
        Layer.prototype.fixed = false;

        /**
         * @private
         * 事件初始化
         * @return {Layer} this
         */
        Layer.prototype._initEvent = function () {
            var me = this;
            var cancelTime = null;

            /*var clearTime = function(){
                cancelTime&&clearTimeout(cancelTime);
            }*/
            // 下拉刷新回调，建议在相应的document里面触发
            if (me.ptrFn) {
                layerApi.on('layerPullDown', function (event) {
                    me.ptrFn.apply(me, arguments);
                }, me.id, me);
            }
            layerApi.on('layerCreateSuccess', function (event) {
                if (me.autoStopLoading) {
                    cancelTime = setTimeout(function () {
                        me.stopLoading();
                    }, me.maxLoadingTime);
                }

                blend.ready(function (e) {
                    me.pullToRefresh && layerApi.setPullRefresh(me.id, true, {
                        'pullText': me.pullText,
                        'loadingText': me.loadingText,
                        'releaseText': me.releaseText,
                        'pullIcon': me.pullIcon

                    });
                });

                // console.info('Time layerCreateSuccess:' + (new Date() - __time));
                me.afterrender && me.afterrender.apply(me, arguments);
            }, me.id, me);
            layerApi.on('layerLoadFinish', function (event) {
                if (!me.autoStopLoading) {
                    cancelTime = setTimeout(function () {
                        me.stopLoading();
                    }, me.maxLoadingTime);
                }

                me.autoStopLoading && me.stopLoading();
                if (event.url !== me.url) {
                    me.autoStopLoading && me.stopLoading();
                    me.url = event.url;
                    me.changeUrl && me.changeUrl.call(me, event, me.url);
                }
                me.onload && me.onload.apply(me, arguments);
            }, me.id, me);

            layerApi.on('layerPoped', function (event) {
                me.onhide && me.onhide.apply(me, arguments);
                layerApi.fire('out', false, me.id);
            }, me.id, me);

            // 销毁之后撤销绑定
            me.on('afterdistory', function () {
                clearTimeout(cancelTime);
                me.ptrFn && layerApi.off('layerPullDown', 'all', me.id, me);
                layerApi.off('layerCreateSuccess', 'all', me.id, me);
                layerApi.off('layerLoadFinish', 'all', me.id, me);
                layerApi.off('layerPoped', 'all', me.id, me);
            });
            return me;
        };

        /**
         * 创建渲染页面
         * @return {Object} this 当前实例
         */
        Layer.prototype.paint = function () {
            var me = this;

            var fcolor = Math.floor(0xFFFFFF * Math.random());
            var bcolor = 0xFFFFFF ^ fcolor;
            layerApi.prepare(me.id, {
                'parent': me.parent,
                'url': me.url,
                'dom': me.dom,
                'backgroundColor': me.backgroundColor,
                'reusable': me.reusable,
                'loadingIcon': me.loadingIcon,
                'subLayer': me.subLayer,
                'fixed': me.fixed
            });
            return this;
        };

        /**
         * 激活页面
         * @return {Object} this 当前实例
         */
        Layer.prototype.in = function () {
            var me = this;
            Control.prototype.in.apply(me, arguments);
            if (!layerApi.isAvailable(this.id)) {
                me.render();
            }
            layerApi.resume(me.id, {
                reverse: me.reverse,
                fx: me.fx,
                cover: me.cover,
                duration: me.duration,
                timingFn: me.timingFn
            });
            return this;
        };


        /**
         * 当前layer退场，返回上一个Layer
         * @param {string} [toLayerId] 退场后返回的layerId
         * @return {Object} this 当前实例
         */
        Layer.prototype.out = function (toLayerId) {
            Control.prototype.out.apply(this, arguments);
            if (this.subLayer) {
                layerApi.hideSubLayer(this.id);
            } else {
                layerApi.back(toLayerId);
            }
            return this;
        };

        /**
         * 重新刷新页面
         * @param {string} url 刷新页面时所用的url
         * @return {Object} this 当前实例
         */
        Layer.prototype.reload = function (url) {
            if (url) {
                url = getBasePath(url);
                if (url !== this.url) {
                    layerApi.reload(this.id, url);
                }
            }
            return this;
        };

        /**
         * url 替换
         *
         * @param {string} url 刷新页面时所用的url
         * @return {Object} this 当前实例
         */
        Layer.prototype.replace = function (url) {
            url = url ? getBasePath(url) : this.url;
            layerApi.replaceUrl(this.id, url);
            return this;
        };

        /**
         * 停止layer拉动刷新状态
         *
         * @return {Object} this 当前实例
         */
        Layer.prototype.stopPullRefresh = function () {
            layerApi.stopPullRefresh(this.id);
            return this;
        };

        /**
         * 停止loading状态
         * @return {Object} this 当前实例
         */
        Layer.prototype.stopLoading = function () {
            // this.fire("_initEvent");
            layerApi.stopLoading(this.id);
            return this;
        };

        /**
         * 获取layer的当前url
         * @return {Object} this 当前实例
         */
        Layer.prototype.getUrl = function () {
            return layerApi.getUrl(this.id);
        };

        /**
         * 获取layer是否可以history go
         * @return {boolean} canGoBack 是否可以返回
         */
        Layer.prototype.canGoBack = function () {
            return layerApi.canGoBack(this.id);
        };

        /**
         * 清除history堆栈
         * @return {boolean}
         */
        Layer.prototype.clearHistory = function () {
            layerApi.clearHistory(this.id);
            return this;
        };

        /**
         * layer是否是激活状态
         * @return {boolean}
         */
        Layer.prototype.isActive = function () {
            return layerApi.isActive(this.id);
        };

        /**
         * 设置layer的布局
         * @param {Object} options top,left,width,height布局对象
         * @return {Object} native返回值
         */
        Layer.prototype.setLayout = function (options) {
            var me = this;
            [
                'top',
                'left',
                'width',
                'height'
            ].forEach(function (n, i) {
                if (options[n]) {
                    me[n] = options[n];
                } else {
                    options[n] = me[n];
                }
            });
            return layerApi.setLayout(this.id, options);
        };

        /**
         * 销毁此layer
         * @return {Object} this 当前实例
         */
        Layer.prototype.destroy = function () {
            // this.fire("_initEvent");
            Control.prototype.destroy.apply(this, arguments);
            return this;
        };

        /**
         * 得到当前Layer的配置信息
         *
         * @return {Object} 当前Layer的配置信息
         */
        Layer.prototype.getConfig = function () {
            return layerApi.getConfig(this.id);
        };

        // Layer的静态方法

        /*
         * 为layer怎加增加侧边栏,默认为当前layer
         * @parms {string} layerId 要怎加侧边栏的layerId
         * @parms {Object} options 侧边栏的设置值
         * @parms {string} [options.url] 侧边栏url;
         * @parms {string} [options.bgColor] 侧边栏的底层背景;
         * @parms {boolean} [options.opacity] 侧边栏是否透明;
         * @parms {number} options.width 侧边栏宽度
         */
        Layer.addSidebar = function (layerId, options) {
            if (!options) {
                options = layerId;
                layerId = layerApi.getCurrentId();
            }
            options.sliderLayer = true;
            layerApi.prepare(layerId, options);
        };

        // 显示layer上的侧边栏
        Layer.showSidebar = function (layerId) {
            layerId = layerId || layerApi.getCurrentId();
            layerApi.showSlider(layerId);
        };

        // 隐藏layer上的侧边栏
        Layer.hideSidebar = function (layerId) {
            layerId = layerId || layerApi.getCurrentId();
            layerApi.hideSlider(layerId);
        };

        // 隐藏layer上的侧边栏
        Layer.destorySidebar = function (layerId) {
            layerId = layerId || layerApi.getCurrentId();
            layerApi.destroySlider(layerId, options);
        };

        return Layer;
    }
);
