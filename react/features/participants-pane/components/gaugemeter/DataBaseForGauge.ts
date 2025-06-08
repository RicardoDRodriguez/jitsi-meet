// DataBaseForGauge.ts
import Participante from "./Participante";
import { IReduxState } from "../../../app/types";
import { getLocalParticipant, getParticipantById } from "../../../base/participants/functions";
import { ILocalParticipant, IParticipant } from "../../../base/participants/types";
import { getSortedParticipantIds } from "../../functions";
import { ISpeaker } from "../../../speaker-stats/reducer";
import { getRoomName } from "../../../base/conference/functions";
import Saida from "./Saida";
import { forEach } from "lodash-es";
import { formatTimeFromMilliseconds, getHorarioAtual } from "./TimeUtils";
import { participantPresenceChanged } from "../../../base/participants/actions";



interface IChaveDataBase {
  key: any;        // Chave do campo
  nomeChave: any; // Campo obrigatório (não opcional)
}

// Tipagem auxiliar para ParticipanteStorage
interface IParticipanteStorage {
  name: string;
  sala: string;
  entradaNaSala?: number;
  tempoPresenca?: number;
  timeoutMeet?: number;
  horaRetorno?: string;
  id?: string;
  tempoDeFala?: number;
  isReturned?: boolean;
}

