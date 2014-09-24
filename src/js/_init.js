app.settings.$document.ready(function () {
    var scrollTop = $(this).scrollTop();

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
    app.scrollSpy.init();
});

app.settings.$window.on('scroll', function () {
    var scrollTop = $(this).scrollTop();

    app.scrollSpy.init();
    app.scrollSpyNav.init(scrollTop);
    app.parallax.init(scrollTop);
    app.navBar.scroller(scrollTop);
    app.disableHover.init();
});

app.settings.$window.on('touchmove', function(){
    var scrollTop = $(this).scrollTop();

    app.scrollSpy.init();
    app.scrollSpyNav.init(scrollTop);
});

app.settings.$window.on('resize', function () {
    var scrollTop = $(this).scrollTop();

    app.navBar.init(scrollTop);
    app.equalize.init();
    app.scrollSpy.init();
    app.scrollSpyNav.init(scrollTop);
    app.parallax.init(scrollTop);
    app.navBar.scroller(scrollTop);
});