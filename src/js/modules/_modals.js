app.modals = {
    settings: {
        scrollTopPosition: null,
        $trigger: $('.modal__trigger'),
        $modal: $('.modal')
    },

    init: function () {
        var self = this;

        if (app.modals.settings.$trigger.length > 0 && app.modals.settings.$modal.length > 0) {
            app.settings.$body.append('<div class="modal__overlay" data-modal-close></div>');

            self.triggers();
        }
    },

    triggers: function () {
        var self = this;

        app.modals.settings.$trigger.on('click', function (event) {
            event.preventDefault();

            var $trigger = $(this);

            self.openModal($trigger, $trigger.data('modalId'));
        });

        app.settings.$body.on('keydown', function(event){
            if (event.keyCode === 27) {
                self.closeModal();
            }
        });

        $('[data-modal-close]').on('click', function(event) {
            event.preventDefault();
            self.closeModal();
        });
    },

    openModal: function (_trigger, _modalId) {
        var self = this,
            scrollTopPosition = app.settings.$window.scrollTop(),
            $targetModal = $('#' + _modalId);

        app.modals.settings.scrollTopPosition = scrollTopPosition;

        app.settings.$html
            .addClass('modal-show')
            .attr('data-modal-effect', $targetModal.data('modal-effect'));

        $targetModal.addClass('modal-show');

        app.settings.$background.scrollTop(scrollTopPosition);
    },

    closeModal: function () {
        var self = this;

        $('.modal-show').removeClass('modal-show');
        app.settings.$html
            .removeClass('modal-show')
            .removeAttr('data-modal-effect');

        app.settings.$window.scrollTop(app.modals.settings.scrollTopPosition);
    }
};