app.formModules = {
    settings: {
        $passwordToggle: $('.form__password-toggle'),
        passwordShowClass: 'form__input--show-password',
        $validation: $('[data-form-validate]'),
        validationLanguage: 'nl',
        $range: $('input[type=range]')
    },

    init: function () {
        app.formModules.range();
        app.formModules.validation();
        app.formModules.password();
        app.formModules.ajaxForm();
    },

    range: function () {
        if (!Modernizr.inputtypes.range) {
            yepnope.injectJs(app.pathBower + 'rangeslider.js/dist/rangeslider.min.js', function () {
                app.formModules.settings.$range.rangeslider();
            });
        }

        app.formModules.settings.$range.on('input change', function () {
            var $this = $(this),
                data = $this.data(),
                id = $this.attr('id'),
                val = $this.val(),
                $range = $('[data-range=' + id +']');

            if (id !== undefined) {
                data.rangeMeasurement === undefined ? $range.html(val) : $range.html(val + data.rangeMeasurement);
            }
        });
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
            yepnope.injectJs(app.pathBower + 'parsleyjs/src/i18n/' + app.formModules.settings.validationLanguage + '.js', function () {
                yepnope.injectJs(app.pathBower + 'parsleyjs/dist/parsley.js',
                    function(){
                        app.formModules.settings.$validation.each(function () {
                            $(this).parsley(parsleyOptions);
                        });

                        window.ParsleyValidator.setLocale(app.formModules.settings.validationLanguage);
                    });
            });
        }
    },

    ajaxForm: function () {
        app.settings.$body.on('submit', '[data-form-ajax]', function (event) {
            var $form = $(this),
                action = $form.attr('action'),
                data = $form.data(),
                url = null;

            event.preventDefault();

            url === undefined ? url = window.location : url = data.formAjaxUrl;

            if ($form.parsley().isValid()) {
                $.ajax({
                    url: url,
                    data: $form.serialize(),
                    action: action,
                    method: data.formAjaxMethod,
                    dataType: data.formAjaxDatatype,
                    success: function (response) {

                        switch (response.status) {
                            case 200:
                                app.notifications.add(data.formAjaxMsgContainer, response.message, 'beta', 'success');
                                app.formModules.emptyForm($form);
                                break;
                            case 500:
                                app.notifications.add(data.formAjaxMsgContainer, response.message, 'beta', 'error');
                                break;
                        }

                        app.jump.to(data.formAjaxMsgContainer, 40);
                    }
                });
            }
        });
    },

    emptyForm: function (_form) {
        _form.find('input[type=text], input[type=password], textarea, select').val('');
        _form.find('input[type=radio], input[type=checkbox]').prop('checked', false);
    }
};