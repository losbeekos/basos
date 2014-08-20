app.settings.$document.ready(function () {
    var scrollTop = $(this).scrollTop();

    app.equalize.init();
    app.fastClick.init();
    app.fitVids.init();
    app.navBar.init(scrollTop);
    app.formModules.init();
    app.jump.init();
    app.modals.init();
    app.tooltips.init();
    app.accordion.init();
    app.tabs.init();
    app.notifications.init();
    app.offCanvas.init();
    app.scrollSpy.init();
    app.parallax.init(scrollTop);

    //app.cycle.init();
    //app.fancybox.init();
    //app.navPrimary.init();

});

app.settings.$window.on('resize scroll', function () {
    var scrollTop = $(this).scrollTop();

    app.scrollSpy.init();
    app.parallax.init(scrollTop);
    app.navBar.scroller(scrollTop);
});

app.settings.$window.on('resize', function () {
    app.equalize.init();
});