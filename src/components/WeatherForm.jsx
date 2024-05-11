import { useState } from "react";
import PropTypes from "prop-types";
import "./WeatherForm.css";

function WeatherForm({ onSubmit }) {
  const [inputLocation, setInputLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(inputLocation);
  };

  return (
    <form className="locationform" onSubmit={handleSubmit}>
      <div className="locationform__elements">
        <label htmlFor="location">Ask me what the weather is currently like anywhere:</label>
        <input
          id="location"
          type="text"
          value={inputLocation}
          onChange={(e) => setInputLocation(e.target.value)}
        />
        <input type="submit" value="Submit" />
      </div>
      <p className="instructions">
        Please provide at least a city for accurate results
        <br />
        For Example: whats the weather like in Edmonton?
      </p>
    </form>
  );
}

WeatherForm.propTypes = {
  onSubmit: PropTypes.func,
};

export default WeatherForm;
