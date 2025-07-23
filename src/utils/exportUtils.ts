import { ExportData } from '../types';

// Backend API configuration
const API_BASE_URL = 'http://localhost:3001/api';

// HTTP Client functions for Backend API communication
export async function readJsonFile(path: string): Promise<any> {
  try {
    console.log(`[API] Reading: ${path}`);
    
    // Map old file paths to new API endpoints
    let apiUrl: string;
    if (path === 'data/orders/orders.json') {
      apiUrl = `${API_BASE_URL}/orders`;
    } else if (path === 'data/master-data/surveyDefinition.json') {
      apiUrl = `${API_BASE_URL}/master-data/survey-definition`;
    } else if (path === 'data/master-data/validationGroups.json') {
      apiUrl = `${API_BASE_URL}/master-data/validation-groups`;
    } else if (path.startsWith('data/surveys/survey-') && path.endsWith('-inprogress.json')) {
      // Extract orderId from path: data/surveys/survey-{orderId}-inprogress.json
      const match = path.match(/survey-(.+?)-inprogress\.json/);
      const orderId = match ? match[1] : '';
      apiUrl = `${API_BASE_URL}/surveys/${orderId}/data`;
    } else {
      throw new Error(`Unsupported path: ${path}`);
    }
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`[API] Error reading ${path}:`, error);
    throw error;
  }
}

export async function writeJsonFile(path: string, data: any): Promise<void> {
  try {
    console.log(`[API] Writing: ${path}`);
    
    // Map old file paths to new API endpoints
    if (path === 'data/orders/orders.json') {
      // This should not be called directly - use specific order operations instead
      throw new Error('Use specific order API endpoints instead of writing orders.json directly');
    } else if (path.startsWith('data/surveys/survey-') && path.endsWith('-inprogress.json')) {
      // Extract orderId from path
      const match = path.match(/survey-(.+?)-inprogress\.json/);
      const orderId = match ? match[1] : '';
      
      const apiUrl = `${API_BASE_URL}/surveys/${orderId}/progress`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } else {
      throw new Error(`Unsupported write path: ${path}`);
    }
  } catch (error) {
    console.error(`[API] Error writing ${path}:`, error);
    throw error;
  }
}

export async function listSurveyFiles(orderId?: string): Promise<string[]> {
  try {
    console.log(`[API] Listing survey files${orderId ? ` for order ${orderId}` : ''}`);
    
    if (orderId) {
      // Check if specific order has an in-progress survey
      try {
        const statusResponse = await fetch(`${API_BASE_URL}/surveys/${orderId}/status`);
        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();
          if (statusResult.data?.exists && statusResult.data?.status === 'in_progress') {
            return [`survey-${orderId}-inprogress.json`];
          }
        }
      } catch (error) {
        console.log(`[API] No survey found for order ${orderId}`);
      }
      return [];
    } else {
      // List all surveys
      const response = await fetch(`${API_BASE_URL}/surveys`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data || [];
    }
  } catch (error) {
    console.error(`[API] Error listing survey files:`, error);
    throw error;
  }
}

export async function deleteSurveyFile(filename: string): Promise<void> {
  try {
    console.log(`[API] Deleting: ${filename}`);
    
    // Extract orderId from filename
    const match = filename.match(/survey-(.+?)-(?:inprogress|.+)\.json/);
    const orderId = match ? match[1] : '';
    
    if (!orderId) {
      throw new Error(`Cannot extract orderId from filename: ${filename}`);
    }
    
    const response = await fetch(`${API_BASE_URL}/surveys/${orderId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`[API] Error deleting ${filename}:`, error);
    throw error;
  }
}

export const exportToJSON = async (data: ExportData): Promise<void> => {
  try {
    // Versuche, die vollständigen Daten aus der Backend-Datei zu laden
    let fullData = data;
    
    try {
      // Lade die vollständigen Survey-Daten vom Backend
      const response = await fetch(`http://localhost:3001/api/surveys/${data.productionOrder.id}/data`);
      if (response.ok) {
        const backendData = await response.json();
        if (backendData.data) {
          // Kombiniere Backend-Daten mit Frontend-Daten
          fullData = {
            ...data,
            survey: backendData.data.survey || data.answers,
            validation: backendData.data.validation || {},
            productionOrder: backendData.data.productionOrder || data.productionOrder
          };
          console.log('[Export] Loaded full data from backend:', fullData);
        }
      }
    } catch (error) {
      console.warn('[Export] Could not load backend data, using frontend data only:', error);
    }
    
    const fileName = `Protokoll_${data.productionOrder.id}_${formatDateForFilename(data.completedAt)}.json`;
    const jsonString = JSON.stringify(fullData, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw new Error('JSON-Export fehlgeschlagen');
  }
};

export const exportToPDF = async (data: ExportData): Promise<void> => {
  try {
    
    // Create HTML content for PDF
    const htmlContent = generatePDFContent(data);
    
    // Create a temporary iframe to render the content
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Cannot access iframe document');
    }
    
    // Write content to iframe
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Print the iframe content
    iframe.contentWindow?.print();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('PDF-Export fehlgeschlagen');
  }
};

