// --------------------------  Polyfills  -------------------------- //

/**
 * Custom event Polyfill
 */
(function () {
    if ( typeof window.CustomEvent === "function" ) return false;
    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();

// --------------------------  ArticleLoader Plugin  -------------------------- //

(function(root, factory) {

    var pluginName = 'articleLoader';

    if (typeof define === 'function' && define.amd) {
        define(['module'], function (module, pluginName) {
            module.exports = factory(pluginName);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(require(pluginName));
    } else {
        root[pluginName] = factory(pluginName);
    }

}(this, function(pluginName) {

    'use strict';

    var $ = jQuery;

    var defaults = {
        containerSelector: null,
        articleSelector: '.article',
        loadingClass: 'is-loading',
        delay: 0,
        autoInit: true,
        scrollData: false,
        onInit: null,
        onBeforeSend: null,
        onComplete: null,
        onScroll: null,
        onAddArticle: null,
        onRemoveArticle: null
    }

    // --------------------------  Merge defaults with user options  -------------------------- //

    /**
     * Merge defaults with user options
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     */

    var extend = function(defaults, options) {
        var prop, extended = {};
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

    // --------------------------  Helper functions  -------------------------- //

    /**
     * private function description
     * @param {Object} element Container from articleloader
     * @private
     */
    var cumulativeOffset = function(element) {
        var top = 0, left = 0;
        do {
            top += element.offsetTop  || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while(element);
        return {
            top: top,
            left: left
        };
    };

    /**
     * Returns a function, that, as long as it continues to be invoked, will not be triggered
     * @private
     */
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    // --------------------------  Plugin Object  -------------------------- //

    /**
     * Function for returning the constructor ArticleLoader
     * @param {Object} instance Container element
     * @param {Object} options User options
     */

    function Plugin(instance, options) {
        var containerSelector = null;

        if (typeof instance === 'string') {
            containerSelector = instance;
            instance = document.querySelector(instance);
        }

        if (!instance) {
            return null;
        } else {
           return new ArticleLoader(instance, options, containerSelector);
        }
    }

    /**
     * @param {Object} instance Container from articleloader
     * @param {Object} options User options
     * @param {String} containerSelector Selector for the container
     * @constructor
     */

    function ArticleLoader(instance, options, containerSelector) {
        this.instance = instance;
        this.options = extend(defaults, options);
        this.data = {};

        if (this.options.containerSelector) {
            this.container = this.instance.querySelector(this.options.containerSelector);
            if (!this.container) this.container = this.instance;
            this.containerSelector = this.options.containerSelector;
        } else {
            this.container = this.instance;
            this.containerSelector = containerSelector;
        }

        if (this.options.autoInit) this.init();
    }

    // --------------------------  Plugin prototypes  -------------------------- //

    /**
     * @public
     * @constructor
     */

    ArticleLoader.prototype = {
        /**
         * Initialization function for the plugin
         */
        init: function() {
            this.state = {
                isLoading: false
            }

            /**
             * Set the callback functions
             */
            this.callbacks = {
                init: this.options.onInit ? this.options.onInit.bind(this) : null,
                beforeSend: this.options.onBeforeSend ? this.options.onBeforeSend.bind(this) : null,
                complete: this.options.onComplete ? this.options.onComplete.bind(this) : null,
                scroll: this.options.onScroll ? this.options.onScroll.bind(this) : null,
                addArticle: this.options.onAddArticle ? this.options.onAddArticle.bind(this) : null,
                removeArticle: this.options.onRemoveArticle ? this.options.onRemoveArticle.bind(this) : null
            }

            /**
             * Create custom events
             */
            this.customEvents = {
                init: new CustomEvent('init', {
                    ArticleLoader: this
                }),
                beforeSend: new CustomEvent('beforeSend', {
                    ArticleLoader: this
                }),
                complete: new CustomEvent('complete', {
                    ArticleLoader: this
                }),
                addArticle: new CustomEvent('addArticle', {
                    ArticleLoader: this
                }),
                removeArticle: new CustomEvent('removeArticle', {
                    ArticleLoader: this
                })
            }

            /**
             * Add option for scrolldata when scrolldata is set to true
             */
            if (this.options.scrollData) {
                getScreenData.call(this);
                document.addEventListener('resize', getScreenData.bind(this));

                function getScreenData() {
                    this.data.windowHeight = window.innerHeight;
                }

                getScrollData.call(this);
                var onScroll = debounce(getScrollData.bind(this), 200);
                document.addEventListener('scroll', onScroll.bind(this));

                function getScrollData() {
                    this.data.offsetTop = window.pageYOffset;
                    this.data.offsetBottom = this.data.offsetTop + this.data.windowHeight;
                    this.data.containerHeight = this.container.offsetHeight;
                    this.data.containerOffsetTop = cumulativeOffset(this.container).top;
                    this.data.containerOffsetBottom = this.data.containerOffsetTop + this.data.containerHeight;
                    if (this.callbacks.scroll) this.callbacks.scroll();
                }
            }

            /**
             * Methods for get or update url paramaters
             */
            this.uri = {
                /**
                 * @param {String} url Url you want to update
                 * @param {String} key The key which you want to update
                 * @param {String} value The value for the key you want to update
                 */
                updateParam: function(url, key, value) {
                    if (!url) return false;
                    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
                    var separator = url.indexOf('?') !== -1 ? "&" : "?";
                    if (url.match(re)) {
                        return url.replace(re, '$1' + key + "=" + value + '$2');
                    } else {
                        return url + separator + key + "=" + value;
                    }
                },
                /**
                 * @param {String} url Url you want to get the parameter from
                 * @param {String} key The key where you want to get the vaue from
                 */
                getParam: function(url, key) {
                    if (!url) url = window.location.href;
                    key = key.replace(/[\[    \]]/g, '\\$&');
                    var regex = new RegExp('[?&]' + key + '(=([^&#]*)|&|#|$)'),
                        results = regex.exec(url);
                    if (!results) return null;
                    if (!results[2]) return '';
                    return decodeURIComponent(results[2].replace(/\+/g, ' '));
                }
            }

            if (this.callbacks.init) this.callbacks.init();
        },
        /**
         * Create a loader element from a string, and saves it in this.loader
         * @param {String} loaderString String which creates a loader element
         */
        initLoader: function(loaderString) {
            if (!loaderString) return false;
            var loader = document.createElement('div');
                loader.innerHTML = loaderString;
                loader = loader.firstElementChild;

            if (!this.loader) this.loader = loader;
            return this.loader;
        },
        /**
         * Get all articles that are in the container
         */
        getArticles: function() {
            return [].slice.call(this.container.querySelectorAll(this.options.articleSelector));
        },
        /**
         * @param {String} url AJAX url for ajax call
         * @param {String} type Type of ajax call (GET or POST)
         * @param {String} data Optionally data that could be send within the AJAX post
         * @param {Function} callback Optional callback function after data is loaded
         */
        loadData: function(url, type, data, callback) {
            if (!url) return false;

            if (!this.state.isLoading) {
                this.state.isLoading = true;

                if (this.callbacks.beforeSend) this.callbacks.beforeSend();
                this.container.dispatchEvent(this.customEvents.beforeSend);

                return $.ajax({
                    url: url,
                    type: type ? type : 'GET',
                    data: data ? data : null,
                }).always(function(result, status) {
                    window.setTimeout(function() {
                        this.state.isLoading = false;
                        var resultElement = null;
                        var articles = null;

                        if (status === 'success') {
                            if (callback) callback.call(this);
                            resultElement = document.createElement('div');
                            resultElement.innerHTML = result;
                            articles = [].slice.call(resultElement.querySelectorAll(this.options.articleSelector));
                        } else {
                            console.log(result.status);
                        }

                        if (this.callbacks.complete) this.callbacks.complete(status, articles, resultElement);
                        this.customEvents.complete.status = status;
                        this.customEvents.complete.articles = articles;
                        this.customEvents.complete.resultElement = resultElement;
                        this.container.dispatchEvent(this.customEvents.complete);
                    }.bind(this), this.options.delay)
                }.bind(this))
            }
        },
        /**
         * Add article to the container
         * @param {Array or Element} articles Element(s) of the article(s) that should be added, this can not be a nodelist
         * @param {Boolean} insertBefore If set to true it will place the article as first item
         */
        add: function(articles, insertBefore) {
            if(!Array.isArray(articles)) articles = [articles];
            articles.forEach(function(article) {
                if (this.callbacks.addArticle) this.callbacks.addArticle(article);
                this.customEvents.addArticle.article = article;
                this.container.dispatchEvent(this.customEvents.addArticle);

                if (insertBefore) {
                    this.container.insertBefore(article, this.container.firstChild);
                } else {
                    this.container.appendChild(article);
                }
            }.bind(this));
        },
        /**
         * Remove article from the container
         * @param {String} element Element of the article that should be removed
         */
        remove: function(articles) {
            if(!Array.isArray(articles)) articles = [articles];
            articles.forEach(function(article) {
                if (this.callbacks.removeArticle) this.callbacks.removeArticle(article);
                this.customEvents.removeArticle.article = article;
                this.container.dispatchEvent(this.customEvents.removeArticle);
                article.parentNode.removeChild(article);
            }.bind(this));
        },
        /**
         * Remove all articles in the container
         */
        empty: function() {
            this.remove(this.getArticles());
        },
        /**
         * Init callbacks for the ArticleLoader
         * @param {String} type Type of callback that should be added
         * @param {Function} func Function that should be added
         */
        on: function(type, func) {
            this.callbacks[type] = func.bind(this);

            if (type === 'init') {
                this.callbacks.init();
                this.container.dispatchEvent(this.customEvents.init);
            }

            return this;
        }
    }
    return Plugin;
}));
