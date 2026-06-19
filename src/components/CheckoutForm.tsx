'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CardElement, PaymentRequestButtonElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/lib/store';
import { formatEUR } from '@/lib/format';
import { useRouter } from 'next/navigation';
import type { StripeCardElementChangeEvent, PaymentRequest } from '@stripe/stripe-js';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  card?: string;
  submit?: string;
}

export function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !formData.email) return;
    const id = setTimeout(() => {
      if (items.length > 0 && formData.email && formData.name) {
        fetch('/api/abandoned-cart', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email, name: formData.name,
            items: items.map(i => ({ name: i.productName, quantity: i.quantity, price: i.price })),
            total: getTotal(),
            checkoutUrl: window.location.href,
          }),
        }).catch(() => {});
        tracked.current = true;
      }
    }, 10000);
    return () => clearTimeout(id);
  }, [formData.email, formData.name, items, getTotal]);

  // Initialize Payment Request (Apple Pay / Google Pay)
  useEffect(() => {
    if (!stripe || items.length === 0) return;
    const pr = stripe.paymentRequest({
      country: 'ES',
      currency: 'eur',
      total: { label: 'CamiArt', amount: Math.round(getTotal() * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
      shippingOptions: [{
        id: 'standard',
        label: 'Envío gratis',
        amount: 0,
      }],
    });
    pr.canMakePayment().then((result) => {
      if (result) setCanMakePayment(true);
    });
    pr.on('paymentmethod', async (e: any) => {
      try {
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: e.payerName || formData.name,
            email: e.payerEmail || formData.email,
            phone: e.payerPhone || formData.phone,
            address: e.shippingAddress?.line1 || formData.address,
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            total: getTotal(),
          }),
        });
        const { orderId, clientSecret } = await orderRes.json();
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: e.paymentMethod.id,
        });
        if (confirmError) {
          e.complete('fail');
          return;
        }
        e.complete('success');
        clearCart();
        setSuccess(true);
        setTimeout(() => router.push(`/checkout/success?orderId=${orderId}`), 1500);
      } catch {
        e.complete('fail');
      }
    });
    setPaymentRequest(pr);
  }, [stripe, items, getTotal, formData, router, clearCart]);
  const [cardError, setCardError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  // Validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar teléfono (mínimo 10 caracteres)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'El teléfono debe tener al menos 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar errores del campo cuando el usuario empieza a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Manejar cambios en CardElement
  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError('');
    }
  };

  // Crear orden y obtener clientSecret
  const createOrder = async (): Promise<{ orderId: string; clientSecret: string } | null> => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          total: getTotal(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating order');
      }

      const data = await response.json();
      return {
        orderId: data.orderId,
        clientSecret: data.clientSecret,
      };
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Error al crear la orden',
      }));
      return null;
    }
  };

  // Procesar pago
  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Crear orden
      const orderData = await createOrder();
      if (!orderData) {
        setLoading(false);
        return;
      }

      const { orderId, clientSecret } = orderData;

      // Obtener CardElement
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirmar pago
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
          },
        },
      });

      if (error) {
        setErrors((prev) => ({
          ...prev,
          submit: error.message || 'Error al procesar el pago',
        }));
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Pago exitoso
        setSuccess(true);
        clearCart();
        
        // Redirigir a página de éxito
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${orderId}`);
        }, 1500);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // 3D Secure u otra acción requerida
        setErrors((prev) => ({
          ...prev,
          submit: 'Se requiere autenticación adicional. Por favor, completa el desafío 3D Secure.',
        }));
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Error inesperado',
      }));
    } finally {
      setLoading(false);
    }
  };

  // Enviar formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    handlePayment();
  };

  // Mostrar mensaje de éxito
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-cami-900 p-6 text-center shadow-glow">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10">
            <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">Pago confirmado</h3>
          <p className="mb-4 text-[#e2e2e2]/80">Estamos redirigiendo a la confirmacion de pedido.</p>
          <div className="h-2 overflow-hidden rounded-full bg-cami-800">
            <div className="h-full animate-pulse bg-emerald-300"></div>
          </div>
        </div>
      </div>
    );
  }

  const total = getTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Personal */}
      <div className="rounded-[1.5rem] border border-white/10 bg-cami-900/60 p-6 shadow-glow">
        <h3 className="mb-6 font-display text-2xl text-white">Datos de facturacion</h3>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#e2e2e2]">
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Tu nombre"
              disabled={loading}
              className={`w-full rounded-xl border bg-cami-950/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f00] ${
                errors.name ? 'border-red-400' : 'border-white/12'
              } disabled:cursor-not-allowed disabled:bg-cami-800`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-300">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#e2e2e2]">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              disabled={loading}
              className={`w-full rounded-xl border bg-cami-950/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f00] ${
                errors.email ? 'border-red-400' : 'border-white/12'
              } disabled:cursor-not-allowed disabled:bg-cami-800`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-300">{errors.email}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#e2e2e2]">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+34 600 000 000"
              disabled={loading}
              className={`w-full rounded-xl border bg-cami-950/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f00] ${
                errors.phone ? 'border-red-400' : 'border-white/12'
              } disabled:cursor-not-allowed disabled:bg-cami-800`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-300">{errors.phone}</p>}
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-[#e2e2e2]">
              Dirección de envío (Opcional)
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Calle, numero, ciudad y codigo postal"
              rows={3}
              disabled={loading}
              className="w-full resize-none rounded-xl border border-white/12 bg-cami-950/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff4f00] disabled:cursor-not-allowed disabled:bg-cami-800"
            />
          </div>
        </div>
      </div>

      {/* Información de Pago */}
      <div className="rounded-[1.5rem] border border-white/10 bg-cami-900/60 p-6 shadow-glow">
        <h3 className="mb-6 font-display text-2xl text-white">Datos de pago</h3>

        {canMakePayment && paymentRequest && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <hr className="flex-1 border-white/10" />
              <span className="text-xs font-medium uppercase tracking-wider text-white/40">Pago rápido</span>
              <hr className="flex-1 border-white/10" />
            </div>
            <PaymentRequestButtonElement
              options={{ paymentRequest }}
              className="[&_.PaymentRequestButton]:rounded-xl"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-[#e2e2e2]">
            Tarjeta de Crédito *
          </label>
          <div
            className={`rounded-xl border-2 p-4 focus-within:ring-2 focus-within:ring-accent-400 ${
              cardError ? 'border-red-400' : 'border-white/12'
            }`}
          >
            <CardElement
              onChange={handleCardChange}
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#f4f7fb',
                    '::placeholder': {
                      color: '#8ea1b8',
                    },
                  },
                  invalid: {
                    color: '#fca5a5',
                  },
                },
              }}
            />
          </div>
          {cardError && <p className="mt-2 text-sm text-red-300">{cardError}</p>}
        </div>
      </div>

      {/* Errores generales */}
      {errors.submit && (
        <div className="rounded-xl border border-red-400/20 bg-red-950/30 p-4">
          <div className="flex">
            <svg className="mt-0.5 mr-3 h-5 w-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-200">{errors.submit}</p>
          </div>
        </div>
      )}

      {/* Resumen y Botón de Pago */}
      <div className="rounded-[1.5rem] border border-white/10 bg-cami-900/60 p-6 shadow-glow">
        <div className="mb-6">
          <h3 className="mb-4 font-display text-2xl text-white">Resumen de la orden</h3>

          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-[#e2e2e2]/80">
                <span>
                  {item.productName} ({item.size}) x {item.quantity}
                </span>
                <span>{formatEUR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>{formatEUR(total)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className={`w-full rounded-full py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-all ${
            loading || !stripe || !elements
              ? 'cursor-not-allowed border border-white/12 bg-cami-800 text-[#e2e2e2]/80'
              : 'border border-[#ff4f00]/30 bg-metal-button text-white shadow-metal hover:-translate-y-0.5 hover:brightness-110'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Procesando...
            </span>
          ) : (
            `Pagar ${formatEUR(total)}`
          )}
        </button>
      </div>

      {/* Información de tarjetas de prueba */}
      <div className="rounded-xl border border-white/10 bg-cami-900/45 p-4 text-sm text-[#e2e2e2]/80">
        <p className="mb-2 font-semibold text-white">Tarjetas de prueba:</p>
        <ul className="space-y-1 text-xs">
          <li>✓ Éxito: 4242 4242 4242 4242</li>
          <li>✗ Rechazada: 4000 0000 0000 0002</li>
          <li>🔐 3D Secure: 4000 0025 0000 3155</li>
        </ul>
      </div>
    </form>
  );
}
