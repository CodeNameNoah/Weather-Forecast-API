// Establishing variables to access later
let openWeatherAPIKey = "166a433c57516f51dfab1f7edaed8413";
let locations = [];

// This function retrieves weather data from the OpenWeatherMap API using latitude, longitude, and an API key
function retrieveForecastData(lat, lon, city) {
  // Constructs the query URL for the API using the provided latitude, longitude, and API key
  var queryURL =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&exclude=,minutely,hourly,alerts&appid=" +
    openWeatherAPIKey;

  // Issues an AJAX call to the OpenWeatherMap API with the constructed query URL
  $.ajax({
    url: queryURL,
    method: "GET",
  })
    // If the AJAX call succeeds, execute the following callback function with the response data
    .then(function (response) {
      // Call the showForecastData function to display the weather data for the specified city
      showForecastData(response, city);
    });
}

// This loads weather data for a given area by using ZIP codes retrieved by making a request to the OpenWeatherMap API
function loadForecastByZipCode(zipCode, isClicked) {
  // Constructs the query URL for the API using the provided ZIP code and API key
  var queryURL =
    "https://api.openweathermap.org/data/2.5/forecast?zip=" +
    zipCode +
    ",us&appid=" +
    openWeatherAPIKey;
  // Get a reference to the forecast section of the page
  var forecastSection = $("#forecastSection");
  // Make an AJAX call to the OpenWeatherMap API with the constructed query URL
  $.ajax({
    url: queryURL,
    method: "GET",
  })
    // If/Then statement for when the AJAX call succeeds, execute the following callback function with the response data
    .then(function (response) {
      // Log the response data to the console
      console.log(response);
      // If/Then statement for when the function was not called due to a click event, save the location to local storage and render the list of saved locations
      if (!isClicked) {
        recordLocations(response);
        renderLocations();
      }
      // Call the retrieveForecastData function to display the weather data for the specified location
      retrieveForecastData(
        response.city.coord.lat,
        response.city.coord.lon,
        response.city.name
      );
    })
    // If the AJAX call fails, display an error message to the user
    .catch(function (response) {
      alert("Not a vaild Zip Code");
    });
}
// Loads forecast data for the targeted city and updates the UI accordingly.
function loadForecastCity(city, isClicked) {
  // Build the query URL for the OpenWeatherMap API using the city name and API key.
  var queryURL =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    ",us&appid=" +
    openWeatherAPIKey;
  // Gets a reference to the forecast section of the UI.
  var forecastSection = $("#forecastSection");

  // Uses AJAX to make a GET request to the OpenWeatherMap API.
  $.ajax({
    url: queryURL,
    method: "GET",
  })
    .then(function (response) {
      console.log(response);

      // condition checks if variable isClicked is false, if true then then location forecast data will be stored
      if (!isClicked) {
        recordLocations(response);
        renderLocations();
      }

      //load weathers for the selected area
      retrieveForecastData(
        response.city.coord.lat,
        response.city.coord.lon,
        response.city.name
      );
    })
    // function to alert "Please enter an existing city"
    .catch(function (response) {
      alert("Please enter an existing city");
    });
}

function showForecastData(forecastData, city) {
  // loads current data for city selected
  var iconURL =
    "http://openweathermap.org/img/w/" +
    forecastData.current.weather[0].icon +
    ".png"; //get weather icon
  $("#cityDate").html(
    city +
      " (" +
      new Date().toLocaleDateString() +
      ') <img id="icon" src="' +
      iconURL +
      '" alt="Weather icon"/>'
  );

  var temp = parseInt(forecastData.current.temp);
  temp = Math.round((temp - 273.15) * 1.8 + 32);
  $("#currentAreaTemperature").html(" " + temp + "  &degF");
  $("#currentAreaHumidity").html(forecastData.current.humidity + "%");
  $("#currentAreaWindSpeed").html(forecastData.current.wind_speed + " MPH");

  //load 5 Day
  var ul5 = $("#fiveDay");
  ul5.empty();

  for (
    i = 1;
    i < 6;
    i++ // weird way of getting days 1-5 to appear
  ) {
    // Generates the elements to display the 5 day weather forecast and appends to the parent div
    var div = $("<div>").addClass("bg-primary");

    var dateTime = parseInt(forecastData.daily[i].dt);
    var dateHeading = $("<h6>").text(
      new Date(dateTime * 1000).toLocaleDateString()
    ); // Will transform unix time to JS date format
    var iconDayURL =
      "http://openweathermap.org/img/w/" +
      forecastData.daily[i].weather[0].icon +
      ".png";
    var icon = $("<img>").attr("src", iconDayURL);

    temp = parseInt(forecastData.daily[i].temp.day);
    temp = Math.round((temp - 273.15) * 1.8 + 32);
    var temp5 = $("<p>").html("Temp: " + temp + "  &degF");

    var humidity5 = $("<p>").html(
      "Humidity: " + forecastData.daily[i].humidity + "%"
    );

    div.append(dateHeading);
    div.append(icon);
    div.append(temp5);
    div.append(humidity5);
    ul5.append(div);
  }

  $("#forecastData").show();
}

// Loads locations from local storage to the locations array which can be accessed later to update UI
function loadLocations() {
  var locationsArray = localStorage.getItem("locations");
  if (locationsArray) {
    locations = JSON.parse(locationsArray);
    renderLocations();
  } else {
    localStorage.setItem("locations", JSON.stringify(locations));
  }
}
// Will reset the cities list before rendering from the local storage object
function renderLocations() {
  var divLocations = $("#areaSearchHistory");
  divLocations.empty();

  $.each(locations, function (index, item) {
    var a = $("<a>")
      .addClass("list-group-item list-group-item-action city")
      .attr("data-city", locations[index])
      .text(locations[index]);
    divLocations.append(a);
  });

  $("#areaSearchHistory > a").off();

  $("#areaSearchHistory > a").click(function (event) {
    var element = event.target;
    var city = $(element).attr("data-city");

    loadForecastCity(city, true);
  });
}

//save locations to the locations array and local storage
function recordLocations(data) {
  var city = data.city.name; //get the city came

  locations.unshift(city);
  localStorage.setItem("locations", JSON.stringify(locations)); //convert to a string and sent to local storage
}

$(document).ready(function () {
  $("#forecastData").hide(); // Removes divs from visibility that will display all weather information

  loadLocations(); // Retrieves locations from local storage and places values into locations array

  $("#searchBtn").click(function (event) {
    var element = event.target;
    var searchRequirement = $("#areaCode").val();
    // Creates requirement for search field to not be empty
    if (searchRequirement !== "") {
      // Checks if input field text is a zipcode or city
      var zip = parseInt(searchRequirement);

      if (!isNaN(zip)) {
        loadForecastByZipCode(zip, false);
      } else {
        loadForecastCity(searchRequirement, false);
      }
    }
  });
});
