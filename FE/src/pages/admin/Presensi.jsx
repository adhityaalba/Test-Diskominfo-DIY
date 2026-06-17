import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { formatTanggal } from '../../utils/date';

export default function AdminPresensi() {
  const [data, setData] = useState([]);
  const [pegawais, setPegawais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, pegawai_id: '', tanggal: '', status_hadir: 'hadir', jam_masuk: '', jam_keluar: '' });

  useEffect(() => {
    fetchData();
    fetchPegawais();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/presensi');
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPegawais = async () => {
    try {
      const res = await axiosClient.get('/pegawai');
      setPegawais(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setForm({ 
        id: item.id, 
        pegawai_id: item.pegawai_id, 
        tanggal: item.tanggal, 
        status_hadir: item.status_hadir,
        jam_masuk: item.jam_masuk ? item.jam_masuk.slice(0,5) : '', 
        jam_keluar: item.jam_keluar ? item.jam_keluar.slice(0,5) : ''
      });
    } else {
      setForm({ 
        id: null, 
        pegawai_id: pegawais[0]?.id || '', 
        tanggal: new Date().toISOString().split('T')[0], 
        status_hadir: 'hadir', 
        jam_masuk: '09:00', 
        jam_keluar: '17:00' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await axiosClient.put(`/presensi/${form.id}`, form);
      } else {
        await axiosClient.post('/presensi', form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan. Pastikan tanggal presensi tidak duplikat untuk pegawai ini.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus presensi ini?')) {
      try {
        await axiosClient.delete(`/presensi/${id}`);
        fetchData();
      } catch (e) {
        alert('Gagal menghapus');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Presensi</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>Tambah Presensi</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Pegawai</th>
                  <th>Status</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Terlambat (m)</th>
                  <th>Lembur (m)</th>
                  <th style={{ width: '150px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>{formatTanggal(item.tanggal)}</td>
                    <td>{item.pegawai?.nama}</td>
                    <td>
                      <span className={`badge ${item.status_hadir === 'hadir' ? 'badge-success' : 'badge-danger'}`}>
                        {item.status_hadir.toUpperCase()}
                      </span>
                    </td>
                    <td>{item.jam_masuk || '-'}</td>
                    <td>{item.jam_keluar || '-'}</td>
                    <td style={{ color: Math.abs(item.terlambat_menit) > 0 ? 'var(--color-danger)' : 'inherit' }}>{Math.abs(item.terlambat_menit)}</td>
                    <td style={{ color: Math.abs(item.lembur_menit) > 0 ? 'var(--color-success)' : 'inherit' }}>{Math.abs(item.lembur_menit)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={() => handleOpenModal(item)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="8" className="empty-state">Belum ada data presensi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="card-title">{form.id ? 'Edit Presensi' : 'Tambah Presensi'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Pegawai</label>
                <select required className="form-control" value={form.pegawai_id} onChange={e => setForm({...form, pegawai_id: e.target.value})}>
                  <option value="">-- Pilih Pegawai --</option>
                  {pegawais.map(p => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input required type="date" className="form-control" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Status Hadir</label>
                <select required className="form-control" value={form.status_hadir} onChange={e => setForm({...form, status_hadir: e.target.value})}>
                  <option value="hadir">Hadir</option>
                  <option value="alpa">Alpa</option>
                </select>
              </div>
              
              {form.status_hadir === 'hadir' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Jam Masuk</label>
                    <input type="time" className="form-control" value={form.jam_masuk} onChange={e => setForm({...form, jam_masuk: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jam Keluar</label>
                    <input type="time" className="form-control" value={form.jam_keluar} onChange={e => setForm({...form, jam_keluar: e.target.value})} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
