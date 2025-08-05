export const handler = async (req, res) => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    // Verifica que la API key exista
    if (!API_KEY) {
      console.error('API key no configurada en las variables de entorno');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Configuración incompleta', 
          details: 'API key no configurada',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    const CITY = 'Monterrey';
    const COUNTRY_CODE = 'MX';
    
    // Construye la URL de la API
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${API_KEY}&units=metric&lang=es`;
    console.log('URL de la API:', apiUrl.replace(API_KEY, '***REDACTED***'));
    
    // Realiza la solicitud
    const response = await fetch(apiUrl);
    
    // Manejo seguro de la respuesta
    let responseBody;
    try {
      // Intenta parsear como JSON
      responseBody = await response.json();
    } catch (e) {
      // Si falla, intenta obtener como texto
      try {
        responseBody = { message: await response.text() };
      } catch (e2) {
        responseBody = { message: 'Error desconocido al obtener datos climáticos' };
      }
    }
    
    // Si la respuesta no es OK
    if (!response.ok) {
      console.error('Error de la API:', {
        status: response.status,
        statusText: response.statusText,
        body: responseBody
      });
      
      // Maneja específicamente el error 401
      if (response.status === 401) {
        return {
          statusCode: 401,
          body: JSON.stringify({ 
            error: 'API key inválida',
            details: 'Verifica tu API key en OpenWeatherMap y asegúrate de que tu cuenta esté confirmada por email',
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Maneja otros errores
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'Error de la API',
          details: responseBody.message || response.statusText,
          timestamp: new Date().toISOString()
        })
      };
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
    console.error('Error FATAL en la función de clima:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido',
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    };
  }
};