const formatDateForFilename = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}`;
};

const formatDateForDisplay = (dateString: string): string => {
  return new Date(dateString).toLocaleString('de-DE');
};

const generatePDFContent = (data: ExportData): string => {
  const { productionOrder, answers, completedAt, survey, validation } = data;
  // Verwende die vollständigen Survey-Daten falls verfügbar
  const fullAnswers = survey || answers;
  
  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cannabis Produktions-Protokoll</title>
        <style>
            @page {
                size: A4;
                margin: 2cm;
            }
            body {
                font-family: Arial, sans-serif;
                line-height: 1.4;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 1rem;
                margin-bottom: 2rem;
            }
            .header h1 {
                color: #2c3e50;
                margin: 0;
            }
            .order-info {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 4px;
                margin-bottom: 1.5rem;
            }
            .order-info h2 {
                color: #2c3e50;
                margin-top: 0;
                margin-bottom: 1rem;
            }
            .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }
            .info-item {
                display: flex;
                flex-direction: column;
            }
            .info-item label {
                font-weight: bold;
                color: #555;
                margin-bottom: 0.25rem;
            }
            .section {
                margin-bottom: 1.5rem;
                break-inside: avoid;
            }
            .section h3 {
                color: #2c3e50;
                border-bottom: 1px solid #ddd;
                padding-bottom: 0.5rem;
                margin-bottom: 1rem;
            }
            .subsection {
                margin-bottom: 1rem;
                padding-left: 1rem;
            }
            .subsection h4 {
                color: #34495e;
                margin-bottom: 0.5rem;
            }
            .answer-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                padding: 0.25rem 0;
                border-bottom: 1px dotted #ddd;
            }
            .answer-item:last-child {
                border-bottom: none;
            }
            .answer-question {
                font-weight: 500;
                flex: 1;
                margin-right: 1rem;
            }
            .answer-value {
                color: #2c3e50;
                font-weight: bold;
            }
            .checkbox-yes {
                color: #28a745;
            }
            .checkbox-no {
                color: #dc3545;
            }
            .panel-data {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 4px;
                margin-bottom: 1rem;
            }
            .validation-section {
                background: #f8f9fa;
                border-left: 4px solid #28a745;
                padding: 1rem;
                margin-top: 1rem;
                border-radius: 4px;
            }
            .validation-section h4 {
                color: #28a745;
                margin-top: 0;
                margin-bottom: 1rem;
                font-size: 1rem;
            }
            .validation-data {
                background: white;
                padding: 0.5rem;
                border-radius: 3px;
                border: 1px solid #dee2e6;
            }
            .subsection {
                margin-bottom: 1rem;
                padding-left: 1rem;
            }
            .subsection h4 {
                color: #34495e;
                margin-bottom: 0.5rem;
                font-size: 0.95rem;
                border-left: 3px solid #3498db;
                padding-left: 0.5rem;
            }
            .panel-data {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 4px;
                margin-bottom: 1rem;
                border: 1px solid #e9ecef;
            }
            .footer {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #666;
                font-size: 0.9rem;
            }
            .table-container {
                margin: 1rem 0;
                overflow-x: auto;
            }
            .data-table {
                width: 100%;
                border-collapse: collapse;
                margin: 0.5rem 0;
                font-size: 0.9rem;
            }
            .data-table th {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                padding: 0.5rem;
                text-align: left;
                font-weight: bold;
                color: #495057;
            }
            .data-table td {
                border: 1px solid #dee2e6;
                padding: 0.5rem;
                text-align: left;
            }
            .data-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .data-table tr:hover {
                background-color: #e9ecef;
            }
            @media print {
                .no-print {
                    display: none;
                }
                body {
                    font-size: 12px;
                }
                .data-table {
                    font-size: 10px;
                }
                .data-table th,
                .data-table td {
                    padding: 0.25rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Cannabis Produktions-Protokoll</h1>
            <p>Digitale Dokumentation des Produktionsprozesses</p>
        </div>
        
        <div class="order-info">
            <h2>Produktionsauftrag</h2>
            <div class="info-grid">
                <div class="info-item">
                    <label>Produkt:</label>
                    <span>${productionOrder.produktName}</span>
                </div>
                <div class="info-item">
                    <label>Material-Typ:</label>
                    <span>${productionOrder.materialType}</span>
                </div>
                <div class="info-item">
                    <label>Auftragsnummer:</label>
                    <span>${productionOrder.id}</span>
                </div>
                <div class="info-item">
                    <label>Protokoll-Nummer:</label>
                    <span>${answers.protokoll_nummer || 'Nicht vergeben'}</span>
                </div>
                <div class="info-item">
                    <label>Eingangsmaterial:</label>
                    <span>${productionOrder.eingangsmaterial.artikelNummer} (${productionOrder.eingangsmaterial.charge})</span>
                </div>

                <div class="info-item">
                    <label>Abgeschlossen am:</label>
                    <span>${formatDateForDisplay(completedAt)}</span>
                </div>
            </div>
        </div>
        
        ${generateSectionContent(fullAnswers, validation)}
        
        <div class="footer">
            <p>Erstellt am: ${formatDateForDisplay(completedAt)}</p>
            <p>Dieses Dokument wurde automatisch generiert durch das Cannabis Produktions-Dokumentationssystem.</p>
        </div>
    </body>
    </html>
  `;
};

