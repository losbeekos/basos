app.fitVids = {
    init: function(){
        if (app.settings.fitVids.$el.length > 0) {
            yepnope.injectJs(
                app.path + 'plugins/jquery.fitvids/jquery.fitvids.min.js' + app.settings.version,
                function(){
                    app.settings.fitVids.$el.fitVids();
                }
            );
        }
    }
};