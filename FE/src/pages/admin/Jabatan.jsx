import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { formatRupiah } from '../../utils/currency';

export default function Jabatan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, nama_jabatan: '', gaji_pokok: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/jabatan');
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setForm({ id: item.id, nama_jabatan: item.nama_jabatan, gaji_pokok: item.gaji_pokok });
    } else {
      setForm({ id: null, nama_jabatan: '', gaji_pokok: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await axiosClient.put(`/jabatan/${form.id}`, form);
      } else {
        await axiosClient.post('/jabatan', form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus jabatan ini?')) {
      try {
        await axiosClient.delete(`/jabatan/${id}`);
        fetchData();
      } catch (e) {
        alert('Gagal menghapus');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Jabatan</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>Tambah Jabatan</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Jabatan</th>
                  <th>Gaji Pokok</th>
                  <th style={{ width: '150px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.nama_jabatan}</td>
                    <td>{formatRupiah(item.gaji_pokok)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={() => handleOpenModal(item)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="4" className="empty-state">Belum ada data jabatan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2 className="card-title">{form.id ? 'Edit Jabatan' : 'Tambah Jabatan'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nama Jabatan</label>
                <input required type="text" className="form-control" value={form.nama_jabatan} onChange={e => setForm({...form, nama_jabatan: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Gaji Pokok</label>
                <input required type="number" className="form-control" value={form.gaji_pokok} onChange={e => setForm({...form, gaji_pokok: e.target.value})} />
              </div>
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
