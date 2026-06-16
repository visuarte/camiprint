'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

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
  submitError: string | null;
  supportRequestId: string | null;
  isSupportIdCopied: boolean;
  retryCount: number;
  isServerError: boolean;
}

interface QuoteApiValidationDetail {
  field: string;
  issue: string;
}

interface QuoteApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: QuoteApiValidationDetail[];
  };
  meta?: {
    requestId?: string;
  };
}

interface QuoteApiSuccessResponse {
  ok: true;
  data: {
    id: string;
    status: string;
    createdAt: string;
  };
  meta?: {
    requestId?: string;
  };
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

const resolvePrefilledQuantity = (): string | null => {
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
};

const CONTACT_WATCHDOG_KEY = 'contact-watchdog-reported';

const hasContactWatchdogReported = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.sessionStorage.getItem(CONTACT_WATCHDOG_KEY) === '1';
  } catch {
    return false;
  }
};

const markContactWatchdogReported = () => {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(CONTACT_WATCHDOG_KEY, '1');
  } catch {
    // noop
  }
};

const reportContactVisibilityIssue = async (payload: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;

  try {
    const body = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/v1/watchdog/contact-form', blob);
      return;
    }

    await fetch('/api/v1/watchdog/contact-form', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // We never block UX for monitoring failures.
  }
};

