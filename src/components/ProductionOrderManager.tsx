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
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'edit' | 'create'>('list');
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


  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setEditingOrder(order);
      setViewMode('details');
    }
  };

  const handleEditOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setEditingOrder(order);
      setNewOrder({...order});
      setViewMode('edit');
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diesen Produktionsauftrag löschen möchten?')) {
      const updatedOrders = orders.filter(o => o.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('productionOrders', JSON.stringify(updatedOrders));
    }
  };

  const handleUpdateOrder = () => {
    if (!newOrder.produktName || !editingOrder) return;

    const updatedOrder: ProductionOrder = {
      ...editingOrder,
      produktName: newOrder.produktName,
      materialType: newOrder.materialType as 'GACP' | 'GMP',
      eingangsmaterial: newOrder.eingangsmaterial!,
      schablone: newOrder.schablone,
      primaerPackmittel: newOrder.primaerPackmittel!,
      zwischenprodukt: newOrder.zwischenprodukt!,
      probenzug: newOrder.probenzug!,
      bulkBeutelAnzahl: newOrder.bulkBeutelAnzahl || 1
    };

    const updatedOrders = orders.map(o => o.id === editingOrder.id ? updatedOrder : o);
    setOrders(updatedOrders);
    localStorage.setItem('productionOrders', JSON.stringify(updatedOrders));
    
    setViewMode('list');
    setEditingOrder(null);
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
            <button className="btn btn-secondary" onClick={() => setViewMode('create')}>
              Neuen Auftrag erstellen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-manager">
      {viewMode === 'list' && (
        <>
          <div className="order-manager-header">
            <h2>Produktionsaufträge</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setViewMode('create')}
            >
              + Neuer Auftrag
            </button>
          </div>
          
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <h3>{order.produktName}</h3>
                  <span className={`material-type ${order.materialType.toLowerCase()}`}>
                    {order.materialType}
                  </span>
                </div>
                <div className="order-card-body">
                  <p><strong>Erstellt:</strong> {new Date(order.createdAt).toLocaleDateString('de-DE')}</p>
                  <p><strong>Eingangsmaterial:</strong> {order.eingangsmaterial.artikelNummer}</p>
                  <p><strong>Charge:</strong> {order.eingangsmaterial.charge}</p>
                  <p><strong>Bulk-Beutel:</strong> {order.bulkBeutelAnzahl}</p>
                </div>
                <div className="order-card-actions">
                  <button 
                    className="btn btn-primary btn-small"
                    onClick={() => onOrderSelected(order)}
                  >
                    Fragekatalog starten
                  </button>
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    Details
                  </button>
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => handleEditOrder(order.id)}
                  >
                    Bearbeiten
                  </button>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {viewMode === 'details' && editingOrder && (
        <div className="order-details-view">
          <div className="details-header">
            <button 
              className="btn btn-back"
              onClick={() => setViewMode('list')}
            >
              ← Zurück
            </button>
            <h2>Produktionsauftrag Details</h2>
            <div className="details-actions">
              <button 
                className="btn btn-primary"
                onClick={() => onOrderSelected(editingOrder)}
              >
                Fragekatalog starten
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => handleEditOrder(editingOrder.id)}
              >
                Bearbeiten
              </button>
            </div>
          </div>
          
          <div className="details-content">
            <div className="details-section">
              <h3>Grunddaten</h3>
              <div className="details-grid">
                <div><strong>Produktname:</strong> {editingOrder.produktName}</div>
                <div><strong>Material-Typ:</strong> {editingOrder.materialType}</div>
                <div><strong>Erstellt am:</strong> {new Date(editingOrder.createdAt).toLocaleDateString('de-DE')}</div>
                <div><strong>Bulk-Beutel Anzahl:</strong> {editingOrder.bulkBeutelAnzahl}</div>
              </div>
            </div>

            <div className="details-section">
              <h3>Eingangsmaterial</h3>
              <div className="details-grid">
                <div><strong>Artikelnummer:</strong> {editingOrder.eingangsmaterial.artikelNummer}</div>
                <div><strong>Charge:</strong> {editingOrder.eingangsmaterial.charge}</div>
                <div><strong>Verfallsdatum:</strong> {editingOrder.eingangsmaterial.verfallsdatum}</div>
                <div><strong>Eingangsmenge:</strong> {editingOrder.eingangsmaterial.eingangsMenge} g</div>
              </div>
            </div>

            {editingOrder.schablone && (
              <div className="details-section">
                <h3>Schablone</h3>
                <div className="details-grid">
                  <div><strong>EQ-Nummer:</strong> {editingOrder.schablone.eqNummer}</div>
                  <div><strong>Charge:</strong> {editingOrder.schablone.charge}</div>
                  <div><strong>Anzahl:</strong> {editingOrder.schablone.anzahl}</div>
                </div>
              </div>
            )}

            <div className="details-section">
              <h3>Primärpackmittel</h3>
              <div className="details-grid">
                <div><strong>Artikelnummer:</strong> {editingOrder.primaerPackmittel.artikelNummer}</div>
                <div><strong>Charge:</strong> {editingOrder.primaerPackmittel.charge}</div>
                <div><strong>Anzahl:</strong> {editingOrder.primaerPackmittel.anzahl}</div>
              </div>
            </div>

            <div className="details-section">
              <h3>Zwischenprodukt</h3>
              <div className="details-grid">
                <div><strong>Artikelnummer:</strong> {editingOrder.zwischenprodukt.artikelNummer}</div>
                <div><strong>Gebinde-Nummer:</strong> {editingOrder.zwischenprodukt.gebindeNummer}</div>
              </div>
            </div>

            <div className="details-section">
              <h3>Probenzug</h3>
              <div className="details-grid">
                <div><strong>Plan:</strong> {editingOrder.probenzug.plan}</div>
                <div><strong>Anzahl:</strong> {editingOrder.probenzug.anzahl}</div>
                <div><strong>Füllmenge:</strong> {editingOrder.probenzug.fuellmenge} g</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="new-order-form">
          <div className="form-header">
            <button 
              className="btn btn-back"
              onClick={() => setViewMode('list')}
            >
              ← Zurück
            </button>
            <h3>{viewMode === 'edit' ? 'Produktionsauftrag bearbeiten' : 'Neuen Produktionsauftrag erstellen'}</h3>
          </div>
          
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
            <button 
              className="btn btn-primary" 
              onClick={viewMode === 'edit' ? handleUpdateOrder : handleCreateOrder}
            >
              {viewMode === 'edit' ? 'Änderungen speichern' : 'Auftrag erstellen und starten'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setViewMode('list')}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionOrderManager;