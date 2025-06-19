const apiKey = "1bcdef1c1357b167ff571776590bff4f";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkWeather(city) {
  const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

  if (response.status === 404) {
    document.querySelector(".error").style.display = "block";
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".forecast-section").style.display = "none";

  } else {
    const data = await response.json();
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    getWeatherAlerts(lat, lon);


    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    document.querySelector(".feels-like").innerHTML = Math.round(data.main.feels_like);
    document.querySelector(".pressure").innerHTML = data.main.pressure;

    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);

    document.querySelector(".sunrise").innerHTML = sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.querySelector(".sunset").innerHTML = sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const windDeg = data.wind.deg;
    const windDirection = getWindDirection(windDeg);
    document.querySelector(".wind-dir").innerHTML = windDirection;


    const condition = data.weather[0].main;

    updateWeatherIcon(condition);


    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";

    setBackground(condition);

    speakWeather(
      data.name,
      Math.round(data.main.temp),
      data.main.humidity,
      data.wind.speed
    );
    get5DayForecast(data.name);
    getHourlyForecast(data.name);
    document.querySelector(".forecast-section").style.display = "block";

  }

}

async function get5DayForecast(city) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(forecastUrl);
  const data = await response.json();

  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = ""; // clear previous

  const dailyData = {};

  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    const time = item.dt_txt.split(" ")[1];

    // pick one time per day (like 12:00)
    if (time === "12:00:00") {
      if (!dailyData[date]) {
        dailyData[date] = item;
      }
    }
  });

  Object.keys(dailyData).slice(0, 5).forEach((date) => {
    const forecast = dailyData[date];
    const day = new Date(forecast.dt_txt).toLocaleDateString("en-US", {
      weekday: "short",
    });
    const icon = forecast.weather[0].icon;
    const tempMin = Math.round(forecast.main.temp_min);
    const tempMax = Math.round(forecast.main.temp_max);

    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <h4>${day}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${forecast.weather[0].main}" />
      <p>${tempMin}° / ${tempMax}°</p>
    `;

    forecastContainer.appendChild(card);
  });
}

async function getHourlyForecast(city) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(forecastUrl);
  const data = await response.json();

  const hourlyContainer = document.getElementById("hourly");
  hourlyContainer.innerHTML = ""; // clear previous

  const now = new Date();
  let count = 0;

  data.list.forEach((item) => {
    const time = new Date(item.dt_txt);

    if (time > now && count < 8) {
      const hour = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const icon = item.weather[0].icon;
      const temp = Math.round(item.main.temp);

      const card = document.createElement("div");
      card.classList.add("hourly-card");
      card.innerHTML = `
        <p>${hour}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${item.weather[0].main}" />
        <p>${temp}°C</p>
      `;

      hourlyContainer.appendChild(card);
      count++;
    }
  });
}



function updateWeatherIcon(condition) {
  switch (condition) {
    case "Clouds":
      weatherIcon.src = "images/clouds.png";
      weatherIcon.alt = "Weather icon showing clouds";
      break;
    case "Clear":
      weatherIcon.src = "images/clear.png";
      weatherIcon.alt = "Weather icon showing clear sky";
      break;
    case "Rain":
      weatherIcon.src = "images/rain.png";
      weatherIcon.alt = "Weather icon showing rain";
      break;
    case "Drizzle":
      weatherIcon.src = "images/drizzle.png";
      weatherIcon.alt = "Weather icon showing drizzle";
      break;
    case "Mist":
      weatherIcon.src = "images/mist.png";
      weatherIcon.alt = "Weather icon showing mist";
      break;
    case "Snow":
      weatherIcon.src = "images/snow.png";
      weatherIcon.alt = "Weather icon showing snow";
      break;
    default:
      weatherIcon.src = "";
      weatherIcon.alt = "Weather icon";
      break;
  }
}

async function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const response = await fetch(url);

  if (response.status === 404) {
    document.querySelector(".error").style.display = "block";
    document.querySelector(".weather").style.display = "none";
  } else {
    const data = await response.json();

    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    getWeatherAlerts(lat, lon);


    // Extra details
    document.querySelector(".feels-like").innerHTML = Math.round(data.main.feels_like);
    document.querySelector(".pressure").innerHTML = data.main.pressure;

    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);

    document.querySelector(".sunrise").innerHTML = sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.querySelector(".sunset").innerHTML = sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const windDeg = data.wind.deg;
    const windDirection = getWindDirection(windDeg);
    document.querySelector(".wind-dir").innerHTML = windDirection;


    const condition = data.weather[0].main;
    updateWeatherIcon(condition);
    setBackground(condition);
    speakWeather(data.name, Math.round(data.main.temp), data.main.humidity, data.wind.speed);

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
  }
  updateWeatherIcon(condition);
}


function speakWeather(city, temp, humidity, windSpeed) {
  window.speechSynthesis.cancel();
  const message = `Weather update for ${city}. The temperature is ${temp} degrees Celsius. Humidity is ${humidity} percent. Wind speed is ${windSpeed} kilometers per hour.`;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-US";
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

function setBackground(condition) {
  const body = document.body;
  let image = "";

  switch (condition) {
    case "Clear":
      image = "images/backgrounds/clear.jpg";
      break;
    case "Clouds":
      image = "images/backgrounds/clouds.jpg";
      break;
    case "Rain":
      image = "images/backgrounds/rain.jpg";
      break;
    case "Drizzle":
      image = "images/backgrounds/drizzle.jpg";
      break;
    case "Mist":
      image = "images/backgrounds/mist.jpg";
      break;
    case "Snow":
      image = "images/backgrounds/snow.jpg";
      break;
    default:
      body.style.backgroundImage = "none";
      body.style.backgroundColor = "#0f172a";
      return;
  }

  body.style.backgroundImage = `url('${image}')`;
  body.style.backgroundSize = "cover";
  body.style.backgroundPosition = "center";
  body.style.backgroundRepeat = "no-repeat";
}

async function getWeatherAlerts(lat, lon) {
  const alertUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${apiKey}`;
  const response = await fetch(alertUrl);
  const data = await response.json();

  const alertsSection = document.getElementById("alerts-section");
  const alertsDiv = document.getElementById("alerts");
  alertsDiv.innerHTML = "";

  if (data.alerts && data.alerts.length > 0) {
    alertsSection.style.display = "block";
    data.alerts.forEach((alert) => {
      const alertBox = document.createElement("div");
      alertBox.innerHTML = `
        <strong>${alert.event}</strong> <br />
        <em>${alert.sender_name}</em><br />
        <p>${alert.description}</p>
      `;
      alertsDiv.appendChild(alertBox);
    });
  } else {
    alertsSection.style.display = "none";
  }
}

searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
});

