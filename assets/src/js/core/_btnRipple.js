app.btnRipple = {
    settings: {
        ripple: true
    },

    init: function() {
        var $el, $btn, $ripple, x, y;

        app.btnRipple.settings.ripple === true ? $el = $('.btn') : $el = $('.btn--ripple');

        $el
            .each(function () {
                $(this).append('<span class="btn__ripple"></span>');
            })
            .on('click', function (event) {
                $btn = $(this);
                $ripple = $btn.find('.btn__ripple');
                
                if($ripple.length === 0) {
                    $btn.append('<span class="btn__ripple"></span>');
                }

                $btn.removeClass('btn--ripple-animate');
                
                if(!$ripple.height() && !$ripple.width()) {
                    d = Math.max($btn.outerWidth(), $btn.outerHeight());
                    $ripple.css({height: d, width: d});
                }

                x = event.pageX - $btn.offset().left - $ripple.width()/2;
                y = event.pageY - $btn.offset().top - $ripple.height()/2;
                
                $ripple.css({top: y+'px', left: x+'px'});
                $btn.addClass('btn--ripple-animate');
            });
    }

};