const state = {
  tempUnit: "c",
  windUnit: "kmh",
  pressureUnit: "hpa",
  precipUnit: "mm",
  forecastModel: "best_match",
  forecastHours: "24",
  refreshMins: "0",
  alertsSensitivity: "normal",
  themeMode: "atmospheric",
  favorites: [],
  refreshTimer: null,
  airQuality: null,
  place: {
    name: "London",
    country: "United Kingdom",
    latitude: 51.5072,
    longitude: -0.1276,
    timezone: "Europe/London",
    source: "City search",
  },
  forecast: null,
};

const modelLabels = {
  best_match: ["Best Match", "Balanced model blend"],
  ukmo_seamless: ["UKMO", "UK-focused model"],
  ecmwf_ifs04: ["ECMWF", "Global premium model"],
  gfs_seamless: ["GFS", "Long-range model"],
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
  savePlaceBtn: document.querySelector("#savePlaceBtn"),
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
  comfortScore: document.querySelector("#comfortScore"),
  visibilityLabel: document.querySelector("#visibilityLabel"),
  stormRisk: document.querySelector("#stormRisk"),
  radarMoisture: document.querySelector("#radarMoisture"),
  radarPressure: document.querySelector("#radarPressure"),
  radarCloud: document.querySelector("#radarCloud"),
  alertStatus: document.querySelector("#alertStatus"),
  alertStack: document.querySelector("#alertStack"),
  locationSource: document.querySelector("#locationSource"),
  hourlyKicker: document.querySelector("#hourlyKicker"),
  modelBadge: document.querySelector("#modelBadge"),
  insightGrid: document.querySelector("#insightGrid"),
  daylightLabel: document.querySelector("#daylightLabel"),
  sunStats: document.querySelector("#sunStats"),
  sunDot: document.querySelector(".sun-dot"),
  airQualityStatus: document.querySelector("#airQualityStatus"),
  aqiValue: document.querySelector("#aqiValue"),
  aqiLabel: document.querySelector("#aqiLabel"),
  aqiBars: document.querySelector("#aqiBars"),
  lifestyleGrid: document.querySelector("#lifestyleGrid"),
  chartSummary: document.querySelector("#chartSummary"),
  tempChart: document.querySelector("#tempChart"),
  placesCount: document.querySelector("#placesCount"),
  placesList: document.querySelector("#placesList"),
  hourlyStrip: document.querySelector("#hourlyStrip"),
  detailGrid: document.querySelector("#detailGrid"),
  weekList: document.querySelector("#weekList"),
  toast: document.querySelector("#toast"),
  railItems: document.querySelectorAll(".rail-item[data-view]"),
  sections: document.querySelectorAll("[data-view-section]"),
  settingTiles: document.querySelectorAll("[data-preference]"),
};

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem("auroraWeatherPrefs") || "{}");
    Object.assign(state, saved);
    state.favorites = Array.isArray(saved.favorites) ? saved.favorites : [];
  } catch (error) {
    state.favorites = [];
  }
}

function saveState() {
  const {
    tempUnit,
    windUnit,
    pressureUnit,
    precipUnit,
    forecastModel,
    forecastHours,
    refreshMins,
    alertsSensitivity,
    themeMode,
    favorites,
  } = state;
  localStorage.setItem("auroraWeatherPrefs", JSON.stringify({
    tempUnit,
    windUnit,
    pressureUnit,
    precipUnit,
    forecastModel,
    forecastHours,
    refreshMins,
    alertsSensitivity,
    themeMode,
    favorites,
  }));
}

function toF(value) {
  return value * 9 / 5 + 32;
}

function temp(value) {
  const output = state.tempUnit === "f" ? toF(value) : value;
  return `${Math.round(output)}°`;
}

function speed(value) {
  if (state.windUnit === "mph") return `${Math.round(value * 0.621371)} mph`;
  return `${Math.round(value)} km/h`;
}

function pressure(value) {
  if (state.pressureUnit === "inhg") return `${(value * 0.02953).toFixed(2)} inHg`;
  return `${Math.round(value)} hPa`;
}

function precipitation(value) {
  if (state.precipUnit === "in") return `${(value * 0.03937).toFixed(2)} in`;
  return `${Number(value).toFixed(value >= 10 ? 0 : 1)} mm`;
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

function isUkPostcode(query) {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(query.trim());
}

function cleanPostcode(query) {
  return query.trim().toUpperCase().replace(/\s+/g, "");
}

function bestPostcodeName(result) {
  const generic = [
    "unparished area",
    "unparished",
    "england",
    "scotland",
    "wales",
    "northern ireland",
  ];
  const options = [
    result.admin_ward,
    result.parish,
    result.parliamentary_constituency,
    result.admin_district,
    result.region,
  ].filter(Boolean);
  return options.find((value) => {
    const lower = value.toLowerCase();
    return !generic.some((term) => lower.includes(term));
  }) || result.admin_district || "UK postcode";
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 3600);
}

