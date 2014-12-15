app.groupCheckable = {
    init: function () {
        $('[data-group-checkable]').on('change', function () {
            var $this = $(this),
                $group = $('[data-group-checkable-target=' + $this.attr('data-group-checkable') + ']');

            $this.is(':checked') ? $group.prop('checked', true) : $group.prop('checked', false);
        });

        $('[data-group-checkable-target]').on('change', function () {
            var $this = $(this),
                group = $this.attr('data-group-checkable-target'),
                $group = $('[data-group-checkable-target=' + group + ']'),
                $groupChecked = $('[data-group-checkable-target=' + group + ']:checked'),
                $trigger = $('[data-group-checkable=' + group + ']');

            $group.length === $groupChecked.length ? $trigger.prop('checked', true) : $trigger.prop('checked', false);
        });
    }
};