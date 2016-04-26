module.exports = {
    dev:  {
        'classPrefix': 'modernizr_',
        'dest' : '<%= basos.dist %>/js/modernizr.js',
        'parseFiles': true,
        'devFile': 'assets/src/js/modernizr/dev.js',
        'outputFile' : '<%= basos.dist %>/js/modernizr.js',
        'files': {
            'src': [
                '<%= basos.dist %>/css/main.css',
                '<%= basos.dist %>/js/app.js'
            ]
        },
        'options' : [
            'setClasses',
            'html5shiv',
            'addTest',
            'html5printshiv',
            'testProp',
            'fnBind',
            'mq'
        ],
        'tests': [
            'touchevents',
            'ellipsis',
            'supports',
            'template'
        ],
        'excludeTests': [
            'json',
            'svg',
            'csstransitions',
            'cookies',
            'target',
            'borderradius',
            'placeholder',
            'notification'
        ],
        'customTests': [],
        'uglify': false
    }
}