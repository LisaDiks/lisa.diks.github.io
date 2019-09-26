export default function Navigation() {
    
    var $ = jQuery,
        Navigation = {

            init: function(){

                var bodyEl = document.body,
                content = $('.overlay'),
                openbtn = $('.nav-link'),
                isOpen = false;

            function init() {
                initEvents();
            }

            function initEvents() {
                openbtn.click(function(event) {
                    event.preventDefault();

                    toggleMenu();
                });

                // close the menu element if the target it´s not the menu element or one of its descendants..
                content.click(function(ev) {
                    var target = ev.target;
                    if( isOpen && target !== openbtn ) {
                        toggleMenu();
                    }
                });
            }

            function toggleMenu() {
                if( isOpen ) {
                    $(bodyEl).removeClass('show-menu');
                }
                else {
                    $(bodyEl).addClass('show-menu');
                }
                isOpen = !isOpen;
            }

            init();

            // submenu
            var viewportWidth = $(window).width();
            if ((viewportWidth >= 950)) {
                var timer;
                $('.nav__main > ul > li').on("mouseover", function() {
                    clearTimeout(timer);
                     $('.submenu').removeClass('active');
                    $(this).find('.submenu').addClass('active');
                }).on("mouseleave", function() {
                    timer = setTimeout(function(){
                        $('.submenu').removeClass('active');
                    }, 1000);
                });
            }

            }
        };

    Navigation.init();

}


