app.fastClick = {
    init: function(){
        if (app.settings.$html.hasClass('touch')) {
            FastClick.attach(document.body);
        }
    }
};

/*doc
---
title: Fastclick
name: fastclick
category: Javascript
---

Polyfill to remove click delays on browsers with touch UIs

*/