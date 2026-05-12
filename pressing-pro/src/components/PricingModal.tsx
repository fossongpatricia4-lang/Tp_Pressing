import React, { useState } from 'react';
import { PricingTable, Size } from '../types';
import { saveConfig } from '../db/indexedDB';

const TYPES = ['Chemise','Pantalon','Jupe','Robe','Veste','Manteau',
  'Paire de chaussures','Sac','Linge de lit','Serviette','Autre'];
const SIZES: Size[] = ['S','M','L','XL'];

interface Props {
  pricing: PricingTable;
  ownerPin: string;
  onSave: (pricing: PricingTable, pin: string) => void;
  onClose: () => void;
}

export default function PricingModal({ pricing, ownerPin, onSave, onClose }: Props) {
  const [local, setLocal] = useState<PricingTable>(JSON.parse(JSON.stringify(pricing)));
  const [newPin, setNewPin] = useState('');

  const update = (type: string, size: Size, value: string) => {
    setLocal((prev) => ({
      ...prev,
      [type]: { ...prev[type], [size]: parseInt(value) || 0 },
    }));
  };

  const handleSave = async () => {
    let pin = ownerPin;
    if (newPin) {
      if (!/^\d{4}$/.test(newPin)) { alert('Le PIN doit être exactement 4 chiffres.'); return; }
      pin = newPin;
      await saveConfig('pin', pin);
    }
    await saveConfig('pricing', local);
    onSave(local, pin);
    alert('✅ Paramètres sauvegardés !');
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>⚙ Paramètres</h2></div>
        <div className="modal-body">
          <div className="settings-section">
            <label>Changer le PIN gérant</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="password" maxLength={4} placeholder="Nouveau PIN (4 chiffres)"
                value={newPin} onChange={(e) => setNewPin(e.target.value)}
                style={{ flex: 1, padding: '10px 13px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text)' }} />
            </div>
          </div>
          <p className="pricing-intro">Grille tarifaire (F CFA par pièce)</p>
          {TYPES.map((type) => (
            <div key={type} className="pricing-type-block">
              <div className="pricing-type-name">{type}</div>
              <div className="pricing-sizes">
                {SIZES.map((size) => (
                  <div key={size}>
                    <div className="size-label">{size}</div>
                    <input type="number" min={0} step={50}
                      value={local[type]?.[size] ?? 500}
                      onChange={(e) => update(type, size, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Fermer</button>
          <button className="submit-btn" onClick={handleSave}>💾 Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}
