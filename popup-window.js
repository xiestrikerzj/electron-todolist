/**
 * Created by xieyong on 2016/9/6.
 * 组件说明：弹窗组件
 * 本组件提供两个接口，popup（function）和PopupWindow（Class）
 * 其中前者是一个公共弹窗对象的方法，用于默认配置的窗口弹出，如果想自定义窗口，请用PopupWindow类重新申明一个弹窗对象，具体见用例。
 * 用例：
 *    require(['module/popupWindow'], function (popupWindow) {
 *        var popupWindowConf = { // 如果想用默认的弹窗对象，此步骤可以跳过
 *            filter:{ // 必填
 *                container:".MCUBE_MOD_ID_XXX" // 弹窗元素父容器筛选，用于指定弹窗元素在文档流中的放置位置，建议为".MCUBE_MOD_ID_XXX"
 *            },
 *            closeTimer: 0,  // 定时自动关闭弹窗，单位毫秒，如果值为0则不自动关闭；如果弹窗已设置自动关闭，则用户无法手动将其关闭
 *            isFadeIn: false,  // 弹窗以渐入形式弹出
 *            isShowCloseBtn: false,  // 弹窗显示关闭按钮，如果值为true，则用户只有在点击关闭按钮或弹窗外围时才可关闭弹窗
 *            isUnclosable: false, // 不可关闭，如果想要本次弹窗不可关闭，则将该字段设为true，此时包括自动关闭和关闭按钮在内的所有关闭方法都将失效
 *            popupCallback: function(){} // 弹窗成功回调，将在弹窗成功时执行
 *            style: {  // 弹窗元素样式，会覆盖默认样式
 *                alertContainer: {  // 弹窗总容器样式
 *                    'width': '300px' // css属性名：属性值  注意：属性值需为字符串
 *                },
 *                alertBox: {...},  // 弹窗内容容器样式，同上
 *                alertCloseBtn: {...},  // 关闭按钮样式，同上
 *            }
 *        }
 *        var myPopupWindow = new popupWindow.PopupWindow(popupWindowConf);  // 新建一个弹窗对象，在需要自定义弹窗时使用该方法；也可以不新建，此时将默认使用公共弹窗对象的配置；
 *        (myPopupWindow || popupWindow).popup(showHtml, thisPopupConf);  // 显示内容方法，两个参数，第一个是用于展示的html内容，第二个是本次弹窗的自定义配置，如果需要在某一次弹窗时进行额外设置，或覆盖默认配置，可以传入此参数，格式和初始化时的配置格式一致；
 *    }
 *
 * 注意点：
 * 一个弹窗对象一次只能弹出一个内容，再弹出新内容前，会强制将老的内容关闭，也就是说，后弹出的内容将替换先弹出的内容,
 * 所以在使用弹窗公共对象popupWindow而非通过新建对象的方式弹出内容时，需要多加注意，因为这样有可能会和别的以同样方式弹出内容的模块产生冲突，或与自身别的弹窗内容产生冲突，
 * 假设有一个以上的模块都引用了本组件，并都用公共弹窗对象弹出内容，这时，你弹出的内容，有可能被其他模块将要弹出的内容替换，
 * 建议：
 * 1、在不能确定页面中只有自己的模块用到这个组件的情况下，建议新建一个私用的弹窗对象；
 * 2、如果在你的模块中，想要两个弹窗内容同时存在，可以创建多个弹窗对象，同时设置适合的样式，把他们从视觉上区别开来。
 */

define('module/popupWindow', ['base/MoGu'], function (MoGu) {

    var PopupWindow = function (config) {
        var self = this;

        // 公共变量
        self.Common = {

            // 是否是web端
            isWebPage: navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i),
            style: {},
        };

        // 可配置项
        self.Conf = {
            closeTimer: 0, // 自动关闭弹窗延时，如果值为0则不自动关闭
            isFadeIn: false, // 弹窗以渐变形式弹出
            isShowCloseBtn: false, // 显示关闭按钮，如果值为true，则用户只有在点击关闭按钮或弹窗外层时才可关闭弹窗
            isUnclosable: false, // 不可关闭，如果想要本次弹窗不可关闭，则将改字段设为true
            filter: {
                body: 'body',
                container: 'body',
                //alertContainer: ".alertContainer",
                //alertContainerMask: ".alertContainerMask",
                //alertBox: ".alertBox",
                //alertCloseBtn: '.alertCloseBtn',
                //popupWindowStyle: '.popupWindowStyle',
            },
            html: {
                alertContainer: function () {
                    return [
                        '<div class="alertContainer" style="' + self.Common.style.alertContainer + '">',
                        '</div>',
                    ].join('');
                },
                alertContainerMask: function () {
                    return [
                        '<div class="alertContainerMask" style="display: table-cell;vertical-align: middle;">',
                        '</div>',
                    ].join('');
                },
                alertBox: function () {
                    return [
                        '<div class="alertBox" style="' + self.Common.style.alertBox + '">',
                        '</div>',
                    ].join('');
                },
                alertCloseBtn: function (content) {
                    return [
                        '<div class="alertCloseBtn" style="' + self.Common.style.alertCloseBtn + '">',
                        (typeof  content === "string") ? content : '×',
                        '</div>'
                    ].join('');
                }
            },
            // 默认css样式
            style: {
                alertContainer: $.extend(self.Common.isWebPage ? { // h5 css
                    'background': 'rgba(1,1,1,0);',
                } : { // pc css
                    'background': self.Common.is_ie_old ? ' rgba(1,1,1,0);' : 'rgba(1,1,1,.5);',
                }, { // common css
                    'position': self.Common.is_ie_old ? 'absolute;' : 'fixed;',
                    'top': self.Common.is_ie_old ? ($(window).scrollTop() - $(self.Conf.filter.body).offset().top) + 'px;' : '0px;',
                    'left': self.Common.is_ie_old ? -($(self.Conf.filter.body).offset().left) + 'px;' : '0px;',
                    'width': '100%;',
                    'height': '100%;',
                    'z-index': ' 99999;',
                    'display': 'none;'
                }),
                alertBox: $.extend(self.Common.isWebPage ? {
                    'font-size': ' .5rem;',
                    color: 'white;',
                    'background-color': 'rgba(1,1,1,.8);',
                    'width': ' 6.6rem;',
                    'padding': ' .2rem;',
                    'border-radius': ' 0.08rem;',
                } : {
                    'font-size': '14px',
                    'background-color': 'white',
                    'width': '200px;',
                    'padding': '50px',
                }, {
                    'overflow': 'hidden;',
                    'margin': '0 auto',
                    'position': ' relative;',
                    'text-align': 'center',
                }),
                alertCloseBtn: $.extend(self.Common.isWebPage ? {
                    'right': ' .2rem;',
                } : {
                    'cursor': 'pointer',
                    'right': '4px',
                }, {
                    'top': ' 0;',
                    'position': ' absolute;',
                })
            }
        };

        self.init(config);
    };

    PopupWindow.prototype.init = function (config) {
        var self = this;

        config && (self.Conf = $.extend(true, self.Conf, config));

        // 初始化公共dom元素
        self.initCommonDom();

        // 把容器放入页面
        self.putPopupWindowIntoPage();

        self.closeEventListenOn();

        //self.windowResizeListener();
    };

    PopupWindow.prototype.putPopupWindowIntoPage = function () {
        var self = this;
        var _$ = self.Common;

        // 容器默认样式
        $.map(self.Conf.style, function (item, key) {
            self.Common.style[key] = self.cssObj2string(item);
        });

        // 把容器放入页面
        //self.Common.$alertContainer.remove && self.Common.$alertContainer.remove(); // 如果弹窗容器已存在，移除该容器
        _$.$alertContainer = $(self.Conf.html.alertContainer());
        _$.$alertContainerMask = $(self.Conf.html.alertContainerMask());
        _$.$alertBox = $(self.Conf.html.alertBox());
        _$.$alertCloseBtn = $(self.Conf.html.alertCloseBtn());

        _$.$alertContainer.append(_$.$alertContainerMask);
        _$.$alertContainerMask.append(_$.$alertBox);
        _$.$container.append(_$.$alertContainer);

        self.initCommonDom();
    };

    PopupWindow.prototype.cssObj2string = function (cssObj) {
        return JSON.stringify(cssObj).replace(/":"/g, ':').replace(/","/g, ';').replace(/({|}|")/g, '');
    };

// 初始化公共dom元素
    PopupWindow.prototype.initCommonDom = function () {
        var self = this;
        $.map(self.Conf.filter, function (item, key) {
            if (self.Common.$container && item !== self.Conf.filter.container) {
                self.Common['$' + key] = self.Common.$container.find(item);
            } else {
                self.Common['$' + key] = $(item);
            }
        });
    };

// 弹窗关闭按钮点击事件监听
    PopupWindow.prototype.closeEventListenOn = function () {
        var self = this;
        var $alertContainer = self.Common.$alertContainer;
        //self.Common.$container.off('click', self.Conf.filter.alertContainer).on('click', self.Conf.filter.alertContainer, function (e) {
        ($alertContainer.length > 0) && $alertContainer.off('click').on('click', function (e) {
            e.stopPropagation();
            var $self = $(e.target), isShowCloseBtn = $(this).find(self.Common.$alertCloseBtn).length > 0;

            // 如果有关闭按钮，且点击的元素不是关闭按钮或弹窗主容器的话，则不关闭弹窗
            //if (isShowCloseBtn === true && !($self.hasClass('alertContainer') || $self.hasClass('alertContainerMask')) && !$self.hasClass('alertCloseBtn')) return;
            if (isShowCloseBtn === true && !$self.hasClass('alertCloseBtn')) return;

            self.closeWindow();
        });
    };

    PopupWindow.prototype.closeEventListenOff = function () {
        var self = this;
        //self.Common.$container.off('click', self.Conf.filter.alertContainer);
        var $alertContainer = self.Common.$alertContainer;
        ($alertContainer.length > 0) && $alertContainer.off('click');
    };

// 弹窗
    PopupWindow.prototype.popup = function (content, config) {
        var self = this;
        self.Common.closeTimer && clearTimeout(self.Common.closeTimer);
        config = $.extend(true, {}, self.Conf, config);

        // 将内容放入弹窗
        if (content) {
            self.Common.$alertBox.html(content);
        }

        // 如果需要加入关闭按钮，在弹窗中加入按钮元素，并加入相应事件
        if (config.isShowCloseBtn === true) {
            //self.Common.$alertBox.append(config.html.alertCloseBtn());
            self.Common.$alertBox.append(self.Common.$alertCloseBtn);
            self.initCommonDom();
            self.closeEventListenOn();
        }

        // 如果有针对本次弹窗的样式，则用此样式覆盖默认样式
        $.each(config.style, function (key, val) {
            val = self.cssObj2string(val);
            self.Common['$' + key].attr('style', val);
        });

        // 展示弹窗
        if (self.Common.isWebPage) {
            (config.isFadeIn) ? self.Common.$alertContainer.addClass("fadeIn") : "";
        } else {
            (config.isFadeIn) ? self.Common.$alertContainer.fadeIn() : "";
        }
        self.Common.$alertContainer.css('display', 'table');
        //self.Common.$alertBox.children().css('display','block'); // 显示所有子元素

        if (config.isUnclosable === true) {
            self.closeEventListenOff();
        }

        // 触发窗口尺寸变化事件 重新赋予弹窗宽高等属性 防止用户改变窗口尺寸后 弹窗总容器尺寸和窗口尺寸不一致的问题
        //$(window).trigger('resize');

        // 定时关闭弹窗
        var closeTimer = config.closeTimer;
        if (closeTimer !== 0 && !config.isUnclosable) {

            // 如果该本次弹窗已设置自动关闭，则关闭点击事件监听，禁止点击关闭
            self.closeEventListenOff();
            self.Common.closeTimer = setTimeout(function () {
                self.closeWindow();

                // 本次弹窗关闭后，重新开启监听
                self.closeEventListenOn();
            }, closeTimer);
        }

        // 如果有回调函数 执行回调
        (typeof config.popupCallback === "funcion") && config.popupCallback(); // 本次回调
    };

    PopupWindow.prototype.closeWindow = function () {
        var self = this;
        $.map(self.Conf.style, function (item, index) {
            self.Common['$' + index] && self.Common['$' + index].attr('style', item);
        });
        self.Common.$alertContainer.hide();
        self.Common.closeTimer && clearTimeout(self.Common.closeTimer);
    };

    PopupWindow.prototype.windowResizeListener = function () {
        var self = this;
        var $win = $(window);
        //$win.resize(function () {

            // 将弹窗内容放在窗口中央
            //self.Common.$alertBox.css('left', (self.Common.$alertContainer.width() - self.Common.$alertBox.width()) / 2 + 'px');
        //});
    };

    PopupWindow.prototype.$$ = function (filter) {
        var self = this;
        if (filter !== self.Conf.filter.container) {
            return ((self.Common || {}).$container || $(self.Conf.filter.container)).find(filter);
        }
    };

//this.init();

    if (typeof MoGu.popupWin === "undefined") {
        MoGu.popupWin = {};
        MoGu.popupWin.popup = this.popup;
        MoGu.popupWin.popup = this.init;
    }

    var commonPopupWindow = new PopupWindow();

    //解决IE10以下不支持Function.bind
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }
            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }

    return {
        popup: commonPopupWindow.popup.bind(commonPopupWindow),
        PopupWindow: PopupWindow,
    };
});