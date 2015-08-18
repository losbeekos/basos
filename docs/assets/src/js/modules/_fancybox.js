app.fancybox = {
    el: $('.fancybox'),

    init: function(){
        var self = this,
            urlFancybox = app.pathBower + 'fancybox/jquery.fancybox.pack.js',
            urlFancyboxMediaHelper = app.pathBower + 'fancybox/helpers/jquery.fancybox-media.js';

        yepnope({
            test : self.el,
            yep  : [urlFancybox, urlFancyboxMediaHelper],
            callback: function (url) {
                if(url === urlFancyboxMediaHelper){
                    self.el.fancybox({
                        helpers: {
                            media: true
                        }
                    });
                }
            }
        });
    }
};