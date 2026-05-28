"use client";

import React from 'react';

type SiteSettings = {
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
};

function usePublicSiteSettings() {
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSettings({
          whatsappPhone: data?.whatsappPhone ?? null,
          whatsappMessage: data?.whatsappMessage ?? null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setSettings({ whatsappPhone: null, whatsappMessage: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}

export function PublicPhoneLink({
  className,
  emptyText = 'Telefono no disponible',
}: {
  className?: string;
  emptyText?: string;
}) {
  const settings = usePublicSiteSettings();
  const raw = settings?.whatsappPhone?.trim() ?? '';
  const digits = raw.replace(/[^0-9]/g, '');

  if (!digits) {
    return <span>{emptyText}</span>;
  }

  return (
    <a href={`tel:+${digits}`} className={className}>
      {raw}
    </a>
  );
}

export function PublicPhoneText({
  emptyText = 'Telefono no disponible',
}: {
  emptyText?: string;
}) {
  const settings = usePublicSiteSettings();
  const raw = settings?.whatsappPhone?.trim() ?? '';

  if (!raw) {
    return <span>{emptyText}</span>;
  }

  return <span>{raw}</span>;
}

export function PublicWhatsAppLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const settings = usePublicSiteSettings();
  const raw = settings?.whatsappPhone?.trim() ?? '';
  const digits = raw.replace(/[^0-9]/g, '');

  if (!digits) return null;

  const encodedText = encodeURIComponent(
    settings?.whatsappMessage ??
      'Hola, quiero un presupuesto para camisetas corporativas. Nombre, empresa y cantidad:'
  );

  return (
    <a
      href={`https://wa.me/${digits}?text=${encodedText}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
