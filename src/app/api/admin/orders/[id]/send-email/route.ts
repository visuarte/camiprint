import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  secure: process.env.NODE_ENV === 'production',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Generate HTML email
    const itemsHtml = order.items
      .map(
        (item: typeof order.items[number]) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
              ${item.product?.name || 'Product'}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              ${item.quantity}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              $${item.price.toFixed(2)}
            </td>
          </tr>`
      )
      .join('');

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2>Confirmación de Orden #${order.id.substring(0, 8)}</h2>
          <p>Hola,</p>
          <p>Gracias por tu compra. Aquí está el resumen de tu orden:</p>
          
          <h3>Detalles de la Orden</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left;">Producto</th>
                <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">Cantidad</th>
                <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <h3>Información de Envío</h3>
          <p>
            <strong>${order.email}</strong><br/>
            ${order.address}<br/>
            Tel: ${order.phone}
          </p>

          <h3>Total: $${order.totalAmount.toFixed(2)}</h3>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Estado: <strong>${order.status}</strong>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Si tienes preguntas, contacta a nuestro equipo de soporte.
          </p>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@camiprint.com',
      to: order.email,
      subject: `Confirmación de Orden #${order.id.substring(0, 8)}`,
      html,
    });

    return NextResponse.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
