import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tarea 6: Process Section', () => {
  const dataPath = path.join(process.cwd(), 'src', 'app', 'data', 'processSteps.ts');
  const componentPath = path.join(process.cwd(), 'src', 'app', 'components', 'Process.tsx');
  const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');

  it('existe archivo de datos con interface ProcessStep', () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    expect(data).toContain('export interface ProcessStep');
    expect(data).toContain('stepNumber');
    expect(data).toContain('title');
    expect(data).toContain('description');
    expect(data).toContain('icon');
    expect(data).toContain('timeframe');
  });

  it('define 4 pasos del proceso', () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    expect(data).toContain('stepNumber: 1');
    expect(data).toContain('stepNumber: 2');
    expect(data).toContain('stepNumber: 3');
    expect(data).toContain('stepNumber: 4');
  });

  it('Process es Server Component y usa section con id proceso', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).not.toContain("'use client'");
    expect(component).toContain('id="proceso"');
    expect(component).toContain('<section');
  });

  it('renderiza pasos en layout responsive', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).toContain('grid-cols-1');
    expect(component).toContain('lg:grid-cols-4');
    expect(component).toContain('processSteps.map');
  });

  it('cada paso muestra timeframe', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).toContain('step.timeframe');
  });

  it('incluye conectores visuales entre pasos en desktop', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).toContain('lg:block');
    expect(component).toContain('bg-blue-300');
  });

  it('incluye CTA final Comenzar Ahora a #contacto', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).toContain('Comenzar Ahora');
    expect(component).toContain('href="#contacto"');
  });

  it('iconos con accesibilidad (role img y aria-label)', () => {
    const component = fs.readFileSync(componentPath, 'utf-8');
    expect(component).toContain('role="img"');
    expect(component).toContain('aria-label={step.title}');
  });

  it('está integrado en page.tsx', () => {
    const page = fs.readFileSync(pagePath, 'utf-8');
    expect(page).toContain("import Process from './components/Process'");
    expect(page).toContain('<Process />');
  });
});
