app.equalize = {
    settings: {
        $el: $('[data-equalize]'),
        $targets: $('[data-equalize-target]')
    },

    init: function(){
        if (app.equalize.settings.$el.length > 0) {
            app.equalize.settings.$el.each(function () {
                var currentHeight = 0;

                app.equalize.settings.$targets
                    .each(function () {
                        var $this = $(this),
                            height = $(this).height();

                        if (height > currentHeight) {
                            currentHeight = height;
                        }
                    })
                    .height(currentHeight);
            });
        }
    }
};