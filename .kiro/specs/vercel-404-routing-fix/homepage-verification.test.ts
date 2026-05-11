import { describe, it, expect } from 'vitest';

/**
 * Homepage Content Verification Tests
 * 
 * **Validates: Requirements 2.2**
 * 
 * These tests verify that the production build serves the correct Camiprint
 * homepage content and does not contain any Next.js template content.
 */

describe('Homepage Content Verification', () => {
  const BASE_URL = 'http://localhost:3000';

  it('should return status code 200', async () => {
    const response = await fetch(BASE_URL);
    expect(response.status).toBe(200);
  });

  it('should contain main heading about custom t-shirts', async () => {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    
    expect(html).toContain('Camisetas personalizadas para negocios, restaurantes y empresas');
  });

  it('should contain all three quantity offers', async () => {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    
    expect(html).toContain('10+ camisetas');
    expect(html).toContain('25+ camisetas');
    expect(html).toContain('50+ camisetas');
  });

  it('should contain "Especialistas en" section', async () => {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    
    expect(html).toContain('Especialistas en');
  });

  it('should NOT contain Next.js template content', async () => {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    
    // Verify template content is NOT present
    expect(html).not.toContain('To get started, edit the page.tsx file');
    expect(html).not.toContain('Deploy Now');
    expect(html).not.toContain('Read our docs');
  });

  it('should have correct page title', async () => {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    
    expect(html).toContain('<title>Camiprint | Camisetas laborales y publicitarias</title>');
  });
});
