app.settings.$document.ready(function () {
    var $this = $(this),
        scrollTop = $this.scrollTop();

    app.equalize.init();
    app.scrollSpyNav.init(scrollTop);
    app.fastClick.init();
    app.fitVids.init();
    app.navBar.init(scrollTop);
    app.dropdowns.init();
    app.formModules.init();
    app.jump.init();
    app.modals.init();
    app.tooltips.init();
    app.accordion.init();
    app.tabs.init();
    app.notifications.init();
    app.offCanvas.init();
    app.toggle.init();
    app.parallax.init(scrollTop);

    //app.cycle.init();
    //app.fancybox.init();
    //app.navPrimary.init();

});

app.settings.$window.ready(function () {
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.scrollSpy.init(scrollTop, windowHeight, true);
});

app.settings.$window.on('scroll', function () {
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.scrollSpy.init(scrollTop, windowHeight, false);
    app.scrollSpyNav.init(scrollTop);
    app.parallax.init(scrollTop);
    app.navBar.scroller(scrollTop);
    app.disableHover.init();
});

app.settings.$window.on('touchmove', function(){
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.scrollSpy.init(scrollTop, windowHeight, false);
    app.scrollSpyNav.init(scrollTop);
});

app.settings.$window.on('resize', function () {
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.navBar.init(scrollTop);
    app.equalize.init();
    app.scrollSpy.init(scrollTop, windowHeight, true);
    app.scrollSpyNav.init(scrollTop);
    app.parallax.init(scrollTop);
    app.navBar.scroller(scrollTop);
});