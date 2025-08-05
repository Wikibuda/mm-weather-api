export default async function handler(req, res) {
  // Solo para verificar que funciona
  res.status(200).json({ 
    status: "Funcionando",
    message: "Tu función Vercel está configurada correctamente"
  });
}
