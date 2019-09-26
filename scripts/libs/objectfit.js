import Closest from '../vendor/element-closest';

export default function ObjectFit() {

    var ObjectFit = {

        init: function init() {
            
            if (!Modernizr.objectfit) {
                let allObjectFits = document.querySelectorAll('.js-objectfit'), i;

                // Add '.js-objectfit' css class to the image that needs to be object fitted.
                // In a picture element, add the class to the 'img'
                // Add the '.objectfit' css class to the image for proper styling.

                
                for (i = 0; i < allObjectFits.length; i++) {
                    
                    let img = allObjectFits[i],
                        imgSrc = null,
                        wrapper = document.createElement('div');

                    // Check if objectfit image is in a picture element
                    if (img.closest('picture')) {
                        imgSrc = img.closest('picture').querySelector('source').getAttribute('srcset');
                    } else {
                        imgSrc = img.getAttribute('src');
                    }

                    wrapper.className = "objectfit-wrapper"

                    img.parentNode.insertBefore(wrapper, img);
                    wrapper.appendChild(img);

                    wrapper.style.backgroundImage = "url('" + imgSrc + "')";
                }
            }

        }
    };

    ObjectFit.init();
}

