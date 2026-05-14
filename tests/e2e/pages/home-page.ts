import { expect, type Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        level: 1,
        name: /camisetas personalizadas para tu negocio/i,
      })
    ).toBeVisible();
  }

  async openContactSection(): Promise<void> {
    await this.page.locator('#contacto').scrollIntoViewIfNeeded();
    await expect(this.page.getByRole('heading', { name: /hablemos de tu pedido/i })).toBeVisible();
  }

  async fillQuoteForm(data: {
    name: string;
    email: string;
    phone: string;
    companyName: string;
    quantity: string;
    message?: string;
  }): Promise<void> {
    await this.page.getByLabel(/^nombre \*$/i).fill(data.name);
    await this.page.getByLabel(/^email \*$/i).fill(data.email);
    await this.page.getByLabel(/^telefono \*$/i).fill(data.phone);
    await this.page.getByLabel(/^empresa \*$/i).fill(data.companyName);
    await this.page.getByLabel(/^cantidad \*$/i).selectOption(data.quantity);
    if (typeof data.message === 'string') {
      await this.page.getByLabel(/^mensaje$/i).fill(data.message);
    }
  }

  async submitQuoteForm(): Promise<void> {
    await this.page.getByRole('button', { name: /solicitar propuesta/i }).click();
  }

  mobileMenuButton() {
    return this.page.getByRole('button', { name: /toggle navigation menu/i });
  }

  mobileLink(label: RegExp | string) {
    return this.page.locator('#mobile-main-menu').getByRole('link', { name: label });
  }
}
