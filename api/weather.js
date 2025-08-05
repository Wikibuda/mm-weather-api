export const handler = async (req, res) => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    console.log('API Key:', API_KEY ? 'Existe' : 'NO EXISTE');
    
    if (!API_KEY) {
      throw new Error('API key no configurada en las variables de entorno');
    }
    
    const CITY = 'Monterrey';
    const COUNTRY_CODE = 'MX';
    
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${API_KEY}&units=metric&lang=es`;
    console.log('URL de la API:', apiUrl.replace(API_KEY, '***REDACTED***'));
    
    const response = await fetch(apiUrl);
    
    // Manejo seguro de la respuesta
    let responseBody;
    try {
      // Intentamos parsear como JSON
      responseBody = await response.json();
    } catch (e) {
      // Si falla, intentamos obtener como texto
      try {
        responseBody = { message: await response.text() };
      } catch (e2) {
        responseBody = { message: 'Error desconocido al obtener datos climáticos' };
      }
    }
    
    if (!response.ok) {
      console.error('Error de la API:', {
        status: response.status,
        statusText: response.statusText,
        body: responseBody
      });
      
      // Manejamos específicamente el error 401
      if (response.status === 401) {
        throw new Error('API key inválida o no autorizada. Verifica tu API key en OpenWeatherMap.');
      }
      
      throw new Error(`Error de la API: ${response.status} - ${responseBody.message || response.statusText}`);
    }
    
    // Procesa los datos para enviar solo lo necesario al frontend
    const processedData = {
      temperature: Math.round(responseBody.main.temp),
      humidity: responseBody.main.humidity,
      windSpeed: Math.round(responseBody.wind.speed * 3.6), // Convertir m/s a km/h
      weatherId: responseBody.weather[0].id,
      timestamp: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(processedData)
    };
    
  } catch (error) {
    console.error('Error en la función de clima:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
