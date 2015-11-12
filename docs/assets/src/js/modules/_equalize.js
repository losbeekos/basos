app.equalize = {
    settings: {
        $el: $('[data-equalize]')
    },

    init: function(){
        if (app.equalize.settings.$el.length > 0) {
            app.equalize.settings.$el.each(function () {
                var currentHeight = 0,
                    $this = $(this),
                    mediaQuery = $this.attr('data-equalize');
               
                if (Modernizr.mq(app.mediaQueries[mediaQuery]) || app.mediaQueries[mediaQuery] === undefined) {
                    $this.find('[data-equalize-target]')
                        .each(function () {
                            var $this = $(this),
                                height = null;

                            $this.css({height: 'auto'});

                            height = $(this).height();

                            if (height > currentHeight) {
                                currentHeight = height;
                            }
                        })
                        .height(currentHeight);
                } else {
                    $this.find('[data-equalize-target]').height('auto');
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
<div class="grid" data-equalize="beta-and-up">
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