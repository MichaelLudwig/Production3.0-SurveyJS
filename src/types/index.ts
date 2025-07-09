export interface ProductionOrder {
  id: string;
  produktName: string;
  protokollNummer?: string;
  materialType: 'GACP' | 'GMP';
  eingangsmaterial: {
    artikelNummer: string;
    charge: string;
    verfallsdatum: string;
    eingangsMenge: number;
  };
  schablone?: {
    eqNummer: string;
    charge: string;
    anzahl: number;
  };
  primaerPackmittel: {
    artikelNummer: string;
    charge: string;
    anzahl: number;
  };
  zwischenprodukt: {
    artikelNummer: string;
    gebindeNummer: string;
  };
  probenzug: {
    plan: string;
    anzahl: number;
    fuellmenge: number;
  };
  bulkBeutelAnzahl: number;
  createdAt: string;
}

export interface SurveyAnswer {
  [key: string]: any;
}

export interface ExportData {
  productionOrder: ProductionOrder;
  answers: SurveyAnswer;
  completedAt: string;
}

export type AppState = 'order-selection' | 'survey' | 'completed';

export interface BulkBeutel {
  bulkNr: string;
  istInhalt: number;
  gebindeProduktion: {
    anzahlGebinde: number;
    fuellmenge: number;
    restmenge: number;
  };
}

export interface Mitarbeiter {
  name: string;
  kuerzel: string;
  unterschrift?: string;
}