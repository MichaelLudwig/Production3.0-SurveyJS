import { ExportData } from '../types';

export const exportToJSON = async (data: ExportData): Promise<void> => {
  try {
    const fileName = `Protokoll_${data.productionOrder.id}_${formatDateForFilename(data.completedAt)}.json`;
    const jsonString = JSON.stringify(data, null, 2);
    
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
  const { productionOrder, answers, completedAt } = data;
  
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
            .footer {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #666;
                font-size: 0.9rem;
            }
            @media print {
                .no-print {
                    display: none;
                }
                body {
                    font-size: 12px;
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
                    <label>Bulk-Beutel:</label>
                    <span>${productionOrder.bulkBeutelAnzahl}</span>
                </div>
                <div class="info-item">
                    <label>Abgeschlossen am:</label>
                    <span>${formatDateForDisplay(completedAt)}</span>
                </div>
            </div>
        </div>
        
        ${generateSectionContent(answers)}
        
        <div class="footer">
            <p>Erstellt am: ${formatDateForDisplay(completedAt)}</p>
            <p>Dieses Dokument wurde automatisch generiert durch das Cannabis Produktions-Dokumentationssystem.</p>
        </div>
    </body>
    </html>
  `;
};

const generateSectionContent = (answers: any): string => {
  const sections = [
    {
      title: 'Vorbereitung',
      items: [
        { key: 'eingangsmaterial_ausgebucht', label: 'Eingangsmaterialien ausgebucht' },
        { key: 'leiter_herstellung_kuerzel', label: 'Leiter der Herstellung' },
        { key: 'beginn_datum', label: 'Datum der Herstellung' },
        { key: 'beginn_uhrzeit', label: 'Uhrzeit Beginn' }
      ]
    },
    {
      title: 'Kennzeichnung',
      items: [
        { key: 'eurocontainer_vorhanden', label: 'Eurocontainer vorhanden' },
        { key: 'probenbehälter_freigabe_vorhanden', label: 'Probenbehälter (Freigabe) vorhanden' },
        { key: 'probenbehälter_ipk_vorhanden', label: 'Probenbehälter (IPK) vorhanden' },
        { key: 'gebinde_rueckfragen_vorhanden', label: 'Gebinde für Rückfragen vorhanden' },
        { key: 'gebinde_restmenge_vorhanden', label: 'Gebinde für Restmenge vorhanden' },
        { key: 'behälter_bruch_vorhanden', label: 'Behälter für Bruch vorhanden' }
      ]
    },
    {
      title: 'Reinraum Vorbereitung',
      items: [
        { key: 'line_clearing_ma1', label: 'Line Clearing MA1' },
        { key: 'line_clearing_ma2', label: 'Line Clearing MA2' },
        { key: 'line_clearing_erfasst', label: 'Line Clearing erfasst durch' },
        { key: 'line_clearing_geprueft', label: 'Line Clearing geprüft durch' },
        { key: 'reinigung_ma1', label: 'Reinigung MA1' },
        { key: 'reinigung_ma2', label: 'Reinigung MA2' },
        { key: 'reinigung_erfasst', label: 'Reinigung erfasst durch' },
        { key: 'reinigung_geprueft', label: 'Reinigung geprüft durch' }
      ]
    },
    {
      title: 'Materialbereitstellung',
      items: [
        { key: 'identität_geprüft', label: 'Identität geprüft' },
        { key: 'unversehrtheit_geprüft', label: 'Unversehrtheit geprüft' },
        { key: 'haltbarkeit_geprüft', label: 'Haltbarkeit geprüft' },
        { key: 'kennzeichnung_geprüft', label: 'Kennzeichnung geprüft' },
        { key: 'materialkontrolle_erfasst', label: 'Materialkontrolle erfasst durch' },
        { key: 'materialkontrolle_geprueft', label: 'Materialkontrolle geprüft durch' }
      ]
    },
    {
      title: 'Pause',
      items: [
        { key: 'pause_durchgeführt', label: 'Pause durchgeführt' },
        { key: 'pause_beginn', label: 'Pause Beginn' },
        { key: 'pause_ende', label: 'Pause Ende' },
        { key: 'pause_kontrolle_ma1', label: 'Pause Kontrolle MA1' },
        { key: 'pause_kontrolle_ma2', label: 'Pause Kontrolle MA2' }
      ]
    },
    {
      title: 'Probenzug und Restmenge',
      items: [
        { key: 'kumulierte_restmenge', label: 'Kumulierte Restmenge (g)' },
        { key: 'probe1_menge', label: 'Probe 1 Menge (g)' },
        { key: 'probe2_menge', label: 'Probe 2 Menge (g)' },
        { key: 'probenzug_erfasst', label: 'Probenzug erfasst durch' },
        { key: 'probenzug_geprueft', label: 'Probenzug geprüft durch' }
      ]
    },
    {
      title: 'Abschluss',
      items: [
        { key: 'ende_datum', label: 'Ende Datum' },
        { key: 'ende_uhrzeit', label: 'Ende Uhrzeit' },
        { key: 'abschließende_bemerkung', label: 'Abschließende Bemerkung' },
        { key: 'abschluss_erfasst', label: 'Abschluss erfasst durch' },
        { key: 'abschluss_geprueft', label: 'Abschluss geprüft durch' }
      ]
    }
  ];

  let content = '';
  
  sections.forEach(section => {
    content += `<div class="section">
      <h3>${section.title}</h3>`;
    
    section.items.forEach(item => {
      const value = answers[item.key];
      if (value !== undefined && value !== null && value !== '') {
        let displayValue = value;
        
        if (typeof value === 'boolean') {
          displayValue = value ? 
            '<span class="checkbox-yes">✓ Ja</span>' : 
            '<span class="checkbox-no">✗ Nein</span>';
        }
        
        content += `
          <div class="answer-item">
            <span class="answer-question">${item.label}:</span>
            <span class="answer-value">${displayValue}</span>
          </div>`;
      }
    });
    
    content += `</div>`;
  });

  // Add dynamic panel data
  if (answers.mitarbeiter_liste && answers.mitarbeiter_liste.length > 0) {
    content += `<div class="section">
      <h3>Beteiligte Mitarbeiter</h3>
      <div class="panel-data">`;
    
    answers.mitarbeiter_liste.forEach((mitarbeiter: any, index: number) => {
      content += `
        <div class="answer-item">
          <span class="answer-question">Mitarbeiter ${index + 1}:</span>
          <span class="answer-value">${mitarbeiter.name} (${mitarbeiter.kuerzel})</span>
        </div>`;
    });
    
    content += `</div></div>`;
  }

  if (answers.bulk_beutel_production && answers.bulk_beutel_production.length > 0) {
    content += `<div class="section">
      <h3>Bulk-Beutel Produktion</h3>`;
    
    answers.bulk_beutel_production.forEach((bulk: any, index: number) => {
      content += `
        <div class="subsection">
          <h4>Bulk-Beutel ${index + 1}</h4>
          <div class="panel-data">
            <div class="answer-item">
              <span class="answer-question">Bulk-Nummer:</span>
              <span class="answer-value">${bulk.bulk_nummer || 'Nicht angegeben'}</span>
            </div>
            <div class="answer-item">
              <span class="answer-question">Ist-Inhalt (g):</span>
              <span class="answer-value">${bulk.ist_inhalt || 'Nicht angegeben'}</span>
            </div>
            <div class="answer-item">
              <span class="answer-question">Anzahl Gebinde:</span>
              <span class="answer-value">${bulk.anzahl_gebinde || 'Nicht angegeben'}</span>
            </div>
            <div class="answer-item">
              <span class="answer-question">Füllmenge gesamt (g):</span>
              <span class="answer-value">${bulk.fuellmenge_gesamt || 'Nicht angegeben'}</span>
            </div>
            <div class="answer-item">
              <span class="answer-question">Restmenge Bulk (g):</span>
              <span class="answer-value">${bulk.restmenge_bulk || 'Nicht angegeben'}</span>
            </div>
          </div>
        </div>`;
    });
    
    content += `</div>`;
  }

  return content;
};