app.settings.$document.ready(function () {

    app.equalize.init();
    app.fastClick.init();
    app.fitVids.init();
    app.navBar.init();
    app.formValidation.init();
    app.jump.init();
    app.modals.init();
    app.tooltips.init();
    app.accordion.init();
    app.tabs.init();
    app.notifications.init();
    app.offCanvas.init();
    app.scrollSpy.init();

    //app.cycle.init();
    //app.fancybox.init();
    //app.navPrimary.init();

});

app.settings.$window.on('resize scroll', function () {
    app.scrollSpy.init();
});

app.settings.$window.on('resize', function () {
    app.equalize.init();
});