app.formValidation = {
    init: function(){
        var self = this,
            parsleyOptions = {
                errorClass: 'form__input--error',
                successClass: 'form__input--success',
                errorsWrapper: '<div class="parsley-container"></div>',
                errorTemplate: '<div></div>',
                trigger: 'change',

                classHandler: function (element){
                    var $element = element.$element[0];

                    if ($element.localName === 'select') {
                        element.$element.closest('.form__input').addClass('form__input--select-validated');
                    }

                    if ($element.localName === 'input' && $element.type === 'checkbox' || $element.localName === 'input' && $element.type === 'radio') {
                        return element.$element.closest('.form__input-list');
                    } else {
                        return element.$element.closest('.form__input');
                    }
                },

                errorsContainer: function (element) {
                    var $container = element.$element.closest('.form__input');

                    return $container;
                }
            };

        if(app.settings.formValidation.$el.length > 0){
            yepnope.injectJs(app.pathBower + 'parsleyjs/src/i18n/' + app.settings.formValidation.language + '.js' + app.settings.version, function () {
                yepnope.injectJs(app.pathBower + 'parsleyjs/dist/parsley.js' + app.settings.version,
                    function(){
                        app.settings.formValidation.$el.each(function () {
                            $(this).parsley(parsleyOptions);
                        });

                        window.ParsleyValidator.setLocale(app.settings.formValidation.language);
                    });
            });
        }
    }
};