app.fitVids = {
    settings: {
        $el: $('.fitvids')
    },

    init: function(){
        if (app.fitVids.settings.$el.length > 0) {
            yepnope.injectJs(
                app.pathBower + 'fitvids/jquery.fitvids.js' + app.settings.version,
                function(){
                    app.fitVids.settings.$el.fitVids();
                }
            );
        }
    }
};

/*doc
---
title: Fitvids
name: fitvids
category: Javascript
---

A lightweight, easy-to-use jQuery plugin for fluid width video embeds.
Use the class fitvids as a container for your video and the plugin will take care of the rest.

*/