import { toCents } from './money';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const start = startOfDay(date);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

function monthStart(date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function formatDateLabel(date, options) {
  return new Intl.DateTimeFormat('es-ES', options).format(date);
}

export function buildEvolutionData(transactions = [], period = 'Mes', referenceDate = new Date()) {
  const today = startOfDay(referenceDate);
  let buckets;

  if (period === 'Sem') {
    buckets = Array.from({ length: 7 }, (_, index) => {
      const start = new Date(today.getTime() - (6 - index) * DAY_MS);
      return {
        key: start.toISOString().slice(0, 10),
        label: formatDateLabel(start, { weekday: 'short' }),
        start,
        end: new Date(start.getTime() + DAY_MS),
        isCurrent: index === 6
      };
    });
  } else if (period === 'Año') {
    buckets = Array.from({ length: 12 }, (_, index) => {
      const start = monthStart(today, index - 11);
      const end = monthStart(today, index - 10);
      return {
        key: `${start.getFullYear()}-${start.getMonth()}`,
        label: formatDateLabel(start, { month: 'short' }),
        start,
        end,
        isCurrent: index === 11
      };
    });
  } else {
    const currentWeek = startOfWeek(today);
    buckets = Array.from({ length: 6 }, (_, index) => {
      const start = new Date(currentWeek.getTime() - (5 - index) * 7 * DAY_MS);
      return {
        key: start.toISOString().slice(0, 10),
        label: index === 5 ? 'Esta sem.' : formatDateLabel(start, { day: '2-digit', month: '2-digit' }),
        start,
        end: new Date(start.getTime() + 7 * DAY_MS),
        isCurrent: index === 5
      };
    });
  }

  const data = buckets.map(bucket => ({ ...bucket, income: 0, expense: 0 }));

  transactions.forEach(transaction => {
    if (transaction.isSettlement || !['ingreso', 'gasto'].includes(transaction.type)) return;
    const date = new Date(transaction.fullDate || '');
    if (Number.isNaN(date.getTime())) return;

    const bucket = data.find(item => date >= item.start && date < item.end);
    if (!bucket) return;

    const amountCents = transaction.totalAmountCents !== undefined && transaction.totalAmountCents !== null
      ? Math.round(Number(transaction.totalAmountCents) || 0)
      : toCents(transaction.amount);
    bucket[transaction.type === 'ingreso' ? 'income' : 'expense'] += amountCents / 100;
  });

  return data;
}
