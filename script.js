
function initMap(parameters) {

  var stops = parameters || [
    'Christchurch, New Zealand',
    'Picton, New Zealand',
    'Wellington, New Zealand',
    'Tararua Forest Park'
  ]

  // var origin1 = 'Christchurch, New Zealand';
  // var origin2 = 'Picton, New Zealand';
  // var destinationA = 'Picton, New Zealand';
  // var destinationB = 'Wellington, New Zealand';

  var bounds = new google.maps.LatLngBounds;
  var markersArray = [];

  var destinationIcon = 'https://chart.googleapis.com/chart?' +
  'chst=d_map_pin_letter&chld=D|FF0000|000000';
  var originIcon = 'https://chart.googleapis.com/chart?' +
  'chst=d_map_pin_letter&chld=O|FFFF00|000000';

  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 55.53, lng: 9.4},
    zoom: 10
  });
  var geocoder = new google.maps.Geocoder;

  var service = new google.maps.DistanceMatrixService;

  var outputDiv = document.getElementById('tripTable');
  outputDiv.innerHTML = '';

  // var xmlhttp=new XMLHttpRequest();
  // xmlhttp.open("GET","trip.kml");
  // xmlhttp.send();
  // var xmlDoc=xmlhttp.responseXML;

  // var xml = new KmlMapParser({
  //   map: map,
  //   kml: 'trip.kml',
  // });

  // calcDistance(origin1, destinationA);
  // calcDistance(origin2, destinationB);
  var origin = stops[0];
  var destination;
  for(var i=1; i<stops.length; i++){
    destination = stops[i];

    calcDistance(origin, destination);

    origin = destination;
  }

  outputDiv.innerHTML += '</table>'

  function calcDistance(origin1, destinationA) {

    service.getDistanceMatrix({
      origins: [origin1],
      destinations: [destinationA],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        console.warn('Error was: ' + status);
      } else {
        var originList = response.originAddresses;
        var destinationList = response.destinationAddresses;
        //outputDiv.innerHTML = '';
        //deleteMarkers(markersArray);

        var showGeocodedAddressOnMap = function(asDestination) {
          var icon = asDestination ? destinationIcon : originIcon;
          return function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              map.fitBounds(bounds.extend(results[0].geometry.location));
              markersArray.push(new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                icon: icon
              }));
            } else {
              console.warn('Geocode was not successful due to: ' + status);
            }
          };
        };

        for (var i = 0; i < originList.length; i++) {
          var results = response.rows[i].elements;
          geocoder.geocode({'address': originList[i]},
          showGeocodedAddressOnMap(false));
          for (var j = 0; j < results.length; j++) {
            geocoder.geocode({'address': destinationList[j]},
            showGeocodedAddressOnMap(true));
            outputDiv.innerHTML +=
            '<tr><td>' + originList[i] + ' </td><td> ' + destinationList[j] +
            '</td><td> ' + results[j].distance.text + ' </td><td> ' +
            results[j].duration.text + '</td></tr>';
          }
        }
      }
    });
  }

}

function deleteMarkers(markersArray) {
  for (var i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray = [];
}

function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    processContents(contents);
  };
  reader.readAsText(file);
}

function processContents(contents) {
  // body...
  var xmlDoc = new DOMParser().parseFromString(contents,'text/xml');
  var placemarks = xmlDoc.getElementsByTagName('Placemark');

  var stops = [];
  for (var i = 0; i < placemarks.length; i++) {
    var p = placemarks[i];

    var hasPoint = p.getElementsByTagName('Point').length >0;
    var name = p.querySelector('name').textContent;
    

    console.log(name);

    if(hasPoint){
      var coord = p.querySelector('Point > coordinates');
      var splits = coord.textContent.split(',');

      var obj = {lat: splits[0], lng: splits[1]};

      console.log(obj)

      stops.push(name);

    }

  }

  initMap(stops);

}

document.getElementById('file-input').addEventListener('change', readSingleFile, false);
