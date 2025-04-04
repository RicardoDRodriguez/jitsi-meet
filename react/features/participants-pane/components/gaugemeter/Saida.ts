/***
 * 
 ------------------------------------------
 Como usar a classe:
 ------------------------------------------

 const saida = new Saida(1, 800); // Cria uma instância de Saida com sequencia 1 e horarioDeSaida 800

// Usando os métodos set
saida.sequencia = 2; // Define a sequencia como 2
saida.horarioDeSaida = 900; // Define o horarioDeSaida como 900
saida.horarioDeRetorno = 1700; // Define o horarioDeRetorno como 1700

// Usando os métodos get
console.log(saida.sequencia); // Saída: 2
console.log(saida.horarioDeSaida); // Saída: 900
console.log(saida.horarioDeRetorno); // Saída: 1700
  
*****/

class Saida {
  private _sequencia: number = 0;
  private _horarioDeSaida: number = 0;
  private _horarioDeRetorno: number = 0;
  private _horaSaida: string;
  private _horaRetorno: string;

  constructor(
    sequencia: number = 0,
    horarioDeSaida: number = 0,
    horaSaida:string='--'
  ) {
    this._sequencia = sequencia;
    this._horarioDeSaida = horarioDeSaida;
    this._horarioDeRetorno = 0;
    this._horaSaida = horaSaida;
  }

  // Métodos get e set para o campo 'sequencia'
  get sequencia(): number {
    return this._sequencia;
  }

  set sequencia(value: number) {
    this._sequencia = value;
  }

  // Métodos get e set para o campo 'horaSaida'
  get horaSaida(): string {
    return this._horaSaida;
  }

  set horaSaida(value: string) {
    this._horaSaida = value;
  }

  // Métodos get e set para o campo 'horaRetorno'
  get horaRetorno(): string {
    return this._horaRetorno;
  }

  set horaRetorno(value: string) {
    this._horaRetorno = value;
  }
  // Métodos get e set para o campo 'horarioDeSaida'
  get horarioDeSaida(): number {
    return this._horarioDeSaida;
  }

  set horarioDeSaida(value: number) {
    this._horarioDeSaida = value;
  }

  // Métodos get e set para o campo 'horarioDeRetorno'
  get horarioDeRetorno(): number {
    return this._horarioDeRetorno;
  }

  set horarioDeRetorno(value: number) {
    this._horarioDeRetorno = value;
  }
}

export default Saida;