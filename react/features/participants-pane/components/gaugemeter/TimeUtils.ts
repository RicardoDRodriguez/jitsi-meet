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

        console.log(' FormatTimeFromMilliseconds millisegundos:',milliseconds);
        console.log(' FormatTimeFromMilliseconds horas:',horas);
        console.log(' FormatTimeFromMilliseconds minutos:',minutos);
        console.log(' FormatTimeFromMilliseconds segundos:',segundos);

        // Formata sempre com horas, minutos e segundos
        return `${horas}h ${minutos}m ${segundos}s`;
    } catch (error) {
        console.error('Erro ao formatar tempo:', error instanceof Error ? error.message : error);
        return "0h 0m 0s";
    }
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