// Chave para refletir o uso do localStorage.
const LISTA_PARTICIPANTES_STORAGE_KEY = 'DataBaseForGauge';


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

  public getParticipantNames(): IChaveDataBase[] {
    try {
      const sortedParticipantIds: any[] = getSortedParticipantIds(DataBaseForGauge.state);
      const nomesChave: IChaveDataBase[] = [];

      sortedParticipantIds.forEach((id: string) => {
        const user = APP.conference.getParticipantById(id);
        if (user) {
          nomesChave.push({
            key: id,
            nomeChave: user.getDisplayName()
          });
        }
      });

      const localUser = getLocalParticipant(DataBaseForGauge.state);
      if (localUser) {
        nomesChave.push({
          key: localUser.id,
          nomeChave: localUser.name
        });
      }
      return nomesChave;
    } catch (error: any) {
      console.log('==== 2. ClearData = erro encontrado', error.message);
      return [];
    }
  }

  async clearData(): Promise<void> {
    try {
      const atualizarStatusParticipantes = () => {
        const sortedParticipantsKey: IChaveDataBase[] = this.getParticipantNames();
        DataBaseForGauge.participantes.forEach(participante => {
          const isActive = sortedParticipantsKey.some(
            (participantKey) => participantKey.nomeChave === participante.name
          );

          if (isActive) {
            if (participante.isOut) {
              participante.isOut = false;
              participante.isReturned = true;
              participante.numberOfReturns = (participante.numberOfReturns || 0) + 1;
              if (participante.saidas?.length) {
                participante.saidas[participante.saidas.length - 1].horarioDeRetorno = Date.now();
                participante.saidas[participante.saidas.length - 1].horaRetorno = getHorarioAtual();
              }
            } else {
              participante.isReturned = false;
            }
          } else {
            if (!participante.isOut) {
              const saida = new Saida(
                participante.saidas ? participante.saidas.length + 1 : 1,
                Date.now(), getHorarioAtual(), '--',
                participante.id,
                participante.tempoDeFala,
                participante.entradaNaSala
              );
              participante.isOut = true;
              participante.isReturned = false;
              participante.saidas = participante.saidas || [];
              participante.saidas.push(saida);
            }
          }
        });
      };

      if (DataBaseForGauge.participantes.length > 0) {
        atualizarStatusParticipantes();
      }
    } catch (error: any) {
      console.log('==== 2. ClearData = erro encontrado', error.message);
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
    try {
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
    } catch (error: any) {
      console.log(` ==== set State e Conference com erro ${error.message} ===`);
    }
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
    try {
      console.log(`==== 1. loadParticipantes --> Limpando os dados de DataBaseForGauge`);
      this.clearData();

      console.log(`==== 2. loadParticipantes --> Carregando a funcao setStateAndConference`);
      this.setStateAndConference();

      //Carrega Id de participantes de function
      let sortedParticipantIds: any = getSortedParticipantIds(DataBaseForGauge.state);
      console.log(`==== 3. loadParticipantes --> Carregando a variavel iReorderedParticipants`, sortedParticipantIds);
      this.carregarParticipantes(sortedParticipantIds);
    } catch (error: any) {
      console.error('==== 4. loadParticipantes --> Erro ao carregar participantes:', error);
      // throw error; // Re-lança o erro para que chamadores possam tratá-lo se necessário
    }
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
    } catch (erro: any) {
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
    try {
      await this.loadParticipantes();

      const totalTempoDeFalaEmMinutos = DataBaseForGauge.participantes.reduce(
        (total, participante) => total + Number(participante.tempoDeFala), 0
      );

      console.log(`==== 1. getParticipantes  --> total de tempo de fala ${totalTempoDeFalaEmMinutos}: `);
      DataBaseForGauge.participantes.forEach((participante) => {
        const saidas: any = participante.saidas;
        let ultimaSaida = 0;
        if (saidas && saidas.length > 0) {
          ultimaSaida = saidas[saidas.length - 1].tempoDeFala;
          participante.entradaNaSala = saidas[saidas.length - 1].horarioDeEntrada
        }
        participante.tempoDeFala += ultimaSaida // Soma o valor acumulado do tempo de fala anterior com o tempo atual
        participante.percentualAcumuloFala = ((participante.tempoDeFala + ultimaSaida) / totalTempoDeFalaEmMinutos) * 100;
      });

      const participantesOrdenadosDescrescente = DataBaseForGauge.participantes.slice().sort((a, b) => b.percentualAcumuloFala - a.percentualAcumuloFala);
      return participantesOrdenadosDescrescente;
    } catch (error: any) {
      console.error("Error in getParticipantesPercentualAcumuloFala:", error);
      return []; // Retorna um novo array vazio em caso de erro
    }
  }

  async calcularGini(): Promise<number> {
    try {
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
    } catch (error: any) {
      console.error("==== 11. CalcularGini - Error calculating Gini index:", error);
      return 0;
    }



  }

  async calcularMediaTempoDeFala(): Promise<number> {
    let retorno = 0
    try {

      if (DataBaseForGauge.participantes.length === 0) {
        console.log("Não encontrei participantes para calcular a média");
        return 0;
      }

      const totalTempoDeFalaEmMinutos = DataBaseForGauge.participantes.reduce(
        (total, participante) => total + parseInt(participante.tempoDeFala.toString()), 0
      );
      retorno = totalTempoDeFalaEmMinutos / DataBaseForGauge.participantes.length;
    } catch (error: any) {
      console.error("==== CalcularMedia Tempo de fala - Error calculating Gini index:", error);
      retorno = 0;
    }
    return retorno;
  }

  async processarParticipante(key: string, room: string): Promise<void> {
    try {
      /**
       * Salva ou Atualiza os dados do Participante no Storage
       * @param participanteParaSalvar 
       */
      const salvarOuAtualizarParticipanteNoStorage = (
        participanteParaSalvar: Participante
      ): void => {
        const listaJSON = localStorage.getItem(LISTA_PARTICIPANTES_STORAGE_KEY);
        let listaParticipantes: Participante[] = [];

        if (listaJSON) {
          try {
            listaParticipantes = JSON.parse(listaJSON);
            if (!Array.isArray(listaParticipantes)) {
              listaParticipantes = [];
            }
          } catch (error) {
            console.error('==== salvarOuAtualizarParticipanteNoStorage ==== 1. Erro ao parsear lista de participantes do storage:', error);
            listaParticipantes = [];
            localStorage.removeItem(LISTA_PARTICIPANTES_STORAGE_KEY);
          }
        }

        const indiceExistente = listaParticipantes.findIndex(p => p.id === participanteParaSalvar.id);

        if (indiceExistente !== -1) {
          listaParticipantes[indiceExistente] = participanteParaSalvar;
        } else {
          listaParticipantes.push(participanteParaSalvar);
        }

        try {
          localStorage.setItem(LISTA_PARTICIPANTES_STORAGE_KEY, JSON.stringify(listaParticipantes));
          console.log(`==== salvarOuAtualizarParticipanteNoStorage ==== 2. Salvo com sucesso no Storage o participante: ${participanteParaSalvar.name}`);
        } catch (error) {
          console.error('==== salvarOuAtualizarParticipanteNoStorage ==== 3. Erro ao salvar lista no localStorage (limite excedido?):', error);
        }
      };

      const atualizarParticipante = (idkey: any, participante: Participante, stats: ISpeaker, now: number) => {
        participante.id = idkey;
        participante.tempoDeFala = stats.getTotalDominantSpeakerTime() ?? participante.tempoDeFala;
        participante.tempoPresenca = now - participante.entradaNaSala;

        salvarOuAtualizarParticipanteNoStorage(participante);
      };

      /**
       * Atualiza dados do participante com o que se encontra no storage
       * @param participante 
       * @returns void
       */

      const atualizarParticipanteComDadosDoStorage = (participante: Participante): void => {
        const listaJSON = localStorage.getItem(LISTA_PARTICIPANTES_STORAGE_KEY);

        if (!listaJSON) {
          console.log(`==== atualizarParticipanteComDadosDoStorage === 1. Nenhuma lista de participantes encontrada no localStorage com a chave: ${LISTA_PARTICIPANTES_STORAGE_KEY}`);
          return;
        }

        try {
          const listaDadosParticipantes: unknown = JSON.parse(listaJSON);

          // Verificação robusta do tipo
          if (!Array.isArray(listaDadosParticipantes)) {
            console.error('==== atualizarParticipanteComDadosDoStorage === 2. Formato inválido no storage, não é um array.');
            localStorage.removeItem(LISTA_PARTICIPANTES_STORAGE_KEY);
            return;
          }

          // Filtra usando propriedades obrigatórias
          const correspondentesCompletos = listaDadosParticipantes.filter(
            (p): p is IParticipanteStorage =>
              typeof p === 'object' &&
              p !== null &&
              'name' in p &&
              'sala' in p &&
              p.name === participante.name &&
              p.sala === participante.sala
          );

          if (correspondentesCompletos.length === 0) {
            console.log(`==== atualizarParticipanteComDadosDoStorage === 3. Nenhum participante "${participante.name}" na sala "${participante.sala}" encontrado no storage.`);
            return;
          }

          // Ordenação segura com fallback
          correspondentesCompletos.sort((a, b) => {
            const timeA = a.entradaNaSala ?? a.timeoutMeet ?? 0;
            const timeB = b.entradaNaSala ?? b.timeoutMeet ?? 0;
            return timeB - timeA;
          });

          const [dadosParticipantePrincipal, ...dadosParticipantesAnteriores] = correspondentesCompletos;
          const arrayDeSaidas: Saida[] = [];

          // Acumula o tempo de fala corretamente
          let tempoDeFalaAcumulado = 0;

          dadosParticipantesAnteriores.forEach((dadosAnterior, index) => {
            // Calcula horário de saída
            const horarioDeSaidaAnterior =
              dadosAnterior.entradaNaSala && dadosAnterior.tempoPresenca
                ? dadosAnterior.entradaNaSala + dadosAnterior.tempoPresenca
                : dadosAnterior.timeoutMeet ?? 0;

            // Acumula tempo de fala
            tempoDeFalaAcumulado += dadosAnterior.tempoDeFala ?? 0;

            arrayDeSaidas.push(new Saida(
              index + 1,
              horarioDeSaidaAnterior,
              formatTimeFromMilliseconds(horarioDeSaidaAnterior),
              dadosAnterior.horaRetorno || '--',
              dadosAnterior.id || '',
              dadosAnterior.tempoDeFala || 0,
              dadosAnterior.entradaNaSala || 0
            ));
          });

          // Atualiza o participante principal
          const participanteAtualizado: Participante = {
            ...participante,  // Mantém dados existentes
            ...dadosParticipantePrincipal,  // Sobrescreve com dados do storage
            isReturned: true,
            tempoDeFala: (dadosParticipantePrincipal.tempoDeFala || 0) + tempoDeFalaAcumulado,
            saidas: arrayDeSaidas
          };

          Object.assign(participante, participanteAtualizado);

          console.log(`==== atualizarParticipanteComDadosDoStorage === 4. Participante "${participante.name}" ATUALIZADO:`, participante);
          if (arrayDeSaidas.length > 0) {
            console.log('==== atualizarParticipanteComDadosDoStorage === 5. Saidas:', arrayDeSaidas);
          }

        } catch (error) {
          console.error('==== atualizarParticipanteComDadosDoStorage === 6. Erro ao processar dados:', error);
          localStorage.removeItem(LISTA_PARTICIPANTES_STORAGE_KEY);
        }
      };

      /**
       * Adiciona novo participante
       * @param participante 
       * @param stats 
       * @param partic 
       */
      const adicionarParticipante = (participante: Participante, stats: ISpeaker, partic: IParticipant) => {
        const user = APP.conference.getParticipantById(partic.id);

        // 1. Cria o objeto novoParticipante com os dados da sessão atual
        const novoParticipante = {
          ...participante,
          id: partic.id,
          tempoDeFala: stats.getTotalDominantSpeakerTime() ?? participante.tempoDeFala,
          entradaNaSala: partic.userStartTime ?? user.userStartTime,
          tempoPresenca: 0,
          avatarURL: partic.avatarURL ?? participante.avatarURL,
          displayName: partic.displayName ?? participante.displayName,
          name: partic.name ?? participante.name,
          role: partic.role ?? participante.role,
          dominantSpeaker: partic.dominantSpeaker ?? participante.dominantSpeaker,
          local: partic.local,
          fatorTempoPresenca: 0,
          fatorAcumuladoCurvaLorenz: 0
        };

        

        // Chama a função para LER dados históricos do storage e fundir com o novo participante
        console.log(`==== adicionarParticipante === 1. checar os dados do Participante com Dados no Storage: ${novoParticipante.name} - ${novoParticipante.sala}`);
        atualizarParticipanteComDadosDoStorage(novoParticipante);

        console.log(`==== adicionarParticipante === 2. Após checar storage, estado final de ${novoParticipante.name}:`, novoParticipante);

        // 3. CORREÇÃO: Salva o estado final (combinado) de volta no storage
        salvarOuAtualizarParticipanteNoStorage(novoParticipante);

        // 4. Adiciona à lista em memória da sessão atual
        DataBaseForGauge.participantes.push(novoParticipante);
      };


      const sortedParticipantsKey: IChaveDataBase[] = this.getParticipantNames();
      for (const nomeChave of sortedParticipantsKey) {
        const partic: IParticipant | undefined = getParticipantById(DataBaseForGauge.state, nomeChave.key);
        if (partic) {
          const speakerStats = DataBaseForGauge.conference.getSpeakerStats();
          const now = new Date().getTime();
          const existingParticipant = DataBaseForGauge.participantes.find(p => nomeChave.nomeChave === p.name);
          const stats = speakerStats[nomeChave.key];

          if (existingParticipant) {
            console.log(`==== processarParticipante === 1. Participante já existe no ParticPane: ${partic.name}`);
            atualizarParticipante(nomeChave.key, existingParticipant, stats, now);
          } else {
            console.log(`==== processarParticipante === 1. Participante NÂO existe no ParticPane: ${partic.name}`);
            const participante = new Participante(nomeChave.key, room);
            adicionarParticipante(participante, stats, partic);
          }
        }
      }
    } catch (error: any) {
      console.error("==== processarParticipante - Erro geral :", error);
    }
  }

  public static getInstance(): DataBaseForGauge {
    if (!DataBaseForGauge.instance) {
      DataBaseForGauge.instance = new DataBaseForGauge();
      (window as any).dataBaseForGauge = DataBaseForGauge.instance; // Mantém no window para compatibilidade com código antigo
      console.log("==== 6. getInstance -> Instancia criada no getInstance")
    } else {
      console.log("==== 7. getInstance -> Instancia já existia no getInstance")
    }
    return DataBaseForGauge.instance;
  }

}

// Criar uma instância singleton do DataBaseForGauge
export default DataBaseForGauge.getInstance(); // Exportar para uso em outros módulos



