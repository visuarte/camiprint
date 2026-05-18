import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pricing from '../app/components/Pricing';
import ContactSection from '../app/components/ContactSection';

const mockApiResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.PropsWithChildren<{ href: string } & Record<string, unknown>>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

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

describe('Tarea 9.5: Integracion flujo de cotizacion', () => {
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

  it('usuario hace clic en CTA de pricing tier', () => {
    render(<Pricing />);

    const ctaTier50 = document.querySelector('a[href="#contacto?quantity=tier-50"]') as HTMLAnchorElement | null;

    expect(ctaTier50).toBeTruthy();

    // En jsdom no hay scroll real; simulamos el cambio de hash tras el click del enlace.
    fireEvent.click(ctaTier50 as HTMLAnchorElement);
    window.history.pushState({}, '', (ctaTier50 as HTMLAnchorElement).getAttribute('href') ?? '/');

    expect(window.location.hash).toBe('#contacto?quantity=tier-50');
  });

  it('formulario se muestra con cantidad preseleccionada y permite submit exitoso', async () => {
    window.history.pushState({}, '', '/#contacto?quantity=tier-50');

    render(
      <>
        <Pricing />
        <ContactSection />
      </>
    );

    const contactSection = document.getElementById('contacto');
    expect(contactSection).toBeTruthy();

    const quantitySelect = screen.getByLabelText('Cantidad *') as HTMLSelectElement;
    expect(quantitySelect.value).toBe('50-99');

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'carlos@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Telefono *'), { target: { value: '+34 600 123 123' } });
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Camiart SL' } });

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('Solicitud enviada. Te contactaremos en breve.')).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith('/api/v1/quotes', expect.objectContaining({ method: 'POST' }));
  });
});
