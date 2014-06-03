app.formValidation = {
    init: function(){
        var self = this,
            parsleyOptions = {
                trigger: 'change',
                successClass: 'form__input--success',
                errorClass: 'form__input--error',
                errors: {
                    classHandler: function (element, isRadioOrCheckbox){
                        var $element = $(element);

                        if ($element[0].localName === 'select') {
                            $($element[0].offsetParent).closest('.form__input').addClass('form__input--select-validated');
                        }

                        if (isRadioOrCheckbox) {
                            return $element.closest('.form__input-list');
                        } else {
                            return $element.closest('.form__input');
                        }
                    },

                    container: function (element, isRadioOrCheckbox) {
                        var $container = element.closest('.form__input');

                        if ($container.length === 0) {
                            $container = $("<ul class='parsley-container'></ul>").append($container);
                        }

                        return $container;
                    }
                }
            };

        if(app.settings.formValidation.$el.length > 0){
            yepnope.injectJs(app.path + 'plugins/jquery.parsley/i18n/messages.nl.js' + app.settings.version, function () {
                yepnope.injectJs(app.path + 'plugins/jquery.parsley/parsley.js' + app.settings.version,
                    function(){
                        app.settings.formValidation.$el.each(function () {
                            $(this).parsley(parsleyOptions);
                        });
                    });
            });
        }
    }
};