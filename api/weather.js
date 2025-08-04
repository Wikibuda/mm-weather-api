export default async function handler(req, res) {
  try {
    // Obtén la API key de las variables de entorno (NUNCA en el código)
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const CITY = 'Monterrey';
    const COUNTRY_CODE = 'MX';
    
    // URL de la API de OpenWeatherMap
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${API_KEY}&units=metric&lang=es`;
    
    // Realiza la solicitud a la API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error de la API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Procesa los datos para enviar solo lo necesario al frontend
    const processedData = {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convertir m/s a km/h
      weatherId: data.weather[0].id,
      timestamp: new Date().toISOString()
    };
    
    // Devuelve los datos procesados
    res.status(200).json(processedData);
    
  } catch (error) {
    console.error('Error en la función de clima:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos climáticos',
      timestamp: new Date().toISOString()
    });
  }
}
