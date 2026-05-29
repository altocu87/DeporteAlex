import { useEffect, useState } from 'react';
import { Ruler, Plus } from 'lucide-react';
import { api } from '../api/client.js';
import MeasurementCard from '../components/measurements/MeasurementCard.jsx';
import MeasurementForm from '../components/measurements/MeasurementForm.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function Measurements() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setMeasurements(await api.get('/measurements?limit=50'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setModalOpen(true); }
  function openEdit(m) { setEditing(m); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta medida?')) return;
    await api.delete(`/measurements/${id}`);
    setMeasurements(m => m.filter(x => x.id !== id));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="hidden lg:block text-2xl font-bold text-text-primary">Medidas Corporales</h1>
        <Button onClick={openNew}><Plus size={16} />Anotar medidas</Button>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" size={32} />
      ) : measurements.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Ruler size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">Sin medidas registradas</p>
          <p className="text-sm mb-4">Empieza a registrar tu progreso corporal</p>
          <Button onClick={openNew}><Plus size={16} />Anotar medidas</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {measurements.map(m => (
            <MeasurementCard key={m.id} m={m} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar medidas' : 'Nuevas medidas corporales'}
        size="lg"
      >
        <MeasurementForm
          initial={editing}
          onSaved={() => { closeModal(); load(); }}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
