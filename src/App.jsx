import { useEffect, useState } from "react";
import "./App.css";
import useApiRequests from "./components/useApiRequests";
import WeatherForm from "./components/WeatherForm";
import WeatherCard from "./components/WeatherCard";
import Description from "./components/Description";

function App() {
  const [prompt, setPrompt] = useState("");
  const [units, setUnits] = useState("metric");
  const [weatherDataLoading, setWeatherDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [weatherDescriptLoading, setWeatherDescriptLoading] = useState(false);

  // Custom hook to handle API requests. Fires when prompt changes.
  const { error, promptData, locationData, weatherData, weatherDescription } = useApiRequests(prompt);

  // Set error message if error is returned from API request.
  useEffect(() => {
    if (error) {
      setErrorMsg(error);
      setWeatherDataLoading(false);
    }
  }, [weatherData]);

  useEffect(() => {
    if (promptData && promptData.units){
      setUnits(promptData.units);
    }
  }, [promptData])

  // Set weatherDataLoading to false when weatherData is returned from API request.
  useEffect(() => {
    if (weatherData) {
      setWeatherDataLoading(false);
    }
  }, [weatherData]);

  useEffect(() => {
    if (weatherDescription) {
      setWeatherDescriptLoading(false);
    }
  }, [weatherDescription]);

  // Handle form submission. Set prompt to user input.
  const handleSubmit = (newPrompt) => {
    setErrorMsg("");
    setWeatherDataLoading(true);
    setWeatherDataLoading(true);
    setPrompt(newPrompt);
  };

  return (
    <div className="container">
      <h1 className="title">AI Weather App</h1>
      <header className="header">
        <h2 className="page-subtitle">Current Weather</h2>
        <WeatherForm onSubmit={handleSubmit} />
        {error && <p className="error">{errorMsg.message}</p>}
        {weatherDescription ? (
          <Description isLoading={weatherDescriptLoading}
            weatherDescription={weatherDescription} />
        ) : (
          <Description isLoading={weatherDataLoading} />
        )}
      </header>
      <main className="main-content">
        {weatherData.name && !errorMsg ? (
          <WeatherCard
            isLoading={weatherDataLoading}
            data={weatherData}
            units={units}
            country={promptData.country}
            USstate={locationData[0].state}
            setUnits={setUnits}
          />
        ) : (
          <WeatherCard isLoading={weatherDataLoading} setUnits={setUnits} />
        )}
      </main>
    </div>
  );
}

export default App;
