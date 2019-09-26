import SmoothScroll from '../vendor/smooth-scroll.polyfills';

export default function Smoothscroll() {
    var scroll = new SmoothScroll('a[href*="#"]:not([href="#"])',{
        topOnEmptyHash: false,
        speed: 750,
        speedAsDuration: true,
        updateURL: false,
        popstate: false,
        offset: function() {
            return window.innerWidth >= 990 ? 80 : 62;
        }
    });
}