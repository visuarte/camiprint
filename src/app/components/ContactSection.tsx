'use client';

import { FormEvent, useMemo, useState } from 'react';
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

const initialForm: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  quantity: '25-49',
  message: '',
};

const quantityOptions = ['10-24', '25-49', '50-99', '100+'];

const ContactSection = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialForm);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const setField = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSuccess(false);

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      // Placeholder para futuro puente API.
      await new Promise((resolve) => setTimeout(resolve, 650));
      setIsSuccess(true);
      setFormData(initialForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="scroll-mt-20 bg-gradient-to-b from-cami-900 to-cami-950 px-4 py-16 md:px-6 md:py-24">
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
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-cami-200">Nombre *</label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) => setField('name', e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-cami-950/60 px-3 py-2 text-white outline-none ring-accent-400 placeholder:text-cami-700 focus:ring-2"
                placeholder="Tu nombre"
              />
              {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-cami-200">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-cami-950/60 px-3 py-2 text-white outline-none ring-accent-400 placeholder:text-cami-700 focus:ring-2"
                  placeholder="empresa@correo.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-cami-200">Telefono *</label>
                <input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-cami-950/60 px-3 py-2 text-white outline-none ring-accent-400 placeholder:text-cami-700 focus:ring-2"
                  placeholder="+34 600 000 000"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-300">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-cami-200">Empresa *</label>
                <input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setField('companyName', e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-cami-950/60 px-3 py-2 text-white outline-none ring-accent-400 placeholder:text-cami-700 focus:ring-2"
                  placeholder="Nombre de tu empresa"
                />
                {errors.companyName && <p className="mt-1 text-xs text-red-300">{errors.companyName}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-cami-200">Cantidad *</label>
                <select
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setField('quantity', e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-cami-950/60 px-3 py-2 text-white outline-none ring-accent-400 focus:ring-2"
                >
                  {quantityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.quantity && <p className="mt-1 text-xs text-red-300">{errors.quantity}</p>}
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
