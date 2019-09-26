import Closest from '../vendor/element-closest';
import Cookies from '../vendor/js.cookie';

export default function CookieMessage() {

    var Cookie = {

        init: function init() {

            // START - Dismiss cookie message
            var cookieMessageBtn = document.querySelector('.js-dismiss-cookie-message');

            if ( cookieMessageBtn ) {
                cookieMessageBtn.addEventListener('click', function () {
                    document.querySelector('.cookie-message').classList.add('dismissed');
                });
            }
            // END - Dismiss cookie message

            // Accordion behavior outsourced to toggler.js (init.accordion.js)


            // START - Check if cookie message has been displayed
            var cookieMessageShown = Cookies.get('cookie_message_shown'),
                cookieMessage = document.querySelector('.js-cookie-message');

            if ( cookieMessage ) {
                if (cookieMessageShown === 'true') {
                    cookieMessage.parentNode.removeChild(cookieMessage);
                } else {
                    cookieMessage.classList.remove('hidden');
                    Cookies.set('cookie_message_shown', 'true', { expires: 365 });
                }
            }
            // END - Check if cookie message has been displayed


            // START - Setting cookies based on cookie settings form
            var form = document.querySelector('form.article__cookies');

            if (form) {
                var radioBtns = form.querySelectorAll('input[type=radio]');
                var marketingCookiesAllowed = Cookies.get('allow_all_cookies');

                // Set correct radio button on page load
                if (marketingCookiesAllowed === 'true' || typeof marketingCookiesAllowed === 'undefined') {
                    document.getElementById('no_marketing_cookies').removeAttribute('checked');
                    document.getElementById('marketing_cookies').setAttribute('checked', true);
                } else {
                    document.getElementById('marketing_cookies').removeAttribute('checked');
                    document.getElementById('no_marketing_cookies').setAttribute('checked', true);
                }

                for (var _index = 0; _index < radioBtns.length; _index++) {
                    var radioBtn = radioBtns[_index];

                    radioBtn.addEventListener('change', function (event) {
                        if (event.target.id === 'no_marketing_cookies') {
                            // don't allow marketing cookies
                            Cookies.set('allow_all_cookies', 'false', { expires: 365 });
                        } else {
                            // allow marketing cookies
                            Cookies.set('allow_all_cookies', 'true', { expires: 365 });
                        }
                    });
                }
            }
            // END - Setting cookies based on cookie settings form
        }
    };

    Cookie.init();
}