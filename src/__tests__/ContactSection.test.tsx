import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactSection from '../app/components/ContactSection';

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const fillValidRequiredFields = () => {
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'carlos@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Telefono *'), { target: { value: '+34 600 123 123' } });
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Camiprint SL' } });
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
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Camiprint SL' } });
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
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Camiprint SL' } });
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('Telefono invalido')).toBeTruthy();
  });

  it('muestra mensaje de exito despues de submit valido', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    render(<ContactSection />);

    fillValidRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar propuesta' }));

    expect(await screen.findByText('Solicitud enviada. Te contactaremos en breve.')).toBeTruthy();

    expect(logSpy).toHaveBeenCalled();
  });

  it('resetea el formulario despues de submit exitoso', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
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
});
