import React, { useState, useCallback } from 'react';
import { Order, AppMode, PricingTable } from './types';
import { useOrders } from './hooks/useOrders';
import { getConfig } from './db/indexedDB';
import PinModal from './components/PinModal';
import ClientView from './components/ClientView';
import OwnerView from './components/OwnerView';
import AddOrderModal from './components/AddOrderModal';
import PaymentModal from './components/PaymentModal';
import ReceiptModal from './components/ReceiptModal';
import PricingModal from './components/PricingModal';

const DEFAULT_PRICING: PricingTable = {
  'Chemise':             { S:500,  M:600,  L:700,  XL:800  },
  'Pantalon':            { S:700,  M:800,  L:900,  XL:1000 },
  'Jupe':                { S:500,  M:600,  L:700,  XL:800  },
  'Robe':                { S:800,  M:1000, L:1200, XL:1400 },
  'Veste':               { S:1000, M:1200, L:1400, XL:1600 },
  'Manteau':             { S:1500, M:1800, L:2000, XL:2200 },
  'Paire de chaussures': { S:600,  M:600,  L:700,  XL:700  },
  'Sac':                 { S:500,  M:700,  L:900,  XL:1100 },
  'Linge de lit':        { S:1000, M:1200, L:1500, XL:1800 },
  'Serviette':           { S:300,  M:400,  L:500,  XL:600  },
  'Autre':               { S:500,  M:700,  L:900,  XL:1100 },
};

export default function App() {
  const { orders, addOrder, updateOrder, removeOrder } = useOrders();
  const [mode, setMode] = useState<AppMode>('client');
  const [ownerUnlocked, setOwnerUnlocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [ownerPin, setOwnerPin] = useState('1234');
  const [pricing, setPricing] = useState<PricingTable>(DEFAULT_PRICING);
  const [dark, setDark] = useState(false);

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [payOrderId, setPayOrderId] = useState<string | null>(null);
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);
  const [receiptIsOwner, setReceiptIsOwner] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  // Client view search
  const [clientSearch, setClientSearch] = useState('');

  // Load config from IndexedDB on mount
  React.useEffect(() => {
    getConfig<PricingTable>('pricing').then((p) => { if (p) setPricing(p); });
    getConfig<string>('pin').then((p) => { if (p) setOwnerPin(p); });
    document.documentElement.style.setProperty('color-scheme', 'light dark');
  }, []);

  // Dark mode
  React.useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  const switchToOwner = () => {
    if (ownerUnlocked) { setMode('owner'); }
    else { setShowPin(true); }
  };
  const switchToClient = () => setMode('client');
  const lockOwner = () => { setOwnerUnlocked(false); setMode('client'); };

  const handlePinSuccess = () => {
    setOwnerUnlocked(true);
    setShowPin(false);
    setMode('owner');
  };

  const handleToggleItem = useCallback(async (orderId: string, idx: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const items = order.items.map((item, i) =>
      i === idx ? { ...item, donePcs: (item.donePcs || 0) >= item.qty ? 0 : item.qty } : item
    );
    await updateOrder({ ...order, items });
  }, [orders, updateOrder]);

  const handleMarkAllDone = useCallback(async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    await updateOrder({ ...order, items: order.items.map((i) => ({ ...i, donePcs: i.qty })) });
  }, [orders, updateOrder]);

  const handlePayConfirm = useCallback(async (updated: Order) => {
    await updateOrder(updated);
  }, [updateOrder]);

  const openClientReceipt = (id: string) => { setReceiptOrderId(id); setReceiptIsOwner(false); };
  const openOwnerReceipt  = (id: string) => { setReceiptOrderId(id); setReceiptIsOwner(true); };

  const payOrder = payOrderId ? orders.find((o) => o.id === payOrderId) : null;
  const receiptOrder = receiptOrderId ? orders.find((o) => o.id === receiptOrderId) : null;

  return (
    <>
      {/* Mode bar */}
      <div className="mode-bar">
        <div className="mode-tabs">
          <button className={`mode-tab ${mode === 'client' ? 'active' : ''}`} onClick={switchToClient}>
            👤 Client
          </button>
          <button className={`mode-tab owner-tab ${mode === 'owner' ? 'active' : ''}`} onClick={switchToOwner}>
            🔒 Gérant
          </button>
        </div>
        <div className="mode-right">
          <span className={mode === 'owner' ? 'owner-tag' : 'client-tag'}>
            {mode === 'owner' ? 'Mode gérant' : 'Mode client'}
          </span>
          <button className="dark-btn" onClick={() => setDark((d) => !d)} />
        </div>
      </div>

      {/* Views */}
      {mode === 'client' ? (
        <ClientView
          orders={orders}
          search={clientSearch}
          setSearch={setClientSearch}
          onNewOrder={() => setShowAdd(true)}
          onReceipt={openClientReceipt}
        />
      ) : (
        <OwnerView
          orders={orders}
          onToggleItem={handleToggleItem}
          onMarkAllDone={handleMarkAllDone}
          onRemove={removeOrder}
          onPay={(id) => setPayOrderId(id)}
          onReceipt={openOwnerReceipt}
          onNewOrder={() => setShowAdd(true)}
          onLock={lockOwner}
          onOpenPricing={() => setShowPricing(true)}
        />
      )}

      {/* Modals */}
      {showPin && (
        <PinModal ownerPin={ownerPin} onSuccess={handlePinSuccess} onCancel={() => setShowPin(false)} />
      )}
      {showAdd && (
        <AddOrderModal pricing={pricing} onSave={addOrder} onClose={() => setShowAdd(false)} />
      )}
      {payOrder && (
        <PaymentModal order={payOrder} onConfirm={handlePayConfirm} onClose={() => setPayOrderId(null)} />
      )}
      {receiptOrder && (
        <ReceiptModal order={receiptOrder} isOwner={receiptIsOwner} onClose={() => setReceiptOrderId(null)} />
      )}
      {showPricing && (
        <PricingModal
          pricing={pricing}
          ownerPin={ownerPin}
          onSave={(p, pin) => { setPricing(p); setOwnerPin(pin); }}
          onClose={() => setShowPricing(false)}
        />
      )}
    </>
  );
}
