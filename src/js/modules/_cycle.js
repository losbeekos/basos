app.cycle = {
    settings: {
        $el: $('.cycle-wrap', '.cycle'),
        slides: '> .cycle-item',
        pager : '> .cycle-pager',
        pagerActiveClass: 'cycle-pager-active'
    },

    init: function(){
        var self = this;

        if(app.cycle.settings.$el.el.length > 0){
            yepnope.injectJs(app.pathBower + 'cycle2/build/jquery.cycle2.min.js',
                function(){
                    self.el.cycle({
                        slides           : app.cycle.settings.slides,
                        pager            : app.cycle.settings.pager,
                        pagerActiveClass : app.cycle.settings.pagerActiveClass,
                        pauseOnHover     : true,
                        swipe            : true,
                        log              : false
                    });
                });
        }
    }
};