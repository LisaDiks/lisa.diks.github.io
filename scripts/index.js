// ES6 javascript imports
import RegisterSW from './libs/register-service-worker';

// Polyfills for IE11 default commented out. Turn on when needed
// import Modernizr from './vendor/modernizr-3.6.0';
// import Picturefill from './vendor/picturefill';
// import ObjectFit from './libs/objectfit';

import polyfills from './libs/polyfills';
// import SmoothScroll from './libs/smoothscroll';
import CookieMessage from './libs/cookiemessage';
import Navigation from './libs/navigation';
// import TabFocus from './libs/tabfocus';
import Accordion from './libs/init.accordion';
import LazyLoad from './libs/init.lazyload';
// import Modals from './libs/init.modals';
import Swiper from './libs/init.swiper';
import SmoothScroll from './libs/init.smoothscroll';
import SocialButtons from './libs/init.socialbuttons';

// Call the different functions
SmoothScroll();
CookieMessage();
Navigation();
// TabFocus();
Accordion()
Swiper();
LazyLoad();
// Modals();
SocialButtons();
