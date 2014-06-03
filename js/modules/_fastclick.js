app.fastClick = {
    init: function(){
        if (app.settings.$html.hasClass('touch')) {
            yepnope.injectJs(
                app.path + 'plugins/fastclick/fastclick.min.js' + app.settings.version,
                function(){
                    new FastClick(document.body);
                }
            );
        }
    }
};