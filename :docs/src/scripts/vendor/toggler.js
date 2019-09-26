(function(root, factory) {

    var pluginName = 'toggler';

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


    var defaults = {
        triggerSelector: '.toggler-trigger',
        wrapperSelector: '.toggler-wrapper',
        contentSelector: '.toggler-content',
        triggerEvent: 'click',
        openClassName: 'is-open',
        preventDefault: true,
        toggleHeight: true,
        touchEnabled: true,
        closeSiblings: true,
        closeOnClickOutside: false,
        closeOnMouseLeave: false,
        closeOnEscape: false,
        closeDelay: 0
    };




    // --------------------------  Merge defaults with user options  -------------------------- //

    /**
     * Merge defaults with user options
     * @private
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     * @returns {Object} Merged values of defaults and options
     */
    var extend = function ( defaults, options ) {
        var extended = {};
        var prop;
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
    }


    // --------------------------  Helper functions  -------------------------- //

    /**
     * private function description
     * @private
     */

    var onTrigger = function(trigger, event) {
        if (this.toggler.options.preventDefault) event.preventDefault();

        // if (this.toggler.info.isTouch() && event.type !== 'touchend') return false

        if (event.type === 'click' || event.type === 'touchend') {
            this.toggle();
        } else if (event.type === 'mouseover' || event.type === 'mouseenter') {
            if (this.closeTimeout) clearTimeout(this.closeTimeout);
            this.open();
        } else if (event.type === 'mouseout' || event.type === 'mouseleave') {
            this.closeTimeout = window.setTimeout(function() {
                this.close();
            }.bind(this), this.toggler.options.closeDelay)
        }

        if (this.toggler.options.closeSiblings) {
            this.toggler.items.forEach(function(item) {
                if (item.element !== this.element) {
                    if (item.closeTimeout) clearTimeout(item.closeTimeout);
                    item.close();
                }
            }.bind(this));
        }
    };


    // --------------------------  Plugin Object  -------------------------- //

    /**
     * @param {Object} options User options
     * @constructor
     */

    function Plugin(elements, options) {
        return new Toggler(elements, options);
    }


    /**
     * @param {Object} options User options
     * @constructor
     */

    function Toggler(elements, options) {
        this.options = extend(defaults, options);

        this.items = [];
        this.events = [];
        this.callbacks = {};

        this.info = {
            init: false,
            isTouch: function() {
                return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
            }
        }

        this.add(elements)
        if (this.items.length > 0)  this.init();
    }


    // --------------------------  Plugin prototypes  -------------------------- //

    /**
     * @public
     * @constructor
     */

    Toggler.prototype = {

        /**
         * Initialization of plugin
         */
        init: function(elements, options) {
            this.info.init = true;

            if (options && typeof options === 'object') this.options = extend(this.options, options);
            if (elements) this.add(elements, false);


            this.items.forEach(function(item) {
                item.init();
            })

            if (this.options.closeOnClickOutside) {
                this.events.push({
                    element: document,
                    type: 'click',
                    func: function(event) {
                        this.items.forEach(function(item) {
                            if (item.isOpen && !item.element.contains(event.target)) {
                                item.close();
                            }
                        })
                    }.bind(this),
                    useCapture: true
                })
            }

            if (this.options.closeOnEscape) {
                this.events.push({
                    element: document,
                    type: 'keydown',
                    func: function(event) {
                        // event.preventDefault();
                        if (event.keyCode == 27) {
                            this.items.forEach(function(item) {
                                if (item.isOpen) item.close();
                            })
                        }
                    }.bind(this),
                    useCapture: false
                })
            }

            // Add all event listeners from event array
            this.events.forEach(function(event) {
                event.element.addEventListener(event.type, event.func, event.useCapture);
            })

            if (this.callbacks.init) this.callbacks.init();
        },

        /**
         * Destroy plugin
         */
        destroy: function(removeItems) {
            this.info.init = false;

            this.items.forEach(function(item) {
                item.destroy();
            });
            if (removeItems) this.items = [];

            // Removes all event listeners from event array
            this.events.forEach(function(event) {
                event.element.removeEventListener(event.type, event.func, event.useCapture);
            })
            this.events = [];
        },

        /**
         * Add item
         */
        add: function(elements, noInit) {
            if (elements) {
                if (typeof elements === 'string') {
                    elements = [].slice.call(document.querySelectorAll(elements));
                } else if (Array.isArray(elements)) {
                    elements = elements;
                } else {
                    elements = [elements];
                }

                elements.forEach(function(element) {
                    if (element && element.nodeType && !element.toggler) {
                        var item = new TogglerItem(element, this);
                        this.items.push(item);
                        if (!noInit) item.init();
                    }
                }.bind(this));
            }
        },

        /**
         * open all items
         */
        open: function(element) {
            if (element && element.nodeType && element.toggler) {
                element.toggler.open();
            } else {
                this.items.forEach(function(item) {
                    item.open();
                });
            }

        },

        /**
         * close all items
         */
        close: function(element) {
            if (element && element.nodeType && element.toggler) {
                element.toggler.close();
            } else {
                this.items.forEach(function(item) {
                    item.close();
                });
            }
        },

        /**
         * Init trigger event
         */
        initTriggerEvent: function(eventType, element) {
            if (element && element.nodeType && element.toggler) {
                element.toggler.initEvents(eventType);
            } else {
                this.items.forEach(function(item) {
                    item.initEvents(eventType);
                });
            }
        },

        /**
         * Callbacks from Toggler
         */
        on: function(type, func) {
            this.callbacks[type] = func.bind(this);
            if (type === 'init' && this.items.length > 0) this.callbacks.init();
        }

    };

    // --------------------------  TogglerItem Object  -------------------------- //

    /**
     * @param {Object} options User options
     * @constructor
     */

    function TogglerItem(element, toggler) {
        this.element = element;
        this.toggler = toggler;

        this.events = [];
        this.callbacks = {};

        this.isOpen = null;

        this.info = {
            init: false,
            contentHeight: function() {
                return this.content.offsetHeight + this.content.offsetTop;
            }.bind(this)
        }
    }


    // --------------------------  TogglerItem prototypes  -------------------------- //

    /**
     * @public
     * @constructor
     */

    TogglerItem.prototype = {

        /**
         * Initialization of plugin
         */
        init: function() {
            this.element.toggler = this;

            this.triggers = [].slice.call(this.element.querySelectorAll(this.toggler.options.triggerSelector));
            if (this.triggers.length === 0) this.triggers = [this.element];

            if (this.toggler.options.toggleHeight) {
                this.wrapper = this.element.querySelector(this.toggler.options.wrapperSelector);
                this.content = this.element.querySelector(this.toggler.options.contentSelector);
            }

            this.initEvents(this.toggler.options.triggerEvent);

            if (this.element.classList.contains(this.toggler.options.openClassName)) {
                this.isOpen = false;
                this.open();
            } else {
                this.isOpen = true;
                this.close();
            }

            this.info.init = true;
        },

        /**
         * Destroy TogglerItem
         */
        destroy: function() {
            this.info.init = false;
            this.isOpen = true;
            this.wrapper.style.height = null;
            this.element.classList.remove(this.toggler.options.openClassName);
            this.removeEvents();
            this.triggers = null;
            this.wrapper = null;
            this.content = null;
            this.element.toggler = null;
        },

        /**
         * Init events for TogglerItem
         */
        initEvents: function(eventType) {
            this.removeEvents();

            this.triggers.forEach(function(trigger) {

                this.events.push({
                    element: trigger,
                    type: eventType,
                    func: onTrigger.bind(this, trigger),
                    useCapture: false
                })

                if (this.toggler.options.closeOnMouseLeave) {
                    this.events.push({
                        element: trigger,
                        type: 'mouseleave',
                        func: onTrigger.bind(this, trigger),
                        useCapture: false
                    })
                }

                // if (this.toggler.options.touchEnabled) {
                //     this.events.push({
                //         element: trigger,
                //         type: 'touchend',
                //         func: onTrigger.bind(this, trigger),
                //         useCapture: false
                //     })
                // }
            }.bind(this));

            if (this.wrapper) {
                this.events.push({
                    element: this.wrapper,
                    type: 'transitionend',
                    func: function(event) {
                        if (event.target === this.wrapper) {
                            if (this.isOpen) {
                                if (this.toggler.options.toggleHeight) this.wrapper.style.height = 'auto';
                                if (this.callbacks.opened) this.callbacks.opened(this);
                                if (this.toggler.callbacks.opened) this.toggler.callbacks.opened(this);
                            } else {
                                if (this.callbacks.closed) this.callbacks.closed(this);
                                if (this.toggler.callbacks.closed) this.toggler.callbacks.closed(this);
                            }
                        }
                    }.bind(this),
                    useCapture: false
                })
            }

            // Add all event listeners from event array
            this.events.forEach(function(event) {
                event.element.addEventListener(event.type, event.func, event.useCapture);
            });
        },

        /**
         * Remove events for TogglerItem
         */
        removeEvents: function(eventType) {
            this.events.forEach(function(event) {
                event.element.removeEventListener(event.type, event.func, event.useCapture);
            }.bind(this));
            this.events = [];
        },

        /**
         * Open TogglerItem
         */
        open: function() {
            if (!this.isOpen) {
                this.isOpen = true;
                if (this.toggler.options.toggleHeight) this.wrapper.style.height = this.info.contentHeight() + 'px';
                this.element.classList.add(this.toggler.options.openClassName);

                if (this.callbacks.open) this.callbacks.open(this);
                if (this.toggler.callbacks.open) this.toggler.callbacks.open(this);
            }
        },

        /**
         * Close TogglerItem
         */
        close: function() {
            if (this.isOpen) {
                this.isOpen = false;

                if (this.toggler.options.toggleHeight) {
                    this.wrapper.style.height = this.info.contentHeight() + 'px';

                    window.setTimeout(function() {
                        if (this.wrapper) this.wrapper.style.height = '0px';
                    }.bind(this), 10)
                }

                this.element.classList.remove(this.toggler.options.openClassName);

                if (this.callbacks.close) this.callbacks.close(this);
                if (this.toggler.callbacks.close) this.toggler.callbacks.close(this);
            }
        },

        /**
         * Toggle TogglerItem
         */
        toggle: function() {
            if (!this.isOpen) {
                this.open();
            } else {
                this.close();
            }
        },

         /**
         * Callbacks from TogglerItem
         */
        on: function(type, func) {
            this.callbacks[type] = func.bind(this);
        }
    };

    return Plugin;

}));
