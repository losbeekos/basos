app.fancybox = {
    el: $('.fancybox'),

    init: function(){
        var self = this,
            urlFancybox = app.path + 'plugins/jquery.fancybox/jquery.fancybox.pack.js',
            urlFancyboxMediaHelper = app.path + 'plugins/jquery.fancybox/helpers/jquery.fancybox-media.min.js';

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