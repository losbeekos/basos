app.fitVids = {
    init: function(){
        if (app.settings.fitVids.$el.length > 0) {
            yepnope.injectJs(
                app.pathBower + 'fitvids/jquery.fitvids.js' + app.settings.version,
                function(){
                    app.settings.fitVids.$el.fitVids();
                }
            );
        }
    }
};