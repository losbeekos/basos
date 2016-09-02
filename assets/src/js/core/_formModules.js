/**
 * This module is depended on jQuery.
 * Plugin used: Parsley (validation engine).
 */

app.formModules = {
    settings: {
        passwordToggle: document.querySelectorAll('.form__password-toggle'),
        passwordShowClass: 'form__input--show-password',
        $validation: $('[data-form-validate]'),
        validationLanguage: 'nl',
        range: document.querySelectorAll('input[type=range]')
    },

    init: function () {
        app.formModules.customFileInput();
        app.formModules.validation();
        app.formModules.password();
        app.formModules.ajaxForm();
        app.formModules.floatingLabel();
        app.formModules.range();
    },

    range: function () {
        let rangeEventHandler = range => {
            range.addEventListener('input', function () {
                let id = this.getAttribute('id'),
                    val = this.value,
                    measurement = this.getAttribute('data-range-measurement'),
                    range = document.querySelector('[data-range=' + id +']');

                if (id !== undefined) {
                    range.innerHTML = measurement === undefined ? val : val + measurement;
                }
            });
        };

        app.formModules.settings.range.forEach(rangeEventHandler);
    },

    customFileInput: function () {
        let fileInput = document.querySelectorAll('.form__file-input');

        if(fileInput.length > 0) {
            fileInput.forEach(input => {
                let label = input.nextElementSibling,
                    labelVal = label.innerHTML;

                input.addEventListener('change', function(event) {
                    let fileName = '';

                    fileName = this.files && this.files.length > 1 ? (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length) : event.target.value.split('\\').pop();
                    fileName ? label.querySelector('span').innerHTML = fileName : label.html(labelVal);
                });

                // Firefox bug fix
                input.addEventListener('focus', el => el.classList.add('has-focus'));
                input.addEventListener('blur', el => el.classList.remove('has-focus'));
            });
        }
    },

    password: function () {
        let eventHandler = el => {
            el.addEventListener('click', function () {
                let $this = $(this),
                    $formPassword = $this.closest('.form__input'),
                    $formInput = $formPassword.find('input'),
                    formType = $formInput.attr('type');

                $formInput.attr('type', formType === 'text' ? 'password': 'text');
                $formPassword.toggleClass(app.formModules.settings.passwordShowClass);
            });
        };

        app.formModules.settings.passwordToggle.forEach(eventHandler);
    },

    validation: function(){
        let parsleyOptions = {
                errorClass: 'form__input--error',
                successClass: 'form__input--success',
                errorsWrapper: '<div class="parsley-container"></div>',
                errorTemplate: '<div></div>',
                trigger: 'change',

                classHandler: function (element){
                    let $element = element.$element[0];

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
                    let $container = element.$element.closest('.form__input');

                    return $container;
                }
            };

        if (app.formModules.settings.$validation.length > 0) {
            app.formModules.settings.$validation.each(function () {
                $(this).parsley(parsleyOptions);
            });

            window.Parsley.setLocale(app.formModules.settings.validationLanguage);
        }
    },

    ajaxForm: function () {
        app.settings.$body.on('submit', '[data-form-ajax]', function (event) {
            let $form = $(this),
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
    },

    floatingLabel: function () {
        app.formModules.floatingLabelSetClass($('.form__input--floating-label input'));

        app.settings.$body.on('change', '.form__input--floating-label input', function () {
            app.formModules.floatingLabelSetClass($(this));
        });
    },

    floatingLabelSetClass: function ($input) {
        if ($input.length > 0) {
            $input.val().length > 0 ? $input.addClass('is-filled') : $input.removeClass('is-filled');
        }
    }
};