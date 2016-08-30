app.equalize = {
    settings: {
        el: document.querySelectorAll('[data-equalize]')
    },

    init: function(){
        if (app.equalize.settings.el !== null) {
            app.equalize.settings.el.forEach(equalize => {
                var currentHeight = 0,
                    mediaQuery = equalize.getAttribute('data-equalize'),
                    targets = equalize.querySelectorAll('[data-equalize-target]');

                if (Modernizr.mq(app.mediaQueries[mediaQuery]) === true || app.mediaQueries[mediaQuery] === undefined) {
                    targets.forEach(target => {
                        var height = null;

                        target.style.height = 'auto';
                        height = target.offsetHeight;

                        if (height > currentHeight) {
                            currentHeight = height;
                        }
                    });

                    targets.forEach(target => target.style.height = currentHeight + 'px');
                } else {
                    targets.forEach(target => target.style.height = 'auto');
                }
            });
        }
    }
};

/*doc
---
title: Equalize
name: equalize
category: Content
---

Equalize targets in just a snap. It can be everything not just columns or blocks.

```html_example
<div class="grid" data-equalize>
    <div class="column-4">
        <div data-equalize-target class="card">
            <div class="card__content">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis, beatae, alias? Necessitatibus nulla sint voluptate perspiciatis excepturi, architecto et, incidunt itaque iusto inventore porro! Eum ullam placeat quam, eius aperiam!</div>
        </div>
    </div>
    <div class="column-4">
        <div data-equalize-target class="card">
            <div class="card__content">Lorem ipsum.</div>
        </div>
    </div>
    <div class="column-4">
        <div data-equalize-target class="card">
            <div class="card__content">Lorem ipsum.</div>
        </div>
    </div>
</div>
```

You can also set a media query from where the equalizer has to kick in, like this.

```html_example
<div class="grid" data-equalize="betaAndUp">
    <div class="column-4">
        <div data-equalize-target class="card">
            <div class="card__content">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis, beatae, alias? Necessitatibus nulla sint voluptate perspiciatis excepturi, architecto et, incidunt itaque iusto inventore porro! Eum ullam placeat quam, eius aperiam!</div>
        </div>
    </div>
    <div class="column-4">
        <div data-equalize-target class="card">
            <div class="card__content">Lorem ipsum.</div>
        </div>
    </div>
    <div class="column-4">
        <div data-equalize-target class="card">
            <div class="card__content">Lorem ipsum.</div>
        </div>
    </div>
</div>
```

*/