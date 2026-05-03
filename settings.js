const defaults = {
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
};

const modelNames = {
  best_match: "Best Match",
  ukmo_seamless: "UKMO",
  ecmwf_ifs04: "ECMWF",
  gfs_seamless: "GFS",
};

let settings = { ...defaults };

const shell = document.querySelector(".settings-shell");
const optionCards = document.querySelectorAll("[data-preference]");
const profileSummary = document.querySelector("#profileSummary");
const modelSummary = document.querySelector("#modelSummary");
const placesSummary = document.querySelector("#placesSummary");
const settingsPlaces = document.querySelector("#settingsPlaces");
const resetSettings = document.querySelector("#resetSettings");
const toast = document.querySelector("#toast");

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("auroraWeatherPrefs") || "{}");
    settings = { ...defaults, ...saved };
    settings.favorites = Array.isArray(saved.favorites) ? saved.favorites : [];
  } catch (error) {
    settings = { ...defaults };
  }
}

function saveSettings() {
  localStorage.setItem("auroraWeatherPrefs", JSON.stringify(settings));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function renderPlaces() {
  placesSummary.textContent = `${settings.favorites.length} saved`;
  if (!settings.favorites.length) {
    settingsPlaces.innerHTML = '<div class="empty">No saved places yet. Save places from the main weather dashboard.</div>';
    return;
  }

  settingsPlaces.innerHTML = settings.favorites.map((place, index) => `
    <article class="place-row">
      <div>
        <strong>${place.name}</strong>
        <span>${place.country}</span>
      </div>
      <button type="button" data-remove-place="${index}" aria-label="Remove ${place.name}">×</button>
    </article>
  `).join("");
}

function render() {
  shell.dataset.theme = settings.themeMode;
  optionCards.forEach((card) => {
    card.classList.toggle("active", settings[card.dataset.preference] === card.dataset.value);
  });
  profileSummary.textContent = `${modelNames[settings.forecastModel]} · ${settings.tempUnit.toUpperCase()} · ${settings.windUnit}`;
  modelSummary.textContent = modelNames[settings.forecastModel];
  renderPlaces();
}

optionCards.forEach((card) => {
  card.addEventListener("click", () => {
    settings[card.dataset.preference] = card.dataset.value;
    saveSettings();
    render();
    showToast("Settings saved.");
  });
});

settingsPlaces.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-place]");
  if (!button) return;
  settings.favorites.splice(Number(button.dataset.removePlace), 1);
  saveSettings();
  render();
  showToast("Place removed.");
});

resetSettings.addEventListener("click", () => {
  settings = { ...defaults, favorites: [] };
  saveSettings();
  render();
  showToast("Settings reset.");
});

loadSettings();
render();