async function searchPlace(query) {
  if (isUkPostcode(query)) return searchPostcode(query);

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
    source: "City search",
  };
}

async function searchPostcode(query) {
  const postcode = cleanPostcode(query);
  const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
  if (!response.ok) throw new Error("No matching UK postcode found");
  const data = await response.json();
  const result = data.result;
  if (!result?.latitude || !result?.longitude) throw new Error("That postcode could not be located");

  let nearby = null;
  try {
    nearby = await reversePlace(result.latitude, result.longitude);
  } catch (error) {
    nearby = null;
  }

  const name = bestPostcodeName(result);
  const district = result.admin_district && result.admin_district !== name ? `, ${result.admin_district}` : "";
  return {
    name,
    country: `United Kingdom${district}`,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: nearby?.timezone || "Europe/London",
    source: `Postcode ${result.postcode}`,
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
    source: "Current location",
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
  if (state.forecastModel !== "best_match") params.set("models", state.forecastModel);
  let response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok && state.forecastModel !== "best_match") {
    params.delete("models");
    response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  }
  if (!response.ok) throw new Error("Forecast request failed");
  return response.json();
}

async function fetchAirQuality(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: "auto",
    current: "european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,uv_index",
    hourly: "european_aqi,pm2_5,pm10,uv_index",
    forecast_days: "2",
  });
  const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
  if (!response.ok) throw new Error("Air quality request failed");
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

function fallbackAirQuality() {
  return {
    current: {
      european_aqi: 32,
      pm10: 18,
      pm2_5: 8,
      carbon_monoxide: 160,
      nitrogen_dioxide: 14,
      ozone: 58,
      uv_index: 4,
    },
    hourly: {
      european_aqi: Array.from({ length: 48 }, (_, index) => 28 + Math.round(Math.sin(index / 4) * 12)),
      pm2_5: Array.from({ length: 48 }, (_, index) => 7 + Math.max(0, Math.sin(index / 5) * 4)),
      pm10: Array.from({ length: 48 }, (_, index) => 17 + Math.max(0, Math.cos(index / 4) * 6)),
      uv_index: Array.from({ length: 48 }, (_, index) => Math.max(0, Math.sin((index - 6) / 6) * 6)),
    },
  };
}

function windCompass(degrees) {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(degrees / 45) % 8];
}

function comfortLabel(current, daily) {
  const humidity = current.relative_humidity_2m;
  const wind = current.wind_speed_10m;
  const rain = daily.precipitation_probability_max[0];
  if (rain > 70 || wind > 42) return "Rough";
  if (humidity > 82 || rain > 45 || wind > 30) return "Changeable";
  if (humidity < 70 && wind < 24) return "Excellent";
  return "Comfortable";
}

function visibilityLabel(current) {
  if (current.cloud_cover > 82 || current.relative_humidity_2m > 88) return "Muted";
  if (current.cloud_cover > 55) return "Soft";
  return "Crisp";
}

function stormRisk(current, daily) {
  const sensitivity = state.alertsSensitivity;
  const highRain = sensitivity === "sensitive" ? 58 : sensitivity === "calm" ? 86 : 76;
  const mediumRain = sensitivity === "sensitive" ? 28 : sensitivity === "calm" ? 56 : 42;
  const highWind = sensitivity === "sensitive" ? 36 : sensitivity === "calm" ? 55 : 45;
  const mediumWind = sensitivity === "sensitive" ? 22 : sensitivity === "calm" ? 38 : 30;
  const code = current.weather_code;
  if (code >= 95 || daily.precipitation_probability_max[0] > highRain || current.wind_speed_10m > highWind) return "High";
  if (daily.precipitation_probability_max[0] > mediumRain || current.wind_speed_10m > mediumWind) return "Medium";
  return "Low";
}

function bestOutdoorWindow(hourly) {
  let best = { score: -Infinity, time: hourly.time[0], temp: hourly.temperature_2m[0] };
  hourly.time.slice(0, 24).forEach((time, index) => {
    const rain = hourly.precipitation_probability[index] || 0;
    const wind = hourly.wind_speed_10m[index] || 0;
    const humidity = hourly.relative_humidity_2m[index] || 60;
    const score = 100 - rain - wind * 1.5 - Math.abs(humidity - 55) * 0.5;
    if (score > best.score) best = { score, time, temp: hourly.temperature_2m[index] };
  });
  return best;
}

