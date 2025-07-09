import React, { useState, useEffect } from 'react';
import { ProductionOrder } from '../types';
import sampleOrders from '../data/sampleOrders.json';
import './ProductionOrderManager.css';

interface ProductionOrderManagerProps {
  onOrderSelected: (order: ProductionOrder) => void;
  currentOrder: ProductionOrder | null;
  onContinueSurvey: () => void;
}

const ProductionOrderManager: React.FC<ProductionOrderManagerProps> = ({
  onOrderSelected,
  currentOrder,
  onContinueSurvey
}) => {
  const [orders, setOrders] = useState<ProductionOrder[]>(sampleOrders as ProductionOrder[]);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [newOrder, setNewOrder] = useState<Partial<ProductionOrder>>({
    produktName: '',
    materialType: 'GACP',
    eingangsmaterial: {
      artikelNummer: '',
      charge: '',
      verfallsdatum: '',
      eingangsMenge: 0
    },
    schablone: {
      eqNummer: '',
      charge: '',
      anzahl: 0
    },
    primaerPackmittel: {
      artikelNummer: '',
      charge: '',
      anzahl: 0
    },
    zwischenprodukt: {
      artikelNummer: '',
      gebindeNummer: ''
    },
    probenzug: {
      plan: '',
      anzahl: 2,
      fuellmenge: 10
    },
    bulkBeutelAnzahl: 1
  });

  useEffect(() => {
    const savedOrders = localStorage.getItem('productionOrders');
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        setOrders(parsed);
      } catch (error) {
        console.error('Error loading saved orders:', error);
      }
    }
  }, []);

  const handleSelectOrder = () => {
    const order = orders.find(o => o.id === selectedOrderId);
    if (order) {
      onOrderSelected(order);
    }
  };

  const handleCreateOrder = () => {
    if (!newOrder.produktName || !newOrder.materialType || !newOrder.eingangsmaterial || !newOrder.primaerPackmittel || !newOrder.zwischenprodukt || !newOrder.probenzug) {
      alert('Bitte füllen Sie alle erforderlichen Felder aus.');
      return;
    }

    const order: ProductionOrder = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      produktName: newOrder.produktName,
      materialType: newOrder.materialType as 'GACP' | 'GMP',
      eingangsmaterial: newOrder.eingangsmaterial,
      schablone: newOrder.schablone,
      primaerPackmittel: newOrder.primaerPackmittel,
      zwischenprodukt: newOrder.zwischenprodukt,
      probenzug: newOrder.probenzug,
      bulkBeutelAnzahl: newOrder.bulkBeutelAnzahl || 1
    };

    const updatedOrders = [...orders, order];
    setOrders(updatedOrders);
    localStorage.setItem('productionOrders', JSON.stringify(updatedOrders));
    
    onOrderSelected(order);
    setShowNewOrderForm(false);
    setNewOrder({
      produktName: '',
      materialType: 'GACP',
      eingangsmaterial: {
        artikelNummer: '',
        charge: '',
        verfallsdatum: '',
        eingangsMenge: 0
      },
      schablone: {
        eqNummer: '',
        charge: '',
        anzahl: 0
      },
      primaerPackmittel: {
        artikelNummer: '',
        charge: '',
        anzahl: 0
      },
      zwischenprodukt: {
        artikelNummer: '',
        gebindeNummer: ''
      },
      probenzug: {
        plan: '',
        anzahl: 2,
        fuellmenge: 10
      },
      bulkBeutelAnzahl: 1
    });
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setNewOrder(prev => {
      const currentSection = prev[section as keyof typeof prev] as any;
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: value
        }
      };
    });
  };

  const handleDirectInputChange = (field: string, value: any) => {
    setNewOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (currentOrder) {
    return (
      <div className="order-manager">
        <div className="current-order-info">
          <h2>Aktueller Produktionsauftrag</h2>
          <div className="order-details">
            <p><strong>Produkt:</strong> {currentOrder.produktName}</p>
            <p><strong>Material-Typ:</strong> {currentOrder.materialType}</p>
            <p><strong>Eingangsmaterial:</strong> {currentOrder.eingangsmaterial.artikelNummer} (Charge: {currentOrder.eingangsmaterial.charge})</p>
            <p><strong>Bulk-Beutel Anzahl:</strong> {currentOrder.bulkBeutelAnzahl}</p>
          </div>
          <div className="order-actions">
            <button className="btn btn-primary" onClick={onContinueSurvey}>
              Fragekatalog fortsetzen
            </button>
            <button className="btn btn-secondary" onClick={() => setShowNewOrderForm(true)}>
              Neuen Auftrag erstellen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-manager">
      <h2>Produktionsauftrag auswählen oder erstellen</h2>
      
      {!showNewOrderForm ? (
        <div className="order-selection">
          <div className="select-existing">
            <h3>Vorhandenen Auftrag auswählen</h3>
            <select 
              value={selectedOrderId} 
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="order-select"
            >
              <option value="">Bitte auswählen...</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.produktName} ({order.materialType}) - {new Date(order.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <button 
              className="btn btn-primary" 
              onClick={handleSelectOrder}
              disabled={!selectedOrderId}
            >
              Auftrag laden
            </button>
          </div>
          
          <div className="create-new">
            <h3>Neuen Auftrag erstellen</h3>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowNewOrderForm(true)}
            >
              Neuen Produktionsauftrag anlegen
            </button>
          </div>
        </div>
      ) : (
        <div className="new-order-form">
          <h3>Neuen Produktionsauftrag erstellen</h3>
          
          <div className="form-group">
            <label>Produktname *</label>
            <input
              type="text"
              value={newOrder.produktName}
              onChange={(e) => handleDirectInputChange('produktName', e.target.value)}
              placeholder="z.B. Cannabis Blüten 20% THC"
            />
          </div>

          <div className="form-group">
            <label>Material-Typ *</label>
            <select
              value={newOrder.materialType}
              onChange={(e) => handleDirectInputChange('materialType', e.target.value)}
            >
              <option value="GACP">GACP</option>
              <option value="GMP">GMP</option>
            </select>
          </div>

          <div className="form-section">
            <h4>Eingangsmaterial</h4>
            <div className="form-group">
              <label>Artikelnummer *</label>
              <input
                type="text"
                value={newOrder.eingangsmaterial?.artikelNummer}
                onChange={(e) => handleInputChange('eingangsmaterial', 'artikelNummer', e.target.value)}
                placeholder="z.B. CAN-001"
              />
            </div>
            <div className="form-group">
              <label>Charge *</label>
              <input
                type="text"
                value={newOrder.eingangsmaterial?.charge}
                onChange={(e) => handleInputChange('eingangsmaterial', 'charge', e.target.value)}
                placeholder="z.B. 2024-001"
              />
            </div>
            <div className="form-group">
              <label>Verfallsdatum *</label>
              <input
                type="date"
                value={newOrder.eingangsmaterial?.verfallsdatum}
                onChange={(e) => handleInputChange('eingangsmaterial', 'verfallsdatum', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Eingangsmenge (g) *</label>
              <input
                type="number"
                value={newOrder.eingangsmaterial?.eingangsMenge}
                onChange={(e) => handleInputChange('eingangsmaterial', 'eingangsMenge', parseFloat(e.target.value))}
                placeholder="z.B. 1000"
              />
            </div>
          </div>

          {newOrder.materialType === 'GACP' && (
            <div className="form-section">
              <h4>Schablone (nur GACP)</h4>
              <div className="form-group">
                <label>EQ-Nummer</label>
                <input
                  type="text"
                  value={newOrder.schablone?.eqNummer}
                  onChange={(e) => handleInputChange('schablone', 'eqNummer', e.target.value)}
                  placeholder="z.B. EQ-001"
                />
              </div>
              <div className="form-group">
                <label>Charge</label>
                <input
                  type="text"
                  value={newOrder.schablone?.charge}
                  onChange={(e) => handleInputChange('schablone', 'charge', e.target.value)}
                  placeholder="z.B. SCH-001"
                />
              </div>
              <div className="form-group">
                <label>Anzahl</label>
                <input
                  type="number"
                  value={newOrder.schablone?.anzahl}
                  onChange={(e) => handleInputChange('schablone', 'anzahl', parseInt(e.target.value))}
                  placeholder="z.B. 5"
                />
              </div>
            </div>
          )}

          <div className="form-section">
            <h4>Primärpackmittel</h4>
            <div className="form-group">
              <label>Artikelnummer *</label>
              <input
                type="text"
                value={newOrder.primaerPackmittel?.artikelNummer}
                onChange={(e) => handleInputChange('primaerPackmittel', 'artikelNummer', e.target.value)}
                placeholder="z.B. PKM-001"
              />
            </div>
            <div className="form-group">
              <label>Charge *</label>
              <input
                type="text"
                value={newOrder.primaerPackmittel?.charge}
                onChange={(e) => handleInputChange('primaerPackmittel', 'charge', e.target.value)}
                placeholder="z.B. PKM-2024-001"
              />
            </div>
            <div className="form-group">
              <label>Anzahl *</label>
              <input
                type="number"
                value={newOrder.primaerPackmittel?.anzahl}
                onChange={(e) => handleInputChange('primaerPackmittel', 'anzahl', parseInt(e.target.value))}
                placeholder="z.B. 100"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Zwischenprodukt</h4>
            <div className="form-group">
              <label>Artikelnummer *</label>
              <input
                type="text"
                value={newOrder.zwischenprodukt?.artikelNummer}
                onChange={(e) => handleInputChange('zwischenprodukt', 'artikelNummer', e.target.value)}
                placeholder="z.B. ZP-001"
              />
            </div>
            <div className="form-group">
              <label>Gebinde-Nummer *</label>
              <input
                type="text"
                value={newOrder.zwischenprodukt?.gebindeNummer}
                onChange={(e) => handleInputChange('zwischenprodukt', 'gebindeNummer', e.target.value)}
                placeholder="z.B. GB-001"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Probenzug</h4>
            <div className="form-group">
              <label>Plan</label>
              <input
                type="text"
                value={newOrder.probenzug?.plan}
                onChange={(e) => handleInputChange('probenzug', 'plan', e.target.value)}
                placeholder="z.B. Standardprobenzug"
              />
            </div>
            <div className="form-group">
              <label>Anzahl Proben</label>
              <input
                type="number"
                value={newOrder.probenzug?.anzahl}
                onChange={(e) => handleInputChange('probenzug', 'anzahl', parseInt(e.target.value))}
                placeholder="z.B. 2"
              />
            </div>
            <div className="form-group">
              <label>Füllmenge pro Probe (g)</label>
              <input
                type="number"
                value={newOrder.probenzug?.fuellmenge}
                onChange={(e) => handleInputChange('probenzug', 'fuellmenge', parseFloat(e.target.value))}
                placeholder="z.B. 10"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Anzahl Bulk-Beutel *</label>
            <input
              type="number"
              min="1"
              value={newOrder.bulkBeutelAnzahl}
              onChange={(e) => handleDirectInputChange('bulkBeutelAnzahl', parseInt(e.target.value))}
              placeholder="z.B. 3"
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleCreateOrder}>
              Auftrag erstellen und starten
            </button>
            <button className="btn btn-secondary" onClick={() => setShowNewOrderForm(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionOrderManager;