import PropTypes from "prop-types";

const PromptToLocation = async (prompt) => {
  const url = `https://api.openai.com/v1/chat/completions`;

  const data = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    functions: [
      {
        name: "displayData",
        description: "Get the current weather in a given location",
        parameters:{
          type:'object',
          properties:{
            country: {
              type: "string",
              description: "Country name.",
            },
            countryCode: {
              type: "string",
              description: "Country code. Use ISO-3166",
            },
            USstate: {
              type: "string",
              description: "Full state name.",
            },
            state: {
              type: "string",
              description: "Two-letter state code.",
            },
            city: {
              type: "string",
              description: "City name.",
            },
            unit: {
              type: "string",
              description: "location unit: metric or imperial.",
            },
          },
          required: [
            'countryCode',
            'country',
            'USstate',
            'state',
            'city',
            'unit',
          ]
        }
      }
    ],
    function_call: "auto",
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
    const promptRes= JSON.parse(data.choices[0].message.function_call.arguments);
    const locationString= () =>{
      if (promptRes.countryCode === "US") {
        return `${promptRes.city}, ${promptRes.state}, ${promptRes.country}`;
      } else {
        return `${promptRes.city}, ${promptRes.country}`;
      }
    }
    const promptData= {
      locationString: locationString(),
      units: promptRes.unit,
      city: promptRes.city,
      USstate: promptRes.state,
      country: promptRes.country,
    }
    console.log(promptRes)
    return promptData;
  } catch (error) {
    console.log("Error:", error);
    throw new Error(
      "Unable to identify a location from your question. Please try again."
    );
    
  }
};


PromptToLocation.propTypes = {
  prompt: PropTypes.string.isRequired,
};

export default PromptToLocation;