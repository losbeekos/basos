app.cycle = {
    init: function(){
        var self = this;

        if(app.settings.cycle.$el.el.length > 0){
            yepnope.injectJs(app.pathBower + 'cycle2/build/jquery.cycle2.min.js',
                function(){
                    self.el.cycle({
                        slides           : app.settings.cycle.slides,
                        pager            : app.settings.cycle.pager,
                        pagerActiveClass : app.settings.cycle.pagerActiveClass,
                        pauseOnHover     : true,
                        swipe            : true,
                        log              : false
                    });
                });
        }
    }
};