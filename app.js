const state = {
  unit: "c",
  place: {
    name: "London",
    country: "United Kingdom",
    latitude: 51.5072,
    longitude: -0.1276,
    timezone: "Europe/London",
  },
  forecast: null,
};

const weatherCodes = {
  0: ["Clear sky", "☀", "clear"],
  1: ["Mainly clear", "☀", "clear"],
  2: ["Partly cloudy", "◐", "cloud"],
  3: ["Overcast", "☁", "cloud"],
  45: ["Fog", "≋", "cloud"],
  48: ["Rime fog", "≋", "cloud"],
  51: ["Light drizzle", "☂", "rain"],
  53: ["Drizzle", "☂", "rain"],
  55: ["Dense drizzle", "☂", "rain"],
  61: ["Light rain", "☔", "rain"],
  63: ["Rain", "☔", "rain"],
  65: ["Heavy rain", "☔", "rain"],
  71: ["Light snow", "✦", "snow"],
  73: ["Snow", "✦", "snow"],
  75: ["Heavy snow", "✦", "snow"],
  80: ["Rain showers", "☔", "rain"],
  81: ["Heavy showers", "☔", "rain"],
  82: ["Violent showers", "☔", "rain"],
  95: ["Thunderstorm", "⚡", "rain"],
  96: ["Storm with hail", "⚡", "rain"],
  99: ["Severe hailstorm", "⚡", "rain"],
};

const els = {
  shell: document.querySelector(".app-shell"),
  form: document.querySelector("#searchForm"),
  input: document.querySelector("#cityInput"),
  locationBtn: document.querySelector("#locationBtn"),
  celsiusBtn: document.querySelector("#celsiusBtn"),
  fahrenheitBtn: document.querySelector("#fahrenheitBtn"),
  updatedAt: document.querySelector("#updatedAt"),
  locationName: document.querySelector("#locationName"),
  currentTemp: document.querySelector("#currentTemp"),
  conditionText: document.querySelector("#conditionText"),
  feelsLike: document.querySelector("#feelsLike"),
  highLow: document.querySelector("#highLow"),
  sunTimes: document.querySelector("#sunTimes"),
  precipChance: document.querySelector("#precipChance"),
  forecastSummary: document.querySelector("#forecastSummary"),
  windDirection: document.querySelector("#windDirection"),
  hourlyStrip: document.querySelector("#hourlyStrip"),
  detailGrid: document.querySelector("#detailGrid"),
  weekList: document.querySelector("#weekList"),
  toast: document.querySelector("#toast"),
};

function toF(value) {
  return value * 9 / 5 + 32;
}

function temp(value) {
  const output = state.unit === "f" ? toF(value) : value;
  return `${Math.round(output)}°`;
}

function speed(value) {
  if (state.unit === "f") return `${Math.round(value * 0.621371)} mph`;
  return `${Math.round(value)} km/h`;
}

function formatTime(value, options = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
}

function formatDay(value, weekday = "short") {
  return new Intl.DateTimeFormat("en-GB", { weekday }).format(new Date(value));
}

function describe(code) {
  return weatherCodes[code] || ["Seasonal weather", "◌", "clear"];
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 3600);
}

