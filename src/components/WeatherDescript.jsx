import PropTypes from "prop-types";
import WeatherData from "./WeatherData";

const WeatherDescript = async (prompt, WeatherData) => {
  const url = `https://api.openai.com/v1/chat/completions`;
  const sysMsg = `In a conversational professional tone, answer the [Question] based on the [Weather Data]. 

- Provide an opinion about what the weather feels like. 
- Provide temperature in either Celsius or Fahrenheit, whichever is more appropriate. 
- Never display the temperature in Kelvin. 
- Provide a recommendation on how to prepare and what to wear (e.g. bring an umbrella, wear a wind breaker, a warm jacket, etc.)`;

const newPrompt= `Question: ${prompt}, Weather Data: ${JSON.stringify(WeatherData)}`
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
        { role: "system", content: sysMsg },
        { role: "user", content: newPrompt }],
  };
  const params = {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(url, params);
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.log("Error:", error);
    throw new Error(
      "Unable to fetch weather decsription. Please try again."
    );
  }
};


WeatherDescript.propTypes = {
  prompt: PropTypes.string.isRequired,
};

export default WeatherDescript;