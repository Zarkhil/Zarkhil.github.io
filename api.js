// Variables
let bioscoopForm = document.querySelector("#formBioscoop");
let parkingForm = document.querySelector("#formParking");

let linkBioscoop = document.querySelector("#linkBioscoop");
let linkParking = document.querySelector("#linkParking");

let listParkings = document.querySelector(".listParkings");
let listBioscopen = document.querySelector(".listBioscopen");
let click = 0;

// Audio bij het drukken op een marker
const clickSound = document.querySelector("#clickSound");

// Bij het drukken op de gekozen filters worden de filters voor elk categorie zichtbaar
linkBioscoop.addEventListener("click", function (e) {
  if (click % 2 == 0) {
    bioscoopForm.style.visibility = "visible";
  } else if (click % 2 == 1) {
    bioscoopForm.style.visibility = "hidden";
  }
  click++;
});

linkParking.addEventListener("click", function (e) {
  if (click % 2 == 0) {
    parkingForm.style.display = "block";
  } else if (click % 2 == 1) {
    parkingForm.style.display = "none";
  }
  click++;
});

// Functie om de maps te tonen en markers(met labels, content, icons, ect...) toe te voegen
async function initMap() {
  let map;
  let parkings = await fetchParking();
  let bioscopen = await fetchBioscoop();

  // Iconen voor de bioscopen en de cinema's: http://kml4earth.appspot.com/icons.html

  const markerParking = {
    url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png",
    scaledSize: new google.maps.Size(50, 50),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, 0),
  };

  const markerBioscoop = {
    url: "http://maps.google.com/mapfiles/kml/shapes/movies.png",
    scaledSize: new google.maps.Size(50, 50),
    origin: new google.maps.Point(0, 0),
    achor: new google.maps.Point(0, 0),
  };

  // De link naar de video voor het gebruiken van google maps api https://www.youtube.com/watch?v=Zxf1mnP5zcw&t=136s
  // Hier gaan we kijken als de navigator geolocation toelaat of niet
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentpositie = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map = new google.maps.Map(document.getElementById("map"), {
          center: currentpositie,
          zoom: 14,
        });

        // Functie om marker met de nodige propreties toe te voegen
        function addMarker(props) {
          var marker = new google.maps.Marker({
            position: props.coords,
            map: map,
            animation: google.maps.Animation.DROP,
          });

          if (props.iconImage) {
            marker.setIcon(props.iconImage);
          }

          if (props.labelText) {
            marker.setLabel(props.labelText);
          }

          if (props.titleMarker) {
            marker.setTitle(props.titleMarker);
          }

          if (props.content) {
            var infoWindow = new google.maps.InfoWindow({
              content: props.content,
            });

            marker.addListener("click", function () {
              clickSound.play();
              infoWindow.open(map, marker);
            });
          }
        }

        // Lijst van markers
        var markers = [
          {
            content: "<h1> I found you!</h1>",
            coords: currentpositie,
          },
        ];

        // Verschillende bioscopen toevoegen aan de lijst van markers
        bioscopen.forEach((bioscoop) => {
          markers.push({
            content: `<h1>${bioscoop.fields.bioscoop}</h1>`,
            coords: {
              lat: bioscoop.fields.coordinaten[0],
              lng: bioscoop.fields.coordinaten[1],
            },
            iconImage: markerBioscoop,
          });

          listBioscopen.insertAdjacentHTML(
            "beforeend",
            `
            <li class="bioscopenItems listItems"><a class="bioscopenLinks listLinks" href="#"><span class="linksSpan">${bioscoop.fields.bioscoop}</span></a></li>
            `
          );
        });

        // Verschillende parkings toevoegen aan de lijst van markers
        parkings.forEach((parking) => {
          if (
            parking.fields.nombre_de_places_aantal_plaatsen >=
            VrijParking(parking)
          ) {
            markers.push({
              content: `<h1>${parking.fields.nom_naam}, Plaatsen vrij: ${parking.fields.nombre_de_places_aantal_plaatsen} </h1>`,
              coords: {
                lat: parking.fields.coordonnes_coordinaten[0],
                lng: parking.fields.coordonnes_coordinaten[1],
              },
              iconImage: markerParking,
              titleMarker: `${VrijParking(parking)} Vrij`,
            });
          } else if (
            parking.fields.nombre_de_places_aantal_plaatsen >=
            bijnaVolzetParking(parking)
          ) {
            markers.push({
              content: `<h1>${parking.fields.nom_naam}, Plaatsen vrij: ${parking.fields.nombre_de_places_aantal_plaatsen} </h1>`,
              coords: {
                lat: parking.fields.coordonnes_coordinaten[0],
                lng: parking.fields.coordonnes_coordinaten[1],
              },
              iconImage: markerParking,
              titleMarker: `${bijnaVolzetParking(parking)} BijnaVolzet`,
            });
          } else if (
            parking.fields.nombre_de_places_aantal_plaatsen <=
            VolzetParking(parking)
          ) {
            markers.push({
              content: `<h1>${parking.fields.nom_naam}, Plaatsen vrij: ${parking.fields.nombre_de_places_aantal_plaatsen}</h1>`,
              coords: {
                lat: parking.fields.coordonnes_coordinaten[0],
                lng: parking.fields.coordonnes_coordinaten[1],
              },
              iconImage: markerParking,
              titleMarker: `${VolzetParking(parking)} VOLZET`,
            });
          }

          // Alle parkings tonen in een lijst met het aantal plaatsen
          listParkings.insertAdjacentHTML(
            "beforeend",
            `
            <li class="parkingsItems listItems"><a class="listLinks" href="#"><span class="linksSpan">${parking.fields.nom_naam}</span>, Vrije plaatsen: ${parking.fields.nombre_de_places_aantal_plaatsen}</a></li>
            `
          );

          // Bij het drukken op een van de parkings in de lijst van bij de filters wordt er gezoomt op de marker van de parking zelf
          listParkings.addEventListener("click", function (e) {
            e.preventDefault();
            map.setCenter({
              lat: parking.fields.coordonnes_coordinaten[0],
              lng: parking.fields.coordonnes_coordinaten[1],
            });
            map.setZoom(19);
          });
        });

        // Automatisatie voor het invoegen van markers
        for (let i = 0; i < markers.length; i++) {
          addMarker(markers[i]);
        }
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }

  // Indien navigator niet werkt wordt er een foutmelding getoont
  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  }
}

// Functie om te kijken als elke parking 75% van zijn plaatsen over heeft
function VrijParking(parking) {
  let vrij = percentage(parking.fields.nombre_de_places_aantal_plaatsen, 75);
  return vrij;
}

// Functie om te kijken als elke parking 50% van zijn plaatsen over heeft
function bijnaVolzetParking(parking) {
  let bijnaVolzet = percentage(
    parking.fields.nombre_de_places_aantal_plaatsen,
    50
  );
  return bijnaVolzet;
}

// Functie om te kijken als elke parking 25% van zijn plaatsen over heeft
function VolzetParking(parking) {
  let volzet = percentage(parking.fields.nombre_de_places_aantal_plaatsen, 25);

  return volzet;
}

// Functie die gaat berekenen hoeveel plaatsen er overblijven bij elke parking door het geven van een getal en een percentage
function percentage(num, per) {
  return Math.round((num / 100) * per);
}
