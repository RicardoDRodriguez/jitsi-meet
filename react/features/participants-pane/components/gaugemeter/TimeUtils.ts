// Arquivo: timeUtils.ts

/**
 * 
 * @param milliseconds formata em minutos e segundos o tempo h, m e s
 * @returns tempo formatado em minutos e segundos
 */

export function formatTimeFromMilliseconds(milliseconds: number): string {
    try {
        if (typeof milliseconds !== 'number' || isNaN(milliseconds) || milliseconds < 0) {
            throw new Error('Valor inválido: deve ser um número positivo');
        }

        const horas = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutos = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((milliseconds % (1000 * 60)) / 1000);

        console.log('FormatTimeFromMilliseconds millisegundos:', milliseconds);
        console.log('FormatTimeFromMilliseconds horas:', horas);
        console.log('FormatTimeFromMilliseconds minutos:', minutos);
        console.log('FormatTimeFromMilliseconds segundos:', segundos);

        // Cria um array com as partes não-zero
        const partes:any = [];
        if (horas > 0) partes.push(`${horas}h`);
        if (minutos > 0) partes.push(`${minutos}m`);
        if (segundos > 0) partes.push(`${segundos}s`);

        // Se todas as partes forem zero, retorna "0s"
        if (partes.length === 0) {
            return "0s";
        }

        // Junta as partes com espaços
        return partes.join(' ');
    } catch (error) {
        console.error('Erro ao formatar tempo:', error instanceof Error ? error.message : error);
        return "0s";
    }
}
/**
 * Retorna no formato String a hora minuto e segundo
 * @returns HHh MNm SSs
 */
export function getHorarioAtual(): string {
    const data = new Date();
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    const segundos = data.getSeconds().toString().padStart(2, '0');
    
    return `${horas}h ${minutos}m ${segundos}s`;
}


 /**
 * Calcula o tempo fora do participante recebendo dois parâmetros
 * @param saida - Timestamp de saída do participante em milissegundos
 * @param retorno - Timestamp de retorno do participante em milissegundos (opcional)
 * @returns String formatada com o tempo fora ou "--" se não houver retorno
 */

export function calcularTempoFora(saida: number, retorno?: number): string {
    // Verifica se existe retorno e se os valores são válidos
    if (typeof retorno !== 'number' || isNaN(retorno) || isNaN(saida)) {
        return "--";
    }

    // Garante que o retorno é maior que a saída
    if (retorno <= saida) {
        console.warn('Tempo de retorno deve ser maior que tempo de saída');
        return "--";
    }

    const diferencaMs = retorno - saida;
    return formatTimeFromMilliseconds(diferencaMs);
}