import PropTypes from "prop-types";
import "./Description.css";
import Loader from "./Loader";

const Description = ({ isLoading, weatherDescription = "Waiting for location data." }) => {
const descriptionText = typeof weatherDescription === 'object' ? 'Waiting for location data.' : weatherDescription;
  return (
    <div className="description">
      <h2 className="description__title">Description</h2>
      <div className="description__divider">
        {isLoading && <Loader />}
        <p className="description__text">{descriptionText}</p>
      </div>
    </div>
  );
};


Description.propTypes = {
  weatherDescription: PropTypes.object,
};

export default Description;