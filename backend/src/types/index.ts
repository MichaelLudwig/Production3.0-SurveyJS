// Shared types for Backend API
// Based on frontend types but adapted for server use

export interface ProductionOrder {
  id: string;
  produktionsauftragsnummer?: string;
  produktName: string;
  protokollNummer?: string;
  materialType: 'GACP' | 'GMP';
  eingangsmaterial: {
    artikelNummer: string;
    produktbezeichnung?: string;
    charge: string;
    verfall?: string;
    menge?: string;
    eingangsMenge?: number;
  };
  schablone?: {
    eqNummer: string;
    charge: string;
    anzahl: number;
  };
  primaerPackmittel: {
    artikelNummer: string;
    produktbezeichnung?: string;
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
    freigabeVorgesehen?: string;
    anzahl: number;
    fuellmenge?: number;
    fuellmenge1?: number;
    fuellmenge2?: number;
  };
  createdAt: string;
}

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
  [key: string]: SurveyAnswerItem | any;
}

export interface ValidationGroup {
  name: string;
  questions: string[];
  title: string;
  requiresMA2?: boolean;
  validationType?: string;
  signatureLabel?: string;
  showMA2?: boolean;
}

// Backend-specific types
export interface SurveyFile {
  orderId: string;
  timestamp: string;
  status: 'in_progress' | 'completed' | 'aborted';
  
  // Neue saubere Struktur
  survey?: Record<string, any>; // Survey-Antworten
  validation?: Record<string, any>; // Validierungsgruppen
  productionOrder?: ProductionOrder; // Produktionsauftrag-Daten
  
  // Legacy-Felder für Kompatibilität
  answers?: Record<string, SurveyAnswerItem>;
  auditTrail?: Record<string, any>;
  
  currentPageNo?: number;
  ma2Completions?: Record<string, boolean>;
  pendingMA2Groups?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SurveyStatus {
  exists: boolean;
  status?: 'in_progress' | 'completed' | 'aborted';
  lastModified?: string;
  currentPageNo?: number;
}

// API Request/Response types
export interface CreateOrderRequest {
  order: Omit<ProductionOrder, 'id' | 'createdAt'>;
}

export interface UpdateOrderRequest {
  order: ProductionOrder;
}

export interface SaveSurveyProgressRequest {
  data: any; // SurveyJS data
  enhancedData: SurveyAnswer;
  ma2Completions: Record<string, boolean>;
  pendingMA2Groups: string[];
  currentPageNo: number;
}

export interface CompleteSurveyRequest {
  answers: SurveyAnswer;
  auditTrail: Record<string, any>;
  productionOrder?: ProductionOrder;
  completedAt?: string;
}