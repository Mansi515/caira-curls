/* Open-Meteo adapter. UI and recommendation code consume a normalized shape so
   the provider can be replaced without changing their data contract. */
(function (root) {
  const WMO_CONDITIONS = Object.freeze({
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Cloudy',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    97: 'Heavy thunderstorm',
    99: 'Thunderstorm with heavy hail'
  });

  function isNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  async function readJson(response) {
    if (!response.ok) throw new Error('Weather service is temporarily unavailable.');
    return response.json();
  }

  function nearestHourlyIndex(times, currentTime) {
    if (!Array.isArray(times) || !currentTime) return -1;
    const toComparableTime = value => {
      const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
        ? value
        : value.length === 16 ? `${value}:00Z` : `${value}Z`;
      const timestamp = Date.parse(normalized);
      return Number.isFinite(timestamp) ? timestamp : NaN;
    };
    const target = toComparableTime(currentTime);
    if (!Number.isFinite(target)) return -1;
    let bestIndex = -1;
    let bestDistance = Infinity;
    times.forEach((time, index) => {
      const candidate = toComparableTime(time);
      const distance = Math.abs(candidate - target);
      if (Number.isFinite(distance) && distance < bestDistance) {
        bestIndex = index;
        bestDistance = distance;
      }
    });
    return bestDistance <= 90 * 60 * 1000 ? bestIndex : -1;
  }

  async function fetchCurrent(city, fetchImpl) {
    const cityQuery = String(city || '').trim();
    if (!cityQuery) throw new Error('Add a city to your hair profile to see local weather.');
    const request = fetchImpl || root.fetch.bind(root);
    const geocodeUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geocodeUrl.search = new URLSearchParams({ name: cityQuery, count: '1', language: 'en', format: 'json' });
    const geocoding = await readJson(await request(geocodeUrl));
    const place = geocoding.results?.[0];
    if (!place) throw new Error(`We couldn’t find “${cityQuery}”. Update the city in your hair profile and try again.`);

    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.search = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: 'temperature_2m,relative_humidity_2m,weather_code',
      hourly: 'precipitation_probability',
      timezone: 'auto',
      forecast_days: '1'
    });
    const forecast = await readJson(await request(forecastUrl));
    const current = forecast.current;
    if (!current || typeof current !== 'object') throw new Error('Current weather is unavailable for this location.');
    const code = isNumber(current.weather_code) ? current.weather_code : null;
    const hourlyIndex = nearestHourlyIndex(forecast.hourly?.time, current.time);
    const chance = hourlyIndex >= 0 ? forecast.hourly?.precipitation_probability?.[hourlyIndex] : null;

    return {
      temperature: isNumber(current.temperature_2m) ? current.temperature_2m : null,
      humidity: isNumber(current.relative_humidity_2m) ? current.relative_humidity_2m : null,
      precipitationProbability: isNumber(chance) && chance >= 0 && chance <= 100 ? chance : null,
      condition: code !== null ? (WMO_CONDITIONS[code] || 'Unknown condition') : null,
      weatherCode: code,
      timestamp: typeof current.time === 'string' ? current.time : null,
      timezone: typeof forecast.timezone === 'string' ? forecast.timezone : null,
      location: {
        name: place.name || cityQuery,
        country: place.country || '',
        latitude: place.latitude,
        longitude: place.longitude
      }
    };
  }

  root.OpenMeteoWeather = Object.freeze({ fetchCurrent, WMO_CONDITIONS, nearestHourlyIndex });
})(typeof window !== 'undefined' ? window : globalThis);
