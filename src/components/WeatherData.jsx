import PropTypes from "prop-types";

// Fetch weather data through the same-origin weather API.
const WeatherData = async (locationData) => {
  try {
    const response = await fetch(
      `/api/weather?lat=${encodeURIComponent(locationData[0].lat)}&lon=${encodeURIComponent(locationData[0].lon)}`
    );
    const weatherData = await response.json();
    if (!response.ok) {
      throw new Error(weatherData.error || "Unable to fetch weather data.");
    }
    return weatherData;
  } catch (error) {
    console.error("Error:", error);
    return await Promise.reject(
      error instanceof Error ? error : new Error("Unable to fetch weather data.")
    );
  }
};

WeatherData.propTypes = {
  locationData: PropTypes.string.isRequired,
};

export default WeatherData;
