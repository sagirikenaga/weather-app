// assigning variables
let searchInputEl = document.getElementById("search-input");
let searchFormEl = document.getElementById("search-section");
futureDates = document.getElementsByClassName("fdate");
futureTemp = document.getElementsByClassName("ftemp");
futureWind = document.getElementsByClassName("fwind");
futureHumidity = document.getElementsByClassName("fhumidity");
futureIcon = document.getElementsByClassName("fweather-icon");
image = document.getElementsByClassName("img");
future = document.getElementsByClassName("future");
historyEl = document.getElementById("history");
cityNameEl = document.getElementById("city-name");
currentDateEl = document.getElementById("date");
currentTempEl = document.getElementById("temp");
currentWindEl = document.getElementById("wind");
currentHumidityEl = document.getElementById("humidity");
currentIconEl = document.getElementById("weather-icon");
currentImage = document.getElementById("current-img");
let weatherFound;

//API links 
const initialURL = 'https://api.openweathermap.org/data/2.5/forecast?appid=ade8f7a4c03aa4d6280241e8e6da95e0'
const geocodeInitialURL = 'http://api.openweathermap.org/geo/1.0/direct?appid=ade8f7a4c03aa4d6280241e8e6da95e0&q='

//initial function to retrieve latitude/longitude value for searched city input
const findCityInfo = function(event) {
    event.preventDefault();

    const cadCode = 'CA';
    const city = searchInputEl.value.trim();
    const updatedGeocodeUrl = `${geocodeInitialURL}${city},${cadCode}`;
  
    fetch(updatedGeocodeUrl).then(function(response) {
      if (response.ok) {
        return response.json();
      }
    })
    .then(function(data) {
      if (data.length === 0) {
        return alert(`City not found. Please enter valid city name.`);
      }
      const cityFound = data[0];
      const lat = cityFound.lat;
      const lon = cityFound.lon;
      console.log(cityFound);
      return getInfo(lat, lon, city);
    })
    .catch(function(error) {
      console.log(error);
      return alert('Results not found. Please enter valid city name.');
    }) 
  }

//function to retrieve weather data for searched city and displays to screen
const getInfo = function(lat, lon, city) {

    let updatedURL = `${initialURL}&lat=${lat}&lon=${lon}`;
  
    fetch(updatedURL).then(function(response) {
      if (response.ok) {
        return response.json();
      }
    })

    .then(function(data) {
      //update current forecast
      weatherFound = data;
      console.log(weatherFound);

      cityNameEl.innerHTML = `City: ${weatherFound.city["name"]}`
      currentDateEl.innerHTML = ` ${moment().format("ddd MMM D YYYY")}`

      let totalTemp = 0;
      let totalHumidity = 0;
      let totalWind = 0;
      for (let i=0; i < 40; i++) {
        totalTemp += (weatherFound.list[i].main["temp"] - 273.15);
        totalHumidity += (weatherFound.list[i].main["humidity"]);
        totalWind += (weatherFound.list[i].wind["speed"]);
      }
      
      currentTempEl.innerHTML = `Temperature: ${Math.round(totalTemp/40)} °C`
      currentHumidityEl.innerHTML = `Humidity: ${Math.round(totalHumidity/40)} %`
      currentWindEl.innerHTML = `Current Wind: ${Math.round(totalWind/40)} m/s`

      let currentIcon = weatherFound.list[0].weather[0].icon;
        let currentIconUrl = `http://openweathermap.org/img/wn/${currentIcon}.png`
        currentIconEl.src = currentIconUrl;

      //update future 5-day forecast
      for(let i=3; i < 40; i+=8) {
        let j = (i-3)/8;
        let x = new Date(Date.parse(weatherFound.list[i].dt_txt)).toDateString();

        futureDates[j].innerHTML = `Date: ${x}`;
        futureTemp[j].innerHTML = `Temperature: ${Math.round(weatherFound.list[i].main["temp"] - 273.15)} °C`;
        futureWind[j].innerHTML = `Wind: ${weatherFound.list[i].wind["speed"]} m/s`;
        futureHumidity[j].innerHTML = `Humidity: ${weatherFound.list[i].main["humidity"]} %`;

        let icon = weatherFound.list[i].weather[0].icon;
        let iconUrl = `http://openweathermap.org/img/wn/${icon}.png`
        futureIcon[j].src = iconUrl;
      }

      updateHistory(lat, lon, city);

    })
    .catch(function(error) {
      console.log(error);
      return alert('Error. Not Found.');
    })
  }

  // adds searched city into local storage and lists as buttons under search bar
function updateHistory(lat, lon, city) {
  let storedCity = {
    lat: lat,
    lon: lon,
    city: city
  }
  let searchedCities = JSON.parse(localStorage.getItem("cityinfo"));
  if (!searchedCities) {
    searchedCities =[];
  }
  if (!searchedCities.some(c => c.city == storedCity.city)) {
    searchedCities.push(storedCity);
    localStorage.setItem('cityinfo', JSON.stringify(searchedCities));
    const button = document.createElement("button");
    button.setAttribute('type', 'button');
    button.dataset.lat = lat;
    button.dataset.lon = lon;
    button.dataset.city = city;
    button.innerHTML = storedCity.city;
    button.onclick = buttonSearch;
    document.getElementById("history").appendChild(button);
  }
  searchInputEl.value = '';
}

//creates and appends buttons onto page on load up
function createButtons() {
  let searchedCities = JSON.parse(localStorage.getItem("cityinfo"));
  if (searchedCities) { 
    for (i=0; i < searchedCities.length; i++) {
      const button = document.createElement("button");
      button.setAttribute('type', 'button');
      button.dataset.lat = searchedCities[i].lat;
      button.dataset.lon = searchedCities[i].lon;
      button.dataset.city = searchedCities[i].city;
      button.innerHTML = searchedCities[i].city;
      button.onclick = buttonSearch;
      document.getElementById("history").appendChild(button);
    }
  }
}

// runs function so that when button for previous city is clicked, information for that city appears with getInfo function
function buttonSearch() {
  console.log(this);
  getInfo(this.dataset.lat, this.dataset.lon, this.dataset.city);
}

searchFormEl.addEventListener('submit', findCityInfo);
createButtons();

  