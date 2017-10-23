    var map;
    var markers = []; // create blank array for all the listing markers
    var polygon = null; // Ensure only one polygon is rendered with this global variable
    var placeMarkers = []; // placemakers array to use in several fxs to have control over the number of places that show.

	function initMap(){
        // To style map, create styles array inside initialize function
        var styles = new google.maps.StyledMapType(
            [
                {
                    featureType: 'water',
                    stylers: [
                        {color: '#19a0d8'}
                    ]
                },
                {
                    featureType: 'administrative',
                    elementType: 'labels.text.stroke',
                    stylers: [
                        {color: '#ffffff'},
                        {weight: 6}
                    ]
                },
                {
                    featureType: 'administrative',
                    elementType: 'labels.text.fill',
                    stylers: [
                        {color: '#e85113'},
                    ]                        
                },
                {
                    featureType: 'road.highway',
                    elementType: 'geometry.stroke',
                    stylers: [
                        {color: '#efe9e4'},
                        {lightness: -40}
                    ]                        
                },
                {
                    featureType: 'transit.station',
                    stylers: [
                        {weight: 9},
                        {hue: '#e85113'}
                    ]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'labels.icon',
                    stylers: [
                        {visibility: 'off'},
                    ]                        
                },
                {
                    featureType: 'water',
                    elementType: 'labels.text.stroke',
                    stylers: [
                      { lightness: 100 }
                    ]
                  },
                  {
                    featureType: 'water',
                    elementType: 'labels.text.fill',
                    stylers: [
                      { lightness: -100 }
                    ]
                  },
                  {
                    featureType: 'poi',
                    elementType: 'geometry',
                    stylers: [
                      { visibility: 'on' },
                      { color: '#f0e4d3' }
                    ]
                  },
                  {
                    featureType: 'road.highway',
                    elementType: 'geometry.fill',
                    stylers: [
                      { color: '#efe9e4' },
                      { lightness: -25 }
                    ]
                  }
            ],
            {name: 'Styled Map'});
		// Create a new map instance (object) to be placed inside the HTML we specify (e.g. div with #map). REQ'D PARAMETERS: center AND zoom.
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 40.7413549, lng: -73.9980244}, 
            // center: {lat: 41.828860, lng: -71.434593},  //450 Valley St Prov: 41.828860 / -71.434593
			zoom: 14,
            // styles: styles,         // initial map now includes styles defined inside function.
            mapTypeControlOptions: {
                mapTypeIds: ['satellite', 'styled_map']
            }// give user ability to switch map view bw roadmap and our styled map
            // mapTypeControl: false //mapTypeControl parameter allows user to change map type. This line disables it.
		});
        // Associate the styled map with the mapTypeId and set it to display.
        map.mapTypes.set('styled_map', styles);
        map.setMapTypeId('styled_map');

        var autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('search-within-time-text'));
        
        var zoomAutocomplete = new google.maps.places.Autocomplete(
            document.getElementById('zoom-to-area-text'));
        // Bias the boundaries within the map for the zoom to text area
        zoomAutocomplete.bindTo('bounds', map);
        // Create a search box for searching for places 
        var searchBox = new google.maps.places.SearchBox(
            document.getElementById('places-search'));
        //Bias the searchbox to within bounds of the map
        searchBox.setBounds(map.getBounds());

        // Listings to be shown to user (listings should eventually be moved to a DB)
		var locations = [
            {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
            {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
            {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
            {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
            {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
            {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
        ];
        // var locations = [
        //     {title: 'WaterFire Arts Center', location: {lat: 41.828860, lng: -71.434593}},
        //     {title: 'Davis Park', location: {lat: 41.833305, lng: -71.431050}},
        //     {title: 'Providence Public Library', location: {lat: 41.821860, lng: -71.417114}},
        //     {title: 'URI', location: {lat: 41.823345, lng: -71.413960}},
        //     {title: 'PPAC', location: {lat: 41.821132, lng: -71.411961}},
        //     {title: 'Providence City Hall', location: {lat: 41.824134, lng: -71.412913}},
        //     {title: 'Train Station', location: {lat: 41.829250, lng: -71.413283}}
        // ];
        var largeInfowindow = new google.maps.InfoWindow();
        // Initialize the drawing manager
        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT,
                drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
                ]
            }
        });
        // Style the default listing marker
        var defaultIcon = makeMarkerIcon('0091ff');
        // Style the "highlighted location" marker; i.e. a marker that changes color when user mouses over the marker.
        var highlightedIcon = makeMarkerIcon('FFFF24');

        // In case a marker is outside zoom area and we need to resize and capture the southwest and northeast corners of the window, we create a new "bounds" instance.
        var bounds = new google.maps.LatLngBounds();

        // Loop below uses location array to create array of markers on initialize, including the "defaultIcon" style created above.
        for (var i = 0; i < locations.length; i++) {
            // get the position from the location array
            var position = locations[i].location;
            var title = locations[i].title;
            // create a marker per location, and put into markers array
            var marker = new google.maps.Marker({
                position: position,
                title: title,
                icon: defaultIcon, //style defined above loop
                animation: google.maps.Animation.DROP,
                id: i
            });
            // Push the marker to our array of markers
            markers.push(marker);
            // extend the boundaries of the map for each marker
            bounds.extend(marker.position);
            // create onclick event to open an infowindow at each marker
            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow);
            });
            // Two event listeners below change the colors back and forth bw mouseover and mouseout
            marker.addListener('mouseover', function(){
                this.setIcon(highlightedIcon);
            });
            marker.addListener('mouseout', function(){
                this.setIcon(defaultIcon);
            });
        }
        document.getElementById('show-listings').addEventListener('click', showListings);
        document.getElementById('hide-listings').addEventListener('click', hideMarkers(markers));
        document.getElementById('toggle-drawing').addEventListener('click', function(){
            toggleDrawing(drawingManager);
        });
        document.getElementById('zoom-to-area').addEventListener('click', function(){
            zoomToArea();
        });
        document.getElementById('search-within-time').addEventListener('click', function(){
            searchWithinTime();
        });
        // Event listener for whe user selects a prediction from the picklist
        searchBox.addListener('places_changed', function() {
            searchBoxPlaces(this);
        });
        // Event listener for when user selects a prediction and clicks "go" for more details for that place.
        document.getElementById('go-places').addEventListener('click', textSearchPlaces);

        // Event Listener for when polygon is captured, it calls the searchWithinPolygon function. It will
        // show the markers located within the polygon and hide those utside of it.
        drawingManager.addListener('overlaycomplete', function(event) {
            // First, check if there is an existing polygon. If there is, get rid of it and remove the markers
            if (polygon) {
              polygon.setMap(null);
              hideMarkers(markers);
            }
            // Switching the drawing mode to the HAND (i.e., no longer drawing).
            drawingManager.setDrawingMode(null);
            // Creating a new editable polygon from the overlay.
            polygon = event.overlay;
            polygon.setEditable(true);
            // Searching within the polygon.
            searchWithinPolygon();
            // Make sure the search is re-done if the poly is changed.
            polygon.getPath().addListener('set_at', searchWithinPolygon);
            polygon.getPath().addListener('insert_at', searchWithinPolygon);
          });
    }

        // Function below populates the infowindow with the marker's title when the marker is clicked.
        function populateInfoWindow (marker, infowindow){
            if (infowindow.marker == marker) {
                // clear the infowindow content to give the streetview time to load
                infowindow.setContent('');
                infowindow.marker = marker;
                infowindow.open(map, marker);
                // Clear the marker when the infowindow is closed
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
                // Create a new StreetViewService object. Object will get a panorama based on the closest location to the marker AND it needs to find out which way to point the camera (heading and pitch).
                // Use streetview service to get the closest streetview image w/in 50 mtrs of the markers position
                var streetViewService = new google.maps.StreetViewService();
                var radius = 50;
                // If status is OK (ie the pano was found), compute the position of streetview image, then calculate the heading, then get a panorama from that and set the options
                function getStreetView(data, status){
                    if (status == google.maps.StreetViewStatus.OK) {
                        var nearStreetViewLocation = data.location.latLng;
                        var heading = google.maps.geometry.spherical.computeHeading(
                            nearStreetViewLocation, marker.position);
                            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                            var panoramaOptions = {
                                position: nearStreetViewLocation,
                                pov: {
                                    heading: heading,
                                    pitch: 30
                                }
                            };
                        var panorama = new google.maps.StreetViewPanorama(
                            document.getElementById('pano'), panoramaOptions);
                    } else
                    {
                        infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
                    }
                }
                // Use streetview service to get the closest streetview image w/in 50 mtrs of the markers position
                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                // Open the infowindow on the correct marker
                infowindow.open(map, marker);
            }
        }
        // Function to loop through all markers in array and display them
        function showListings(){
            var bounds = new google.maps.LatLngBounds();
            // Extend the boundaries of the map for each marker and display the marker
            for(var i = 0; i < markers.length; i++){
                markers[i].setMap(map);
                bounds.extend(markers[i].position);
            }
            map.fitBounds(bounds);
        }

        // Fx to loop through the listings array and hide them all
        function hideMarkers(markers){
            for(var i = 0; i < markers.length; i++){
                markers[i].setMap(null);
            }
        }
	

    // Function to take in a color and then create a new marker icon of that color with these properties: 21px wide x 34px high; Origin of (0,0); Anchored at (10,34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +'|40|_|%E2%80%A2',
          new google.maps.Size(31, 44),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(31, 44));
        return markerImage;
    }

    // Fx to toggle the show and hide in the drawing options
    function toggleDrawing(drawingManager){
        if (drawingManager.map){
            drawingManager.setMap(null); //if showing, hide
            if (polygon !== null) {
                polygon.setMap(null);
            }
        } else {
            drawingManager.setMap(map); //if hiding, show
        }
    }

    // Fx to hide all markers outside the polygon and show only the ones inside it.
    function searchWithinPolygon() {
        for (var i = 0; i < markers.length; i++){
            if(google.maps.geometry.poly.containsLocation(markers[i].position, polygon)){
                markers[i].setMap(map);
            } else {
                markers[i].setMap(null);
            }
        }
    }

    function zoomToArea() {
        // Initialize the geocoder.
        var geocoder = new google.maps.Geocoder();
        // Get the address or place that the user entered.
        var address = document.getElementById('zoom-to-area-text').value;
        // Make sure the address isn't blank.
        if (address == '') {
          window.alert('You must enter an area, or address.');
        } else {
          // Geocode the address/area entered to get the center. Then, center the map on it and zoom in
          geocoder.geocode(
            { address: address,
              componentRestrictions: {locality: 'New York'}
            }, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(15);
              } else {
                window.alert('We could not find that location - try entering a more' +
                    ' specific place.');
              }
            });
        }
    }

    // Use the DistanceMatrixService to calculate the distance and the duration to travel between each of our markers and the 
    // location that the user enters. This results in a F/E funcionality where the user can search listings located within 
    // the travel time (in minutes) of a given location.
    function searchWithinTime() {
        // Initialize the distance matrix service.
        var distanceMatrixService = new google.maps.DistanceMatrixService;
        var address = document.getElementById('search-within-time-text').value;
        // Check to make sure the place entered isn't blank.
        if (address == '') {
          window.alert('You must enter an address.');
        } else {
          hideMarkers(markers);
        // Distance Matrix Service: use it calculate the duration of the routes between all our markers, 
        //  and the destination address entered by the user. Then put all the origins into an origin matrix.
          var origins = [];
          for (var i = 0; i < markers.length; i++) {
            origins[i] = markers[i].position;
          }
          var destination = address;
          var mode = document.getElementById('mode').value;
          // With origins and destination now defined, get all the info for the distances between them.
          distanceMatrixService.getDistanceMatrix({
            origins: origins,
            destinations: [destination],
            travelMode: google.maps.TravelMode[mode],
            unitSystem: google.maps.UnitSystem.IMPERIAL,
          }, function(response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
              window.alert('Error was: ' + status);
            } else {
              displayMarkersWithinTime(response);
            }
          });
        }
      }
      // This function will go through each of the results, and,
      // if the distance is LESS than the value in the picker, show it on the map.
      function displayMarkersWithinTime(response) {
        var maxDuration = document.getElementById('max-duration').value;
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        // Parse through the results, and get the distance and duration of each.
        // Because there might be  multiple origins and destinations we have a nested loop
        // Then, make sure at least 1 result was found.
        var atLeastOne = false;
        for (var i = 0; i < origins.length; i++) {
          var results = response.rows[i].elements;
          for (var j = 0; j < results.length; j++) {
            var element = results[j];
            if (element.status === "OK") {
              // The distance is returned in feet, but the TEXT is in miles. If we wanted to switch
              // the function to show markers within a user-entered DISTANCE, we would need the
              // value for distance, but for now we only need the text.
              var distanceText = element.distance.text;
              // Duration value is given in seconds so we make it MINUTES. We need both the value
              // and the text.
              var duration = element.duration.value / 60;
              var durationText = element.duration.text;
              if (duration <= maxDuration) {
                //the origin [i] should = the markers[i]
                markers[i].setMap(map);
                atLeastOne = true;
                // Create a mini infowindow to open immediately and contain the
                // distance and duration
                var infowindow = new google.maps.InfoWindow({
                    // content: durationText + ' away, ' + distanceText
                    content: durationText + ' away, ' + distanceText + '<div><input type=\"button\" value=\"View Route\" onclick=' + 
                  '\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
                });
                infowindow.open(map, markers[i]);
                // Put this in so that this small window closes if the user clicks
                // the marker, when the big infowindow opens
                markers[i].infowindow = infowindow;
                google.maps.event.addListener(markers[i], 'click', function() {
                  this.infowindow.close();
                });
              }
            }
          }
        } 
  
        if (!atLeastOne) {
          window.alert('We could not find any locations within that distance!');
        }
      }

      function displayDirections(origin) {
        hideMarkers(markers);
        var directionsService = new google.maps.DirectionsService;
        // get destination address from user
        var destinationAddress =
          document.getElementById('search-within-time-text').value;
        // get mode from user
        var mode = document.getElementById('mode').value;
        directionsService.route({
            //origin is the passed in marker's position
            origin: origin,
            // destination entered by user
            destination: destinationAddress,
            travelMode: google.maps.TravelMode[mode]
        }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                var directionsDisplay = new google.maps.DirectionsRenderer({
                    map: map,
                    directions: response,
                    draggable: true,
                    polylineOptions: {
                        strokeColor: 'green'
                    }
                   });
                   } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });
            }

    // This fx fires when user selects a searchbox picklist item. It will do a nearby search using the selected query string or place.
    function searchBoxPlaces(searchBox) {
        hideMarkers(placeMarkers);
        var places = searchBox.getPlaces();
        // for each place, get the icon, name & location
        createMarkersForPlaces(places);
        if (places.length == 0) {
            window.alert('We did not find any places matching that search!');
        }
    }
    // This fx fires when user selects "go" on the places search. It will do a nearby search using the selected query string or place.
    function textSearchPlaces() {
        var bounds = map.getBounds();
        hideMarkers(placeMarkers);
        var placesService = new google.maps.places.PlacesService(map);
        placesService.textSearch({
            query: document.getElementById('places-search').value,
            bounds: bounds
        }, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                createMarkersForPlaces(results);
            }
        });
    }
    // This function creates markers for each place found in either places search
    function createMarkersForPlaces(places) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var icon = {
                url: place.icon,
                size: new google.maps.Size(35, 35),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(15, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location,
                id: place.id
            });
            placeMarkers.push(marker);
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }            
        }
        map.fitBounds(bounds);
    }

// To compute the area (in sq mtrs) of a polygonal area, use geometry library and call computeArea(), 
// passing the array of LatLng objects defining a closed loop. google.maps.geometry.spherical.computeArea(yourPolygon.getPath());