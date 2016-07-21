app.modal = {
    settings: {
        scrollTopPosition: null,
        $trigger: $('.modal__trigger'),
        $modal: $('.modal')
    },

    init: function () {
        app.settings.$body.append('<div class="modal__overlay" data-modal-close></div>');
        app.modal.triggers();
    },

    triggers: function () {
        app.settings.$body.on('click', '.modal__trigger', function (event) {
            event.preventDefault();

            var $trigger = $(this),
                data = $trigger.data();

            data.modal === 'ajax' ? app.modal.ajax(data.modalAjaxActivity, data.modalAjaxSection) : app.modal.open($trigger, data);
        });

        app.settings.$body.on('keydown', function(event){
            if (event.keyCode === 27) {
                app.modal.close();
            }
        });

        app.settings.$body.on('click', '[data-modal-close]', function(event) {
            event.preventDefault();
            app.modal.close();
        });
    },

    create: function (_triggerData, _targetModal) {
        var html = '<div id="' + _triggerData.modalId + '" class="modal"><div class="modal__content">';

        if (_triggerData.modal === 'ajax') {
            html += _triggerData.modalAjaxContent;
            html += '<a class="modal__close" data-modal-close></a>';
        } else {
            if (_triggerData.modalTitle !== undefined) {
                html +='<h2>' + _triggerData.modalTitle + '</h2>';
            }

            if (_triggerData.modalText !== undefined) {
                html += '<p>' + _triggerData.modalText + '</p>';
            }

            html += '<ul class="list-inline">';

            if (_triggerData.modalCloseBtn !== undefined) {
                if (_triggerData.modal === 'confirm') {
                    if ( typeof _triggerData.modalConfirmAction === "function") {
                        html += '<li><a class="btn btn--beta btn--medium confirm-ok" href="javascript:void(0)" data-modal-close>' + _triggerData.modalConfirmBtn + '</a></li>';
                    } else {
                        html += '<li><a class="btn btn--beta btn--medium" href="' + _triggerData.modalConfirmAction + '">' + _triggerData.modalConfirmBtn + '</a></li>';
                    }
                    html += '<li><button class="btn btn--alpha btn--medium" data-modal-close>' + _triggerData.modalCloseBtn + '</button></li>';
                } else {
                    html += '<li><button class="btn btn--beta btn--medium" data-modal-close>' + _triggerData.modalCloseBtn + '</button></li>';
                }
            }

            html += '</ul>';
        }

        html += '</div></div>';

        app.settings.$body.append(html);

        if ( app.settings.$html.find('.confirm-ok').length ) {
            app.settings.$body.find('#' + _triggerData.modalId + ' .confirm-ok').click(_triggerData.modalConfirmAction);
        }
    },

    open: function (_trigger, _triggerData) {
        var scrollTopPosition = app.settings.$window.scrollTop(),
            $targetModal = (typeof _triggerData === 'string') ? $('#' + _triggerData) : $('#' + _triggerData.modalId);

        app.modal.settings.scrollTopPosition = scrollTopPosition;

        if ($targetModal.length > 0) {
            app.modal.show($targetModal, scrollTopPosition, _triggerData.modalOpenCallback);
        } else {
            app.modal.create(_triggerData, $targetModal);

            setTimeout(function () {
                app.modal.show($('#' + _triggerData.modalId), scrollTopPosition, _triggerData.modalOpenCallback);
            }, 100);
        }
    },

    show: function (_targetModal, _scrollTopPosition, _modalOpenCallback) {
        app.settings.$html.addClass('modal-show');
        _targetModal.addClass('modal-show');

        //app.settings.$background.scrollTop(_scrollTopPosition);
        app.modal.setSize(_targetModal);

        if (_modalOpenCallback && typeof _modalOpenCallback === 'function') {
            _modalOpenCallback();
        }
    },

    close: function () {
        $('.modal-show').removeClass('modal-show');

        //app.settings.$window.scrollTop(app.modal.settings.scrollTopPosition);
    },

    confirm: function (_options) {
        var modalId = 'js-modal-confirm',
            options = $.extend({
                            modal: 'confirm',
                            modalId: modalId,
                            modalConfirmBtn: 'bevestigen',
                            modalCloseBtn: 'annuleren',
                        }, _options);

        $('#' + modalId).remove();

        app.modal.open(this, options);
    },

    /**
     * @TODO: Needs work..
     */
    ajax: function (activity, request) {
        var modalId = 'js-modal-ajax';

        $('#' + modalId).remove();

        $.ajax({
            url: 'modal-ajax.html',
            method: 'GET',
            success: function (data) {
                app.modal.open(this, {
                    modal: 'ajax',
                    modalId: modalId,
                    modalAjaxContent: data
                });
            }
        });
    },

    setSize: function (_targetModal) {
        // Adding even width and height
        // Because of subpixel rendering in Webkit
        // http://martinkool.com/post/27618832225/beware-of-half-pixels-in-css

        _targetModal.removeAttr('style');

        _targetModal.css({
            width: (2 * Math.ceil(_targetModal.width() / 2)),
            height: (2 * Math.ceil(_targetModal.height() / 2))
        });
    }
};