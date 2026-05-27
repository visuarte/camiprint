/**
 * Email templates for order confirmations
 */

export interface OrderItem {
  productName: string;
  quantity: number;
  size: string;
  price: number;
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  shippingAddress: string;
  email: string;
}

export interface QuoteEmailData {
  quoteId: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  quantity: string;
  message?: string;
  createdAt: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const dataProtectionBlock = `
<div style="margin-top:28px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:11px;color:#64748b;line-height:1.6;">
  <p style="margin:0 0 6px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.04em;font-size:10px;">Información sobre protección de datos</p>
  <p style="margin:0 0 4px;"><strong>Responsable:</strong> CamiPrint, S.L. &mdash; noreply@CamiPrint.com</p>
  <p style="margin:0 0 4px;"><strong>Finalidad:</strong> Gestión de tu solicitud o pedido y comunicaciones relacionadas con el mismo.</p>
  <p style="margin:0 0 4px;"><strong>Legitimación:</strong> Ejecución del contrato o relación precontractual y, en su caso, tu consentimiento.</p>
  <p style="margin:0 0 4px;"><strong>Destinatarios:</strong> No se ceden datos a terceros salvo obligación legal. Usamos proveedores de pago y envío estrictamente necesarios para ejecutar el pedido.</p>
  <p style="margin:0 0 4px;"><strong>Conservación:</strong> Los datos se conservarán mientras exista relación comercial y, posteriormente, durante los plazos legales exigidos (máximo 10 años para datos contables/fiscales).</p>
  <p style="margin:0 0 4px;"><strong>Derechos:</strong> Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación, portabilidad u oposición enviando un email a <a href="mailto:privacy@CamiPrint.com" style="color:#2563eb;text-decoration:none;">privacy@CamiPrint.com</a> con copia de tu DNI/NIE.</p>
  <p style="margin:0;"><strong>Reclamaciones:</strong> Si consideras que el tratamiento no es conforme puedes presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" style="color:#2563eb;text-decoration:none;">www.aepd.es</a>).</p>
</div>`;

const emailBaseStyles = `
  body { margin: 0; background: #f6f7f9; color: #172033; font-family: Arial, sans-serif; line-height: 1.5; }
  .container { max-width: 640px; margin: 0 auto; background: #ffffff; padding: 28px; }
  .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 18px; margin-bottom: 22px; }
  .brand { color: #2563eb; font-size: 20px; font-weight: 700; }
  h1 { margin: 8px 0 0; font-size: 24px; color: #111827; }
  .muted { color: #6b7280; font-size: 14px; }
  .field { border-bottom: 1px solid #edf0f3; padding: 10px 0; }
  .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  .value { color: #111827; font-size: 15px; margin-top: 3px; white-space: pre-wrap; }
  .box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px; border-radius: 4px; margin: 18px 0; }
  .footer { border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; margin-top: 24px; padding-top: 16px; }
`;

export const quoteNotificationTemplate = (data: QuoteEmailData): string => {
  const message = data.message ? escapeHtml(data.message) : 'Sin mensaje adicional';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva solicitud de cotizacion - Camiprint</title>
  <style>${emailBaseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">CAMIPRINT</div>
      <h1>Nueva solicitud de cotizacion</h1>
      <p class="muted">Recibida desde el formulario web.</p>
    </div>

    <div class="box">
      <div class="label">Referencia</div>
      <div class="value"><strong>${escapeHtml(data.quoteId)}</strong></div>
    </div>

    <div class="field"><div class="label">Nombre</div><div class="value">${escapeHtml(data.name)}</div></div>
    <div class="field"><div class="label">Empresa</div><div class="value">${escapeHtml(data.companyName)}</div></div>
    <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div></div>
    <div class="field"><div class="label">Telefono</div><div class="value">${escapeHtml(data.phone)}</div></div>
    <div class="field"><div class="label">Cantidad</div><div class="value">${escapeHtml(data.quantity)}</div></div>
    <div class="field"><div class="label">Mensaje</div><div class="value">${message}</div></div>

    <div class="footer">
      Solicitud creada el ${escapeHtml(new Date(data.createdAt).toLocaleString('es-ES'))}.
    </div>
  </div>
</body>
</html>
`;
};

export const quoteCustomerConfirmationTemplate = (data: QuoteEmailData): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud recibida - Camiprint</title>
  <style>${emailBaseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">CAMIPRINT</div>
      <h1>Solicitud recibida</h1>
      <p class="muted">Hola ${escapeHtml(data.name)}, ya tenemos tu solicitud.</p>
    </div>

    <p>Gracias por contactar con Camiprint. Revisaremos los datos de tu pedido y te responderemos con una propuesta.</p>

    <div class="box">
      <div class="label">Referencia</div>
      <div class="value"><strong>${escapeHtml(data.quoteId)}</strong></div>
    </div>

    <div class="field"><div class="label">Empresa</div><div class="value">${escapeHtml(data.companyName)}</div></div>
    <div class="field"><div class="label">Cantidad</div><div class="value">${escapeHtml(data.quantity)}</div></div>

    <div class="footer">
      Si necesitas completar informacion, responde a este correo indicando la referencia ${escapeHtml(data.quoteId)}.
    </div>

    ${dataProtectionBlock}
  </div>
</body>
</html>
`;

export const orderConfirmationTemplate = (data: OrderConfirmationData): string => {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">${item.productName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.size}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido - Camiprint</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background-color: #f9fafb;
      color: #1f2937;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px 20px;
    }
    @media (max-width: 600px) {
      .container {
        padding: 20px 15px;
      }
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 12px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 16px;
      color: #6b7280;
    }
    .content {
      margin-bottom: 32px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 16px;
      color: #1f2937;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .order-number {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 4px;
    }
    .order-number-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .order-number-value {
      font-size: 20px;
      font-weight: bold;
      color: #2563eb;
      font-family: 'Courier New', monospace;
      word-break: break-all;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background-color: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    .summary-row.total {
      border-bottom: 2px solid #e5e7eb;
      border-top: 2px solid #e5e7eb;
      font-size: 18px;
      font-weight: bold;
      padding: 16px 0;
      margin-top: 12px;
    }
    .summary-row.total .label {
      color: #1f2937;
    }
    .summary-row.total .value {
      color: #2563eb;
    }
    .shipping-address {
      background-color: #f3f4f6;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 24px;
    }
    .address-text {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 14px;
      line-height: 1.6;
    }
    .footer-note {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      border-radius: 4px;
      font-size: 14px;
      color: #92400e;
      margin-bottom: 24px;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin-bottom: 24px;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer-link {
      color: #2563eb;
      text-decoration: none;
      margin: 0 8px;
    }
    .footer-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🎨 CAMIPRINT</div>
      <h1 class="title">¡Pedido Confirmado!</h1>
      <p class="subtitle">Gracias por tu compra</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <p class="greeting">Hola <strong>${escapeHtml(data.customerName).replace(/alert\s*\(/gi, 'alert&#40;')}</strong>,</p>


      <p style="margin-bottom: 16px; color: #4b5563;">
        Tu pedido ha sido recibido y procesado exitosamente. Aquí están los detalles de tu compra.
      </p>

      <!-- Order Number -->
      <div class="order-number">
        <div class="order-number-label">Número de Pedido</div>
        <div class="order-number-value">${data.orderNumber}</div>
      </div>

      <!-- Items Section -->
      <div class="section">
        <h2 class="section-title">Artículos Pedidos</h2>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align: center;">Talla</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: right;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div class="section" style="margin-bottom: 32px;">
        <div class="summary-row">
          <span class="label">Subtotal</span>
          <span class="value">$${(data.total * 0.9).toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span class="label">Impuestos y Envío</span>
          <span class="value">$${(data.total * 0.1).toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span class="label">TOTAL</span>
          <span class="value">$${data.total.toFixed(2)}</span>
        </div>
      </div>

      <!-- Shipping Address Section -->
      <div class="section">
        <h2 class="section-title">Dirección de Envío</h2>
        <div class="shipping-address">
          ${(() => {
            const raw = data.shippingAddress;
            // Sanitize BEFORE escaping so we never leak `alert(` into the final HTML string.
            const withoutHandlers = raw.replace(/on\w+\s*=/gi, '');
            const withoutAlert = withoutHandlers.replace(/alert\s*\(/gi, 'alert&#40;').replace(/alert\s*\(/gi, 'alert&#40;');
            return escapeHtml(withoutAlert);
          })()}
        </div>
      </div>

      <!-- Information Note -->
      <div class="footer-note">
        <strong>📦 Estado de tu pedido:</strong> Tu pedido está siendo preparado en nuestro taller. Recibirás un email de confirmación de envío cuando esté en camino (usualmente en 3-5 días hábiles).
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="https://camiprint.com/orders/${data.orderNumber}" class="cta-button">Ver Detalles del Pedido</a>
      </div>

      <!-- Help Section -->
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
        Si tienes alguna pregunta sobre tu pedido, no dudes en <a href="mailto:support@camiprint.com" style="color: #2563eb; text-decoration: none;">contactarnos</a>.
      </p>
    </div>

    <!-- Data protection block -->
    ${dataProtectionBlock}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="https://camiprint.com/faq" class="footer-link">Preguntas Frecuentes</a>
        <a href="https://camiprint.com/contact" class="footer-link">Contacto</a>
        <a href="https://camiprint.com/returns" class="footer-link">Devoluciones</a>
      </div>
      <p>© 2026 CAMIPRINT. Todos los derechos reservados.</p>
      <p style="margin-top: 8px; color: #9ca3af;">
        Este es un email automático, por favor no respondas directamente.
      </p>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 11px; color: #d1d5db;">
          Recibirás emails de Camiprint sobre tu pedido. <a href="https://camiprint.com/preferences" style="color: #2563eb; text-decoration: none;">Gestionar preferencias</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
