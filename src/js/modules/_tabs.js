app.tabs = {
    init: function(){
        var self = this;

        if (app.settings.tabs.$tab.length > 0) {
            app.settings.tabs.$tab.on('click', function (event) {
                var $tab = $(this);

                event.preventDefault();

                app.settings.tabs.$tab.removeClass('tab--active');
                $tab.addClass('tab--active');

                $($tab.attr('href'))
                    .addClass('tab-item--active')
                    .siblings()
                    .removeClass('tab-item--active');
            });
        }
    }
};