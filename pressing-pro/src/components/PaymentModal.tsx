import React, { useState, useEffect } from 'react';
import { Order, PaymentMethod } from '../types';
import { orderDue, orderTotal, orderPaid, fmtMoney, today } from '../hooks/useOrders';

interface Props {
  order: Order;
  onConfirm: (updated: Order) => void;
  onClose: () => void;
}

const METHODS: { key: string; method: PaymentMethod; icon: string }[] = [
  { key: 'cash', method: 'Espèces', icon: '💵' },
  { key: 'mobile', method: 'Mobile Money', icon: '📱' },
  { key: 'card', method: 'Carte', icon: '💳' },
];

export default function PaymentModal({ order, onConfirm, onClose }: Props) {
  const due = orderDue(order);
  const total = orderTotal(order);
  const paid = orderPaid(order);
  const [method, setMethod] = useState<PaymentMethod>('Espèces');
  const [amount, setAmount] = useState(String(due));

  const entered = parseFloat(amount) || 0;
  const change = entered - due;

  const handleConfirm = () => {
    if (entered <= 0) { alert('Veuillez entrer un montant.'); return; }
    const actualAmount = Math.min(entered, due);
    const updated: Order = {
      ...order,
      payments: [...(order.payments || []), { date: today(), method, amount: actualAmount }],
    };
    onConfirm(updated);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>💰 Encaisser un paiement</h2></div>
        <div className="modal-body">
          <div className="pay-total">{fmtMoney(due)}</div>
          <div className="pay-subtitle">
            Total: {fmtMoney(total)}{paid > 0 ? ` · Déjà payé: ${fmtMoney(paid)}` : ''}
          </div>
          <div className="form-group">
            <label>Mode de paiement</label>
            <div className="pay-methods">
              {METHODS.map(({ key, method: m, icon }) => (
                <button key={key} className={`pay-method ${method === m ? 'selected' : ''}`}
                  onClick={() => setMethod(m)}>
                  {icon} {m}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Montant reçu (F CFA)</label>
            <input className="pay-amount-input" type="number" min={0}
              value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          {entered > 0 && (
            <div className="pay-change">
              {change > 0 ? `Monnaie à rendre: ${fmtMoney(change)}`
               : change < 0 ? `Reste dû après ce paiement: ${fmtMoney(Math.abs(change))}`
               : '✓ Paiement exact'}
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Annuler</button>
          <button className="pay-submit-btn" onClick={handleConfirm}>✓ Valider</button>
        </div>
      </div>
    </div>
  );
}
