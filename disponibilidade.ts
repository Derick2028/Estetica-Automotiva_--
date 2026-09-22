import { isBefore, isValid, parse, startOfDay } from 'date-fns';
import { Agendamento } from './types';

export type StatusDisponibilidade = {
  disponivel: boolean;
  mensagem: string;
};

const HORA_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/**
 * Verifica se uma data e horário podem receber um novo agendamento.
 * Regras: atendimento das 10h às 18h, pausa das 12h às 13h,
 * data não pode ser passada e não pode existir outro agendamento no mesmo horário.
 */
export function verificarDisponibilidade(
  data: string,
  horario: string,
  agendamentos: Agendamento[],
  idIgnorar?: string,
): StatusDisponibilidade {
  if (data.length !== 10) {
    return { disponivel: false, mensagem: 'Informe uma data completa.' };
  }

  const dataConvertida = parse(data, 'dd/MM/yyyy', new Date());
  if (!isValid(dataConvertida)) {
    return { disponivel: false, mensagem: 'Data inválida.' };
  }

  if (isBefore(startOfDay(dataConvertida), startOfDay(new Date()))) {
    return { disponivel: false, mensagem: 'Esta data já passou.' };
  }

  if (!HORA_REGEX.test(horario)) {
    return { disponivel: false, mensagem: 'Informe um horário válido.' };
  }

  const [hora, minuto] = horario.split(':').map(Number);
  const totalMinutos = hora * 60 + minuto;

  if (totalMinutos < 600 || totalMinutos >= 1080) {
    return { disponivel: false, mensagem: 'Atendimento das 10:00 às 18:00.' };
  }

  if (totalMinutos >= 720 && totalMinutos < 780) {
    return { disponivel: false, mensagem: 'Horário de almoço: 12:00 às 13:00.' };
  }

  const dataHoje = startOfDay(dataConvertida).getTime() === startOfDay(new Date()).getTime();
  if (dataHoje) {
    const agora = new Date();
    const agoraEmMinutos = agora.getHours() * 60 + agora.getMinutes();
    if (totalMinutos <= agoraEmMinutos) {
      return { disponivel: false, mensagem: 'Este horário já passou hoje.' };
    }
  }

  const ocupado = agendamentos.some(
    (item) =>
      item.id !== idIgnorar &&
      item.data === data &&
      item.horario === horario,
  );

  if (ocupado) {
    return { disponivel: false, mensagem: 'Este horário já está agendado.' };
  }

  return { disponivel: true, mensagem: 'Data e horário disponíveis para agendamento.' };
}
