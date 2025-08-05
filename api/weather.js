export const handler = async (req, res) => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    console.log('API Key:', API_KEY ? 'Existe' : 'NO EXISTE');
    
    if (!API_KEY) {
      throw new Error('API key no configurada');
    }
    
    const CITY = 'Monterrey';
    const COUNTRY_CODE = 'MX';
    
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${API_KEY}&units=metric&lang=es`;
    console.log('URL de la API:', apiUrl.replace(API_KEY, '***REDACTED***'));
    
    const response = await fetch(apiUrl);
    
    // Manejo seguro de la respuesta de error
    let errorData = {};
    try {
      // Intentamos parsear como JSON
      errorData = await response.json();
    } catch (e) {
      // Si no es JSON válido, usamos texto plano
      try {
        errorData.message = await response.text();
      } catch (e2) {
        errorData.message = 'Error desconocido al obtener datos climáticos';
      }
    }
    
    if (!response.ok) {
      console.error('Error de la API:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      
      // Manejamos específicamente el error 401
      if (response.status === 401) {
        throw new Error('API key inválida o no autorizada. Verifica tu API key en OpenWeatherMap.');
      }
      
      throw new Error(`Error de la API: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    // Procesa los datos para enviar solo lo necesario al frontend
    const processedData = {
      temperature: Math.round(response.data.main.temp),
      humidity: response.data.main.humidity,
      windSpeed: Math.round(response.data.wind.speed * 3.6),
      weatherId: response.data.weather[0].id,
      timestamp: new Date().toISOString()
    };
    
    // Devuelve los datos procesados
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
