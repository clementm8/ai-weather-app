import PropTypes from "prop-types";

// Fetch location data through the same-origin weather API.
const LocationToCoordinates = async (locationString) => {
  try {
    const response = await fetch(
      `/api/weather?q=${encodeURIComponent(locationString)}`
    );
    const locationData = await response.json();
    if (!response.ok) {
      throw new Error(locationData.error || "No location by that name. Try again.");
    }
    if (!Array.isArray(locationData) || locationData.length === 0) {
      throw new Error("No location by that name. Try again.");
    }
    return locationData;
  } catch (error) {
    console.error("Error:", error);
    return await Promise.reject(error);
  }
};

LocationToCoordinates.propTypes = {
  location: PropTypes.string.isRequired,
};

export default LocationToCoordinates;
