app.settings = {
    version: '?v=0.1', // If the file changes, update this number
    $document: $(document),
    $window: $(window),
    $html: $('html'),
    $body: $('body'),
    $htmlAndBody: $('html, body'),
    $background: $('#background'),
    $container: $('#container'),
    $main: $('#main'),


    /*==========  Notification  ==========*/

    notifications: {
        cookieLaw: {
            position: 'bottom',
            approveBtnText: 'ok, ik snap het',
            infoBtnShow: true,
            infoBtnLink: '/cookiewet',
            infoBtnText: 'meer informatie',
            notificationText: 'Wij gebruiken cookies om uw gebruikerservaring te verbeteren en statistieken bij te houden.'
        }
    },


    /*==========  Off anvas  ==========*/
    
    offCanvas: {
        toggleLeft: '#off-canvas-toggle-left',
        toggleRight: '#off-canvas-toggle-right',
        width: $('.off-canvas').outerWidth(),
        $el: $('.off-canvas'),
        $link: $('.off-canvas-nav__link')
    },


    /*==========  Fitvids  ==========*/

    fitVids: {
        $el: $('.fitvids')
    },


    /*==========  Jumpto  ==========*/

    jump: {
        $el: $('[data-jumpto]'),
        speed: 300
    },


    /*==========  Primary nav  ==========*/

    navPrimary: {
        $el: $('.nav-primary')
    },


    /*==========  Modals  ==========*/

    modals: {
        $trigger: $('.modal__trigger'),
        $modal: $('.modal')
    },


    /*==========  Cycle  ==========*/

    cycle: {
        $el: $('.cycle-wrap', '.cycle'),
        slides: '> .cycle-item',
        pager : '> .cycle-pager',
        pagerActiveClass: 'cycle-pager-active'
    },


    /*==========  Tooltips  ==========*/

    tooltips: {
        $el: $('.tooltip'),
        tooltipActiveClass: 'tooltip--active',
        tooltipContentClass: 'tooltip__content',
        arrowWidth: 8
    },


    /*==========  Accordion  ==========*/

    accordion: {
        $el: $('.accordion'),
        $group: $('.accordion__group'),
        $trigger: $('.accordion__trigger'),
        contentShowClass: 'accordion-content--show'
    },


    /*==========  Form validation  ==========*/

    formValidation: {
        $el: $('[data-form-validate]'),
        language: 'nl'
    },


    /*==========  Tabs  ==========*/

    tabs: {
        $nav: $('.tabs'),
        $tab: $('.tab'),
        $content: $('.tab-content')
    }

};