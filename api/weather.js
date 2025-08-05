export const handler = async (req, res) => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      console.error('ERROR: API_KEY no configurada');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Configuración incompleta',
          details: 'API key no configurada en variables de entorno',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    const CITY = 'Monterrey';
    const COUNTRY_CODE = 'MX';
    
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${API_KEY}&units=metric&lang=es`;
    console.log('URL de la API:', apiUrl.replace(API_KEY, '***REDACTED***'));
    
    const response = await fetch(apiUrl);
    
    // Verifica si la respuesta es OK (código 200)
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de la API:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'Error de la API',
          details: `HTTP ${response.status}: ${response.statusText}`,
          response: errorText,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Parsea la respuesta como JSON
    const data = await response.json();
    
    // Verifica que los datos tengan la estructura esperada
    if (!data.main || !data.wind || !data.weather || !data.weather[0]) {
      console.error('Estructura de datos inesperada:', data);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Datos inesperados',
          details: 'La respuesta de la API no tiene la estructura esperada',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Procesa los datos
    const processedData = {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convertir m/s a km/h
      weatherId: data.weather[0].id,
      timestamp: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(processedData)
    };
    
  } catch (error) {
    console.error('Error FATAL en la función:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    };
  }
};
