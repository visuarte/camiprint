import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { sendAbandonedCartEmail } from '@/server/emails/service';

const DATA_DIR = join(process.cwd(), 'data', 'abandoned-carts');
const DATA_FILE = join(DATA_DIR, 'carts.json');

interface AbandonedCart {
  email: string;
  name: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  checkoutUrl: string;
  createdAt: string;
  reminded: boolean;
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readCarts(): AbandonedCart[] {
  ensureDir();
  if (!existsSync(DATA_FILE)) return [];
  return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
}

function writeCarts(carts: AbandonedCart[]) {
  ensureDir();
  writeFileSync(DATA_FILE, JSON.stringify(carts, null, 2), 'utf-8');
}

export function trackAbandonedCart(cart: Omit<AbandonedCart, 'createdAt' | 'reminded'>) {
  const carts = readCarts();
  const existing = carts.findIndex(c => c.email === cart.email);
  const entry: AbandonedCart = { ...cart, createdAt: new Date().toISOString(), reminded: false };
  if (existing >= 0) carts[existing] = entry;
  else carts.push(entry);
  writeCarts(carts);
  return entry;
}

export function getAbandonedCarts(hoursOld = 1): AbandonedCart[] {
  const now = Date.now();
  return readCarts().filter(c =>
    !c.reminded && (now - new Date(c.createdAt).getTime()) > hoursOld * 3600000
  );
}

export async function sendRecoveryEmails(hoursOld = 1): Promise<number> {
  const carts = getAbandonedCarts(hoursOld);
  let sent = 0;
  for (const cart of carts) {
    try {
      await sendAbandonedCartEmail({ email: cart.email, name: cart.name, items: cart.items, total: cart.total, checkoutUrl: cart.checkoutUrl });
      const all = readCarts();
      const idx = all.findIndex(c => c.email === cart.email);
      if (idx >= 0) { all[idx].reminded = true; writeCarts(all); }
      sent++;
    } catch { /* skip */ }
  }
  return sent;
}
