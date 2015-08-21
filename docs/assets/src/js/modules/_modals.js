app.modals = {
    settings: {
        scrollTopPosition: null,
        $trigger: $('.modal__trigger'),
        $modal: $('.modal')
    },

    init: function () {
        if (app.modals.settings.$trigger.length > 0) {
            app.settings.$body.append('<div class="modal__overlay" data-modal-close></div>');

            app.modals.triggers();
        }
    },

    triggers: function () {
        app.settings.$body.on('click', '.modal__trigger', function (event) {
            event.preventDefault();

            var $trigger = $(this),
                data = $trigger.data();

            data.modal === 'ajax' ? app.modals.ajax(data.modalAjaxActivity, data.modalAjaxSection) : app.modals.openModal($trigger, data);
        });

        app.settings.$body.on('keydown', function(event){
            if (event.keyCode === 27) {
                app.modals.closeModal();
            }
        });

        app.settings.$body.on('click', '[data-modal-close]', function(event) {
            event.preventDefault();
            app.modals.closeModal();
        });
    },

    createModal: function (_triggerData, _targetModal) {
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

            if (_triggerData.modalCloseBtn !== undefined) {
                if (_triggerData.modal === 'confirm') {
                    if ( typeof _triggerData.modalConfirmAction === "function") {
                        html += '<a class="btn btn--beta btn--medium confirm-ok" href="javascript:void(0)" data-modal-close>' + _triggerData.modalConfirmBtn + '</a>';
                    } else {
                        html += '<a class="btn btn--beta btn--medium" href="' + _triggerData.modalConfirmAction + '">' + _triggerData.modalConfirmBtn + '</a>';
                    }
                    html += '<button class="btn btn--alpha btn--medium" data-modal-close>' + _triggerData.modalCloseBtn + '</button>';
                } else {
                    html += '<button class="btn btn--beta btn--medium" data-modal-close>' + _triggerData.modalCloseBtn + '</button>';
                    html += '<a class="modal__close" data-modal-close></a>';
                }
            }
        }

        html += '</div></div>';

        app.settings.$body.append(html);

        if ( app.settings.$html.find('.confirm-ok').length ) {
            app.settings.$body.find('#' + _triggerData.modalId + ' .confirm-ok').click(_triggerData.modalConfirmAction);
        }
    },

    openModal: function (_trigger, _triggerData) {
        var scrollTopPosition = app.settings.$window.scrollTop(),
            $targetModal = (typeof _triggerData === 'string') ? $('#' + _triggerData) : $('#' + _triggerData.modalId);

        app.modals.settings.scrollTopPosition = scrollTopPosition;

        if ($targetModal.length > 0) {
            app.modals.showModal($targetModal, scrollTopPosition, _triggerData.modalOpenCallback);
        } else {
            app.modals.createModal(_triggerData, $targetModal);

            setTimeout(function () {
                app.modals.showModal($('#' + _triggerData.modalId), scrollTopPosition, _triggerData.modalOpenCallback);
            }, 100);
        }
    },

    showModal: function (_targetModal, _scrollTopPosition, _modalOpenCallback) {
        app.settings.$html.addClass('modal-show');
        _targetModal.addClass('modal-show');

        //app.settings.$background.scrollTop(_scrollTopPosition);

        if (_modalOpenCallback && typeof _modalOpenCallback === 'function') {
            _modalOpenCallback();
        }
    },

    closeModal: function () {
        $('.modal-show').removeClass('modal-show');

        //app.settings.$window.scrollTop(app.modals.settings.scrollTopPosition);
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

        app.modals.openModal(this, options);
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
                app.modals.openModal(this, {
                    modal: 'ajax',
                    modalId: modalId,
                    modalAjaxContent: data
                });
            }
        });
    }
};