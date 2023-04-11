const APIKey = "166a433c57516f51dfab1f7edaed8413";
const locations = ["New York", "London", "Tokyo"];

const baseURL = "http://api.openweathermap.org/data/2.5/weather?q=";
const units = "&units=metric";

for (let i = 0; i < locations.length; i++) {
  const city = locations[i];
  const url = baseURL + city + units + "&appid=" + APIKey;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(`The current temperature in ${city} is ${data.main.temp}°C`);
    })
    .catch((error) => console.log(error));
}
