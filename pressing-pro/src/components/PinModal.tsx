import React, { useState } from 'react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  ownerPin: string;
}

export default function PinModal({ onSuccess, onCancel, ownerPin }: Props) {
  const [buffer, setBuffer] = useState('');
  const [error, setError] = useState('');

  const handleKey = (k: string) => {
    if (buffer.length >= 4) return;
    const next = buffer + k;
    setBuffer(next);
    setError('');
    if (next.length === 4) {
      setTimeout(() => {
        if (next === ownerPin) {
          onSuccess();
        } else {
          setError('PIN incorrect. Réessayez.');
          setBuffer('');
        }
      }, 150);
    }
  };

  const handleDel = () => setBuffer((b) => b.slice(0, -1));

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal modal-xs" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div className="pin-wrap">
            <div className="pin-icon">🔐</div>
            <h2 className="pin-title">Accès gérant</h2>
            <p className="pin-sub">Entrez votre code PIN à 4 chiffres</p>
            <div className="pin-dots">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`pin-dot ${i < buffer.length ? 'filled' : ''}`} />
              ))}
            </div>
            <div className="pin-pad">
              {['1','2','3','4','5','6','7','8','9'].map((k) => (
                <button key={k} className="pin-key" onClick={() => handleKey(k)}>{k}</button>
              ))}
              <button className="pin-key del" onClick={handleDel}>⌫</button>
              <button className="pin-key" onClick={() => handleKey('0')}>0</button>
              <button className="pin-key del" onClick={onCancel}>✕</button>
            </div>
            {error && <p className="pin-error">{error}</p>}
            <p className="pin-hint">PIN par défaut: <strong>1234</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
