import GuiaTallasClient from './GuiaTallasClient';

export default async function GuiaTallasPage({ params }: { params: Promise<{ modelcode: string }> }) {
  const { modelcode } = await params;
  return <GuiaTallasClient modelcode={modelcode} />;
}
