app.disableHover = {
    timer: null,

    init: function(){
        clearTimeout(app.disableHover.timer);
        if(!app.settings.$body.hasClass('disable-hover')) {
            app.settings.$body.addClass('disable-hover');
        }

        app.disableHover.timer = setTimeout(function(){
            app.settings.$body.removeClass('disable-hover');
        }, 100);
    }
};