const locationBtn = document.getElementById("locationBtn");

locationBtn.addEventListener("click", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      (error) => {
        alert("Unable to access location. Please check browser permissions.");
        console.error(error);
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});


// Add mic button
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;

  const micBtn = document.createElement("button");
  micBtn.innerHTML = "🎤";
  micBtn.setAttribute("aria-label", "Speak city name");
  micBtn.style.marginLeft = "10px";
  micBtn.style.fontSize = "24px";
  micBtn.style.borderRadius = "50%";
  micBtn.style.width = "60px";
  micBtn.style.height = "60px";
  micBtn.style.border = "none";
  micBtn.style.background = "#14b8a6";
  micBtn.style.color = "#fff";
  micBtn.style.cursor = "pointer";

  document.querySelector(".search").appendChild(micBtn);

  micBtn.onclick = () => {
    recognition.start();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchBox.value = transcript;
    checkWeather(transcript);
  };
}

function getWindDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function getWindDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

const toggleBtn = document.getElementById("toggleBtn");
const extraDetails = document.querySelector(".extra-details");
const basicDetails = document.querySelector(".basic-details");

toggleBtn.addEventListener("click", () => {
  const isExpanded = extraDetails.style.display === "block";

  extraDetails.style.display = isExpanded ? "none" : "block";
  basicDetails.style.display = isExpanded ? "flex" : "none";
  toggleBtn.textContent = isExpanded ? "More Details" : "Less Details";
});

