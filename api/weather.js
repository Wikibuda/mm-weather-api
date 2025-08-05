export const handler = async (req, res) => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    console.log('API Key:', API_KEY ? 'Existe' : 'NO EXISTE');
    
    const CITY = 'Monterrey';
    const COUNTRY_CODE = 'MX';
    
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${API_KEY}&units=metric&lang=es`;
    console.log('URL de la API:', apiUrl.replace(API_KEY, '***REDACTED***'));
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Respuesta de error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      throw new Error(`Error de la API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Procesa los datos para enviar solo lo necesario al frontend
    const processedData = {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      weatherId: data.weather[0].id,
      timestamp: new Date().toISOString()
    };
    
    // Devuelve los datos procesados
    res.status(200).json(processedData);
    
  } catch (error) {
    console.error('Error en la función de clima:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos climáticos',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