function renderInsights(current, hourly, daily) {
  const window = bestOutdoorWindow(hourly);
  const rainPeak = Math.max(...hourly.precipitation_probability.slice(0, 24));
  const windPeak = Math.max(...hourly.wind_speed_10m.slice(0, 24));
  const uv = Math.round(daily.uv_index_max[0]);
  const insights = [
    ["Best time outside", formatTime(window.time), `${temp(window.temp)} with the clearest comfort score`],
    ["Rain peak", `${rainPeak}%`, rainPeak > 55 ? "Carry a jacket or umbrella" : "Low interruption risk"],
    ["Wind peak", speed(windPeak), windPeak > 32 ? "Exposed routes may feel breezy" : "Comfortable travel conditions"],
    ["UV plan", `${uv} index`, uv >= 7 ? "Strong sun protection advised" : uv >= 4 ? "Moderate sun protection" : "Low exposure"],
  ];
  els.insightGrid.innerHTML = insights.map(([label, value, body]) => `
    <article class="insight-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <p>${body}</p>
    </article>
  `).join("");
}

function renderSun(current, daily) {
  const sunrise = formatTime(daily.sunrise[0]);
  const sunset = formatTime(daily.sunset[0]);
  const sunriseDate = new Date(daily.sunrise[0]);
  const sunsetDate = new Date(daily.sunset[0]);
  const currentDate = new Date(current.time);
  const totalMs = sunsetDate - sunriseDate;
  const elapsedMs = currentDate - sunriseDate;
  const progress = totalMs > 0 ? Math.min(1, Math.max(0, elapsedMs / totalMs)) : 0;
  const angle = Math.PI * (1 - progress);
  const centerX = 50;
  const centerY = 95;
  const radius = 40;
  const sunX = centerX + Math.cos(angle) * radius;
  const sunY = centerY - Math.sin(angle) * radius;

  els.daylightLabel.textContent = `${Math.max(0, (sunsetDate - sunriseDate) / 36e5).toFixed(1)} hours of daylight`;
  els.sunStats.innerHTML = `
    <span>Sunrise <strong>${sunrise}</strong></span>
    <span>Sunset <strong>${sunset}</strong></span>
    <span>UV max <strong>${Math.round(daily.uv_index_max[0])}</strong></span>
  `;

  if (els.sunDot) {
    els.sunDot.style.left = `${sunX}%`;
    els.sunDot.style.top = `${sunY}%`;
  }
}

function aqiLabel(value) {
  if (value <= 20) return "Excellent";
  if (value <= 40) return "Good";
  if (value <= 60) return "Moderate";
  if (value <= 80) return "Poor";
  return "Very poor";
}

