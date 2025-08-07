export default async function handler(req, res) {
  // Configuración completa de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
  res.setHeader('Vary', 'Origin');
  
  // Manejo de solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    // Verifica que la API key exista
    if (!API_KEY) {
      console.error('ERROR: API_KEY no configurada');
      return res.status(500).json({
        error: 'Configuración incompleta',
        details: 'API key no configurada en variables de entorno',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verifica que la API key tenga 32 caracteres
    if (API_KEY.length !== 32) {
      console.error('ERROR: API_KEY longitud incorrecta', API_KEY.length);
      return res.status(500).json({
        error: 'Configuración incorrecta',
        details: 'La API key debe tener 32 caracteres',
        timestamp: new Date().toISOString()
      });
    }
    
    // Obtener parámetros de la URL
    const { lat, lon } = req.query;
    
    let apiUrl;
    
    // Si hay coordenadas, usar el endpoint tradicional (v2.5)
    if (lat && lon) {
      console.log(`Obteniendo clima para coordenadas: ${lat}, ${lon} usando endpoint tradicional`);
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
    } else {
      console.log('Obteniendo clima para Monterrey por defecto');
      const CITY = 'Monterrey';
      const COUNTRY_CODE = 'MX';
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${API_KEY}&units=metric&lang=es`;
    }
    
    const response = await fetch(apiUrl);
    
    // Manejo seguro de errores de la API
    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch (e) {
        try {
          errorBody = { message: await response.text() };
        } catch (e2) {
          errorBody = { message: 'Error desconocido al obtener datos climáticos' };
        }
      }
      
      console.error('Error de la API:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      
      // Maneja específicamente el error 401
      if (response.status === 401) {
        return res.status(401).json({
          error: 'API key inválida',
          details: 'Verifica tu API key en OpenWeatherMap',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(response.status).json({
        error: 'Error de la API',
        details: errorBody.message || response.statusText,
        timestamp: new Date().toISOString()
      });
    }
    
    // Parsea la respuesta como JSON
    const data = await response.json();
    
    // Procesa los datos - CORRECCIÓN DE ALTITUD
    let altitude;
    
    // Calcular la altitud aproximada desde la presión atmosférica
    if (data.main && (data.main.grnd_level || data.main.sea_level)) {
      const pressure = data.main.grnd_level || data.main.sea_level || 1013.25;
      
      // Fórmula para calcular altitud aproximada en metros
      // altitud (m) = (1013.25 - presión en hPa) * 8.43
      altitude = Math.round((1013.25 - pressure) * 8.43);
      
      console.log(`Altitud calculada desde presión (${pressure} hPa): ${altitude} msnm`);
      
      // Si la altitud calculada es negativa o muy alta, usar un valor razonable
      if (altitude < 0) {
        altitude = 0;
      } else if (altitude > 5000) {
        altitude = 5000;
      }
    } else {
      altitude = 540; // Altitud por defecto de Monterrey
      console.log(`Altitud por defecto para Monterrey: ${altitude} msnm`);
    }
    
    // Preparar la respuesta
    const processedData = {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      altitude: altitude,
      weatherId: data.weather[0].id,
      timestamp: new Date().toISOString()
    };
    
    // Devuelve la respuesta
    res.status(200).json(processedData);
    
  } catch (error) {
    console.error('Error FATAL en la función:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
