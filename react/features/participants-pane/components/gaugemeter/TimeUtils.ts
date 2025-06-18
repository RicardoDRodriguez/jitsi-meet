// Arquivo: timeUtils.ts

/**
 * 
 * @param milliseconds formata em minutos e segundos o tempo d, h, m e s
 * @returns tempo formatado em minutos e segundos
 */

export function formatTimeFromMilliseconds(milliseconds: number): string {
    try {
        if (typeof milliseconds !== 'number' || isNaN(milliseconds) || milliseconds < 0) {
            throw new Error('Valor inválido: deve ser um número positivo');
        }

        const msPerSecond = 1000;
        const msPerMinute = msPerSecond * 60;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;

        const days = Math.floor(milliseconds / msPerDay);
        const hours = Math.floor((milliseconds % msPerDay) / msPerHour);
        const minutes = Math.floor((milliseconds % msPerHour) / msPerMinute);
        const seconds = Math.floor((milliseconds % msPerMinute) / msPerSecond);

        console.log('FormatTimeFromMilliseconds milliseconds:', milliseconds);
        console.log('FormatTimeFromMilliseconds days:', days);
        console.log('FormatTimeFromMilliseconds hours:', hours);
        console.log('FormatTimeFromMilliseconds minutes:', minutes);
        console.log('FormatTimeFromMilliseconds seconds:', seconds);

        const parts: string[] = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);

        if (parts.length === 0) {
            return "0s";
        }

        return parts.join(' ');
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