const generateSectionContent = (answers: any, validation?: Record<string, any>): string => {
  let content = '';
  
  // Funktion zum sicheren Abrufen von Werten
  const getValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };
  
  // Funktion zum Formatieren von Werten
  const formatValue = (value: any): string => {
    if (value === undefined || value === null || value === '') {
      return '';
    }
    
    if (typeof value === 'boolean') {
      return value ? '<span class="checkbox-yes">✓ Ja</span>' : '<span class="checkbox-no">✗ Nein</span>';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  // Funktion zum Erstellen von Tabellen für Matrix-Daten
  const createTable = (data: any[], headers: string[], title?: string): string => {
    if (!data || data.length === 0) return '';
    
    let tableHtml = '';
    if (title) {
      tableHtml += `<div class="subsection"><h4>${title}</h4>`;
    }
    
    tableHtml += `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>`;
    
    headers.forEach(header => {
      tableHtml += `<th>${header}</th>`;
    });
    
    tableHtml += `
            </tr>
          </thead>
          <tbody>`;
    
    data.forEach((row, index) => {
      tableHtml += `<tr>`;
      headers.forEach(header => {
        // Verwende den exakten Header-Namen als Schlüssel
        const value = row[header] || '';
        tableHtml += `<td>${formatValue(value)}</td>`;
      });
      tableHtml += `</tr>`;
    });
    
    tableHtml += `
          </tbody>
        </table>
      </div>`;
    
    if (title) {
      tableHtml += `</div>`;
    }
    
    return tableHtml;
  };

  // Funktion zum Erstellen von Sektionen mit Validierung und Matrix-Daten
  const createSection = (title: string, items: Array<{key: string, label: string}>, validationGroupName?: string, validationData?: Record<string, any>): string => {
    let sectionContent = `<div class="section"><h3>${title}</h3>`;
    let hasItems = false;
    
    // Hauptantworten (aber nicht für Matrix-Daten, die in Tabellen dargestellt werden)
    items.forEach(item => {
      const value = getValue(answers, item.key);
      if (value !== undefined && value !== null && value !== '') {
        // Überspringe Matrix-Daten, die in Tabellen dargestellt werden
        const skipForTable = [
          'mitarbeiter_liste',
          'schleusen_ist_druck_matrix',
          'arbeitsraum_ist_druck_matrix',
          'kennzeichnung_matrix_allgemein',
          'bulkgebinde_liste',
          'raumtemperatur_ist_matrix',
          'vorbereitung_waage_matrix',
          'bulk_beutel_production',
          'probegebinde_liste',
          'produktliste',
          'schleusung_eurocontainer',
          'mitarbeiter_signaturen'
        ];
        
        if (!skipForTable.includes(item.key)) {
          hasItems = true;
          sectionContent += `
            <div class="answer-item">
              <span class="answer-question">${item.label}:</span>
              <span class="answer-value">${formatValue(value)}</span>
            </div>`;
        }
      }
    });

    // Spezielle Behandlung für Matrix-Daten in den jeweiligen Sektionen
    if (title === '1.2 Beteiligte Mitarbeiter' && answers.mitarbeiter_liste) {
      const headers = ['Name', 'Kürzel'];
      const tableData = answers.mitarbeiter_liste.map((mitarbeiter: any, index: number) => ({
        'Name': mitarbeiter.name || `Mitarbeiter ${index + 1}`,
        'Kürzel': mitarbeiter.kuerzel || 'Kein Kürzel'
      }));
      sectionContent += createTable(tableData, headers, 'Liste beteiligte Mitarbeiter');
      hasItems = true;
    }

    if (title === '1.5 Raumstatus überprüfen') {
      // Schleusen-Druck-Matrix
      if (answers.schleusen_ist_druck_matrix && answers.schleusen_ist_druck_matrix.length > 0) {
        const headers = ['EQ', 'Druck (mbar)'];
        const tableData: any[] = [];
        
        answers.schleusen_ist_druck_matrix.forEach((druck: any, index: number) => {
          Object.entries(druck).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              tableData.push({
                'EQ': key.replace('eq', 'EQ '),
                'Druck (mbar)': value
              });
            }
          });
        });
        
        if (tableData.length > 0) {
          sectionContent += createTable(tableData, headers, 'Schleusen-Druck-Messungen');
          hasItems = true;
        }
      }

      // Arbeitsraum-Druck-Matrix
      if (answers.arbeitsraum_ist_druck_matrix && answers.arbeitsraum_ist_druck_matrix.length > 0) {
        const headers = ['EQ', 'Druck (mbar)'];
        const tableData: any[] = [];
        
        answers.arbeitsraum_ist_druck_matrix.forEach((druck: any, index: number) => {
          Object.entries(druck).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              tableData.push({
                'EQ': key.replace('eq', 'EQ '),
                'Druck (mbar)': value
              });
            }
          });
        });
        
        if (tableData.length > 0) {
          sectionContent += createTable(tableData, headers, 'Arbeitsraum-Druck-Messungen');
          hasItems = true;
        }
      }
    }

    if (title === '1.4 Vorbereitung Kennzeichnung' && answers.kennzeichnung_matrix_allgemein) {
      const headers = ['Kennzeichnung', 'Status'];
      const tableData = Object.entries(answers.kennzeichnung_matrix_allgemein).map(([key, value]) => ({
        'Kennzeichnung': key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        'Status': formatValue(value)
      }));
      sectionContent += createTable(tableData, headers, 'Kennzeichnungs-Übersicht');
      hasItems = true;
    }

    if (title === '2.2 Materialbereitstellung - Bulkmaterial' && answers.bulkgebinde_liste) {
      const headers = ['Gebinde', 'Anzahl', 'Gebindegröße', 'Probenzug verwendet', 'Dicht/Sauber'];
      const tableData = answers.bulkgebinde_liste.map((gebinde: any, index: number) => ({
        'Gebinde': `Gebinde ${index + 1}`,
        'Anzahl': gebinde.anzahl || '',
        'Gebindegröße': gebinde.gebindegroesse || gebinde.gebindeGroesse || '',
        'Probenzug verwendet': formatValue(gebinde.probenzug_verwendet || gebinde.probenzugVerwendet || false),
        'Dicht/Sauber': formatValue(gebinde.dicht_sauber || gebinde.dichtSauber || false)
      }));
      sectionContent += createTable(tableData, headers, 'Bulkgebinde-Übersicht');
      hasItems = true;
    }

    if (title === '3.1 Vorbereitung Reinraum - Line Clearing' && answers.raumtemperatur_ist_matrix) {
      const headers = ['EQ', 'Temperatur (°C)'];
      const tableData: any[] = [];
      
      answers.raumtemperatur_ist_matrix.forEach((temp: any, index: number) => {
        Object.entries(temp).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            tableData.push({
              'EQ': key.replace('raumtemperatur_', 'Raumtemperatur ').replace('eq', 'EQ '),
              'Temperatur (°C)': value
            });
          }
        });
      });
      
      if (tableData.length > 0) {
        sectionContent += createTable(tableData, headers, 'Raumtemperatur-Messungen');
        hasItems = true;
      }
    }

    if (title === '3.2 Vorbereitung Waage' && answers.vorbereitung_waage_matrix) {
      const headers = ['Kategorie', 'Gerät', 'Status'];
      const tableData: any[] = [];
      
      Object.entries(answers.vorbereitung_waage_matrix).forEach(([kategorie, geraete]) => {
        if (typeof geraete === 'object' && geraete !== null) {
          Object.entries(geraete).forEach(([geraet, status]) => {
            if (status !== undefined && status !== null && status !== '') {
              tableData.push({
                'Kategorie': kategorie.charAt(0).toUpperCase() + kategorie.slice(1),
                'Gerät': geraet.replace('eq', 'EQ '),
                'Status': formatValue(status)
              });
            }
          });
        }
      });
      
      if (tableData.length > 0) {
        sectionContent += createTable(tableData, headers, 'Waage-Vorbereitung');
        hasItems = true;
      }
    }



    if (title === '4.5 Kumulierte Restmenge und Probenzug' && answers.probegebinde_liste) {
      const headers = ['Probegebinde', 'Anzahl', 'Inhalt'];
      const tableData = answers.probegebinde_liste.map((gebinde: any, index: number) => ({
        'Probegebinde': `Probegebinde ${index + 1}`,
        'Anzahl': gebinde.anzahl || '',
        'Inhalt': gebinde.inhalt || ''
      }));
      sectionContent += createTable(tableData, headers, 'Probegebinde-Übersicht');
      hasItems = true;
    }

    if (title === '6.1 Schleusung - Eurocontainer') {
      // Verwende die Haupt-Produktliste, falls vorhanden, sonst die Schleusung-Produktliste
      let produktliste = null;
      let tableTitle = '';
      
      if (answers.produktliste && answers.produktliste.length > 0) {
        produktliste = answers.produktliste;
        tableTitle = 'Eurocontainer Produktliste';
      } else if (answers.schleusung_eurocontainer && answers.schleusung_eurocontainer.produktliste) {
        produktliste = answers.schleusung_eurocontainer.produktliste;
        tableTitle = 'Schleusung Eurocontainer';
      }
      
      if (produktliste && produktliste.length > 0) {
        const headers = ['Produkt', 'Art Inhalt', 'Anzahl Gebinde', 'Plomben Nr.', 'Plomben Nr. 2'];
        const tableData = produktliste.map((produkt: any, index: number) => ({
          'Produkt': `Produkt ${index + 1}`,
          'Art Inhalt': produkt.art_inhalt || produkt.artInhalt || '',
          'Anzahl Gebinde': produkt.anzahl_gebinde || produkt.anzahlGebinde || '',
          'Plomben Nr.': produkt.plomben_nr || produkt.plombenNr || '',
          'Plomben Nr. 2': produkt.plomben_nr_2 || produkt.plombenNr2 || ''
        }));
        sectionContent += createTable(tableData, headers, tableTitle);
        hasItems = true;
      }
    }

    if (title === '10.2 Herstellung abgeschlossen' && answers.mitarbeiter_signaturen) {
      const headers = ['Mitarbeiter', 'Signatur'];
      const tableData = answers.mitarbeiter_signaturen.map((mitarbeiter: any, index: number) => ({
        'Mitarbeiter': mitarbeiter.name || `Mitarbeiter ${index + 1}`,
        'Signatur': mitarbeiter.signatur || 'Keine Signatur'
      }));
      sectionContent += createTable(tableData, headers, 'Mitarbeiter-Signaturen');
      hasItems = true;
    }
    
    // Vier-Augen-Validierung hinzufügen, falls vorhanden
    if (validationGroupName && validationData && validationData[validationGroupName]) {
      const validationGroupData = validationData[validationGroupName];
      sectionContent += `<div class="validation-section">
        <h4>✓ Vier-Augen-Validierung: ${title}</h4>
        <div class="validation-data">`;
      
      if (validationGroupData.ma2Kuerzel) {
        sectionContent += `
          <div class="answer-item">
            <span class="answer-question">Geprüft durch:</span>
            <span class="answer-value">${validationGroupData.ma2Kuerzel}</span>
          </div>`;
      }
      
      if (validationGroupData.ma2Timestamp) {
        sectionContent += `
          <div class="answer-item">
            <span class="answer-question">Prüfungszeitpunkt:</span>
            <span class="answer-value">${formatDateForDisplay(validationGroupData.ma2Timestamp)}</span>
          </div>`;
      }
      
      if (validationGroupData.validationOK !== undefined) {
        sectionContent += `
          <div class="answer-item">
            <span class="answer-question">Prüfung OK:</span>
            <span class="answer-value">${validationGroupData.validationOK ? 
            '<span class="checkbox-yes">✓ Ja</span>' : 
              '<span class="checkbox-no">✗ Nein</span>'}</span>
          </div>`;
        }
        
      if (validationGroupData.ma2Kommentar) {
        sectionContent += `
          <div class="answer-item">
            <span class="answer-question">Kommentar:</span>
            <span class="answer-value">${validationGroupData.ma2Kommentar}</span>
          </div>`;
      }
      
      sectionContent += `</div></div>`;
    }

    // Spezielle Behandlung für Produktionslauf-Daten (alle Antworten zu den Bulk-Beuteln)
    if (title === '4.2 Primärverpackung - Produktionslauf' && answers.bulk_beutel_production) {
      // Detaillierte Produktionslauf-Tabelle mit allen Feldern
      const headers = ['Beutel', 'Bulk Nummer', 'Soll Inhalt', 'Ist Inhalt', 'Anzahl Gebinde', 'Blüten unauffällig', 'Gebinde korrekt abgewogen', 'Restmenge'];
      const tableData = answers.bulk_beutel_production.map((bulk: any, index: number) => ({
        'Beutel': `Beutel ${index + 1}`,
        'Bulk Nummer': bulk.bulk_nummer || bulk.bulkNummer || '',
        'Soll Inhalt': bulk.soll_inhalt || bulk.sollInhalt || '',
        'Ist Inhalt': bulk.ist_inhalt || bulk.istInhalt || '',
        'Anzahl Gebinde': bulk.anzahl_gebinde || bulk.anzahlGebinde || '',
        'Blüten unauffällig': formatValue(bulk.blueten_unauffaellig || bulk.bluetenUnauffaellig || false),
        'Gebinde korrekt abgewogen': formatValue(bulk.gebinde_korrekt_abgewogen || bulk.gebindeKorrektAbgewogen || false),
        'Restmenge': bulk.restmenge || bulk.restMenge || ''
      }));
      sectionContent += createTable(tableData, headers, 'Detaillierter Produktionslauf - Bulk-Beutel');
      hasItems = true;
    }
    
    if (hasItems) {
      sectionContent += '</div>';
    }
    
    return sectionContent;
  };
  
  // Mapping von Feldnamen zu lesbaren Labels
  const fieldLabels: Record<string, string> = {
    // Allgemeine Felder
    'eingangsmaterial_ausgebucht': 'Eingangsmaterialien ausgebucht',
    'mitarbeiter_liste': 'Mitarbeiter Liste',
    'beginn_datum': 'Datum der Herstellung',
    'beginn_uhrzeit': 'Uhrzeit Beginn',
    'kennzeichnung_matrix_allgemein': 'Kennzeichnung Matrix Allgemein',
    'schleusen_ist_druck_matrix': 'Schleusen Ist Druck Matrix',
    'arbeitsraum_ist_druck_matrix': 'Arbeitsraum Ist Druck Matrix',
    'reinraumstatus_ampel': 'Reinraumstatus Ampel',
    'reinraum_nutzbar': 'Reinraum nutzbar',
    'reinraum_nutzbar_kommentar': 'Reinraum nutzbar Kommentar',
    'bulkprodukt_name_rot': 'Bulkprodukt Name (bei rot)',
    
    // Materialbereitstellung
    'produktbezeichnung_ist': 'Produktbezeichnung Ist',
    'artikelnummer_ist': 'Artikelnummer Ist',
    'charge_ist': 'Charge Ist',
    'anzahl_ist': 'Anzahl Ist',
    'umverpackung_dicht': 'Umverpackung dicht',
    'umverpackung_dicht_kommentar': 'Umverpackung dicht Kommentar',
    'primaerpackmittel_erfasst_kuerzel': 'Primärpackmittel erfasst Kürzel',
    'bemerkungen': 'Bemerkungen',
    'produktbezeichnung_bulk_ist': 'Produktbezeichnung Bulk Ist',
    'artikelnr_bulk_ist': 'Artikelnummer Bulk Ist',
    'charge_bulk_ist': 'Charge Bulk Ist',
    'verfall_bulk_ist': 'Verfall Bulk Ist',
    'bulkgebinde_liste': 'Bulkgebinde Liste',
    'bulk_erfasst_kuerzel': 'Bulk erfasst Kürzel',
    'bulk_bemerkungen': 'Bulk Bemerkungen',
    'schablonen_eq_ist': 'Schablonen EQ Ist',
    'schablonen_charge_ist': 'Schablonen Charge Ist',
    'schablonen_anzahl_ist': 'Schablonen Anzahl Ist',
    'schablonen_sollangaben_ok': 'Schablonen Sollangaben OK',
    'schablonen_verpackung_ok': 'Schablonen Verpackung OK',
    'schablonen_bemerkung': 'Schablonen Bemerkung',
    'materialbereitstellung_bemerkungen': 'Materialbereitstellung Bemerkungen',
    'materialbereitstellung_ma1_kuerzel': 'Materialbereitstellung MA1 Kürzel',
    'materialbereitstellung_ma2_kuerzel': 'Materialbereitstellung MA2 Kürzel',
    
    // Reinraum Vorbereitung
    'material_entspricht': 'Material entspricht',
    'raumtemperatur_ist_matrix': 'Raumtemperatur Ist Matrix',
    'line_clearing_erfolgt': 'Line Clearing erfolgt',
    'line_clearing_bemerkungen': 'Line Clearing Bemerkungen',
    'line_clearing_erfasst': 'Line Clearing erfasst',
    'vorbereitung_waage_matrix': 'Vorbereitung Waage Matrix',
    'waage_bemerkungen': 'Waage Bemerkungen',
    'waage_erfasst': 'Waage erfasst',
    'verschweiss_programm_ist': 'Verschweißprogramm Ist',
    'schweissgeraet_funktioniert': 'Schweißgerät funktioniert',
    'schweissgeraet_bemerkungen': 'Schweißgerät Bemerkungen',
    'schweissgeraet_erfasst': 'Schweißgerät erfasst',
    
    // Produktion
    'herstellung_beginn_uhrzeit': 'Herstellung Beginn Uhrzeit',
    'bulk_beutel_production': 'Bulk Beutel Production',
    'pause_durchgefuehrt': 'Pause durchgeführt',
    'pause_beginn': 'Pause Beginn',
    'pause_ende': 'Pause Ende',
    'pause_bemerkung': 'Pause Bemerkung',
    'pause_ma1_signatur': 'Pause MA1 Signatur',
    'pause_ma2_signatur': 'Pause MA2 Signatur',
    'kalibrierung_nach_pause_eq60': 'Kalibrierung nach Pause EQ60',
    'kalibrierung_nach_pause_eq61': 'Kalibrierung nach Pause EQ61',
    'verschweiss_nach_pause_ist': 'Verschweiß nach Pause Ist',
    'schweissgeraet_nach_pause_ok': 'Schweißgerät nach Pause OK',
    'pause_nachbereitung_bemerkungen': 'Pause Nachbereitung Bemerkungen',
    'pause_nachbereitung_erfasst': 'Pause Nachbereitung erfasst',
    'restmenge_eingang': 'Restmenge Eingang',
    'restmenge_bemerkung': 'Restmenge Bemerkung',
    'probenzug_ipk_abgefuellt_ma1': 'Probenzug IPK abgefüllt MA1',
    'gesamtmenge_probenzug_ipk': 'Gesamtmenge Probenzug IPK',
    'probenzug_freigabe_vorgesehen': 'Probenzug Freigabe vorgesehen',
    'probegebinde_liste': 'Probegebinde Liste',
    'probegebinde_gekennzeichnet': 'Probegebinde gekennzeichnet',
    'anzahl_zwischenprodukte': 'Anzahl Zwischenprodukte',
    'bruch_abfuellung_restmenge': 'Bruch Abfüllung Restmenge',
    'gebinde_abgewogen_verschweisst_ma1': 'Gebinde abgewogen verschweißt MA1',
    'bruch_aussortiertes_material_ma1': 'Bruch aussortiertes Material MA1',
    'aussortiertes_material_bruch': 'Aussortiertes Material Bruch',
    'finale_restmenge_gewicht': 'Finale Restmenge Gewicht',
    'bruch_aussortiert_abgefuellt_ma1': 'Bruch aussortiert abgefüllt MA1',
    'finale_restmenge_abgefuellt_ma1': 'Finale Restmenge abgefüllt MA1',
    'blueten_an_qk': 'Blüten an QK',
    'testbeutel_verschweisst_ma1': 'Testbeutel verschweißt MA1',
    'primaerpackmittel_uebrig_ma1': 'Primärpackmittel übrig MA1',
    'anzahl_primaerpackmittel_uebrig': 'Anzahl Primärpackmittel übrig',
    'restmenge_ende_uhrzeit': 'Restmenge Ende Uhrzeit',
    'restmenge_bemerkungen': 'Restmenge Bemerkungen',
    'restmenge_erfasst': 'Restmenge erfasst',
    'bruch_finale_restmenge_ma1': 'Bruch finale Restmenge MA1',
    'finale_restmenge_bruch_gewicht': 'Finale Restmenge Bruch Gewicht',
    
    // Schleusung
    'produktliste': 'Produktliste',
    'herstellprozess_ma1_signatur': 'Herstellprozess MA1 Signatur',
    'herstellprozess_ma2_signatur': 'Herstellprozess MA2 Signatur',
    'schleusung_eurocontainer': 'Schleusung Eurocontainer',
    
    // Nachbereitung
    'line_clearing_nachbereitung_ma1': 'Line Clearing Nachbereitung MA1',
    'nachbereitung_reinraum_bemerkungen': 'Nachbereitung Reinraum Bemerkungen',
    'nachbereitung_reinraum_erfasst': 'Nachbereitung Reinraum erfasst',
    
    // Einlagern
    'zwischenprodukte_verpackt_ma1': 'Zwischenprodukte verpackt MA1',
    'zwischenprodukte_produktionslager_ma1': 'Zwischenprodukte Produktionslager MA1',
    'proben_gekennzeichnet_ma1': 'Proben gekennzeichnet MA1',
    'proben_produktionslager_ma1': 'Proben Produktionslager MA1',
    'restmenge_gekennzeichnet_ma1': 'Restmenge gekennzeichnet MA1',
    'restmenge_sperrlager_ma1': 'Restmenge Sperrlager MA1',
    'muell_gekennzeichnet_ma1': 'Müll gekennzeichnet MA1',
    'muell_sperrlager_ma1': 'Müll Sperrlager MA1',
    'ungeoefffnete_bulkbeutel_ma1': 'Ungeöffnete Bulkbeutel MA1',
    'primaerpackmittel_ungeöffnet_ma1': 'Primärpackmittel ungeöffnet MA1',
    'primaerpackmittel_geoeffnet_ma1': 'Primärpackmittel geöffnet MA1',
    'eingangsmaterialien_begruendung': 'Eingangsmaterialien Begründung',
    'schablonen_entfernt_ma1': 'Schablonen entfernt MA1',
    'schablonen_begruendung': 'Schablonen Begründung',
    'nachbereitung_bemerkung': 'Nachbereitung Bemerkung',
    'nachbereitung_erfasst': 'Nachbereitung erfasst',
    
    // Nachbereitung Final
    'eurocontainer_bereitgestellt': 'Eurocontainer bereitgestellt',
    'zwischenreinigung_durchgefuehrt': 'Zwischenreinigung durchgeführt',
    'nachbereitung_reinraum_final_bemerkung': 'Nachbereitung Reinraum Final Bemerkung',
    
    // Abschluss
    'geraete_logbuecher_eingetragen': 'Geräte Logbücher eingetragen',
    'probenzugsplan_ausgefuellt': 'Probenzugsplan ausgefüllt',
    'abschluss_bemerkung': 'Abschluss Bemerkung',
    'abschluss_erfasst': 'Abschluss erfasst',
    'mitarbeiter_signaturen': 'Mitarbeiter Signaturen'
  };
  
  // Mapping von Feldnamen zu Survey-Seiten
  const fieldToPageMapping: Record<string, string> = {
    // 1.1 Information Produktionsauftrag
    'eingangsmaterial_ausgebucht': '1.1 Information Produktionsauftrag',
    
    // 1.2 Beteiligte Mitarbeiter
    'mitarbeiter_liste': '1.2 Beteiligte Mitarbeiter',
    
    // 1.3 Datum + Uhrzeit Beginn
    'beginn_datum': '1.3 Datum + Uhrzeit Beginn',
    'beginn_uhrzeit': '1.3 Datum + Uhrzeit Beginn',
    
    // 1.4 Vorbereitung Kennzeichnung
    'kennzeichnung_matrix_allgemein': '1.4 Vorbereitung Kennzeichnung',
    
    // 1.5 Raumstatus überprüfen
    'schleusen_ist_druck_matrix': '1.5 Raumstatus überprüfen',
    'arbeitsraum_ist_druck_matrix': '1.5 Raumstatus überprüfen',
    'reinraumstatus_ampel': '1.5 Raumstatus überprüfen',
    'reinraum_nutzbar': '1.5 Raumstatus überprüfen',
    'reinraum_nutzbar_kommentar': '1.5 Raumstatus überprüfen',
    'bulkprodukt_name_rot': '1.5 Raumstatus überprüfen',
    
    // 2.1 Materialbereitstellung - Primärpackmittel
    'produktbezeichnung_ist': '2.1 Materialbereitstellung - Primärpackmittel',
    'artikelnummer_ist': '2.1 Materialbereitstellung - Primärpackmittel',
    'charge_ist': '2.1 Materialbereitstellung - Primärpackmittel',
    'anzahl_ist': '2.1 Materialbereitstellung - Primärpackmittel',
    'umverpackung_dicht': '2.1 Materialbereitstellung - Primärpackmittel',
    'umverpackung_dicht_kommentar': '2.1 Materialbereitstellung - Primärpackmittel',
    'primaerpackmittel_erfasst_kuerzel': '2.1 Materialbereitstellung - Primärpackmittel',
    'bemerkungen': '2.1 Materialbereitstellung - Primärpackmittel',
    
    // 2.2 Materialbereitstellung - Bulkmaterial
    'produktbezeichnung_bulk_ist': '2.2 Materialbereitstellung - Bulkmaterial',
    'artikelnr_bulk_ist': '2.2 Materialbereitstellung - Bulkmaterial',
    'charge_bulk_ist': '2.2 Materialbereitstellung - Bulkmaterial',
    'verfall_bulk_ist': '2.2 Materialbereitstellung - Bulkmaterial',
    'bulkgebinde_liste': '2.2 Materialbereitstellung - Bulkmaterial',
    'bulk_erfasst_kuerzel': '2.2 Materialbereitstellung - Bulkmaterial',
    'bulk_bemerkungen': '2.2 Materialbereitstellung - Bulkmaterial',
    
    // 2.3 Zubehör - Schablonen/GMP
    'schablonen_eq_ist': '2.3 Zubehör - Schablonen/GMP',
    'schablonen_charge_ist': '2.3 Zubehör - Schablonen/GMP',
    'schablonen_anzahl_ist': '2.3 Zubehör - Schablonen/GMP',
    'schablonen_sollangaben_ok': '2.3 Zubehör - Schablonen/GMP',
    'schablonen_verpackung_ok': '2.3 Zubehör - Schablonen/GMP',
    'schablonen_bemerkung': '2.3 Zubehör - Schablonen/GMP',
    
    // 2.4 Materialbereitstellung - Abschluss
    'materialbereitstellung_bemerkungen': '2.4 Materialbereitstellung - Abschluss',
    'materialbereitstellung_ma1_kuerzel': '2.4 Materialbereitstellung - Abschluss',
    'materialbereitstellung_ma2_kuerzel': '2.4 Materialbereitstellung - Abschluss',
    
    // 3.1 Vorbereitung Reinraum - Line Clearing
    'material_entspricht': '3.1 Vorbereitung Reinraum - Line Clearing',
    'raumtemperatur_ist_matrix': '3.1 Vorbereitung Reinraum - Line Clearing',
    'line_clearing_erfolgt': '3.1 Vorbereitung Reinraum - Line Clearing',
    'line_clearing_bemerkungen': '3.1 Vorbereitung Reinraum - Line Clearing',
    'line_clearing_erfasst': '3.1 Vorbereitung Reinraum - Line Clearing',
    
    // 3.2 Vorbereitung Waage
    'vorbereitung_waage_matrix': '3.2 Vorbereitung Waage',
    'waage_bemerkungen': '3.2 Vorbereitung Waage',
    'waage_erfasst': '3.2 Vorbereitung Waage',
    
    // 3.3 Vorbereitung Kammerschweißgerät
    'verschweiss_programm_ist': '3.3 Vorbereitung Kammerschweißgerät',
    'schweissgeraet_funktioniert': '3.3 Vorbereitung Kammerschweißgerät',
    'schweissgeraet_bemerkungen': '3.3 Vorbereitung Kammerschweißgerät',
    'schweissgeraet_erfasst': '3.3 Vorbereitung Kammerschweißgerät',
    
    // 4.1 Herstellprozess - Beginn
    'herstellung_beginn_uhrzeit': '4.1 Herstellprozess - Beginn',
    
    // 4.2 Primärverpackung - Produktionslauf
    'bulk_beutel_production': '4.2 Primärverpackung - Produktionslauf',
    
    // 4.3 Pause
    'pause_durchgefuehrt': '4.3 Pause',
    
    // 4.4 Pause Details
    'pause_beginn': '4.4 Pause Details',
    'pause_ende': '4.4 Pause Details',
    'pause_bemerkung': '4.4 Pause Details',
    'pause_ma1_signatur': '4.4 Pause Details',
    'pause_ma2_signatur': '4.4 Pause Details',
    'kalibrierung_nach_pause_eq60': '4.4 Pause Details',
    'kalibrierung_nach_pause_eq61': '4.4 Pause Details',
    'verschweiss_nach_pause_ist': '4.4 Pause Details',
    'schweissgeraet_nach_pause_ok': '4.4 Pause Details',
    'pause_nachbereitung_bemerkungen': '4.4 Pause Details',
    'pause_nachbereitung_erfasst': '4.4 Pause Details',
    
    // 4.5 Kumulierte Restmenge und Probenzug
    'restmenge_eingang': '4.5 Kumulierte Restmenge und Probenzug',
    'restmenge_bemerkung': '4.5 Kumulierte Restmenge und Probenzug',
    'probenzug_ipk_abgefuellt_ma1': '4.5 Kumulierte Restmenge und Probenzug',
    'gesamtmenge_probenzug_ipk': '4.5 Kumulierte Restmenge und Probenzug',
    'probenzug_freigabe_vorgesehen': '4.5 Kumulierte Restmenge und Probenzug',
    'probegebinde_liste': '4.5 Kumulierte Restmenge und Probenzug',
    'probegebinde_gekennzeichnet': '4.5 Kumulierte Restmenge und Probenzug',
    'anzahl_zwischenprodukte': '4.5 Kumulierte Restmenge und Probenzug',
    'bruch_abfuellung_restmenge': '4.5 Kumulierte Restmenge und Probenzug',
    'gebinde_abgewogen_verschweisst_ma1': '4.5 Kumulierte Restmenge und Probenzug',
    
    // 5.1 Restmenge
    'bruch_aussortiertes_material_ma1': '5.1 Restmenge',
    'aussortiertes_material_bruch': '5.1 Restmenge',
    'finale_restmenge_gewicht': '5.1 Restmenge',
    'bruch_aussortiert_abgefuellt_ma1': '5.1 Restmenge',
    'bruch_finale_restmenge_ma1': '5.1 Restmenge',
    'finale_restmenge_bruch_gewicht': '5.1 Restmenge',
    'finale_restmenge_abgefuellt_ma1': '5.1 Restmenge',
    'blueten_an_qk': '5.1 Restmenge',
    'testbeutel_verschweisst_ma1': '5.1 Restmenge',
    'primaerpackmittel_uebrig_ma1': '5.1 Restmenge',
    'anzahl_primaerpackmittel_uebrig': '5.1 Restmenge',
    'restmenge_ende_uhrzeit': '5.1 Restmenge',
    'restmenge_bemerkungen': '5.1 Restmenge',
    'restmenge_erfasst': '5.1 Restmenge',
    
    // 6.1 Schleusung - Eurocontainer
    'produktliste': '6.1 Schleusung - Eurocontainer',
    'herstellprozess_ma1_signatur': '6.1 Schleusung - Eurocontainer',
    'herstellprozess_ma2_signatur': '6.1 Schleusung - Eurocontainer',
    'schleusung_eurocontainer': '6.1 Schleusung - Eurocontainer',
    
    // 7.1 Schleusung und Nachbereitung Reinraum
    'line_clearing_nachbereitung_ma1': '7.1 Schleusung und Nachbereitung Reinraum',
    'nachbereitung_reinraum_bemerkungen': '7.1 Schleusung und Nachbereitung Reinraum',
    'nachbereitung_reinraum_erfasst': '7.1 Schleusung und Nachbereitung Reinraum',
    
    // 8.1 Einlagern
    'zwischenprodukte_verpackt_ma1': '8.1 Einlagern',
    'zwischenprodukte_produktionslager_ma1': '8.1 Einlagern',
    'proben_gekennzeichnet_ma1': '8.1 Einlagern',
    'proben_produktionslager_ma1': '8.1 Einlagern',
    'restmenge_gekennzeichnet_ma1': '8.1 Einlagern',
    'restmenge_sperrlager_ma1': '8.1 Einlagern',
    'muell_gekennzeichnet_ma1': '8.1 Einlagern',
    'muell_sperrlager_ma1': '8.1 Einlagern',
    
    // 8.2 Einlagern - Nicht genutzte Eingangsmaterialien
    'ungeoefffnete_bulkbeutel_ma1': '8.2 Einlagern - Nicht genutzte Eingangsmaterialien',
    'primaerpackmittel_ungeöffnet_ma1': '8.2 Einlagern - Nicht genutzte Eingangsmaterialien',
    'primaerpackmittel_geoeffnet_ma1': '8.2 Einlagern - Nicht genutzte Eingangsmaterialien',
    'eingangsmaterialien_begruendung': '8.2 Einlagern - Nicht genutzte Eingangsmaterialien',
    'schablonen_entfernt_ma1': '8.2 Einlagern - Nicht genutzte Eingangsmaterialien',
    'schablonen_begruendung': '8.2 Einlagern - Nicht genutzte Eingangsmaterialien',
    'nachbereitung_bemerkung': '8.2 Einlagern - Nicht genutzte Eingangsmaterialien',
    'nachbereitung_erfasst': '8.2 Einlagern - Nicht genutzte Eingangsmaterialien',
    
    // 9.1 Nachbereitung Reinraum - Final
    'eurocontainer_bereitgestellt': '9.1 Nachbereitung Reinraum - Final',
    'zwischenreinigung_durchgefuehrt': '9.1 Nachbereitung Reinraum - Final',
    'nachbereitung_reinraum_final_bemerkung': '9.1 Nachbereitung Reinraum - Final',
    
    // 10.1 Abschluss
    'geraete_logbuecher_eingetragen': '10.1 Abschluss',
    'probenzugsplan_ausgefuellt': '10.1 Abschluss',
    'abschluss_bemerkung': '10.1 Abschluss',
    'abschluss_erfasst': '10.1 Abschluss',
    
    // 10.2 Herstellung abgeschlossen
    'mitarbeiter_signaturen': '10.2 Herstellung abgeschlossen'
  };
  
  // Gruppiere Felder nach Survey-Seiten
  const pageGroups: Record<string, Array<{key: string, label: string}>> = {};
  
  Object.keys(answers).forEach(field => {
    const pageTitle = fieldToPageMapping[field];
    if (pageTitle) {
      if (!pageGroups[pageTitle]) {
        pageGroups[pageTitle] = [];
      }
      const label = fieldLabels[field] || field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      pageGroups[pageTitle].push({ key: field, label });
    }
  });
  
  // Mapping von Seitentiteln zu ValidationGroup-Namen
  const validationGroupMapping: Record<string, string> = {
    '1.1 Information Produktionsauftrag': 'eingangsmaterialien_ausbuchen',
    '1.2 Beteiligte Mitarbeiter': 'eingangsmaterialien_ausbuchen',
    '1.3 Datum + Uhrzeit Beginn': 'eingangsmaterialien_ausbuchen',
    '1.4 Vorbereitung Kennzeichnung': 'eingangsmaterialien_ausbuchen',
    '1.5 Raumstatus überprüfen': 'raumstatus_pruefen',
    '2.1 Materialbereitstellung - Primärpackmittel': 'materialbereitstellung_primaerpackmittel',
    '2.2 Materialbereitstellung - Bulkmaterial': 'materialbereitstellung_bulk',
    '2.3 Zubehör - Schablonen/GMP': 'zubehör_schablonen',
    '2.4 Materialbereitstellung - Abschluss': 'materialbereitstellung_abschluss',
    '3.1 Vorbereitung Reinraum - Line Clearing': 'line_clearing',
    '3.2 Vorbereitung Waage': 'vorbereitung_waage',
    '3.3 Vorbereitung Kammerschweißgerät': 'vorbereitung_schweissgeraet',
    '4.1 Herstellprozess - Beginn': 'bulk_beutel_production',
    '4.2 Primärverpackung - Produktionslauf': 'bulk_beutel_production',
    '4.3 Pause': 'pause_details',
    '4.4 Pause Details': 'pause_details',
    '4.5 Kumulierte Restmenge und Probenzug': 'kumulierte_restmenge_gmp',
    '5.1 Restmenge': 'restmenge_final_gmp',
    '6.1 Schleusung - Eurocontainer': 'bulk_beutel_production',
    '7.1 Schleusung und Nachbereitung Reinraum': 'nachbereitung_reinraum',
    '8.1 Einlagern': 'einlagern',
    '8.2 Einlagern - Nicht genutzte Eingangsmaterialien': 'einlagern_eingangsmaterialien_gmp',
    '9.1 Nachbereitung Reinraum - Final': 'nachbereitung_reinraum_final',
    '10.1 Abschluss': 'abschluss',
    '10.2 Herstellung abgeschlossen': 'abschluss'
  };
  
  // Erstelle Sektionen für alle Seiten mit Inhalt
  Object.entries(pageGroups).forEach(([pageTitle, items]) => {
    if (items.length > 0) {
      const validationGroupName = validationGroupMapping[pageTitle];
      content += createSection(pageTitle, items, validationGroupName, validation);
    }
  });

  return content;
};

