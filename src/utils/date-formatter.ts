import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DateFormatter(date: Date) {
   if (isToday(date)) {
    return `Hoje às ${format(date, "HH:mm", { locale: ptBR })}`
  }
  if (isYesterday(date)) {
    return `Ontem às ${format(date, "HH:mm", { locale: ptBR })}`
  }
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
}
  