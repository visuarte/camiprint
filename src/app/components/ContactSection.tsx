'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  quantity: string;
  message: string;
}

type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>;

interface ContactFormState {
  formData: ContactFormData;
  errors: ContactFormErrors;
  touched: Partial<Record<keyof ContactFormData, boolean>>;
  isSubmitting: boolean;
  isSuccess: boolean;
}

const initialForm: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  quantity: '25-49',
  message: '',
};

const quantityOptions = ['10-24', '25-49', '50-99', '100+'];

const quantityFromTierMap: Record<string, string> = {
  'tier-10': '10-24',
  'tier-25': '25-49',
  'tier-50': '50-99',
};

const ContactSection = () => {
  const [state, setState] = useState<ContactFormState>({
    formData: initialForm,
    errors: {},
    touched: {},
    isSubmitting: false,
    isSuccess: false,
  });

  const formData = state.formData;
  const errors = state.errors;
  const isSubmitting = state.isSubmitting;
  const isSuccess = state.isSuccess;

  const isDisabled = useMemo(() => isSubmitting, [isSubmitting]);

  const validateForm = (data: ContactFormData): ContactFormErrors => {
    const nextErrors: ContactFormErrors = {};

    if (data.name.trim().length < 2) nextErrors.name = 'Nombre minimo de 2 caracteres';
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) nextErrors.email = 'Email invalido';
    if (!/^[+0-9\s()-]{7,}$/.test(data.phone.trim())) nextErrors.phone = 'Telefono invalido';
    if (!data.companyName.trim()) nextErrors.companyName = 'Empresa requerida';
    if (!data.quantity.trim()) nextErrors.quantity = 'Selecciona una cantidad';

    return nextErrors;
  };

  const validateField = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]): string | undefined => {
    const textValue = String(value).trim();

    if (key === 'name') return textValue.length < 2 ? 'Nombre minimo de 2 caracteres' : undefined;
    if (key === 'email') return /^\S+@\S+\.\S+$/.test(textValue) ? undefined : 'Email invalido';
    if (key === 'phone') return /^[+0-9\s()-]{7,}$/.test(textValue) ? undefined : 'Telefono invalido';
    if (key === 'companyName') return textValue ? undefined : 'Empresa requerida';
    if (key === 'quantity') return textValue ? undefined : 'Selecciona una cantidad';

    return undefined;
  };

  const prefilledQuantity = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const queryParams = new URLSearchParams(window.location.search);
    const queryValue = queryParams.get('quantity');
    if (queryValue) {
      if (quantityFromTierMap[queryValue]) return quantityFromTierMap[queryValue];
      if (quantityOptions.includes(queryValue)) return queryValue;
    }

    const hash = window.location.hash || '';
    const queryInHash = hash.includes('?') ? hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(queryInHash);
    const hashQuantity = hashParams.get('quantity');
    if (!hashQuantity) return null;
    if (quantityFromTierMap[hashQuantity]) return quantityFromTierMap[hashQuantity];
    if (quantityOptions.includes(hashQuantity)) return hashQuantity;
    return null;
  }, []);

  useEffect(() => {
    if (!prefilledQuantity) return;
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, quantity: prefilledQuantity },
    }));
  }, [prefilledQuantity]);

  const inputErrorClass = (field: keyof ContactFormData) =>
    errors[field] && state.touched[field] ? 'border-red-300 ring-red-300' : 'border-white/15 ring-accent-400';

  const setField = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [key]: value },
      errors: { ...prev.errors, [key]: undefined },
    }));
  };

  const handleBlur = <K extends keyof ContactFormData>(key: K) => {
    setState((prev) => {
      const fieldError = validateField(key, prev.formData[key]);
      return {
        ...prev,
        touched: { ...prev.touched, [key]: true },
        errors: { ...prev.errors, [key]: fieldError },
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState((prev) => ({ ...prev, isSuccess: false }));

    const nextErrors = validateForm(formData);
    setState((prev) => ({
      ...prev,
      errors: nextErrors,
      touched: {
        name: true,
        email: true,
        phone: true,
        companyName: true,
        quantity: true,
      },
    }));

    if (Object.keys(nextErrors).length > 0) return;

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // MVP: simulamos envío y registramos payload para validación manual.
      console.log('Contact form payload', formData);
      await new Promise((resolve) => setTimeout(resolve, 650));
      setState((prev) => ({
        ...prev,
        isSuccess: true,
        formData: { ...initialForm, quantity: prefilledQuantity ?? initialForm.quantity },
        errors: {},
        touched: {},
      }));
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <section id="contacto" data-reveal data-reveal-delay="130" className="scroll-mt-20 bg-gradient-to-b from-cami-900 to-cami-950 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Hablemos de tu pedido</h2>
          <p className="mt-4 max-w-xl text-base text-cami-300 md:text-lg">
            Completa el formulario y te enviaremos una propuesta en minutos con precio y tiempos estimados.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-cami-800/50 p-6 shadow-glow">
            <p className="text-sm text-cami-200">Respuesta promedio</p>
            <p className="mt-1 text-4xl font-bold text-white">15 min</p>
            <p className="mt-4 text-sm text-cami-300">Soporte para ropa laboral, campañas publicitarias y series corporativas.</p>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="rounded-2xl border border-white/12 bg-gradient-to-b from-cami-800 to-cami-900 p-6 shadow-glow md:p-8"
        >
          <div className="grid grid-cols-1 gap-4">
            <p className="rounded-lg border border-accent-400/30 bg-accent-400/10 px-3 py-2 text-xs font-medium text-cami-100">
              Cupos de produccion de esta semana limitados. Te confirmamos disponibilidad y precio en la primera respuesta.
            </p>

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-cami-200">Nombre *</label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) => setField('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full rounded-lg border bg-cami-950/60 px-3 py-2 text-white outline-none placeholder:text-cami-700 focus:ring-2 ${inputErrorClass('name')}`}
                placeholder="Tu nombre"
              />
                {errors.name && state.touched.name && <p className="mt-1 text-xs text-red-300">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-cami-200">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setField('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full rounded-lg border bg-cami-950/60 px-3 py-2 text-white outline-none placeholder:text-cami-700 focus:ring-2 ${inputErrorClass('email')}`}
                  placeholder="empresa@correo.com"
                />
                {errors.email && state.touched.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-cami-200">Telefono *</label>
                <input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full rounded-lg border bg-cami-950/60 px-3 py-2 text-white outline-none placeholder:text-cami-700 focus:ring-2 ${inputErrorClass('phone')}`}
                  placeholder="+34 600 000 000"
                />
                {errors.phone && state.touched.phone && <p className="mt-1 text-xs text-red-300">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-cami-200">Empresa *</label>
                <input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setField('companyName', e.target.value)}
                  onBlur={() => handleBlur('companyName')}
                  className={`w-full rounded-lg border bg-cami-950/60 px-3 py-2 text-white outline-none placeholder:text-cami-700 focus:ring-2 ${inputErrorClass('companyName')}`}
                  placeholder="Nombre de tu empresa"
                />
                {errors.companyName && state.touched.companyName && <p className="mt-1 text-xs text-red-300">{errors.companyName}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-cami-200">Cantidad *</label>
                <select
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setField('quantity', e.target.value)}
                  onBlur={() => handleBlur('quantity')}
                  className={`w-full rounded-lg border bg-cami-950/60 px-3 py-2 text-white outline-none focus:ring-2 ${inputErrorClass('quantity')}`}
                >
                  {quantityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.quantity && state.touched.quantity && <p className="mt-1 text-xs text-red-300">{errors.quantity}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-cami-200">Mensaje</label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setField('message', e.target.value)}
                className="w-full resize-none rounded-lg border border-white/15 bg-cami-950/60 px-3 py-2 text-white outline-none ring-accent-400 placeholder:text-cami-700 focus:ring-2"
                placeholder="Cuentanos brevemente tu idea, tejido y colores."
              />
            </div>

            <p className="text-xs text-cami-300">
              Tus datos estan protegidos y no seran compartidos con terceros.
            </p>
            <p className="text-xs text-cami-300">
              Solo pedimos 5 campos obligatorios para darte una cotizacion precisa.
            </p>

            <button
              type="submit"
              disabled={isDisabled}
              className="mt-2 inline-flex items-center justify-center rounded-lg border border-white/20 bg-metal-button px-6 py-3 font-semibold text-cami-100 shadow-metal transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Enviando...' : 'Solicitar propuesta'}
            </button>

            {isSuccess && (
              <p className="text-sm font-medium text-emerald-300">
                Solicitud enviada. Te contactaremos en breve.
              </p>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
