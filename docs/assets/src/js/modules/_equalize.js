app.equalize = {
    settings: {
        $el: $('[data-equalize]')
    },

    init: function(){
        if (app.equalize.settings.$el.length > 0) {
            app.equalize.settings.$el.each(function () {
                var currentHeight = 0,
                    $this = $(this);

                $this.find('[data-equalize-target]')
                    .each(function () {
                        var $this = $(this),
                            height = null;

                        $this.css({height: 'auto'});

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