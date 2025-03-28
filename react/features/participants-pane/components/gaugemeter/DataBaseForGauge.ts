// DataBaseForGauge.ts
import Participante from "./Participante";
import { IReduxState } from "../../../app/types";
import { getParticipantById } from "../../../base/participants/functions";
import { IParticipant } from "../../../base/participants/types";
import { getSortedParticipantIds } from "../../functions";
import { ISpeaker } from "../../../speaker-stats/reducer";
import { getRoomName } from "../../../base/conference/functions";
import Saida from "./Saida";


class DataBaseForGauge {

  static participantes: Participante[] = [];
  static state: IReduxState;
  static room: string = '';
  static conference: any;
  static roomStarted: number;
  private static instance: DataBaseForGauge | null = null;

  private constructor() {
      // Inicialização da classe (se necessário)
      console.log("==== 0. ClearData = construtor do DataBaseForGauge chamado.");
  }

  /* async clearData(): Promise<void> {
    const removerParticipantesNaoOrdenados = () => {
      const sortedParticipantIds: any = getSortedParticipantIds(DataBaseForGauge.state);
  
      // Filtra os participantes que não estão na lista de IDs ordenados
      DataBaseForGauge.participantes = DataBaseForGauge.participantes.filter(participante => 
        sortedParticipantIds.includes(participante.id)
      );
  
      console.log('==== 0. ClearData = Participantes atualizados:', DataBaseForGauge.participantes);
    };
  
    // Verifica se há participantes antes de executar a função
    if (DataBaseForGauge.participantes.length > 0) {
      removerParticipantesNaoOrdenados();
    } else {
      console.log('==== 1. ClearData = Nenhum participante encontrado.');
    }
  }*/

  async clearData(): Promise<void> {
    const removerParticipantesNaoOrdenados = () => {
      const sortedParticipantIds: any = getSortedParticipantIds(DataBaseForGauge.state);

      DataBaseForGauge.participantes = DataBaseForGauge.participantes.filter(participante => {
        const isIncluded = sortedParticipantIds.includes(participante.id);

        if (!isIncluded && !participante.isOut) {
          // Cria uma nova saída com horário em milissegundos (Date.now())
          const saida = new Saida(
            participante.saidas ? participante.saidas.length + 1 : 1, // sequência
            Date.now() // horarioDeSaida em ms
          );

          participante.isOut = true;

          if (!participante.saidas) {
            participante.saidas = [];
          }

          participante.saidas.push(saida);
        }

        return isIncluded;
      });

      console.log('==== 0. ClearData = Participantes atualizados:', DataBaseForGauge.participantes);
    };
  
      if (DataBaseForGauge.participantes.length > 0) {
          removerParticipantesNaoOrdenados();
      } else {
          console.log('==== 1. ClearData = Nenhum participante encontrado.');
      }
  }
  
  

  async percorrerParticipantes(): Promise<void> {
    console.log("Percorrendo todos os participantes:");
    DataBaseForGauge.participantes.forEach((participante) => {
      console.log(participante);
    });
  }

  /**
   * Carrega o estao e a conferencia
  **/

