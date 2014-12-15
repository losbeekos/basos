app.formModules = {
    settings: {
        $passwordToggle: $('.form__password-toggle'),
        passwordShowClass: 'form__input--show-password',
        $validation: $('[data-form-validate]'),
        validationLanguage: 'nl'
    },

    init: function () {
        app.formModules.validation();
        app.formModules.password();
    },

    password: function () {
        app.formModules.settings.$passwordToggle.on('click', function () {
            var $this = $(this),
                $formPassword = $this.closest('.form__input'),
                $formInput = $formPassword.find('input'),
                formType = $formInput.attr('type');

            $formInput.attr('type', formType === 'text' ? 'password': 'text');
            $formPassword.toggleClass(app.formModules.settings.passwordShowClass);
        });
    },

    validation: function(){
        var parsleyOptions = {
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

        if(app.formModules.settings.$validation.length > 0){
            yepnope.injectJs(app.pathBower + 'parsleyjs/src/i18n/' + app.formModules.settings.validationLanguage + '.js' + app.settings.version, function () {
                yepnope.injectJs(app.pathBower + 'parsleyjs/dist/parsley.js' + app.settings.version,
                    function(){
                        app.formModules.settings.$validation.each(function () {
                            $(this).parsley(parsleyOptions);
                        });

                        window.ParsleyValidator.setLocale(app.formModules.settings.validationLanguage);
                    });
            });
        }
    }
};