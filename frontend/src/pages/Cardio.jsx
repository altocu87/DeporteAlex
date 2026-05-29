import { useEffect, useState } from 'react';
import { Wind, Plus } from 'lucide-react';
import { api } from '../api/client.js';
import CardioCard from '../components/cardio/CardioCard.jsx';
import CardioForm from '../components/cardio/CardioForm.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function Cardio() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setSessions(await api.get('/cardio?limit=50'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setModalOpen(true); }
  function openEdit(s) { setEditing(s); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta sesión?')) return;
    await api.delete(`/cardio/${id}`);
    setSessions(s => s.filter(x => x.id !== id));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="hidden lg:block text-2xl font-bold text-text-primary">Cardio</h1>
        <Button onClick={openNew}><Plus size={16} />Nueva sesión</Button>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" size={32} />
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Wind size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">Sin sesiones de cardio</p>
          <p className="text-sm mb-4">Registra tu primera sesión</p>
          <Button onClick={openNew}><Plus size={16} />Nueva sesión</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => (
            <CardioCard key={s.id} session={s} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar sesión' : 'Nueva sesión de cardio'}
        size="lg"
      >
        <CardioForm
          initial={editing}
          onSaved={() => { closeModal(); load(); }}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
