app.tabs = {
    settings: {
        $nav: $('.tabs'),
        $tab: $('.tab'),
        $content: $('.tab-content')
    },

    init: function(){
        var self = this;

        if (app.tabs.settings.$tab.length > 0) {
            app.tabs.settings.$tab.on('click', function (event) {
                var $tab = $(this);

                event.preventDefault();

                app.tabs.settings.$tab.removeClass('tab--active');
                $tab.addClass('tab--active');

                $($tab.attr('href'))
                    .addClass('tab-item--active')
                    .siblings()
                    .removeClass('tab-item--active');
            });
        }
    }
};