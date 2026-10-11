# 🌌 Aurora Weather

[![License: MIT](https://shields.io)](https://opensource.org)
[![PRs Welcome](https://shields.io)](http://makeapullrequest.com)
[![Platform](https://shields.io)]()

A hyper-polished, feature-dense static weather dashboard engineered with a premium glassmorphic UI. Powered entirely by modern client-side technologies, Aurora integrates multi-model meteorology forecasting with localized granularity.

🔗 **[Launch the Live Dashboard](https://probablynotalemon.github.io/Aurora-Weather/)**

---

## 📸 Interface Preview

<details>
<summary><b>📐 Expand Dashboard Screenshots</b></summary>
<br />

### Control Room & Engine Settings
<img width="2560" height="1305" alt="Aurora Control Room Settings" src="https://github.com/user-attachments/assets/47460b9b-e6df-400b-89fe-4188e924457a" />

### Main Dashboard Interface
<img width="2560" height="1305" alt="Main Dashboard Layout" src="https://github.com/user-attachments/assets/12970e73-a726-4c6f-82d8-532a8f778e2d" />

### Analytics & Micro-Metrics
<img width="2560" height="1305" alt="Analytics and Metrics View" src="https://github.com/user-attachments/assets/a677b444-fe9e-4630-a7a7-50e1ded29987" />

### PWA Mobile Layout
<img width="2560" height="1305" alt="PWA Interface View" src="https://github.com/user-attachments/assets/8442e649-907d-4e10-9876-27d4be9f6642" />

</details>

---

## 🛠️ Core Capabilities

### 🛰️ The Forecast Engine
* **Multi-Model Intelligence** — Switch fluidly between world-class forecasting models including **Best Match**, **UKMO** (UK-focused), **ECMWF** (Global premium), and **GFS** (Long-range patterns).
* **Granular Timelines** — Deep hourly breakdowns paired alongside an extended 7-day predictive outlook.
* **Geocoding & Postcodes** — Lightning-fast city queries via Open-Meteo geocoding mixed with dedicated UK postcode lookups parsing town/ward-style display names.

### 📊 Advanced Data Analytics
* **Environmental Diagnostics** — Real-time air quality indexing (AQI), weather risk mitigation cards, and localized alert tracking.
* **Chronological Mapping** — Dynamic sun timeline visualization mapping daylight windows alongside a 24-hour continuous temperature trend curve.
* **Custom Lifestyle Matrices** — Tailored activity and planning indexes calculated directly from atmospheric pressure, wind metrics, and precipitation probabilities.

### 📱 Engineering & UX
* **Premium Glassmorphic UI** — Fluid, animated weather states packaged in a modern, responsive layout built with custom CSS variables.
* **Full Offline Resilience** — Built as a Progressive Web App (PWA) with smart offline app-shell caching and a hardcoded sample fallback engine when API requests drop.
* ** Granular Control Center** — Independent metric conversion pipelines for Temperature (`°C`/`°F`), Wind Speed (`km/h`/`mph`), Pressure (`hPa`/`inHg`), and Rainfall (`mm`/`in`).

---

## ⚙️ Tech Stack

* **Frontend Architecture:** Semantic HTML5, Vanilla JavaScript (ES6+ Asynchronous Modules)
* **Styling Framework:** Custom CSS3 (CSS Grid, Flexbox, Backdrop-filter pipelines, Fluid variables)
* **Geocoding & API Mapping:** Open-Meteo API Core
* **Application Lifecycle:** Service Workers (PWA Cache-First Architecture)

---

## ⚡ Quick Start

Because Aurora Weather is built entirely as a static client-side dashboard, setting up a local development environment takes seconds.

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd Aurora-Weather
   ```

2. **Serve the project:**
   You can open `index.html` directly in your browser, or run a local server instance for PWA testing:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (Live Server)
   npx live-server
   ```

---

## ⚠️ Beta Notice
Aurora Weather is actively evolving in public beta. Core forecasts, responsive layers, and local lookups are production-stable. However, live meteorological telemetry is fetched from public tier-3 APIs and may experience intermittent rate-throttling or latency spikes.

---

## 👥 Authors & Credits
* **ProbablyNotALemon** — Architecture & Design Lead
* **CodeX AI** — Engineering Contributor

Developed with 🌌 by the Aurora team.
