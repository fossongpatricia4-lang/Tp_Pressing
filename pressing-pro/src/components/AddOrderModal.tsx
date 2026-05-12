import React, { useState } from 'react';
import { Order, OrderItem, Size, PricingTable } from '../types';
import { uid, today, defaultPickup, fmtMoney } from '../hooks/useOrders';

const TYPES = ['Chemise','Pantalon','Jupe','Robe','Veste','Manteau',
  'Paire de chaussures','Sac','Linge de lit','Serviette','Autre'];
const SIZES: Size[] = ['S','M','L','XL'];

interface CartRow { type: string; color: string; size: Size; qty: number; }

interface Props {
  pricing: PricingTable;
  onSave: (order: Order) => void;
  onClose: () => void;
}

export default function AddOrderModal({ pricing, onSave, onClose }: Props) {
  const [client, setClient] = useState('');
  const [pickup, setPickup] = useState(defaultPickup());
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<CartRow[]>([
    { type: 'Chemise', color: '', size: 'M', qty: 1 },
  ]);

  const getPrice = (type: string, size: Size) =>
    pricing[type]?.[size] ?? 500;

  const addRow = () =>
    setRows((r) => [...r, { type: 'Chemise', color: '', size: 'M', qty: 1 }]);

  const removeRow = (i: number) =>
    setRows((r) => r.filter((_, idx) => idx !== i));

  const updateRow = (i: number, field: keyof CartRow, value: string | number) =>
    setRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  const totalPrice = rows.reduce((s, r) => s + getPrice(r.type, r.size) * r.qty, 0);

  const handleSubmit = () => {
    if (!client.trim()) { alert('Veuillez entrer le nom du client.'); return; }
    if (rows.length === 0) { alert('Ajoutez au moins un article.'); return; }
    const items: OrderItem[] = rows.map((r) => ({
      type: r.type, color: r.color, size: r.size,
      qty: Math.max(1, r.qty), unitPrice: getPrice(r.type, r.size), donePcs: 0,
    }));
    onSave({ id: uid(), client: client.trim(), deposited: today(),
      pickup, notes, items, payments: [] });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>Nouvelle commande</h2></div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Nom du client</label>
              <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Ex: Marie Nguemo" />
            </div>
            <div className="form-group">
              <label>Retrait estimé</label>
              <input type="date" value={pickup} onChange={(e) => setPickup(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Délicat, pas de séchoir..." />
          </div>

          <div className="cart-section">
            <div className="cart-title">
              <span>Articles</span>
              <span className="cart-count">{rows.reduce((s,r)=>s+r.qty,0)} pièce(s)</span>
            </div>
            <div className="cart-col-heads">
              <span>Type</span><span>Couleur</span><span>Taille</span><span>Qté</span><span>Prix</span><span></span>
            </div>
            {rows.map((row, i) => (
              <div key={i} className="cart-row">
                <select value={row.type} onChange={(e) => updateRow(i, 'type', e.target.value)}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input value={row.color} onChange={(e) => updateRow(i, 'color', e.target.value)} placeholder="Couleur" />
                <select value={row.size} onChange={(e) => updateRow(i, 'size', e.target.value as Size)}>
                  {SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <input type="number" min={1} value={row.qty}
                  onChange={(e) => updateRow(i, 'qty', parseInt(e.target.value) || 1)} />
                <div className="row-price">{fmtMoney(getPrice(row.type, row.size) * row.qty)}</div>
                <button className="remove-row-btn" onClick={() => removeRow(i)}>×</button>
              </div>
            ))}
            <button className="add-row-btn" onClick={addRow}>+ Ajouter un article</button>
            {rows.length > 0 && (
              <div className="order-summary-box">
                {rows.map((r, i) => (
                  <div key={i} className="sum-row">
                    <span>{r.qty}× {r.type} ({r.size}{r.color ? ' · ' + r.color : ''})</span>
                    <span>{fmtMoney(getPrice(r.type, r.size) * r.qty)}</span>
                  </div>
                ))}
                <div className="sum-row total">
                  <span>TOTAL</span><span>{fmtMoney(totalPrice)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Annuler</button>
          <button className="submit-btn" onClick={handleSubmit}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
