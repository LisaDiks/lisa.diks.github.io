import toggler from '../vendor/toggler';

export default function Accordion() {
    toggler('.accordion-item', {
        wrapperSelector: '.accordion-item__wrapper',
        contentSelector: '.accordion-item__content',
        triggerSelector: '.js-toggle-button'
    });
}