  async setStateAndConference(): Promise<void> {
    while (!APP.store || !APP.conference) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Espera um pouco
        console.warn("==== 0. setStateAndConference -> Aguardando APP.store e APP.conference...");
    }
    DataBaseForGauge.state = APP.store.getState();
    DataBaseForGauge.conference = APP.conference;
    if (!DataBaseForGauge.roomStarted) {
      DataBaseForGauge.roomStarted = Date.now();
    }
    console.log("==== 1. setStateAndConference -> roomStarted: ", DataBaseForGauge.roomStarted);
}


  /**
    * Carrega a lista de participantes para ser processada por GaugeMeter
    * @param id lista de participants
    * 
    */
  async carregarParticipantes(id: string | string[] | any): Promise<void> {
    // Verifica o tipo da variavel
    
    const type = this.checkIsType(id);



    console.log(`==== 1. carregarParticipantes. Processando chave:`, id);
    console.log(`==== 2. carregarParticipantes. Processando type:`, type);
   

    // Carrega o nome da sala
    DataBaseForGauge.room = '';
    try {
      DataBaseForGauge.room = getRoomName(DataBaseForGauge.state) ?? DataBaseForGauge.room;
    } catch (erro: any) {
      DataBaseForGauge.room = ' ==== Não achei a a Sala'
      console.error(" ==== Erro assíncrono capturado:", erro.message);
    }
    try {
      /**
       * Se o tipo de participants do sitema jitsi for um array ou um String
       */
      if (type === 'array') {
        /**
         * Não processa nada se não houver lista
         */
        if (id.length == 0) {
          console.log(` ==== sala ${DataBaseForGauge.room} Lista de ids vazia ===`);
          return
        }

        //==========================================
        //Processar todos os participantes da lista
        //==========================================

        id.forEach((key: string) => this.processarParticipante(key, DataBaseForGauge.room));

      } else if (type === 'string') {
        this.processarParticipante(id, DataBaseForGauge.room.toString());
      }

      /**
       * Checar se no final conseguimos alimentar participantes.
       */
      console.log(` ==== Resultado Final => sala ${DataBaseForGauge.room} em carregarParticipantes ===`, DataBaseForGauge.participantes);
    } catch (erro: any) {
      console.log(` ==== Tentativa de processar lista de participantes acarretou em erro ${erro.message} ===`);
    }
    return
  }

  /**
   * Carrega Participantes de functions de participants-pane
  **/
  async loadParticipantes(): Promise<void> {
    console.log(`==== 1. loadParticipantes --> Limpando os dados de DataBaseForGauge`)
    this.clearData();

    console.log(`==== 2. loadParticipantes --> Carregando a funcao setStateAndConference`)
    this.setStateAndConference();
    //Carrega Id de participantes de function
    let sortedParticipantIds: any = getSortedParticipantIds(DataBaseForGauge.state);
    console.log(`==== 3. loadParticipantes --> Carregando a variavel iReorderedParticipants`, sortedParticipantIds);
    this.carregarParticipantes(sortedParticipantIds);
  }


  /**
   * checa o tipo de participante.
   * @param id Id so Particioante
   * @returns String do tipo de participante.
   */

  checkIsType(id: any): string {
    try {
      if (id === undefined || id === null) {
        return 'undefined';
      } else if (typeof id === 'string') {
        return 'string';
      } else if (Array.isArray(id)) {
        return 'array';
      } else {
        return 'other';
      }
    } catch (erro: any){
      console.error("Erro assíncrono capturado:", erro.message);
      return "Não foi possivel definir o tipo de id";
    }
  }

  /**
   * 
   * @param id chave de identificação do participante
   * @returns True se o participante já está no DataBase // False se o participante não está no DataBase
   */

  hasParticipante(id: string): boolean {
    let found: boolean = false;
  
    if (DataBaseForGauge.participantes.length === 0) {
      return found;
    }
  
    try {
      found = DataBaseForGauge.participantes.some((participante) => {
        return participante.id === id;
      });
    } catch (error: any) {
      console.log(`hasParticipante -> Ocorreu o erro de verificar se existe o participante ${error.message}`);
    }
  
    return found; // Retorna o valor correto após o try...catch
  
  }

  async getParticipantesPercentualAcumuloFala(): Promise<Participante[]> {
    this.loadParticipantes()

    const totalTempoDeFalaEmMinutos = DataBaseForGauge.participantes.reduce(
      (total, participante) => total + Number(participante.tempoDeFala), 0
    );

    console.log(`==== 1. getParticipantes  --> total de tempo de fala ${totalTempoDeFalaEmMinutos}: `);
    DataBaseForGauge.participantes.forEach((participante) => {
      participante.percentualAcumuloFala = (participante.tempoDeFala / totalTempoDeFalaEmMinutos) * 100;
    });

    const participantesOrdenadosDescrescente = DataBaseForGauge.participantes.slice().sort((a, b) => b.percentualAcumuloFala - a.percentualAcumuloFala);
    return participantesOrdenadosDescrescente;
  }


  async calcularGini(): Promise<number> {
    await this.loadParticipantes();

    const participantesFinal = DataBaseForGauge.participantes.slice().sort((a, b) => a.tempoDeFala - b.tempoDeFala);

    //------------------------------------------------------- 
    // COLUNA 3 do artigo
    // Calcula o fatorDeRiquezaAbsoluta de cada participante
    // Tempo de Fala / Total de tempo de fala = Sigma(f) 
    //------------------------------------------------------- 
    const totalTempoDeFalaEmSegundos = DataBaseForGauge.participantes.reduce(
      (total, participante) => total + parseInt(participante.tempoDeFala.toString()), 0
    );
    console.log('==== 1. CalcularGini - totalTempoDeFalaEmSegundos = ', totalTempoDeFalaEmSegundos);

    participantesFinal.forEach((participante, index) => {
      participantesFinal[index].fatorRiquezaAbsoluta = participante.tempoDeFala / totalTempoDeFalaEmSegundos;
    });
    console.log('==== 2. CalcularGini - Lista de fatorRiquezaAbsoluta = ', participantesFinal);

    //------------------------------------------------------- 
    // COLUNA 5 do artigo
    // Proporcao do tempo de presença de cada participante
    // Total de tempo de fala = Sigma(f)
    //------------------------------------------------------- 

    const totalTempoDePresença = DataBaseForGauge.participantes.reduce((total, participante) => {
      return total + participante.tempoPresenca;
    }, 0);


    console.log('==== 3. CalcularGini - totalTempoPresenca = ', totalTempoDePresença);

    participantesFinal.forEach((participante, index) => {
      if (participante.fatorTempoPresenca) {
        participantesFinal[index].fatorTempoPresenca = participante.tempoPresenca / totalTempoDePresença;
      } else {
        participantesFinal[index].fatorTempoPresenca = participante.tempoPresenca / totalTempoDePresença;
      }
      console.log('==== 3.1. CalcularGini - FatorTempoPresenca = ', participantesFinal[index].fatorTempoPresenca);
    });
    console.log('==== 4. CalcularGini - Lista de fatorTempoPresenca = ', participantesFinal);

    //------------------------------------------------------- 
    // COLUNA 6 do artigo
    // Proporcao de tempo de presenca ACUMULADA DA POPULACAO
    //-------------------------------------------------------  

    let fatorTempoPresencaAcumuladoAnterior = 0;

    participantesFinal.forEach((participante, index) => {
      participantesFinal[index].fatorAcumuladoPresenca = participante.fatorTempoPresenca + fatorTempoPresencaAcumuladoAnterior;
      fatorTempoPresencaAcumuladoAnterior = participante.fatorAcumuladoPresenca;
    });
    console.log('==== 4. CalcularGini - fatorAcumiladoPresença = ', participantesFinal);

    //------------------------------------------------------- 
    // COLUNA 7 do artigo
    // Acumulo da proporção dos tempos de fala
    // Riqueza relativa acumulada - ponto da curva Lorenz
    //-------------------------------------------------------  
    let fatorAcumuladoLorenz = 0;

    participantesFinal.forEach((participante, index) => {
      participantesFinal[index].fatorAcumuladoCurvaLorenz = participante.fatorRiquezaAbsoluta + fatorAcumuladoLorenz;
      fatorAcumuladoLorenz = participante.fatorAcumuladoCurvaLorenz;
    });

    console.log("==== 5. CalcularGini - Colecao de participantes com o calculo de Gini: ", participantesFinal);


    // Participantes ordenados de forma decrescente
    const participantesOrdenados = participantesFinal.slice().sort((a, b) => b.tempoDeFala - a.tempoDeFala);
    console.log("Colecao de participantes: ", participantesOrdenados);

    /*
      Calcula a soma acumulativa dos tempos de fala dos participantes
    */

    const ocupantesDaSala = participantesFinal.length;
    const somaAcumulativaTempo = participantesOrdenados.reduce((soma, participante) => {
      soma += participante.tempoDeFala;
      return soma;
    }, 0);

    console.log("==== 6. CalcularGini -  Soma dos tempos : ", somaAcumulativaTempo);
    console.log("==== 7. CalcularGini - Ocupantes da Sala:", ocupantesDaSala);

    /*
    Participantes ordenados de forma crescente
     */
    const participantesOrdenadosCrescente = DataBaseForGauge.participantes.slice().sort((a, b) => a.tempoDeFala - b.tempoDeFala);
    /*
    Remove o ultimo elemento da coleção conforme descrito na formula.
    */
    participantesOrdenadosCrescente.pop();

    /*
    Calculo Final do Gini e do participometro usando 1-formula
   */
    let fiAnterior = 0;
    const ultimaPosicao = participantesOrdenadosCrescente.length - 1;
    let somatorioFi = 0;
    let ultimoElemento = 0;

    participantesOrdenadosCrescente.forEach((participante, index) => {
      somatorioFi += (fiAnterior + participante.fatorAcumuladoCurvaLorenz) * participante.fatorTempoPresenca;
      fiAnterior = participante.fatorAcumuladoCurvaLorenz;
      if (index === ultimaPosicao) {
        ultimoElemento = participante.fatorAcumuladoPresenca;
      }
    });


    /*
    Calculo final do Gini´ usando a formula do artigo
    */
    console.log("==== 8. CalcularGini -  Soma AcumulativaTempo : ", somaAcumulativaTempo);
    console.log("==== 9. CalcularGini - ultimo Elemento:", ultimoElemento);

    const giniIndex = (somatorioFi / (ultimoElemento ** 2));
    console.log("==== 10. CalcularGini - Valor Final de Gini:", giniIndex);

    return giniIndex;
  }

  async calcularMediaTempoDeFala(): Promise<number> {
    if (DataBaseForGauge.participantes.length === 0) {
      console.log("Não encontrei participantes para calcular a média");
      return 0;
    }

    const totalTempoDeFalaEmMinutos = DataBaseForGauge.participantes.reduce(
      (total, participante) => total + parseInt(participante.tempoDeFala.toString()), 0
    );
    return totalTempoDeFalaEmMinutos / DataBaseForGauge.participantes.length;
  }

  async processarParticipante(key: string, room: string): Promise<void> {
    console.log(` ==== 1. processarParticipante --> Processando chave: ${key} no foreach em processarParticipante ===`);

    const now = new Date().getTime()

    const atualizarParticipante = (participante:Participante, stats:ISpeaker, partic:IParticipant, now:number) => {
      participante.tempoDeFala = stats.getTotalDominantSpeakerTime() ?? participante.tempoDeFala;
      participante.tempoPresenca = now - participante.entradaNaSala;
      participante.avatarURL = partic.avatarURL ?? participante.avatarURL;
      participante.displayName = partic.displayName ?? participante.displayName;
      participante.name = partic.name ?? participante.name;
      participante.role = partic.role ?? participante.role;
      participante.dominantSpeaker = partic.dominantSpeaker ?? participante.dominantSpeaker;
      participante.fatorTempoPresenca = 0;
      participante.fatorAcumuladoCurvaLorenz = 0;
      console.log(`==== 5.1. processarParticipante  --> participante ${participante.id}, participante.fatorDePresença ${participante.fatorTempoPresenca}: `);
      console.log(`==== 6. processarParticipante  --> participante atualizado ${participante.id}: `, participante);
    };


    
    const adicionarParticipante = (participante:Participante, stats: ISpeaker, partic:IParticipant) => {
      const user = APP.conference.getParticipantById(partic.id);

      console.log(`==== 1. processarParticipante  --> partic : `, partic);
      console.log(`==== 2. processarParticipante  --> stats : `, stats, );
      console.log(`==== 3. processarParticipante  -->. user: `, user);
      
      const novoParticipante = {
        ...participante,
        tempoDeFala: stats.getTotalDominantSpeakerTime() ?? participante.tempoDeFala,
        entradaNaSala: partic.userStartTime ?? user.userStartTime,
        tempoPresenca: 0,
        avatarURL: partic.avatarURL ?? participante.avatarURL,
        displayName: partic.displayName ?? participante.displayName,
        name: partic.name ?? participante.name,
        role: partic.role ?? participante.role,
        dominantSpeaker: partic.dominantSpeaker ?? participante.dominantSpeaker,
        fatorTempoPresenca: 0,
        fatorAcumuladoCurvaLorenz: 0
      };

      console.log(`==== 3. processarParticipante  --> novo participante ${novoParticipante.id}: `, novoParticipante);


      DataBaseForGauge.participantes.push(novoParticipante);
    };

    const partic: IParticipant | undefined = getParticipantById(DataBaseForGauge.state, key);
    if (partic) {
      const speakerStats = DataBaseForGauge.conference.getSpeakerStats();
      const now = new Date().getTime();
      const existingParticipant = DataBaseForGauge.participantes.find(p => p.id === key);
      for (const userId in speakerStats) {
        if (userId === key) {
          console.log(`==== 4. processarParticipante --> encontrei em SpeakerStats ${key}: `, speakerStats);
          const stats = speakerStats[userId];
          console.log(`==== 5. processarParticipante --> encontrei em stats ${key}: `, stats);
          if (existingParticipant) {
            //Atualizar dados de participante
            atualizarParticipante(existingParticipant, stats, partic, now);
          }
          else {
            const participante: Participante = new Participante(key, room);
            //Adicionar participante
            adicionarParticipante(participante, stats, partic);

          }
          break;
        }
      }
    }
  }

  public static getInstance(): DataBaseForGauge {
    if (!DataBaseForGauge.instance) {
        DataBaseForGauge.instance = new DataBaseForGauge();
        (window as any).dataBaseForGauge = DataBaseForGauge.instance; // Mantém no window para compatibilidade com código antigo
        console.log("==== 6. getInstance -> Instancia criada no getInstance")
    }else{
        console.log("==== 7. getInstance -> Instancia já existia no getInstance")
    }
    return DataBaseForGauge.instance;
  }

}

// Criar uma instância singleton do DataBaseForGauge
export default DataBaseForGauge.getInstance(); // Exportar para uso em outros módulos



