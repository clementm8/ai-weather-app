# AI Weather App

A React app that turns a plain-language question into a location, the current weather, and a short description of what to wear.

It uses the OpenAI API to read the question and describe the conditions, and OpenWeather to look up the place and the forecast. Live demo: [weather-ai-app-three.vercel.app](https://weather-ai-app-three.vercel.app).

## Stack

- React
- Vite
- OpenAI (`gpt-3.5-turbo-16k`)
- OpenWeather

## Run it

```bash
npm install
npm run dev
```

Create a `.env.local` file (it is gitignored) with:

```bash
OPENAI_API_KEY=
OPENWEATHER_API_KEY=
```

Do not use a `VITE_` prefix. Those variables are copied into the browser bundle. Both keys stay on the server: the app calls `/api/openai` and `/api/weather`, and those routes attach the keys.

`npm run dev` serves those routes locally. On Vercel, set the same two variables in the project settings. If this project already has `VITE_OPENAI` or `VITE_OWM`, rename them to the names above and create new keys. The old OpenWeather key was shipped to the browser, and the old OpenAI route accepted requests from any site.

## What a question does

1. OpenAI turns the question into a city and country.
2. OpenWeather resolves that place and returns the current conditions.
3. OpenAI writes a short description from those conditions.
