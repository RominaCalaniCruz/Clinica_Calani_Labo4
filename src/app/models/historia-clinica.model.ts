export interface HistoriaClinica {
    id: string;

    altura: number;

    peso: number;

    temperatura: number;

    presion: number;

    datos_dinamicos: Array<{clave: string, valor: string}>;

}