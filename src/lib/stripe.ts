import Stripe from 'stripe';

// Un secreto que falta es un problema de la PETICIÓN, no del build.
// Antes se lanzaba en el ámbito del módulo: cualquier compilación sin la clave
// (CI, un preview sin secretos) moría al recolectar /api/orders, y el rojo del
// CI tapaba los fallos de verdad. Ahora se avisa y la clave se valida al usar.
const clave = process.env.STRIPE_SECRET_KEY;

if (!clave) {
  console.warn('[stripe] STRIPE_SECRET_KEY no definida: las rutas de pago fallarán si se llaman.');
}

export const stripe = new Stripe(clave || 'sk_test_sin_configurar', {
  apiVersion: '2026-05-27.dahlia',
});

export default stripe;