async function searchPlace(query) {
  const params = new URLSearchParams({
    name: query,
    count: "1",
    language: "en",
    format: "json",
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  if (!response.ok) throw new Error("Location search failed");
  const data = await response.json();
  if (!data.results?.length) throw new Error("No matching city found");
  const result = data.results[0];
  return {
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

async function reversePlace(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    count: "1",
    language: "en",
    format: "json",
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?${params}`);
  if (!response.ok) return { ...state.place, latitude, longitude };
  const data = await response.json();
  const result = data.results?.[0];
  if (!result) return { ...state.place, latitude, longitude };
  return {
    name: result.name,
    country: result.country,
    latitude,
    longitude,
    timezone: result.timezone,
  };
}

async function fetchForecast(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: "auto",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
    hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max",
    forecast_days: "7",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Forecast request failed");
  return response.json();
}

function fallbackForecast() {
  const now = new Date();
  const hours = Array.from({ length: 168 }, (_, index) => {
    const date = new Date(now.getTime() + index * 60 * 60 * 1000);
    const wave = Math.sin(index / 3);
    return {
      time: date.toISOString(),
      temp: 16 + wave * 4 + (index % 24 > 11 ? 3 : -1),
      rain: Math.max(3, Math.round(28 + wave * 22)),
      code: index % 9 === 0 ? 61 : index % 5 === 0 ? 2 : 1,
      wind: 14 + Math.abs(wave) * 8,
      humidity: 62 + Math.round(wave * 12),
      uv: Math.max(0, 4 + wave * 3),
    };
  });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getTime() + index * 24 * 60 * 60 * 1000);
    return {
      time: date.toISOString(),
      max: 20 + Math.sin(index) * 3,
      min: 11 + Math.cos(index) * 2,
      code: index % 3 === 0 ? 2 : 1,
      rain: index === 2 ? 66 : 18 + index * 5,
      wind: 20 + index,
      uv: 5 + Math.sin(index) * 2,
      sunrise: new Date(date.setHours(5, 32, 0, 0)).toISOString(),
      sunset: new Date(date.setHours(20, 28, 0, 0)).toISOString(),
    };
  });

  return {
    current: {
      time: now.toISOString(),
      temperature_2m: 18,
      apparent_temperature: 17,
      relative_humidity_2m: 58,
      precipitation: 0,
      weather_code: 1,
      cloud_cover: 24,
      pressure_msl: 1018,
      wind_speed_10m: 13,
      wind_direction_10m: 315,
    },
    hourly: {
      time: hours.map((item) => item.time),
      temperature_2m: hours.map((item) => item.temp),
      precipitation_probability: hours.map((item) => item.rain),
      weather_code: hours.map((item) => item.code),
      wind_speed_10m: hours.map((item) => item.wind),
      relative_humidity_2m: hours.map((item) => item.humidity),
      uv_index: hours.map((item) => item.uv),
    },
    daily: {
      time: days.map((item) => item.time),
      temperature_2m_max: days.map((item) => item.max),
      temperature_2m_min: days.map((item) => item.min),
      weather_code: days.map((item) => item.code),
      precipitation_probability_max: days.map((item) => item.rain),
      wind_speed_10m_max: days.map((item) => item.wind),
      uv_index_max: days.map((item) => item.uv),
      sunrise: days.map((item) => item.sunrise),
      sunset: days.map((item) => item.sunset),
    },
  };
}

function windCompass(degrees) {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(degrees / 45) % 8];
}

function renderDetails(current, daily) {
  const details = [
    ["Humidity", `${current.relative_humidity_2m}%`, "Water in the air", current.relative_humidity_2m],
    ["Wind", speed(current.wind_speed_10m), `${windCompass(current.wind_direction_10m)} direction`, Math.min(100, current.wind_speed_10m * 2)],
    ["Pressure", `${Math.round(current.pressure_msl)} hPa`, "Sea-level pressure", 58],
    ["Cloud Cover", `${current.cloud_cover}%`, "Sky coverage", current.cloud_cover],
    ["UV Index", `${Math.round(daily.uv_index_max[0])}`, "Peak today", Math.min(100, daily.uv_index_max[0] * 12)],
    ["Rainfall", `${current.precipitation} mm`, "Current intensity", Math.min(100, current.precipitation * 25)],
  ];

  els.detailGrid.innerHTML = details.map(([label, value, meta, meter]) => `
    <article class="detail-card">
      <div class="detail-top">
        <span>${label}</span>
        <span>${meta}</span>
      </div>
      <strong>${value}</strong>
      <div class="meter" aria-hidden="true"><span style="--value: ${meter}%"></span></div>
    </article>
  `).join("");
}

function renderHourly(hourly) {
  const cards = hourly.time.slice(0, 24).map((time, index) => {
    const [condition, icon] = describe(hourly.weather_code[index]);
    return `
      <article class="hour-card" title="${condition}">
        <span>${index === 0 ? "Now" : formatTime(time, { hour: "2-digit" })}</span>
        <div class="weather-icon">${icon}</div>
        <strong>${temp(hourly.temperature_2m[index])}</strong>
        <span>${hourly.precipitation_probability[index] ?? 0}% rain</span>
      </article>
    `;
  });
  els.hourlyStrip.innerHTML = cards.join("");
}

function renderWeek(daily) {
  const rows = daily.time.map((time, index) => {
    const [condition, icon] = describe(daily.weather_code[index]);
    return `
      <article class="day-row">
        <strong>${index === 0 ? "Today" : formatDay(time)}</strong>
        <div class="weather-icon">${icon}</div>
        <span class="week-meta">${condition} · ${daily.precipitation_probability_max[index]}%</span>
        <strong>${temp(daily.temperature_2m_max[index])} / ${temp(daily.temperature_2m_min[index])}</strong>
        <div class="range" aria-hidden="true"><span></span></div>
      </article>
    `;
  });
  els.weekList.innerHTML = rows.join("");
}

function render() {
  const data = state.forecast;
  const current = data.current;
  const daily = data.daily;
  const [condition, , theme] = describe(current.weather_code);

  els.shell.dataset.weather = theme;
  els.updatedAt.textContent = `Updated ${formatTime(current.time)} · Live forecast`;
  els.locationName.textContent = `${state.place.name}, ${state.place.country}`;
  els.currentTemp.textContent = temp(current.temperature_2m);
  els.conditionText.textContent = condition;
  els.feelsLike.textContent = `Feels like ${temp(current.apparent_temperature)} · ${speed(current.wind_speed_10m)} wind`;
  els.highLow.textContent = `H ${temp(daily.temperature_2m_max[0])} / L ${temp(daily.temperature_2m_min[0])}`;
  els.sunTimes.textContent = `Sunrise ${formatTime(daily.sunrise[0])} · Sunset ${formatTime(daily.sunset[0])}`;
  els.precipChance.textContent = `Rain chance ${daily.precipitation_probability_max[0]}%`;
  els.forecastSummary.textContent = `${condition} with a high of ${temp(daily.temperature_2m_max[0])}`;
  els.windDirection.textContent = `${windCompass(current.wind_direction_10m)} wind`;

  renderHourly(data.hourly);
  renderDetails(current, daily);
  renderWeek(daily);
}

async function loadWeather(place, toastMessage) {
  try {
    state.place = place;
    state.forecast = await fetchForecast(place);
    render();
    if (toastMessage) showToast(toastMessage);
  } catch (error) {
    state.forecast = fallbackForecast();
    render();
    showToast("Live weather could not be reached, so Aurora is showing a polished sample forecast.");
  }
}

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = els.input.value.trim();
  if (!query) return;
  try {
    showToast(`Finding ${query}...`);
    const place = await searchPlace(query);
    await loadWeather(place, `Showing forecast for ${place.name}`);
  } catch (error) {
    showToast(error.message);
  }
});

els.locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Location services are not available in this browser.");
    return;
  }
  showToast("Requesting your location...");
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const place = await reversePlace(latitude, longitude);
    await loadWeather(place, "Forecast updated from your location.");
  }, () => showToast("Location permission was not granted."));
});

els.celsiusBtn.addEventListener("click", () => {
  state.unit = "c";
  els.celsiusBtn.classList.add("active");
  els.fahrenheitBtn.classList.remove("active");
  render();
});

els.fahrenheitBtn.addEventListener("click", () => {
  state.unit = "f";
  els.fahrenheitBtn.classList.add("active");
  els.celsiusBtn.classList.remove("active");
  render();
});

loadWeather(state.place);
