import Swiper from '../../../node_modules/swiper/dist/js/swiper';

export default function swiperHome() {
    new Swiper('.swiper-container', { 
        loop: true,
        speed: 600,
        
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        pagination: {
            el: '.swiper-pagination',
            dynamicBullets: true,
          },
        
    });

}