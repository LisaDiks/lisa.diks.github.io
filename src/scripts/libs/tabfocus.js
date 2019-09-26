export default function TabFocus() {

    var TabFocus = {

        init: function init() {

            let origTitle = document.title;
            let message = '👋 Hey. Kom terug!'

            const oldTitle = () => {
                document.title = origTitle;
            }

            const newTitle = () => {
                document.title = message;
            }

            window.onblur = newTitle;
            window.onfocus = oldTitle;            
        }
    };

    TabFocus.init();
}

