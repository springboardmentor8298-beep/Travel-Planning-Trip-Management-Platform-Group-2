import axios from 'axios';
import { getTrips } from './trip.service';
import { getExpenses } from './expense.service';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

/**
 * Fetch dynamic Open-Meteo weather forecast for any destination
 */
export async function getLiveWeatherForecast(destinationName) {
  if (!destinationName) return null;
  const cleanName = destinationName.split(',')[0].trim();
  try {
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=1&language=en&format=json`
    );
    if (!geoRes.data?.results || geoRes.data.results.length === 0) return null;

    const { latitude, longitude, name, country } = geoRes.data.results[0];
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
    );

    return {
      cityName: `${name}${country ? ', ' + country : ''}`,
      current: weatherRes.data.current,
      daily: weatherRes.data.daily,
    };
  } catch (err) {
    console.warn('Weather fetch error in AI Guide:', err);
    return null;
  }
}

/**
 * Interpret Weather Code into human-readable description and icon
 */
export function interpretWeatherCode(code) {
  if (code === 0) return { text: 'Clear Sky ☀️', icon: '☀️', advice: 'Sunny and bright! Wear sunscreen and light clothes.' };
  if (code <= 3) return { text: 'Partly Cloudy ⛅', icon: '⛅', advice: 'Comfortable weather for sightseeing and outdoor tours.' };
  if (code <= 48) return { text: 'Foggy 🌫️', icon: '🌫️', advice: 'Reduced visibility in mornings. Carry a light jacket.' };
  if (code <= 67) return { text: 'Rain Showers 🌧️', icon: '🌧️', advice: 'Carry an umbrella or rain poncho. Great time for indoor museums.' };
  if (code <= 77) return { text: 'Snowy ❄️', icon: '❄️', advice: 'Dress in thermal layers and wear non-slip boots.' };
  if (code <= 99) return { text: 'Thunderstorm ⛈️', icon: '⛈️', advice: 'Keep an umbrella and watch for local alerts.' };
  return { text: 'Fair 🌤️', icon: '🌤️', advice: 'Pleasant travel conditions.' };
}

/**
 * Call Groq Cloud API with Llama 3.3 70B Versatile
 */
async function callGroqLlm({ prompt, systemPrompt }) {
  if (!GROQ_API_KEY) throw new Error('Groq API Key not found');

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.65,
      max_tokens: 1024,
    },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Groq API');
  return content;
}

/**
 * Intelligent Tourist Guide AI Reasoning Engine with Groq LLM & Live Context
 */
export async function queryAiGuide({ prompt, activeTrip = null, allTrips = [] }) {
  const query = (prompt || '').trim();

  // 1. Gather all live context: Trips, Expenses, and Weather
  let tripsList = allTrips;
  if (!tripsList || tripsList.length === 0) {
    try {
      const res = await getTrips();
      tripsList = res.data || [];
    } catch (e) {}
  }

  let expenses = [];
  if (activeTrip?.id) {
    try {
      const expRes = await getExpenses(activeTrip.id);
      expenses = expRes.data || [];
    } catch (e) {}
  }

  const targetDestination = activeTrip?.destination || (query.match(/in ([a-zA-Z\s]+)/)?.[1]?.trim()) || 'Hyderabad';
  const weatherData = await getLiveWeatherForecast(targetDestination);

  // 2. Build live context block for the LLM
  let contextBlock = `--- LIVE TRIPNEST CONTEXT ---\n`;
  if (activeTrip) {
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const budgetNum = Number(activeTrip.budget || 0);
    const remaining = budgetNum > 0 ? (budgetNum - totalSpent) : 0;

    contextBlock += `ACTIVE TRIP:\n`;
    contextBlock += `• Title: ${activeTrip.title}\n`;
    contextBlock += `• Destination: ${activeTrip.destination}\n`;
    contextBlock += `• Dates: ${activeTrip.startDate} to ${activeTrip.endDate} (${activeTrip.durationDays} days)\n`;
    contextBlock += `• Travelers: ${activeTrip.numberOfTravelers}\n`;
    contextBlock += `• Total Budget: ₹${budgetNum.toLocaleString()}\n`;
    contextBlock += `• Total Spent: ₹${totalSpent.toLocaleString()} (${expenses.length} logged expenses)\n`;
    contextBlock += `• Remaining Budget: ₹${remaining.toLocaleString()}\n\n`;
  }

  if (tripsList && tripsList.length > 0) {
    contextBlock += `ALL USER TRIPS IN MY TRIPS:\n`;
    tripsList.forEach((t, i) => {
      contextBlock += `${i + 1}. "${t.title}" -> Destination: ${t.destination}, Dates: ${t.startDate} to ${t.endDate}, Budget: ₹${Number(t.budget || 0).toLocaleString()}, Status: ${t.status}\n`;
    });
    contextBlock += `\n`;
  }

  if (weatherData && weatherData.current) {
    const cur = weatherData.current;
    const interp = interpretWeatherCode(cur.weather_code);
    contextBlock += `REAL-TIME WEATHER FORECAST FOR ${weatherData.cityName.toUpperCase()}:\n`;
    contextBlock += `• Current Temperature: ${cur.temperature_2m}°C\n`;
    contextBlock += `• Condition: ${interp.text}\n`;
    contextBlock += `• Relative Humidity: ${cur.relative_humidity_2m}%\n`;
    contextBlock += `• Wind Speed: ${cur.wind_speed_10m} km/h\n`;
    if (weatherData.daily?.time) {
      contextBlock += `• 4-Day Forecast: ` + weatherData.daily.time.slice(0, 4).map((d, i) => {
        const code = weatherData.daily.weather_code[i];
        const max = weatherData.daily.temperature_2m_max[i];
        const min = weatherData.daily.temperature_2m_min[i];
        const pop = weatherData.daily.precipitation_probability_max?.[i] || 0;
        return `${d}: ${min}°C-${max}°C (${interpretWeatherCode(code).text}, Rain: ${pop}%)`;
      }).join(' | ') + `\n`;
    }
  }
  contextBlock += `--- END CONTEXT ---\n`;

  const systemPrompt = `You are the ultimate AI Tourist Guide, Travel Concierge & Trip Planner for TripNest.
You have access to the user's real-time trip details, live weather forecast, expenses, and travel plans provided in the context below.

YOUR CAPABILITIES & RULES:
1. Act as a world-class local tourist guide: Recommend top monuments, hidden gems, viewpoints, best visiting hours, entry tips, and cultural etiquette.
2. Food & Dining expert: Suggest authentic local dishes, street food hubs, and must-try delicacies (e.g. for Hyderabad: Hyderabadi Dum Biryani, Irani Chai with Osmania biscuits, Haleem, Qubani ka Meetha; for Goa: Goan Fish Curry Thali, Bebinca, etc.).
3. Live Weather & Packing Advisor: Incorporate the provided real-time weather and temperature into actionable travel and clothing recommendations.
4. Budget & Financial Assistant: When asked about budget, use the provided budget and expense metrics from the context to give clear breakdowns and smart cost-saving tips.
5. My Trips Navigator: When asked about user's trips, summarize their planned destinations, dates, and budgets accurately based on the context.
6. Tone & Formatting: Enthusiastic, helpful, friendly, and well-structured using markdown (bold titles, bullet points, emojis). Keep responses concise and engaging.

${contextBlock}`;

  try {
    const llmResponse = await callGroqLlm({ prompt: query, systemPrompt });
    return {
      text: llmResponse,
      suggestions: [
        `🌤️ Weather in ${targetDestination}`,
        `🏛️ Top sights in ${targetDestination}`,
        `🍲 Famous food in ${targetDestination}`,
        `💰 Budget breakdown`,
        `📋 Show my trips`
      ]
    };
  } catch (err) {
    console.warn('Groq LLM call failed, using intelligent fallback:', err);
    // Fallback to local intelligent response if offline
    return getFallbackResponse(query, targetDestination, weatherData, activeTrip, tripsList);
  }
}

/**
 * Intelligent Local Fallback in case of network or rate limit issues
 */
function getFallbackResponse(query, destinationName, weatherData, activeTrip, tripsList) {
  const q = query.toLowerCase();

  if (q.includes('my trip') || q.includes('all trip') || q.includes('show my trip')) {
    if (!tripsList || tripsList.length === 0) {
      return {
        text: `🧳 **You have no trips planned yet.** Click **Create Trip** to start your adventure!`,
        suggestions: ['Plan a trip to Hyderabad', 'Plan a trip to Goa', 'Top destinations']
      };
    }
    let summary = `📋 **Your Trips in TripNest:**\n\n`;
    tripsList.forEach((t, i) => {
      summary += `${i + 1}. **${t.title}** (📍 ${t.destination})\n`;
      summary += `   • **Dates:** ${t.startDate} → ${t.endDate} (${t.durationDays} days)\n`;
      summary += `   • **Budget:** ₹${Number(t.budget || 0).toLocaleString()} | **Travelers:** ${t.numberOfTravelers}\n\n`;
    });
    return { text: summary, suggestions: [`Weather in ${tripsList[0]?.destination || 'Hyderabad'}`, 'Top places to visit', 'Budget tips'] };
  }

  if (weatherData && weatherData.current && (q.includes('weather') || q.includes('temperature') || q.includes('rain'))) {
    const cur = weatherData.current;
    const interp = interpretWeatherCode(cur.weather_code);
    let res = `🌤️ **Live Weather for ${weatherData.cityName}:**\n\n`;
    res += `• **Temperature:** **${cur.temperature_2m}°C** (${interp.text})\n`;
    res += `• **Humidity:** ${cur.relative_humidity_2m}% | **Wind:** ${cur.wind_speed_10m} km/h\n`;
    res += `• **Advice:** ${interp.advice}\n`;
    return { text: res, suggestions: [`Top attractions in ${destinationName}`, `Famous food in ${destinationName}`, 'Packing tips'] };
  }

  return {
    text: `🏛️ **Tourist Guide for ${destinationName}:**\n\n` +
      `• **Top Sights:** Explore iconic historic monuments, heritage museums, and waterfront parks.\n` +
      `• **Local Cuisine:** Savor famous regional signature dishes, authentic tea, and street food.\n` +
      `• **Weather:** ${weatherData?.current ? `${weatherData.current.temperature_2m}°C, ${interpretWeatherCode(weatherData.current.weather_code).text}` : 'Pleasant travel season'}.\n\n` +
      `Ask me anything specific about attractions, itineraries, food, or budget!`,
    suggestions: [`Weather in ${destinationName}`, `Top attractions in ${destinationName}`, `Famous food in ${destinationName}`, `Show my trips`]
  };
}
