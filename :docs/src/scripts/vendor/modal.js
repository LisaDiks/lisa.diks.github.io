(function(root, factory) {

    var pluginName = 'Modal';

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
        openSelector: '.js-open-modal',
        closeSelector: '.js-close-modal',
        modalClassName: 'modal',
        modalPanelClassName: 'modal__panel',
        modalContentClassName: 'modal__content',
        modalHeaderClassName: 'modal__header',
        modalTitle: null,
        overlay: true,
        overlayClassName: 'modal__overlay',
        closeOnOverlay: true,
        closeOnEscape: true,
        openClassName: 'is-open',
        contentType: 'iframe', // options: html, inline, iframe, ajax,
        contentSource: null,
        ajaxDataToSend: null,
        injectHtml: '<button class="modal__close js-close-modal">SLUITEN</button>',
        originalContent: null,
        originalContentContainer: null,
        on: {
            init: function() {},
            build: function() {},
            beforeOpen: function() {},
            afterOpen: function() {},
            beforeClose: function() {},
            afterClose: function() {},
        }
    };

    // --------------------------  Merge defaults with user options  -------------------------- //

    /**
     * Merge defaults with user options
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     */

    var extend = function(target, options) {
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
     * @private
     */

    var buildmodal = function() {
        var panel, content, header;

        if (this.options.on.build) this.options.on.build.call(this);

        panel = document.createElement('div');
        panel.className = this.options.modalPanelClassName;

        header = document.createElement('div');
        header.className = this.options.modalHeaderClassName;
        header.appendChild(document.createElement("h3"));
        if (this.options.modalTitle) {
            header.querySelector('h3').append(this.options.modalTitle);
        }


        content = document.createElement('div');
        content.className = this.options.modalContentClassName;

        this.modal = document.createElement('div');
        this.modal.className = this.options.modalClassName;
        this.modal.appendChild(panel).appendChild(header);
        panel.appendChild(content);



        if (typeof this.options.contentSource === "function") {
            this.options.contentSource = this.options.contentSource(this.target);
        }

        if (this.options.contentType === 'iframe') {
            var iframe;
            iframe = initIframe(this.options.contentSource);
            content.appendChild(iframe);
        } else if (this.options.contentType === 'html') {
            content.insertAdjacentHTML('beforeend', this.options.contentSource);
        } else if (this.options.contentType === 'ajax') {
            const url = this.options.contentSource;
            const data = this.options.ajaxDataToSend;

            $.ajax({
                url: url,
                data: data,
                cache: false,
                contentType: false,
                type: 'GET',
                beforeSend: () => {

                },
                success: (response) => {
                    content.insertAdjacentHTML('beforeend', response);
                    const modalAjaxReady = new CustomEvent('modalAjaxReady');
                    modalAjaxReady.modal = this;
                    document.dispatchEvent(modalAjaxReady);
                },
                error: (err) => {
                    console.log(err.statusText);
                }
            });
        } else if (this.options.contentType === 'inline') {
            // Store original content
            this.options.originalContent = document.querySelector(this.options.contentSource).cloneNode(true);

            // Put original content in modal
            content.appendChild(document.querySelector(this.options.contentSource));

        } else if (this.options.contentType === 'video') {
            var videoEmbed, videoType, loader;
            videoType = this.target.dataset.videoType;
            videoEmbed = document.createElement('div');
            videoEmbed.className = 'embed-container';

            loader = initLoader();
            content.appendChild(loader);

            if (videoType === 'youtube') {
                this.options.contentSource += '?autoplay=1&rel=0';
                var iframe = initIframe(this.options.contentSource);
                iframe.setAttribute('allowfullscreen', true);
                iframe.setAttribute('allow', 'autoplay; encrypted-media');
                videoEmbed.appendChild(iframe);
                iframe.onload = function() {
                    loader.stop();
                }
            } else if (videoType === 'vimeo') {
                this.options.contentSource += '?autoplay=1';
                var iframe = initIframe(this.options.contentSource);
                iframe.setAttribute('allowfullscreen', true);
                iframe.setAttribute('webkitallowfullscreen', true);
                iframe.setAttribute('mozallowfullscreen', true);
                videoEmbed.appendChild(iframe);

                iframe.onload = function() {
                    loader.stop();
                }
            } else {
                var video = document.createElement('video');
                video.src = this.options.contentSource;
                video.setAttribute('controls', true);
                video.setAttribute('autoplay', true);
                videoEmbed.appendChild(video);

                video.addEventListener('loadeddata', function() {
                    loader.stop();
                });
            }
            content.appendChild(videoEmbed);
        } else {
            return false;
        }

        if (this.options.overlay) {
            this.overlay = document.createElement('div');

            if (this.options.closeOnOverlay) {
                this.overlay = document.createElement('a');
                this.overlay.className = this.options.closeSelector.replace('.','');
            }

            this.overlay.classList.add(this.options.overlayClassName);
            this.modal.appendChild(this.overlay);
        }

        if (this.options.injectHtml) {
            header.insertAdjacentHTML('beforeend', this.options.injectHtml);
        }

        document.body.appendChild(this.modal);
        const modalCreated = new CustomEvent('modalCreated');
        document.dispatchEvent(modalCreated);
    };

    /**
     * private function description
     * @private
     */

    var initCloseEvents = function() {
        this.closeSelectors = [].slice.call(this.modal.querySelectorAll(this.options.closeSelector));

        if (this.options.closeOnEscape) {
            closeOnEscape = closeOnEscape.bind(this);
            document.addEventListener('keyup', closeOnEscape);
            function closeOnEscape(event) {
                if (event.keyCode == 27) {
                    this.close.call(this);
                    document.removeEventListener('keyup', closeOnEscape);
                }
            }
        }

        this.closeSelectors.forEach(function(selector){
            selector.addEventListener('click', this.close.bind(this));
        }.bind(this));

        this.modal.addEventListener('transitionend', function() {
            if (this.isOpen) {
                if (this.options.on.afterOpen) this.options.on.afterOpen.call(this, this.modal);
            } else {
                if (this.options.on.afterClose) this.options.on.afterClose.call(this, this.modal);

                // Put original content back
                if ( this.options.originalContentContainer ) document.querySelector(this.options.originalContentContainer).appendChild(this.options.originalContent);

                const modalDestroyed = new CustomEvent('modalDestroyed');
                document.dispatchEvent(modalDestroyed);
            }
        }.bind(this));
    };


    /**
     * Initialise loader div
     * @private
     */

    var initLoader = function() {
        var loader;

        loader = document.createElement('div');
        loader.className = 'loader';
        document.body.classList.add('is-loading');

        loader.stop = function() {
            this.addEventListener('transitionend', function() {
                if ( this.parentNode) this.parentNode.removeChild(this);
            }.bind(this));

            document.body.classList.remove('is-loading');
        }

        return loader;
    };


    /**
     * Initialise loader div
     * @private
     */

    var initIframe = function(src) {
        var iframe;

        iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.frameBorder = 0;

        return iframe;
    };

    // --------------------------  Plugin Object  -------------------------- //

    /**
     * @param {Object} options User options
     * @constructor
     */

    function Plugin(options) {
        this.options = extend(defaults, options);
        this.events = [];
        this.state = {};
        this.init();
    }


    // --------------------------  Plugin prototypes  -------------------------- //

    /**
     * @public
     * @constructor
     */

    Plugin.prototype = {

        /**
         * Initialization of plugin
         */
        init: function(options) {
            this.destroy.call(this);
            if (options) this.options = extend(this.options, options);


            this.openSelectors = [].slice.call(document.querySelectorAll(this.options.openSelector));
            this.openSelectors.forEach(function(selector){
                if (this.options.on.init) this.options.on.init.call(this, selector);
                var event = {
                    element: selector,
                    type: 'click',
                    func: this.open.bind(this, selector)
                }
                this.events.push(event)
                event.element.addEventListener(event.type, event.func);
            }.bind(this));
            this.isOpen = false;
        },

        /**
         * Destroy plugin
         */
        destroy: function(options) {
            this.events.forEach(function(event){
                event.element.removeEventListener(event.type, event.func);
            }.bind(this));
            this.events = [];
            this.openSelectors = null;
        },

        /**
         * Open modal
         */
        open: function(target, event) {
            if (event) { event.preventDefault() }
            if (!this.isOpen) {
                this.isOpen = true;

                this.target = target;

                buildmodal.call(this);

                if (this.options.on.beforeOpen) this.options.on.beforeOpen.call(this, this.modal);

                initCloseEvents.call(this);

                window.getComputedStyle(this.modal).height;

                this.modal.classList.add(this.options.openClassName);
            }
        },

        /**
         * Close modal
         */
        close: function() {
            if (event) { event.preventDefault() }
            if (this.isOpen) {
                this.isOpen = false;

                if (this.options.on.beforeClose) this.options.on.beforeClose.call(this, this.modal);

                this.modal.classList.remove(this.options.openClassName);

                this.modal.addEventListener('transitionend', function() {
                    if (this.modal.parentNode) this.modal.parentNode.removeChild(this.modal);
                }.bind(this));
            }
        }
    };

    return Plugin;

}));
