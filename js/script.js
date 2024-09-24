$(document).ready(function () {
    var countries = [];

    // Charger le fichier JSON contenant les données des pays
    $.getJSON('data/pays.json', function (data) {
        countries = data.map(function (item) {
            return {
                name: item.nom_fr_fr, // ou 'nom_en_gb'
                alpha2: item.alpha2
            };
        });

        // Initialiser l'autocomplétion une fois les données chargées
        $("#country-input").autocomplete({
            source: countries.map(function (item) { return item.name; }),
            select: function (event, ui) {
                var selectedCountry = countries.find(function (country) {
                    return country.name === ui.item.value;
                });
                fetchCountryInfo(selectedCountry.name);
            }
        });
    });

    // Ajouter un gestionnaire d'événements pour le bouton de recherche
    $("#search-button").click(function () {
        var countryName = $("#country-input").val();
        fetchCountryInfo(countryName);
    });

    // Rechercher les informations du pays
    function fetchCountryInfo(countryName) {
        var selectedCountry = countries.find(function (country) {
            return country.name === countryName;
        });

        if (selectedCountry) {
            // URL de Geonames avec HTTPS
            var geonamesUrl = `http://api.geonames.org/searchJSON?name_equals=${selectedCountry.name}&maxRows=1&username=Lisantya`;

            // Appel à l'API Geonames
            $.getJSON(geonamesUrl, function (response) {
                if (response && response.geonames.length > 0) {
                    var countryInfo = response.geonames[0];
                    var lat = countryInfo.lat;
                    var lng = countryInfo.lng;

                    // Afficher les informations du pays
                    $("#country-flag").attr("src", `https://flagcdn.com/80x60/${selectedCountry.alpha2.toLowerCase()}.png`);
                    $("#country-code").text(`Code du pays : ${countryInfo.countryCode}`);
                    $("#country-name").text(`Nom du pays : ${countryInfo.countryName}`);
                    $("#country-population").text(`Population : ${countryInfo.population.toLocaleString()}`);

                    // Afficher le conteneur d'informations du pays
                    $("#country-info").show();
                    $("#country-flag").show(); // Afficher le drapeau

                    // Afficher la carte
                    showMap(lat, lng);
                } else {
                    alert('Le pays n\'a pas été trouvé dans Geonames');
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.error('Erreur lors de la requête à l\'API Geonames :', textStatus, errorThrown);
                alert('Erreur de communication avec l\'API Geonames.');
            });
        } else {
            alert('Pays non trouvé.');
        }
    }

    // Afficher la carte avec Leaflet
    var map;
    function showMap(latitude, longitude) {
        if (!map) {
            map = L.map('map').setView([latitude, longitude], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        } else {
            map.setView([latitude, longitude], 5);
        }

        L.marker([latitude, longitude]).addTo(map)
            .bindPopup('Localisation du pays sélectionné')
            .openPopup();

        // Afficher le conteneur de la carte
        $("#map").show();
    }
});