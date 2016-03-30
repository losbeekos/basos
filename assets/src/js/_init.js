app.settings.$document.ready(function () {
    var $this = $(this),
        scrollTop = $this.scrollTop();

    app.svg.init();
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
    app.groupCheckable.init();
    app.leave.init();
    app.btnDropdown.init();
    app.btnRipple.init();
    app.googleMaps.init();

    //app.cycle.init();
    //app.fancybox.init();
    //app.navPrimary.init();

});

app.settings.$window.ready(function () {
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.scrollSpy.init(scrollTop, windowHeight, true);
    app.affix.init(scrollTop);
    app.equalize.init();
    app.delayedImageLoading.init();

    setTimeout(function () {
        app.responsiveImages.setBackgroundImage();
    }, 10);
});

app.settings.$window.on('scroll', function () {
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.scrollSpy.init(scrollTop, windowHeight, false);
    app.scrollSpyNav.init(scrollTop);
    app.navBar.scroller(scrollTop);
    app.disableHover.init();

    if (app.settings.$html.hasClass('modernizr_no-touchevents')) {
        // app.affix.scroller(scrollTop);
    }
});

app.settings.$window.on('touchmove', function(){
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.affix.scroller(scrollTop);
    app.scrollSpy.init(scrollTop, windowHeight, false);
    app.scrollSpyNav.init(scrollTop);
});

app.settings.$window.on('resize', function () {

    app.settings.$html.addClass('disable-transitions');

    if(this.resizeTo) {
        clearTimeout(this.resizeTo);
    }

    this.resizeTo = setTimeout(function() {
        var $this = $(this),
            scrollTop = $this.scrollTop(),
            windowHeight = $this.height();

        app.equalize.init();
        app.scrollSpy.init(scrollTop, windowHeight, true);
        app.scrollSpyNav.init(scrollTop);
        app.navBar.resize(scrollTop);
        app.navBar.scroller(scrollTop);
        app.affix.init(scrollTop);
        app.responsiveImages.setBackgroundImage();

        app.settings.$html.removeClass('disable-transitions');
    }, 500);
});