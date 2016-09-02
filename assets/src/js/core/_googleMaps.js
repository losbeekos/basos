app.googleMaps = {
    settings: {
        el: document.getElementById('google-maps'),
        map: null,
        markers: [],
        openInfoWindow: null,
        centerLat: 53.199027,
        centerLon: 5.784693
    },

    markerData: [
        {
            'lat': '53.199027',
            'lng': '5.784693',
            'content': '<b>Company HQ</b><br />Some address 23<br />1234 AB Leeuwarden'
        },
        {
            'lat': '53.199810',
            'lng': '5.774750',
            'content': '<b>Company</b><br />Some address 1<br />1234 AB Leeuwarden'
        }
    ],

    init: function() {
        if (app.googleMaps.settings.el !== null){
            let script = document.createElement('script');

            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' + '&callback=app.googleMaps.map';
            document.body.appendChild(script);
        }
    },

    map: function () {
        let mapOptions = {
            zoom: 16,
            center: new google.maps.LatLng(app.googleMaps.settings.centerLat, app.googleMaps.settings.centerLon),
            scrollwheel: false,
            navigationControl: false,
            mapTypeControl: false,
            scaleControl: false,
            draggable: true,
            zoomControl: false,
            panControl: false,

            // Styles from https://snazzymaps.com
            styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#81a2be"},{"visibility":"on"}]}]
        };

        if (document.documentElement.classList.contains('modernizr_touchevents')) {
            mapOptions.draggable = false;
        }

        app.googleMaps.settings.map = new google.maps.Map(app.googleMaps.settings.el, mapOptions);

        let geocoder = new google.maps.Geocoder();

        // Creating a global infoWindow object that will be reused by all markers
        let infoWindow = new google.maps.InfoWindow();

        app.googleMaps.setMarkers(app.googleMaps.settings.map);

        google.maps.event.addListener(app.googleMaps.settings.map, 'click', function() {
            app.googleMaps.settings.markers[app.googleMaps.settings.openInfoWindow].infowindow.close();
        });
    },

    setMarkers: function (map, marker) {
        let bounds = new google.maps.LatLngBounds();
        // let markerIcon = new google.maps.MarkerImage("/res/assets/dist/img/maps-pointer.png", new google.maps.Size(12, 12), new google.maps.Point(0, 0), new google.maps.Point(6, 6));


        app.googleMaps.markerData.forEach(function (item, index, array) {
            let latLng = new google.maps.LatLng(item.lat, item.lng);

            bounds.extend(latLng);

            // Creating a marker and putting it on the map
            let marker = new google.maps.Marker({
                position: latLng,
                // icon: markerIcon,
                map: map,
                title: item.title,
            });

            marker.infowindow = new google.maps.InfoWindow({
                content: item.content
            });

            marker.addListener('click', function() {
                if (app.googleMaps.settings.openInfoWindow) {
                    app.googleMaps.settings.markers[app.googleMaps.settings.openInfoWindow].infowindow.close();
                }

                app.googleMaps.settings.openInfoWindow = index;
                marker.infowindow.open(map, marker);
            });

            app.googleMaps.settings.markers.push(marker);
        });
    }

};