app.svg = {

    init: function() {

        svg4everybody(); // SVG support for IE9-11

    }

};

/*doc
---
title: SVG
name: svg
category: Content
---

There are no SVG images present in basos but you can create an SVG workflow for your project. 

- Just drop SVG files in "/assets/src/img/svg/".
- A grunt task will create an SVG sprite of these files with there filename as an ID.
- You can use these IDs to reference them your HTML document, see example below.

*Note: All the SVG files dropped in the src/svg folder will be copied to the dist/svg map so you can use them separately in your document.*

*Another Note: We use svg4everybody for IE9-11 support.*

```html_example
<svg width="20px" height="20px">
    <use xlink:href="assets/dist/img/sprite.svg#ID" />
</svg>
```

*/