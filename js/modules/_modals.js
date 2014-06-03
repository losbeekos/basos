app.modals = {
    scrollTopPosition: null,

    init: function () {
        var self = this;

        if (app.settings.modals.$trigger.length > 0 && app.settings.modals.$modal.length > 0) {
            app.settings.$body.append('<div class="modal__overlay" data-modal-close></div>');

            self.triggers();
        }
    },

    triggers: function () {
        var self = this;

        app.settings.modals.$trigger.on('click', function (event) {
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

        self.scrollTopPosition = scrollTopPosition;

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

        app.settings.$window.scrollTop(self.scrollTopPosition);
    }
};