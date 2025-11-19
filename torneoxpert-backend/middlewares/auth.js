// middlewares/auth.js
function authMiddleware(req, res, next) {
  const rutasPublicas = [
    '/register',               // backend de inscripciones
    '/registro',               // React: formulario de registro
    '/api/escuelas',
    '/api/verificar-dni-unico',
    '/uploads',
    '/avatars',
  ];

  // Si la ruta empieza con alguna pública, dejar pasar
  if (rutasPublicas.some(r => req.path.startsWith(r))) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Torneoxpert"');
    return res.status(401).send('🔒 Acceso restringido');
  }

  const base64 = authHeader.split(' ')[1];
  const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');

  const USER = process.env.ADMIN_USER || 'admin';
  const PASS = process.env.ADMIN_PASS || 'torneo123';

  if (user === USER && pass === PASS) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Torneoxpert"');
  return res.status(401).send('🔒 Usuario o contraseña incorrectos');
}

module.exports = authMiddleware;