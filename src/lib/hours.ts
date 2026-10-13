/**
 * Horários de funcionamento — Cuba & Café Tabacaria
 * ABERTO TODOS OS DIAS: 10h às 22h (inclusive domingos e feriados)
 * Fuso: America/Sao_Paulo
 */

export const OPEN_HOURS = {
  open: 10,
  close: 22,
  tz: 'America/Sao_Paulo',
  label: 'Todos os dias · 10h às 22h',
};

export interface OpenStatus {
  open: boolean;
  /** "Aberto agora · até 22h" ou "Fechado · abre às 10h" */
  label: string;
  /** "Hoje: 10h às 22h" */
  todayLabel: string;
}

/** Status atual calculado no fuso de São Paulo (roda só no client para evitar mismatch) */
export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: OPEN_HOURS.tz,
    hour: 'numeric',
    hour12: false,
    hourCycle: 'h23',
  });
  const parts = fmt.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '10', 10);

  const open = hour >= OPEN_HOURS.open && hour < OPEN_HOURS.close;
  const todayLabel = 'Hoje: 10h às 22h';

  if (open) {
    return { open: true, label: `Aberto agora · até ${OPEN_HOURS.close}h`, todayLabel };
  }
  return {
    open: false,
    label: `Fechado · abre hoje às ${OPEN_HOURS.open}h`,
    todayLabel,
  };
}
