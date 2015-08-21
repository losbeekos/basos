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

/*doc
---
title: Disable hover
name: disable_hover
category: Javascript
---

A disable hover (.disable-hover) class is added to the body. 
This class prevents pointer events so there won't be any hover effect repaints, just the repaints for scrolling. This results in a better scrolling performance.

*/