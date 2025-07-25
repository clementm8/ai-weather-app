import { useEffect, useState } from "react";
import "./App.css";
import useApiRequests from "./components/useApiRequests";
import WeatherForm from "./components/WeatherForm";
import WeatherCard from "./components/WeatherCard";
import Description from "./components/Description";

function App() {
  const [prompt, setPrompt] = useState("");
  const [units, setUnits] = useState("metric");
  const [errorMsg, setErrorMsg] = useState("");

  // Custom hook to handle API requests. Fires when prompt changes.
  const { error, promptData, locationData, weatherData, weatherDescription, isLoading } = useApiRequests(prompt);

  // Set error message if error is returned from API request.
  useEffect(() => {
    if (error) {
      setErrorMsg(error.message);
    } else {
      setErrorMsg("");
    }
  }, [error]);

  useEffect(() => {
    if (promptData && promptData.units){
      setUnits(promptData.units);
    }
  }, [promptData])

  // Handle form submission. Set prompt to user input.
  const handleSubmit = (newPrompt) => {
    setErrorMsg("");
    setPrompt(newPrompt);
  };

  return (
    <div className="container">
      <h1 className="title">AI Weather App</h1>
      <header className="header">
        <h2 className="page-subtitle">Current Weather</h2>
        <WeatherForm onSubmit={handleSubmit} />
        {errorMsg && <p className="error">{errorMsg}</p>}
        {weatherDescription ? (
          <Description isLoading={isLoading}
            weatherDescription={weatherDescription} />
        ) : (
          <Description isLoading={isLoading} />
        )}
      </header>
      <main className="main-content">
        {weatherData.name && !errorMsg ? (
          <WeatherCard
            isLoading={isLoading}
            data={weatherData}
            units={units}
            country={promptData.country}
            USstate={locationData[0]?.state}
            setUnits={setUnits}
          />
        ) : (
          <WeatherCard isLoading={isLoading} setUnits={setUnits} />
        )}
      </main>
    </div>
  );
}

export default App;
