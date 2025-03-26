class Participante {
  entradaNaSala: number = 0;
  tempoDeFala: number = 0;
  fatorRiquezaAbsoluta: number = 0;
  tempoPresenca: number = 0;
  fatorTempoPresenca: number = 0;
  fatorAcumuladoPresenca: number = 0;
  populacaoAcumulada: number = 0;
  percentualAcumuloFala: number = 0;
  proporcaoAcumuladaPopulacao: number = 0;
  fatorAcumuladoCurvaLorenz: number = 0;
  avatarURL: string = '';
  botType?: string;
  displayName: string = '';
  dominantSpeaker?: boolean | undefined;
  e2eeEnabled?: boolean | undefined;
  e2eeSupported?: boolean | undefined;
  e2eeVerificationAvailable?: boolean | undefined;
  e2eeVerified?: boolean | undefined;
  email?: string;
  id: string = '';
  isJigasi?: boolean | undefined;
  isReplaced?: boolean | undefined;
  isReplacing?: number | undefined;
  jwtId?: string | undefined;
  loadableAvatarUrl?: string | undefined;
  loadableAvatarUrlUseCORS?: boolean | undefined;
  local?: boolean | undefined;
  localRecording?: string | undefined;
  name?: string | undefined;
  pinned?: boolean | undefined;
  presence?: string | undefined;
  raisedHandTimestamp?: number | undefined;
  region?: string | undefined;
  remoteControlSessionStatus?: boolean | undefined;
  role?: string | undefined;
  supportsRemoteControl?: boolean | undefined;
  sala?: string | undefined;
  isOut?: boolean = false;
  isReturned?: boolean = false;
  timeoutMeet?: number = 0;
  numberOfReturns?: number = 0;
  saidas?: any|undefined;
  constructor(
    id: string,
    sala: string = '',
    displayName: string = '',
    avatar: string = '',
    entradaNaSala: number = 0,
    tempoDeFala: number = 0,
    tempoPresenca: number = 0
  ) {
    this.id = id;
    this.sala = sala;
    this.displayName = displayName;
    this.avatarURL = avatar;
    this.entradaNaSala = entradaNaSala;
    this.tempoDeFala = tempoDeFala;
    this.tempoPresenca = tempoPresenca;
    this.fatorRiquezaAbsoluta = 0.0;
    this.fatorTempoPresenca = 0.0;
    this.fatorAcumuladoPresenca = 0.0;
    this.populacaoAcumulada = 0.0;
    this.percentualAcumuloFala = 0.0;
    this.proporcaoAcumuladaPopulacao = 0.0;
    this.fatorAcumuladoCurvaLorenz = 0.0;
    this.isOut = false;
    this.isReturned = false;
    this.numberOfReturns = 0;
    this.timeoutMeet = 0;
    this.saidas=[];
  }
 
}

export default Participante;
