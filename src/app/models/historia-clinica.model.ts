export interface HistoriaClinica {
    altura: number;

    peso: number;

    temperatura: number;

    presion: number;

    datos_dinamicos: Array<{clave: string, valor: string}>;

}