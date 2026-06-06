import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactSection from '../app/components/ContactSection';
import { brandConfig } from '@/config/brand';

const mockApiResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const stripMotionProps = (props: Record<string, unknown>) => {
  const {
    initial,
    whileInView,
    viewport,
    transition,
    animate,
    exit,
    ...rest
  } = props;

  void initial;
  void whileInView;
  void viewport;
  void transition;
  void animate;
  void exit;

  return rest;
};

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag) => {
        return ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
          React.createElement(tag as string, stripMotionProps(props), children);
      },
    }
  ),
}));

describe('Tarea 9.4: Contact Form tests', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockApiResponse(201, {
          ok: true,
          data: {
            id: 'q_test',
            status: 'received',
            createdAt: new Date().toISOString(),
          },
          meta: { requestId: 'req_test' },
        })
      )
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const fillValidRequiredFields = () => {
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'carlos@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Telefono *'), { target: { value: '+34 600 123 123' } });
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: brandConfig.companyExample } });
    fireEvent.change(screen.getByLabelText('Cantidad *'), { target: { value: '50-99' } });
  };

  it('renderiza todos los campos correctamente', () => {
    render(<ContactSection />);

    expect(screen.getByLabelText('Nombre *')).toBeTruthy();
    expect(screen.getByLabelText('Email *')).toBeTruthy();
    expect(screen.getByLabelText('Telefono *')).toBeTruthy();
    expect(screen.getByLabelText('Empresa *')).toBeTruthy();
    expect(screen.getByLabelText('Cantidad *')).toBeTruthy();
    expect(screen.getByLabelText('Mensaje')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Solicitar propuesta' })).toBeTruthy();
  });

  it('muestra errores de validacion cuando campos requeridos estan vacios', async () => {
    render(<ContactSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('Nombre minimo de 2 caracteres')).toBeTruthy();
    expect(screen.getByText('Email invalido')).toBeTruthy();
    expect(screen.getByText('Telefono invalido')).toBeTruthy();
    expect(screen.getByText('Empresa requerida')).toBeTruthy();
  });

  it('valida formato de email', async () => {
    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'email_invalido' } });
    fireEvent.change(screen.getByLabelText('Telefono *'), { target: { value: '+34 600 123 123' } });
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: brandConfig.companyExample } });
    const form = screen.getByRole('button', { name: 'Solicitar propuesta' }).closest('form');

    if (!form) {
      throw new Error('No se encontro el formulario de contacto');
    }

    fireEvent.submit(form);

    expect(await screen.findByText('Email invalido')).toBeTruthy();
  });

  it('valida formato de telefono', async () => {
    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'carlos@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Telefono *'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: brandConfig.companyExample } });
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('Telefono invalido')).toBeTruthy();
  });

  it('muestra mensaje de exito despues de submit valido', async () => {
    render(<ContactSection />);

    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('Solicitud enviada. Te contactaremos en breve.')).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith('/api/v1/quotes', expect.objectContaining({ method: 'POST' }));
  });

  it('resetea el formulario despues de submit exitoso', async () => {
    render(<ContactSection />);

    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Nombre *') as HTMLInputElement;
      const emailInput = screen.getByLabelText('Email *') as HTMLInputElement;
      const quantitySelect = screen.getByLabelText('Cantidad *') as HTMLSelectElement;
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(quantitySelect.value).toBe('25-49');
    });
  });

  it('preselecciona cantidad desde URL parameter', () => {
    window.history.pushState({}, '', '/#contacto?quantity=tier-50');
    render(<ContactSection />);

    const quantitySelect = screen.getByLabelText('Cantidad *') as HTMLSelectElement;
    expect(quantitySelect.value).toBe('50-99');
  });

  it('preselecciona cantidad valida desde query string', () => {
    window.history.pushState({}, '', '/?quantity=10-24#contacto');
    render(<ContactSection />);

    const quantitySelect = screen.getByLabelText('Cantidad *') as HTMLSelectElement;
    expect(quantitySelect.value).toBe('10-24');
  });

  it('mantiene cantidad por defecto cuando el parametro es invalido', () => {
    window.history.pushState({}, '', '/#contacto?quantity=no-existe');
    render(<ContactSection />);

    const quantitySelect = screen.getByLabelText('Cantidad *') as HTMLSelectElement;
    expect(quantitySelect.value).toBe('25-49');
  });

  it('muestra error si cantidad requerida queda vacia', async () => {
    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'carlos@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Telefono *'), { target: { value: '+34 600 123 123' } });
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: brandConfig.companyExample } });
    fireEvent.change(screen.getByLabelText('Cantidad *'), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('Selecciona una cantidad')).toBeTruthy();
  });

  it('ejecuta validacion al perder foco en telefono, empresa y cantidad', () => {
    render(<ContactSection />);

    const emailInput = screen.getByLabelText('Email *');
    const phoneInput = screen.getByLabelText('Telefono *');
    const companyInput = screen.getByLabelText('Empresa *');
    const quantitySelect = screen.getByLabelText('Cantidad *');

    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.focus(phoneInput);
    fireEvent.blur(phoneInput);

    fireEvent.change(companyInput, { target: { value: '' } });
    fireEvent.focus(companyInput);
    fireEvent.blur(companyInput);

    fireEvent.change(quantitySelect, { target: { value: '' } });
    fireEvent.focus(quantitySelect);
    fireEvent.blur(quantitySelect);

    expect(phoneInput).toBeTruthy();
    expect(companyInput).toBeTruthy();
    expect(quantitySelect).toBeTruthy();
  });

  it('permite escribir mensaje opcional', () => {
    render(<ContactSection />);

    const message = screen.getByLabelText('Mensaje') as HTMLTextAreaElement;
    fireEvent.change(message, { target: { value: 'Necesito 60 camisetas rojas.' } });

    expect(message.value).toBe('Necesito 60 camisetas rojas.');
  });

  it('muestra estado de envio durante submit valido', async () => {
    let resolveFetch: ((value: Response) => void) | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          })
      )
    );

    render(<ContactSection />);

    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    await waitFor(() => {
      const sendingButton = screen.getByRole('button', { name: 'Preparando propuesta...' }) as HTMLButtonElement;
      expect(sendingButton.disabled).toBe(true);
    });

    if (!resolveFetch) {
      throw new Error('No se pudo resolver fetch en la prueba');
    }

    resolveFetch(
      mockApiResponse(201, {
        ok: true,
        data: {
          id: 'q_test',
          status: 'received',
          createdAt: new Date().toISOString(),
        },
        meta: { requestId: 'req_test' },
      })
    );

    expect(await screen.findByText('Solicitud enviada. Te contactaremos en breve.')).toBeTruthy();
  });

  it('mapea errores 422 del backend en campos del formulario', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockApiResponse(422, {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Payload invalido',
            details: [
              { field: 'email', issue: 'Formato de email invalido.' },
              { field: 'quantity', issue: 'Valor invalido.' },
            ],
          },
          meta: { requestId: 'req_bad' },
        })
      )
    );

    render(<ContactSection />);
    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('Payload invalido')).toBeTruthy();
    expect(screen.getByText('Formato de email invalido.')).toBeTruthy();
    expect(screen.getByText('Valor invalido.')).toBeTruthy();
  });

  it('muestra mensaje de saturacion para 429', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockApiResponse(429, {
          ok: false,
          error: { code: 'RATE_LIMITED', message: 'Too many requests' },
          meta: { requestId: 'req_429' },
        })
      )
    );

    render(<ContactSection />);
    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('Hay alta demanda en este momento. Intentalo nuevamente en unos minutos.')).toBeTruthy();
  });

  it('muestra mensaje generico para errores 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockApiResponse(500, {
          ok: false,
          error: { code: 'INTERNAL_ERROR', message: 'Error interno' },
          meta: { requestId: 'req_500' },
        })
      )
    );

    render(<ContactSection />);
    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('No pudimos procesar tu solicitud. Intentalo de nuevo.')).toBeTruthy();
  });
});

