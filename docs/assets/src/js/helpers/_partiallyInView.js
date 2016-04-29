helper.partiallyInView = function(el) {
    if (el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.bottom - (rect.height/2) <= app.settings.$window.height()
    );
};