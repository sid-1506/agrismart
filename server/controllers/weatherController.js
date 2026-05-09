const axios = require("axios");

const FARMING_TIPS = {
  Rain:        "Rain expected — delay pesticide spray and foliar application.",
  Drizzle:     "Light rain — good time for transplanting seedlings.",
  Thunderstorm:"Storm warning — avoid field operations today.",
  Clear:       "Clear sky — ideal for harvesting and crop drying.",
  Clouds:      "Overcast — good conditions for irrigation and spraying.",
  Snow:        "Frost risk — protect sensitive crops with covers.",
  Mist:        "Humid conditions — watch for fungal disease outbreak.",
  Haze:        "Hazy conditions — monitor soil moisture carefully.",
  default:     "Check local advisory before field operations.",
};

exports.getWeather = async (req, res) => {
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
      return res.status(500).json({ success: false, message: "Weather API key not configured" });
    }

    const { lat, lon, city } = req.query;

    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&appid=${key}&units=metric`;
    } else {
      return res.status(400).json({ success: false, message: "Provide lat/lon or city" });
    }

    const { data } = await axios.get(url, { timeout: 8000 });

    const main       = data.weather?.[0]?.main || "Clear";
    const farmingTip = FARMING_TIPS[main] || FARMING_TIPS.default;

    return res.status(200).json({
      success: true,
      weather: {
        city:       data.name,
        country:    data.sys?.country,
        temp:       Math.round(data.main?.temp),
        feelsLike:  Math.round(data.main?.feels_like),
        condition:  data.weather?.[0]?.description || "clear sky",
        main,
        humidity:   data.main?.humidity,
        windSpeed:  Math.round((data.wind?.speed || 0) * 3.6), // m/s → km/h
        rainChance: data.clouds?.all,
        icon:       data.weather?.[0]?.icon,
        farmingTip,
      },
    });

  } catch (err) {
    console.error("[weatherController] error:", err.message);
    const status = err?.response?.status;
    if (status === 404) {
      return res.status(404).json({ success: false, message: "City not found" });
    }
    if (status === 401) {
      return res.status(500).json({ success: false, message: "Weather API key invalid" });
    }
    return res.status(500).json({ success: false, message: "Could not fetch weather data" });
  }
};
