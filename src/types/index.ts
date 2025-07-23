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
  verschweissProgramm?: {
    programm: string;
  };
  zwischenprodukt: {
    artikelNummer: string;
    gebindeNummer: string;
    vorgGebindezahl?: number;
  };
  probenzug: {
    plan: string;
    anzahl: number;
    fuellmenge: number;
  };
  createdAt: string;
}

// Enhanced audit trail for each answer
export interface AuditTrail {
  ma1Kuerzel?: string;
  ma1Timestamp?: string;
  ma2Kuerzel?: string;
  ma2Timestamp?: string;
  ma2Kommentar?: string;
}

// Individual answer with audit trail
export interface SurveyAnswerItem {
  value: any;
  audit: {
    ma1Kuerzel?: string;
    ma1Timestamp?: string;
    ma2Kuerzel?: string;
    ma2Timestamp?: string;
    ma2Kommentar?: string;
    ma2PruefungOK?: boolean;
  };
}

export interface SurveyAnswer {
  [key: string]: SurveyAnswerItem | any; // Keep backward compatibility
}

// Four-eyes validation groups
export interface ValidationGroup {
  name: string;
  title: string;
  validationType: "signature" | "validation";
  label: string;
  questions: string[];
}

export interface ExportData {
  productionOrder: ProductionOrder;
  answers: SurveyAnswer;
  completedAt: string;
  survey?: Record<string, any>; // Vollständige Survey-Daten vom Backend
  validation?: Record<string, any>; // Validierungsdaten vom Backend
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