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
  } else {
    const data = await response.json();

    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    const condition = data.weather[0].main;

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

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";

    setBackground(condition);

    speakWeather(
      data.name,
      Math.round(data.main.temp),
      data.main.humidity,
      data.wind.speed
    );
  }
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

searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
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