const ContactSection = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isApiEnabled = process.env.NEXT_PUBLIC_QUOTES_API_ENABLED !== 'false';
  const [state, setState] = useState<ContactFormState>({
    formData: initialForm,
    errors: {},
    touched: {},
    isSubmitting: false,
    isSuccess: false,
    submitError: null,
    supportRequestId: null,
    isSupportIdCopied: false,
    retryCount: 0,
    isServerError: false,
  });
  const [prefilledQuantity, setPrefilledQuantity] = useState<string | null>(null);
  const successMessageRef = useRef<HTMLParagraphElement>(null);
  const formContainerRef = useRef<HTMLFormElement>(null);

  const formData = state.formData;
  const errors = state.errors;
  const isSubmitting = state.isSubmitting;
  const isSuccess = state.isSuccess;
  const submitError = state.submitError;

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

  useEffect(() => {
    const syncPrefilledQuantity = () => {
      const nextQuantity = resolvePrefilledQuantity();
      if (!nextQuantity) return;

      setPrefilledQuantity(nextQuantity);
      setState((prev) => {
        if (prev.formData.quantity === nextQuantity) return prev;
        return {
          ...prev,
          formData: { ...prev.formData, quantity: nextQuantity },
        };
      });
    };

    syncPrefilledQuantity();
    window.addEventListener('hashchange', syncPrefilledQuantity);
    window.addEventListener('popstate', syncPrefilledQuantity);

    return () => {
      window.removeEventListener('hashchange', syncPrefilledQuantity);
      window.removeEventListener('popstate', syncPrefilledQuantity);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = window.setTimeout(() => {
      const formElement = formContainerRef.current;
      const alreadyReported = hasContactWatchdogReported();
      if (alreadyReported) return;

      if (!formElement) {
        void reportContactVisibilityIssue({
          type: 'contact_form_missing',
          path: window.location.pathname,
          userAgent: navigator.userAgent,
        });
        markContactWatchdogReported();
        return;
      }

      const style = window.getComputedStyle(formElement);
      const rect = formElement.getBoundingClientRect();
      const isVisible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number.parseFloat(style.opacity || '1') > 0.02 &&
        rect.width > 200 &&
        rect.height > 180;

      if (isVisible) return;

      const payload = {
        type: 'contact_form_invisible',
        path: window.location.pathname,
        hash: window.location.hash,
        userAgent: navigator.userAgent,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
      };

      console.error('[watchdog] contact form visibility issue', payload);
      void reportContactVisibilityIssue(payload);
      markContactWatchdogReported();
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  const inputErrorClass = (field: keyof ContactFormData) =>
    errors[field] && state.touched[field] ? 'border-red-300 ring-red-300' : 'border-gray-200/15 ring-accent-400';

  const setField = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [key]: value },
      errors: { ...prev.errors, [key]: undefined },
      submitError: null,
      supportRequestId: null,
      isSupportIdCopied: false,
    }));
  };

  const handleCopySupportId = async () => {
    const requestId = state.supportRequestId;
    if (!requestId) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(requestId);
        setState((prev) => ({ ...prev, isSupportIdCopied: true }));
      }
    } catch {
      setState((prev) => ({ ...prev, isSupportIdCopied: false }));
    }
  };

  const mapApiValidationErrors = (details: QuoteApiValidationDetail[] | undefined): ContactFormErrors => {
    const nextErrors: ContactFormErrors = {};
    if (!details) return nextErrors;

    details.forEach((detail) => {
      if (detail.field === 'name') nextErrors.name = detail.issue;
      if (detail.field === 'email') nextErrors.email = detail.issue;
      if (detail.field === 'phone') nextErrors.phone = detail.issue;
      if (detail.field === 'companyName') nextErrors.companyName = detail.issue;
      if (detail.field === 'quantity') nextErrors.quantity = detail.issue;
    });

    return nextErrors;
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

  const executeSubmit = async (data: ContactFormData) => {
    try {
      if (!isApiEnabled) {
        setState((prev) => ({
          ...prev,
          isSuccess: true,
          formData: { ...initialForm, quantity: prefilledQuantity ?? initialForm.quantity },
          errors: {},
          touched: {},
          submitError: null,
          supportRequestId: null,
          retryCount: 0,
          isServerError: false,
          isSupportIdCopied: false,
        }));
        setTimeout(() => successMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
        return;
      }

      const response = await fetch('/api/v1/quotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });

      let responseBody: QuoteApiSuccessResponse | QuoteApiErrorResponse | null = null;
      try {
        responseBody = (await response.json()) as QuoteApiSuccessResponse | QuoteApiErrorResponse;
      } catch {
        responseBody = null;
      }

      const requestId = responseBody?.meta?.requestId ?? null;
      if (isDevelopment && requestId) {
        console.info('[support][quotes] requestId:', requestId, 'status:', response.status);
      }

      if (response.status === 201) {
        setState((prev) => ({
          ...prev,
          isSuccess: true,
          formData: { ...initialForm, quantity: prefilledQuantity ?? initialForm.quantity },
          errors: {},
          touched: {},
          submitError: null,
          supportRequestId: requestId,
          retryCount: 0,
          isServerError: false,
          isSupportIdCopied: false,
        }));
        setTimeout(() => successMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
        return;
      }

      if (response.status === 422) {
        const body = responseBody as QuoteApiErrorResponse | null;
        const apiErrors = mapApiValidationErrors(body?.error.details);
        setState((prev) => ({
          ...prev,
          errors: { ...prev.errors, ...apiErrors },
          touched: {
            ...prev.touched,
            name: true,
            email: true,
            phone: true,
            companyName: true,
            quantity: true,
          },
          submitError: body?.error.message || 'Payload invalido',
          supportRequestId: requestId,
          isSupportIdCopied: false,
          isServerError: false,
        }));
        return;
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const retryText = retryAfter
          ? ` Intenta de nuevo en ${retryAfter} segundos.`
          : ' Intentalo nuevamente en unos minutos.';
        setState((prev) => ({
          ...prev,
          submitError: `Hay alta demanda en este momento.${retryText}`,
          supportRequestId: requestId,
          isSupportIdCopied: false,
          isServerError: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        submitError: 'No pudimos procesar tu solicitud. Intentalo de nuevo.',
        supportRequestId: requestId,
        isSupportIdCopied: false,
        isServerError: true,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        submitError: 'No pudimos enviar tu solicitud por un problema de red. Intentalo de nuevo.',
        supportRequestId: null,
        isSupportIdCopied: false,
        isServerError: false,
      }));
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleRetry = async () => {
    const RETRY_DELAYS_MS = [1000, 2000, 4000];
    const delay = RETRY_DELAYS_MS[Math.min(state.retryCount, RETRY_DELAYS_MS.length - 1)];
    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      submitError: null,
      isServerError: false,
      retryCount: prev.retryCount + 1,
    }));
    await new Promise<void>((resolve) => setTimeout(resolve, delay));
    await executeSubmit(state.formData);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState((prev) => ({
      ...prev,
      isSuccess: false,
      submitError: null,
      supportRequestId: null,
      isSupportIdCopied: false,
      isServerError: false,
      retryCount: 0,
    }));

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
    await executeSubmit(formData);
  };

  return (
    <section id="contacto" className="scroll-mt-20 bg-gradient-to-b from-cami-900 to-cami-950 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <span className="section-eyebrow">Equipo comercial</span>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">Hablemos de tu pedido</h2>
          <p className="mt-4 max-w-xl text-base text-cami-300 md:text-lg">
            Completa el briefing y te devolvemos una propuesta clara con precio, tecnica recomendada y ventana de entrega.
          </p>

          <div className="mt-8 rounded-2xl border border-gray-200/10 bg-cami-800/50 p-6 shadow-glow">
            <p className="text-sm text-cami-200">Respuesta promedio</p>
            <p className="mt-1 text-4xl font-bold text-gray-900">15 min</p>
            <p className="mt-4 text-sm text-cami-300">Soporte para uniformidad, activaciones de marca, reposicion de stock y eventos corporativos.</p>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-gray-200/10 bg-cami-800/30 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#ff4f00]">Contacto directo</p>
            <a href="tel:+34900111222" className="flex items-center gap-3 text-sm text-cami-200 transition-colors hover:text-gray-900">
              <span className="material-symbols-outlined text-[#ff4f00]">call</span>
              +34 900 111 222
            </a>
            <a href="mailto:hola@camiart.com" className="flex items-center gap-3 text-sm text-cami-200 transition-colors hover:text-gray-900">
              <span className="material-symbols-outlined text-[#ff4f00]">mail</span>
              hola@camiart.com
            </a>
            <a href="https://wa.me/34900111222" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-cami-200 transition-colors hover:text-gray-900">
              <span className="material-symbols-outlined text-[#ff4f00]">chat</span>
              WhatsApp
            </a>
            <div className="flex items-center gap-3 text-sm text-cami-200">
              <span className="material-symbols-outlined text-[#ff4f00]">location_on</span>
              Alicante, España
            </div>
          </div>
        </div>

        <form
          ref={formContainerRef}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200/12 bg-gradient-to-b from-cami-800 to-cami-900 p-6 shadow-glow md:p-8"
        >
          <div className="grid grid-cols-1 gap-4">
            <p className="rounded-lg border border-accent-400/30 bg-accent-400/10 px-3 py-2 text-xs font-medium text-cami-100">
              Cuanto mejor nos describas el pedido, más afinada saldrá la primera propuesta comercial.
            </p>

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-cami-200">Nombre *</label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) => setField('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full rounded-lg border bg-white/60 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 ${inputErrorClass('name')}`}
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
                  className={`w-full rounded-lg border bg-white/60 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 ${inputErrorClass('email')}`}
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
                  className={`w-full rounded-lg border bg-white/60 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 ${inputErrorClass('phone')}`}
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
                  className={`w-full rounded-lg border bg-white/60 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 ${inputErrorClass('companyName')}`}
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
                  className={`w-full rounded-lg border bg-white/60 px-3 py-2 text-gray-900 outline-none focus:ring-2 ${inputErrorClass('quantity')}`}
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
                className="w-full resize-none rounded-lg border border-gray-200/15 bg-white/60 px-3 py-2 text-gray-900 outline-none ring-accent-400 placeholder:text-gray-400 focus:ring-2"
                placeholder="Cuentanos brevemente tu idea, tejido y colores."
              />
            </div>

            <p className="text-xs text-cami-300">
              Tus datos se usan solo para preparar y gestionar esta solicitud.
            </p>
            <p className="text-xs text-cami-300">
              Pedimos lo minimo necesario para darte una propuesta util desde el primer correo.
            </p>

            <button
              type="submit"
              disabled={isDisabled}
              className="mt-2 inline-flex items-center justify-center rounded-lg border border-gray-200/20 bg-metal-button px-6 py-3 font-semibold text-cami-100 shadow-metal transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Preparando propuesta...' : 'Solicitar propuesta'}
            </button>

            {isSuccess && (
              <div ref={successMessageRef} className="space-y-1">
                <p className="text-sm font-medium text-emerald-300">
                  Solicitud enviada. Te contactaremos en breve.
                </p>
                {state.supportRequestId && (
                  <p className="text-xs text-cami-300">
                    Codigo de seguimiento: {state.supportRequestId}
                  </p>
                )}
              </div>
            )}
            {submitError && (
              <div>
                <p className="text-sm font-medium text-red-300">
                  {submitError}
                </p>
                {state.isServerError && state.retryCount < 3 && !isSubmitting && (
                  <button
                    type="button"
                    onClick={() => { void handleRetry(); }}
                    className="mt-2 text-sm font-medium text-cami-200 underline hover:text-gray-900"
                  >
                    Reintentar
                  </button>
                )}
                {state.supportRequestId && (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-xs text-cami-300">
                      Si el problema persiste, contacta a soporte con el código: {state.supportRequestId}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopySupportId}
                      className="rounded border border-gray-200/25 px-2 py-0.5 text-[11px] font-medium text-cami-100 hover:bg-white/10"
                    >
                      {state.isSupportIdCopied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
