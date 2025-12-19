import PropTypes from "prop-types";

const WeatherDescript = async (prompt, WeatherData) => {
  const url = `/api/openai/v1/chat/completions`;
  const model = "gpt-3.5-turbo-16k";
  
  console.log(`🌤️ Making weather description request with model: ${model}`);
  
  const sysMsg = `In a conversational professional tone, answer the [Question] based on the [Weather Data]. 

- Provide an opinion about what the weather feels like. 
- Provide temperature in either Celsius or Fahrenheit, whichever is more appropriate. 
- Never display the temperature in Kelvin. 
- Provide a recommendation on how to prepare and what to wear (e.g. bring an umbrella, wear a wind breaker, a warm jacket, etc.)`;

  const newPrompt= `Question: ${prompt}, Weather Data: ${JSON.stringify(WeatherData)}`
  const data = {
    model: model,
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
    
    // Check for rate limiting
    if (response.status === 429) {
      const error = new Error('Rate limit exceeded');
      error.status = 429;
      throw error;
    }
    
    // Check for other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }
    
    const data = await response.json();
    
    // Check if the response has the expected structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.log("Error:", error);
    
    // Re-throw rate limit errors so they can be handled by the retry logic
    if (error.status === 429) {
      throw error;
    }
    
    throw new Error(
      "Unable to fetch weather description. Please try again."
    );
  }
};

WeatherDescript.propTypes = {
  prompt: PropTypes.string.isRequired,
};

export default WeatherDescript;