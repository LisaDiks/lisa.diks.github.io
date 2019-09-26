import Closest from '../vendor/element-closest';

export default function SocialButtons() {

    const buttons = document.querySelectorAll('.js-social-link');

    function openWindow(event) {
        event.preventDefault();
        const   link = event.target.closest('a'),
                url = link.href,
                position = {
                    width: 700,
                    height: 300,
                    top: (window.innerHeight / 2) - (300 / 2),
                    left: (window.innerWidth / 2) - (700 / 2)
                };

        window.open(url, 'socialWindow', 'width=700, height=300, top=' + position.top + ', left=' + position.left);
    }

    if (buttons) {
        buttons.forEach(button => {
            button.addEventListener('click', openWindow);
        });
    }
}
