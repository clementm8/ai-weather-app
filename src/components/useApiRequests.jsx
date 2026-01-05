import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import LocationToCoordinates from "./LocationToCoordinates";
import WeatherData from "./WeatherData";
import PromptToLocation from "./PromptToLocation";
import WeatherDescript from "./WeatherDescript";

// Rate limiting utility
const rateLimiter = {
  lastCall: 0,
  minInterval: 2000, // 2 seconds between calls (more conservative for gpt-3.5-turbo)
  isProcessing: false, // Prevent concurrent calls
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRateLimitedCall = async (apiCall, retries = 3) => {
  // Prevent concurrent API calls
  if (rateLimiter.isProcessing) {
    console.log('Another API call is in progress, waiting...');
    await delay(1000);
    return makeRateLimitedCall(apiCall, retries); // Retry after waiting
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      rateLimiter.isProcessing = true;
      
      // Ensure minimum time between API calls
      const now = Date.now();
      const timeSinceLastCall = now - rateLimiter.lastCall;
      if (timeSinceLastCall < rateLimiter.minInterval) {
        const waitTime = rateLimiter.minInterval - timeSinceLastCall;
        console.log(`Rate limiting: waiting ${waitTime}ms before next API call...`);
        await delay(waitTime);
      }
      
      console.log(`Making API call (attempt ${attempt + 1}/${retries})`);
      rateLimiter.lastCall = Date.now();
      const result = await apiCall();
      console.log(`API call successful on attempt ${attempt + 1}`);
      rateLimiter.isProcessing = false;
      return result;
    } catch (error) {
      rateLimiter.isProcessing = false;
      console.error(`API call attempt ${attempt + 1} failed:`, error);
      
      // Check for 429 errors in various formats
      const isRateLimitError = 
        error.status === 429 || 
        error.message?.includes('429') || 
        error.message?.includes('Rate limit exceeded') ||
        error.message?.includes('Too Many Requests');
      
      if (isRateLimitError) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
};

const useApiRequests = (prompt) => {
  const [error, setError] = useState(null);
  const [promptData, setPromptData] = useState({});
  const [locationData, setLocationData] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [weatherDescription, setWeatherDescription] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Fetch location and weather data from API.
  useEffect(() => {
    if (!prompt) return; // return if prompt is null or undefined

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Debounce the API call to prevent rapid successive calls
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Get location from prompt using OpenAI
        const promptDataRes = await makeRateLimitedCall(() => 
          PromptToLocation(prompt)
        );
        
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) return;
        
        setPromptData(promptDataRes);

        // Step 2: Get coordinates from location string
        const locationDataRes = await LocationToCoordinates(
          promptDataRes.locationString
        );
        
        if (abortControllerRef.current?.signal.aborted) return;
        
        setLocationData(locationDataRes);

        // Step 3: Get weather data
        const weatherDataRes = await WeatherData(locationDataRes);
        
        if (abortControllerRef.current?.signal.aborted) return;
        
        setWeatherData(weatherDataRes);

        // Step 4: Get weather description using OpenAI (with rate limiting)
        const weatherDescriptRes = await makeRateLimitedCall(() => 
          WeatherDescript(prompt, weatherDataRes)
        );
        
        if (abortControllerRef.current?.signal.aborted) return;
        
        setWeatherDescription(weatherDescriptRes);
        
        console.log(weatherDataRes);
      } catch (error) {
        // Don't set error if request was aborted
        if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
          return;
        }
        
        console.error("Error in fetchData:", error);
        
        // Provide user-friendly error messages
        let errorMessage = "An error occurred while fetching weather data.";
        
        if (error.message?.includes('429') || error.status === 429) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (error.message?.includes('Unable to identify a location')) {
          errorMessage = error.message;
        } else if (error.message?.includes('No location by that name')) {
          errorMessage = error.message;
        } else if (error.message?.includes('Unable to fetch weather data')) {
          errorMessage = error.message;
        } else if (error.message?.includes('Unable to fetch weather description')) {
          errorMessage = error.message;
        }
        
        setError(new Error(errorMessage));
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 1000); // 1 second debounce delay (more conservative for gpt-3.5-turbo)

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [prompt]); // run effect when `prompt` changes

  return { error, promptData, locationData, weatherData, weatherDescription, isLoading };
};

useApiRequests.propTypes = {
  prompt: PropTypes.string.isRequired,
};

export default useApiRequests;
