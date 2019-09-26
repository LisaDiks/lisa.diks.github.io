import articleLoader from '../vendor/articleloader';

export default function LazyLoad() {

    // Lazy loading on scroll
    // let lazyLoader = articleLoader('.js-lazy', {
    //     articleSelector: '.js-lazy-article',
    //     containerSelector: '.js-lazy-container',
    //     delay: 1000,
    //     scrollData: true
    // });


    // Lazy loading on click
    let lazyLoader = articleLoader('.js-lazy', {
        articleSelector: '.js-lazy-article',
        containerSelector: '.js-lazy-container',
        delay: 1000
    });

    function initButton(button) {
        button.addEventListener('click', event => {
            event.preventDefault();
            button.setAttribute('disabled', 'disabled');
            this.loadData(button.href);
        });
    }

    function initFilters(buttons) {
        // convert nodelist to array
        buttons = [].slice.call(buttons);

        buttons.forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();

                // Disable all filters
                buttons.forEach(button => {
                    button.setAttribute('disabled', 'disabled');
                });

                // Get new data
                this.loadData(button.dataset.href, null, null, function() {
                    this.empty();
                });
            });
        });
    }

    if (lazyLoader) {
        lazyLoader.on('init', function() {
            this.button = document.querySelector('.js-lazy-button');
            this.filters = document.querySelectorAll('.js-article-filter');
            if (this.filters) initFilters.call(this, this.filters);
            if (this.button) initButton.call(this, this.button);
            this.bottom = document.querySelector('.js-lazy-button-container');
            this.filtersContainer = document.querySelector('.js-filters');
            this.initLoader('<div class="loader"></div>');
        });

        lazyLoader.on('scroll', function(){
            if ( this.data.containerOffsetBottom < this.data.offsetBottom ) {
                if (this.button) this.loadData(this.button.href);
            }
        });

        lazyLoader.on('beforeSend', function() {
            // Set loading class on the instance
            this.instance.classList.add(this.options.loadingClass);
            this.instance.appendChild(this.loader);
        });

        lazyLoader.on('complete', function(status, newItems, resultElement) {
            this.button.removeAttribute('disabled');
            this.instance.classList.remove(this.options.loadingClass);
            this.loader.parentElement.removeChild(this.loader);

            if (status === 'success') {
                this.button.parentElement.removeChild(this.button);
                this.button = resultElement.querySelector('.js-lazy-button');

                // remove old filters
                this.filters.forEach(filter => {
                    filter.parentElement.removeChild(filter);
                });

                // Set new filters
                this.filters = resultElement.querySelectorAll('.js-article-filter');

                if (this.button) {
                    initButton.call(this, this.button);
                    this.bottom.appendChild(this.button);
                }

                if (this.filters) {
                    initFilters.call(this, this.filters);

                    this.filters.forEach(filter => {
                        this.filtersContainer.appendChild(filter);
                    });
                }

                this.add(newItems);
            }
        })


    }
}