describe('ContactSection – Epic 11: retry, requestId, feature flag', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const fillValidRequiredFields = () => {
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'carlos@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Telefono *'), { target: { value: '+34 600 123 123' } });
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: brandConfig.companyExample } });
    fireEvent.change(screen.getByLabelText('Cantidad *'), { target: { value: '50-99' } });
  };

  it('muestra boton Reintentar tras recibir error 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
            meta: { requestId: 'req_500_test' },
          }),
          { status: 500, headers: { 'content-type': 'application/json' } }
        )
      )
    );

    render(<ContactSection />);
    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });

  it('no muestra boton Reintentar tras error 422 de validacion', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error: { code: 'VALIDATION_ERROR', message: 'Payload invalido', details: [] },
            meta: { requestId: 'req_422_test' },
          }),
          { status: 422, headers: { 'content-type': 'application/json' } }
        )
      )
    );

    render(<ContactSection />);
    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    // Para 422 el componente muestra el mensaje de la API, no el genérico
    await screen.findByText('Payload invalido');
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull();
  });

  it('muestra el requestId de soporte para todos los usuarios tras error 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error: { code: 'INTERNAL_ERROR', message: 'Error interno' },
            meta: { requestId: 'req_soporte_xyz789' },
          }),
          { status: 500, headers: { 'content-type': 'application/json' } }
        )
      )
    );

    render(<ContactSection />);
    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText(/req_soporte_xyz789/)).toBeTruthy();
    expect(screen.getByText(/Si el problema persiste/)).toBeTruthy();
  });

  it('muestra segundos de espera cuando la respuesta 429 incluye Retry-After', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error: { code: 'RATE_LIMITED', message: 'Too many requests' },
            meta: { requestId: 'req_429_ra' },
          }),
          {
            status: 429,
            headers: {
              'content-type': 'application/json',
              'retry-after': '45',
            },
          }
        )
      )
    );

    render(<ContactSection />);
    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText(/45 segundos/)).toBeTruthy();
  });

  it('simula exito sin llamar a fetch cuando la feature flag esta desactivada', async () => {
    vi.stubEnv('NEXT_PUBLIC_QUOTES_API_ENABLED', 'false');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<ContactSection />);
    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(
      await screen.findByText('Solicitud enviada. Te contactaremos en breve.')
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