function renderAirQuality(airQuality) {
  const current = airQuality?.current || fallbackAirQuality().current;
  const aqi = Math.round(current.european_aqi ?? 0);
  els.aqiValue.textContent = aqi;
  els.aqiLabel.textContent = aqiLabel(aqi);
  els.airQualityStatus.textContent = `${aqiLabel(aqi)} air`;
  const pollutants = [
    ["PM2.5", current.pm2_5, 25],
    ["PM10", current.pm10, 50],
    ["NO₂", current.nitrogen_dioxide, 40],
    ["O₃", current.ozone, 120],
  ];
  els.aqiBars.innerHTML = pollutants.map(([label, value, limit]) => `
    <div class="aqi-bar">
      <span>${label}</span>
      <strong>${Math.round(value ?? 0)}</strong>
      <div class="meter"><span style="--value: ${Math.min(100, ((value || 0) / limit) * 100)}%"></span></div>
    </div>
  `).join("");
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function renderLifestyle(current, hourly, daily, airQuality) {
  const rain = daily.precipitation_probability_max[0];
  const wind = current.wind_speed_10m;
  const humidity = current.relative_humidity_2m;
  const uv = daily.uv_index_max[0];
  const aqi = airQuality?.current?.european_aqi ?? 35;
  const items = [
    ["Commute", clampScore(100 - rain * 0.55 - wind * 0.8), rain > 55 ? "Wet routes likely" : "Smooth travel window"],
    ["Running", clampScore(105 - rain - wind * 1.2 - Math.max(0, aqi - 35)), wind > 30 ? "Sheltered route advised" : "Good outdoor pace"],
    ["Laundry", clampScore(95 - rain * 1.1 - humidity * 0.35), humidity > 78 ? "Slow drying" : "Decent drying conditions"],
    ["Garden", clampScore(70 + rain * 0.25 - wind * 0.5), rain < 20 ? "Watering may help" : "Natural watering likely"],
    ["Solar", clampScore(100 - current.cloud_cover - rain * 0.25), current.cloud_cover > 65 ? "Reduced generation" : "Strong light potential"],
    ["Skin", clampScore(100 - uv * 9), uv >= 6 ? "Use strong protection" : "Lower sun exposure"],
  ];
  els.lifestyleGrid.innerHTML = items.map(([label, score, note]) => `
    <article class="lifestyle-card">
      <div>
        <span>${label}</span>
        <strong>${score}</strong>
      </div>
      <div class="score-track"><span style="--value: ${score}%"></span></div>
      <p>${note}</p>
    </article>
  `).join("");
}

function renderChart(hourly) {
  const temps = hourly.temperature_2m.slice(0, 24);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = Math.max(1, max - min);
  els.chartSummary.textContent = `${temp(max)} peak · ${temp(min)} low`;
  els.tempChart.innerHTML = temps.map((value, index) => {
    const height = 18 + ((value - min) / range) * 72;
    return `
      <div class="chart-column" title="${formatTime(hourly.time[index])} ${temp(value)}">
        <span style="height: ${height}%"></span>
      </div>
    `;
  }).join("");
}

function renderPlaces() {
  els.placesCount.textContent = `${state.favorites.length} saved`;
  if (!state.favorites.length) {
    els.placesList.innerHTML = `
      <div class="empty-places">
        <strong>No saved places yet</strong>
        <span>Search a place, then use Save place to build your watchlist.</span>
      </div>
    `;
    return;
  }
  els.placesList.innerHTML = state.favorites.map((place, index) => `
    <article class="place-card">
      <button type="button" data-place-index="${index}">
        <strong>${place.name}</strong>
        <span>${place.country}</span>
      </button>
      <button class="remove-place" type="button" data-remove-place="${index}">×</button>
    </article>
  `).join("");
}

function renderDetails(current, daily) {
  const details = [
    ["Humidity", `${current.relative_humidity_2m}%`, "Water in the air", current.relative_humidity_2m],
    ["Wind", speed(current.wind_speed_10m), `${windCompass(current.wind_direction_10m)} direction`, Math.min(100, current.wind_speed_10m * 2)],
    ["Pressure", pressure(current.pressure_msl), "Sea-level pressure", 58],
    ["Cloud Cover", `${current.cloud_cover}%`, "Sky coverage", current.cloud_cover],
    ["UV Index", `${Math.round(daily.uv_index_max[0])}`, "Peak today", Math.min(100, daily.uv_index_max[0] * 12)],
    ["Rainfall", precipitation(current.precipitation), "Current intensity", Math.min(100, current.precipitation * 25)],
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
  const range = Number(state.forecastHours);
  const cards = hourly.time.slice(0, range).map((time, index) => {
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

function renderAlerts(current, daily) {
  const risks = [
    {
      level: stormRisk(current, daily),
      title: "Storm potential",
      body: `${daily.precipitation_probability_max[0]}% peak precipitation with ${speed(daily.wind_speed_10m_max[0])} gust potential.`,
    },
    {
      level: daily.uv_index_max[0] >= 7 ? "High" : daily.uv_index_max[0] >= 4 ? "Medium" : "Low",
      title: "UV exposure",
      body: `Peak UV index is ${Math.round(daily.uv_index_max[0])}.`,
    },
    {
      level: current.relative_humidity_2m > 84 ? "Medium" : "Low",
      title: "Humidity load",
      body: `${current.relative_humidity_2m}% humidity with ${current.cloud_cover}% cloud cover.`,
    },
  ];

  const highest = risks.some((item) => item.level === "High") ? "Active risks" : "All clear";
  els.alertStatus.textContent = highest;
  els.alertStack.innerHTML = risks.map((item) => `
    <article class="alert-card ${item.level.toLowerCase()}">
      <span>${item.level}</span>
      <div>
        <strong>${item.title}</strong>
        <p>${item.body}</p>
      </div>
    </article>
  `).join("");
}

function setActiveView(view) {
  els.railItems.forEach((item) => {
    const isActive = item.dataset.view === view;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-current", isActive ? "page" : "false");
  });
  const section = document.querySelector(`[data-view-section="${view}"]`);
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function highlightView(view) {
  els.railItems.forEach((item) => {
    const isActive = item.dataset.view === view;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function updatePreferenceButtons() {
  els.celsiusBtn.classList.toggle("active", state.tempUnit === "c");
  els.fahrenheitBtn.classList.toggle("active", state.tempUnit === "f");
  els.shell.dataset.theme = state.themeMode;
  els.settingTiles.forEach((tile) => {
    tile.classList.toggle("active", state[tile.dataset.preference] === tile.dataset.value);
  });
}

async function setPreference(key, value) {
  state[key] = value;
  saveState();
  updatePreferenceButtons();
  scheduleRefresh();
  if (key === "forecastModel") {
    await loadWeather(state.place, `Forecast model changed to ${modelLabels[value]?.[0] || value}`);
    return;
  }
  render();
}

function render() {
  if (!state.forecast) return;
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
  els.hourlyKicker.textContent = `Next ${state.forecastHours} hours`;
  els.modelBadge.textContent = modelLabels[state.forecastModel]?.[0] || "Best Match";
  els.comfortScore.textContent = comfortLabel(current, daily);
  els.visibilityLabel.textContent = visibilityLabel(current);
  els.stormRisk.textContent = stormRisk(current, daily);
  els.radarMoisture.textContent = `Moisture ${current.relative_humidity_2m}%`;
  els.radarPressure.textContent = `Pressure ${pressure(current.pressure_msl)}`;
  els.radarCloud.textContent = `Cloud ${current.cloud_cover}%`;
  if (els.locationSource) els.locationSource.textContent = state.place.source || "City search";

  renderHourly(data.hourly);
  renderDetails(current, daily);
  renderWeek(daily);
  renderAlerts(current, daily);
  renderInsights(current, data.hourly, daily);
  renderSun(current, daily);
  renderAirQuality(state.airQuality);
  renderLifestyle(current, data.hourly, daily, state.airQuality);
  renderChart(data.hourly);
  renderPlaces();
}

async function loadWeather(place, toastMessage) {
  try {
    state.place = place;
    const [forecast, airQuality] = await Promise.allSettled([
      fetchForecast(place),
      fetchAirQuality(place),
    ]);
    if (forecast.status !== "fulfilled") throw new Error("Forecast request failed");
    state.forecast = forecast.value;
    state.airQuality = airQuality.status === "fulfilled" ? airQuality.value : fallbackAirQuality();
    updatePreferenceButtons();
    saveState();
    render();
    if (toastMessage) showToast(toastMessage);
  } catch (error) {
    state.forecast = fallbackForecast();
    state.airQuality = fallbackAirQuality();
    updatePreferenceButtons();
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

els.savePlaceBtn.addEventListener("click", () => {
  const exists = state.favorites.some((place) => (
    Math.abs(place.latitude - state.place.latitude) < 0.001 &&
    Math.abs(place.longitude - state.place.longitude) < 0.001
  ));
  if (exists) {
    showToast(`${state.place.name} is already saved.`);
    return;
  }
  state.favorites.unshift({ ...state.place });
  state.favorites = state.favorites.slice(0, 8);
  saveState();
  renderPlaces();
  showToast(`${state.place.name} saved to Places.`);
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
  setPreference("tempUnit", "c");
});

els.fahrenheitBtn.addEventListener("click", () => {
  setPreference("tempUnit", "f");
});

els.railItems.forEach((item) => {
  item.addEventListener("click", () => setActiveView(item.dataset.view));
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) highlightView(visible.target.dataset.viewSection);
  }, { threshold: [0.35, 0.6] });

  els.sections.forEach((section) => observer.observe(section));
}

els.settingTiles.forEach((tile) => {
  tile.addEventListener("click", () => {
    setPreference(tile.dataset.preference, tile.dataset.value);
  });
});

els.placesList.addEventListener("click", async (event) => {
  const loadButton = event.target.closest("[data-place-index]");
  const removeButton = event.target.closest("[data-remove-place]");
  if (removeButton) {
    state.favorites.splice(Number(removeButton.dataset.removePlace), 1);
    saveState();
    renderPlaces();
    return;
  }
  if (loadButton) {
    const place = state.favorites[Number(loadButton.dataset.placeIndex)];
    if (place) await loadWeather(place, `Loaded ${place.name}`);
  }
});

function scheduleRefresh() {
  window.clearInterval(state.refreshTimer);
  const minutes = Number(state.refreshMins);
  if (!minutes) return;
  state.refreshTimer = window.setInterval(() => {
    loadWeather(state.place, "Forecast refreshed automatically.");
  }, minutes * 60 * 1000);
}

loadSavedState();
updatePreferenceButtons();
renderPlaces();
scheduleRefresh();
loadWeather(state.place);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
