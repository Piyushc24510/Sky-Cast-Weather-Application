"use strict";

const apiURL = "https://api.openweathermap.org/data/2.5/weather";
const forecastAPI = "https://api.openweathermap.org/data/2.5/forecast";
const apiKey = "6138cbe655f7380d180b51393f7a7bf3";

const input = document.getElementById("impTXT");
const searchBtn = document.querySelector(".searchArea button");
const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");

const errorText = document.querySelector(".error");
const loader = document.querySelector(".loader");
const weatherAnimation = document.getElementById("weatherAnimation");

// LOADER
function showLoader() {
    loader.style.display = "block";
}
function hideLoader() {
    loader.style.display = "none";
}
// WEATHER ANIMATION
function playWeatherAnimation(type) {
    let animationURL = "";

    if (type === "Clear") animationURL = "https://assets3.lottiefiles.com/packages/lf20_y6mY2A.json";
    else if (type === "Clouds") animationURL = "https://assets7.lottiefiles.com/packages/lf20_jmBauI.json";
    else if (type === "Rain") animationURL = "https://assets7.lottiefiles.com/packages/lf20_rpC1Rd.json";
    else if (type === "Snow") animationURL = "https://assets6.lottiefiles.com/packages/lf20_q4MZz2.json";
    else if (type === "Mist" || type === "Haze") animationURL = "https://assets2.lottiefiles.com/packages/lf20_5iYIBa.json";
    else animationURL = "https://assets3.lottiefiles.com/packages/lf20_y6mY2A.json";

    weatherAnimation.innerHTML = "";
    lottie.loadAnimation({
        container: weatherAnimation,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: animationURL
    });
}
// 🌈 WEATHER BASED ANIMATED BACKGROUND
function changeBackgroundByWeather(weather) {
    let colors;

    if (weather === "Clear") {
        colors = ["#ff9a9e", "#fad0c4"];
    } else if (weather === "Clouds") {
        colors = ["#757f9a", "#d7dde8"];
    } else if (weather === "Rain") {
        colors = ["#1f1c2c", "#928dab"];
    } else if (weather === "Snow") {
        colors = ["#83a4d4", "#b6fbff"];
    } else {
        colors = ["#ff512f", "#dd2476"];
    }

    document.body.style.background = `linear-gradient(-45deg, ${colors[0]}, ${colors[1]}, #24c6dc, #514a9d)`;
    document.body.style.backgroundSize = "400% 400%";
    document.body.style.animation = "gradientBG 12s ease infinite";
}

// ☁ FLOATING CLOUD CONTROL
function toggleClouds(weather) {
    const clouds = document.querySelector(".clouds");

    if (!clouds) return;

    if (weather === "Clear") {
        clouds.style.opacity = "0.2";
    } else if (weather === "Clouds") {
        clouds.style.opacity = "0.6";
    } else if (weather === "Rain" || weather === "Snow") {
        clouds.style.opacity = "0.1";
    } else {
        clouds.style.opacity = "0.3";
    }
}
// ✅ 7 DAY FORECAST
async function get7DayForecast(lat, lon) {
    const forecastContainer = document.getElementById("forecastContainer");
    forecastContainer.innerHTML = "";

    try {
        const response = await fetch(
            `${forecastAPI}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );

        const data = await response.json();
        const dailyMap = {};
        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyMap[date]) {
                dailyMap[date] = item;
            }
        });

        Object.values(dailyMap).slice(0, 7).forEach(day => {
            const weekday = new Date(day.dt_txt).toLocaleDateString("en-IN", { weekday: "short" });
            const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

            forecastContainer.innerHTML += `
                <div class="forecastCard">
                    <div class="forecastDay">${weekday}</div>
                    <img src="${icon}">
                    <div class="forecastTemp">${Math.round(day.main.temp)}°C</div>
                </div>
            `;
        });

    } catch (error) {
        console.error("7 Day Forecast Error:", error);
        forecastContainer.innerHTML = "<p>Error</p>";
    }
}
// ✅ HOURLY FORECAST
async function getHourlyForecast(lat, lon) {
    const hourlyContainer = document.getElementById("hourlyContainer");
    hourlyContainer.innerHTML = "";

    try {
        const response = await fetch(
            `${forecastAPI}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();
        data.list.slice(0, 8).forEach(hour => {
            const time = new Date(hour.dt * 1000).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            });
            const icon = `https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`;

            hourlyContainer.innerHTML += `
                <div class="hourlyCard">
                    <div class="hourlyTime">${time}</div>
                    <img src="${icon}">
                    <div>${Math.round(hour.main.temp)}°C</div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Hourly Forecast Error:", error);
    }
}
// ✅ MAIN WEATHER FUNCTION
async function checkWeather(query) {
    showLoader();
    errorText.innerText = "";
    try {
        const response = await fetch(`${apiURL}?${query}&units=metric&appid=${apiKey}`);
        const data = await response.json();

        if (!response.ok) {
            hideLoader();
            errorText.innerText = "❌ City not found";
            return;
        }
        document.querySelector(".city").innerText = data.name;
        document.querySelector(".temperature").innerText = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerText = data.main.humidity + "%";
        document.querySelector(".wind").innerText = data.wind.speed + " km/h";

        const weatherType = data.weather[0].main;

        playWeatherAnimation(weatherType);
        changeBackgroundByWeather(weatherType);
        toggleClouds(weatherType);

        get7DayForecast(data.coord.lat, data.coord.lon);
        getHourlyForecast(data.coord.lat, data.coord.lon);

        hideLoader();

    } catch (error) {
        console.error(error);
        hideLoader();
        errorText.innerText = "⚠ Network error";
    }
}
// SEARCH
searchBtn.addEventListener("click", () => {
    if (input.value.trim() !== "") checkWeather(`q=${input.value}`);
});
// ENTER SEARCH
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        checkWeather(`q=${input.value}`);
    }
});
// LOCATION
function getLocationWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        checkWeather(`lat=${lat}&lon=${lon}`);
    });
}

locationBtn.addEventListener("click", getLocationWeather);
// THEME TOGGLE
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
});
// AUTO LOAD LOCATION
window.addEventListener("load", () => {
    getLocationWeather();
});
// 🎯 3D MOUSE TILT
const card = document.querySelector(".AppCard");
card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
});
card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
});