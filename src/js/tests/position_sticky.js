/*================================================
=            Test for position sticky            =
=       http://caniuse.com/#feat=css-sticky      =
================================================*/

Modernizr.addTest('csssticky', function(){
    var bool;
    Modernizr.testStyles("#modernizr { position: -webkit-sticky;position: -moz-sticky;position: -o-sticky; position: -ms-sticky; position: sticky;}", function(elem, rule) {
       bool = ((window.getComputedStyle ? getComputedStyle(elem, null) : elem.currentStyle).position).indexOf("sticky") !== -1;
    });
    return bool;
});