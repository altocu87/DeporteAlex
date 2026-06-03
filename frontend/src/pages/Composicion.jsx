import { useEffect, useState } from 'react';
import { Activity, Plus } from 'lucide-react';
import { api } from '../api/client.js';
import ComposicionCard from '../components/composicion/ComposicionCard.jsx';
import ComposicionForm from '../components/composicion/ComposicionForm.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function Composicion() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setRecords(await api.get('/composition?limit=50'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setModalOpen(true); }
  function openEdit(r) { setEditing(r); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este registro de composición?')) return;
    await api.delete(`/composition/${id}`);
    setRecords(r => r.filter(x => x.id !== id));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="hidden lg:block text-2xl font-bold text-text-primary">Composición Corporal</h1>
        <Button onClick={openNew}><Plus size={16} />Nueva lectura</Button>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" size={32} />
      ) : records.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Activity size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">Sin lecturas registradas</p>
          <p className="text-sm mb-4">Registra los datos de tu báscula Healthkeep FG2001B-A</p>
          <Button onClick={openNew}><Plus size={16} />Nueva lectura</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(r => (
            <ComposicionCard key={r.id} record={r} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar composición corporal' : 'Nueva lectura — Healthkeep FG2001B-A'}
        size="lg"
      >
        <ComposicionForm
          initial={editing}
          onSaved={() => { closeModal(); load(); }}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
