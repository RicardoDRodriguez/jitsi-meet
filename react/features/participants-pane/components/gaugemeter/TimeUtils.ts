// Arquivo: timeUtils.ts

/**
 * Formata um valor em milissegundos para uma string legível (ex: "1d 2h 30m 15s").
 * Lida com meses (aproximado), semanas, dias, horas, minutos e segundos.
 * @param {number} milliseconds - O tempo em milissegundos a ser formatado.
 * @returns {string} O tempo formatado como uma string, ou "0s" em caso de entrada inválida.
 */
export function formatTimeFromMilliseconds(milliseconds: number): string {
    try {
        // Validação de entrada aprimorada para lidar com null, undefined, non-finite numbers.
        if (!isFinite(milliseconds) || milliseconds < 0) {
            console.warn("formatTimeFromMilliseconds: Entrada inválida. Esperado um número positivo.", {
                milliseconds,
            });
            return "0s";
        }

        const msPerSecond = 1000;
        const msPerMinute = msPerSecond * 60;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        // A aproximação para um mês (usando 30.44 dias) é mantida, mas deve-se ter ciência da imprecisão.
        const msPerMonth = msPerDay * 30.44;
        const msPerWeek = msPerDay * 7;

        // BUG FIX: A lógica de cálculo foi corrigida para usar o resto da divisão anterior,
        // garantindo que cada unidade de tempo seja calculada corretamente.
        let remaining = milliseconds;

        const months = Math.floor(remaining / msPerMonth);
        remaining %= msPerMonth;

        const weeks = Math.floor(remaining / msPerWeek);
        remaining %= msPerWeek;

        const days = Math.floor(remaining / msPerDay);
        remaining %= msPerDay;

        const hours = Math.floor(remaining / msPerHour);
        remaining %= msPerHour;

        const minutes = Math.floor(remaining / msPerMinute);
        remaining %= msPerMinute;

        const seconds = Math.floor(remaining / msPerSecond);

        const parts: string[] = [];
        if (months > 0) parts.push(`${months}mês${months > 1 ? "es" : ""}`);
        if (weeks > 0) parts.push(`${weeks}sem`);
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        // Mostra segundos se for a única unidade ou se o tempo total for menor que um minuto.
        if (seconds > 0 || parts.length === 0) {
            parts.push(`${seconds}s`);
        }

        return parts.join(" ") || "0s";
    } catch (error) {
        console.error("Erro ao formatar tempo:", error instanceof Error ? error.message : error);

        return "0s";
    }
}

/**
 * Retorna a hora atual formatada como uma string "HHh MMm SSs".
 * @returns {string} A hora atual formatada.
 */
export function getHorarioAtual(): string {
    const data = new Date();
    const horas = data.getHours().toString().padStart(2, "0");
    const minutos = data.getMinutes().toString().padStart(2, "0");
    const segundos = data.getSeconds().toString().padStart(2, "0");

    return `${horas}h ${minutos}m ${segundos}s`;
}

/**
 * Calcula a diferença de tempo entre dois timestamps.
 * Usado para determinar quanto tempo um participante ficou fora da sala.
 * @param {number} saida - O timestamp de saída em milissegundos.
 * @param {number} [retorno] - O timestamp de retorno em milissegundos (opcional).
 * @returns {string} Uma string formatada com o tempo de ausência ou "--" se os dados forem inválidos ou o retorno não for fornecido.
 */
export function calcularTempoFora(saida: number, retorno?: number): string {
    // Validação aprimorada para garantir que ambos os valores são números finitos.
    if (typeof retorno !== "number" || !isFinite(retorno) || !isFinite(saida)) {
        return "--";
    }

    // Garante que o tempo de retorno é posterior ao de saída.
    if (retorno <= saida) {
        console.warn("Tempo de retorno deve ser maior que tempo de saída");

        return "--";
    }

    const diferencaMs = retorno - saida;
    return formatTimeFromMilliseconds(diferencaMs);
}
