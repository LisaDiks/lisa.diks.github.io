import Modal from '../vendor/modal';

export default function Modals() {

    const spritemap = typeof fs_obj !== 'undefined' ? fs_obj.spritemap_svg : 'spritemap.svg';
    const closeTxt = typeof fs_obj !== 'undefined' ? fs_obj.str_close : 'Sluiten';

    let myModal = Modal('body', {
        modalClassName: 'modal modal--video',
        openSelector: '.js-video',
        contentType: 'video',
        injectHtml:
            `<button class="modal__close js-close-modal">${closeTxt}<svg class="icon icon--close"><use xlink:href="${spritemap}#close"></use></svg></button>`,
        onBuild: function() {
            this.options.contentSource = this.target.href;
        }
    });
}
