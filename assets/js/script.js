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

const initialURL = 'https://api.openweathermap.org/data/2.5/forecast?appid=ade8f7a4c03aa4d6280241e8e6da95e0'

const geocodeInitialURL = 'http://api.openweathermap.org/geo/1.0/direct?appid=ade8f7a4c03aa4d6280241e8e6da95e0&q='

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
      currentDate = document.createTextNode(` ${moment().format("ddd MMM D YYYY")}`);
      currentDateEl.appendChild(currentDate);
      let totalTemp = 0;
      let totalHumidity = 0;
      let totalWind = 0;
      for (let i=0; i < 40; i++) {
        totalTemp += (weatherFound.list[i].main["temp"] - 273.15);
        totalHumidity += (weatherFound.list[i].main["humidity"]);
        totalWind += (weatherFound.list[i].wind["speed"]);
      }
      meanTemp = document.createTextNode(` ${Math.round(totalTemp/40)} °C`);
      currentTempEl.appendChild(meanTemp);
      meanHumidity = document.createTextNode(` ${Math.round(totalHumidity/40)} %`);
      currentHumidityEl.appendChild(meanHumidity);
      meanWind = document.createTextNode(` ${Math.round(totalWind/40)} m/s`);
      currentWindEl.appendChild(meanWind);
      let currentIcon = weatherFound.list[0].weather[0].icon;
        let currentIconUrl = `http://openweathermap.org/img/wn/${currentIcon}.png`
        currentIconEl.src = currentIconUrl;
        currentImage.appendChild(currentIconEl);
      //update future 5-day forecast
      for(let i=3; i < 40; i+=8) {
        let j = (i-3)/8;
        let x = new Date(Date.parse(weatherFound.list[i].dt_txt)).toDateString();
        futureDateText = document.createTextNode(` ${x}`);
        futureDates[j].appendChild(futureDateText);
        futureTempText = document.createTextNode(` ${Math.round(weatherFound.list[i].main["temp"] - 273.15)} °C`);
        futureTemp[j].appendChild(futureTempText);
        futureWindText = document.createTextNode(` ${weatherFound.list[i].wind["speed"]} m/s`);
        futureWind[j].appendChild(futureWindText);
        futureHumidityText = document.createTextNode(` ${weatherFound.list[i].main["humidity"]} %`);
        futureHumidity[j].appendChild(futureHumidityText);
        let icon = weatherFound.list[i].weather[0].icon;
        let iconUrl = `http://openweathermap.org/img/wn/${icon}.png`
        futureIcon[j].src = iconUrl;
        image[j].appendChild(futureIcon[j]);
      }
      updateHistory(lat, lon, city);

    })
    .catch(function(error) {
      console.log(error);
      return alert('Error. Not Found.');
    })
  }

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
    button.innerHTML = storedCity.city;
    button.onclick = function () {
      getInfo(storedCity.lat, storedCity.lon, storedCity.city);
    }
    document.getElementById("history").appendChild(button);
  }
  searchInputEl.value = '';
}

function createButtons() {
  let searchedCities = JSON.parse(localStorage.getItem("cityinfo"));
  if (searchedCities) { 
    for (i=0; i < searchedCities.length; i++) {
      const button = document.createElement("button");
      button.setAttribute('type', 'button');
      button.innerHTML = searchedCities[i].city;
      button.onclick = function() {
        console.log(searchedCities);
        console.log(searchedCities[i]);
        getInfo(searchedCities[i].lat, searchedCities[i].lon, searchedCities[i].city);
      }
      document.getElementById("history").appendChild(button);
    }
  }
}

searchFormEl.addEventListener('submit', findCityInfo);
createButtons();

  