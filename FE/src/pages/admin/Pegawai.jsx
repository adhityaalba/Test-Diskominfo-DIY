import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AdminPegawai() {
  const [data, setData] = useState([]);
  const [jabatans, setJabatans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, nama: '', gelar: 'S1', jabatan_id: '', email: '', password: '' });

  useEffect(() => {
    fetchData();
    fetchJabatans();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/pegawai');
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchJabatans = async () => {
    try {
      const res = await axiosClient.get('/jabatan');
      setJabatans(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setForm({ id: item.id, nama: item.nama, gelar: item.gelar, jabatan_id: item.jabatan_id, email: item.user?.email || '', password: '' });
    } else {
      setForm({ id: null, nama: '', gelar: 'S1', jabatan_id: jabatans[0]?.id || '', email: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await axiosClient.put(`/pegawai/${form.id}`, form);
      } else {
        await axiosClient.post('/pegawai', form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus pegawai ini?')) {
      try {
        await axiosClient.delete(`/pegawai/${id}`);
        fetchData();
      } catch (e) {
        alert('Gagal menghapus');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Pegawai</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>Tambah Pegawai</button>
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
                  <th>Nama Pegawai</th>
                  <th>Gelar</th>
                  <th>Jabatan</th>
                  <th style={{ width: '150px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.nama}</td>
                    <td>{item.gelar}</td>
                    <td>{item.jabatan?.nama_jabatan}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={() => handleOpenModal(item)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="5" className="empty-state">Belum ada data pegawai.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2 className="card-title">{form.id ? 'Edit Pegawai' : 'Tambah Pegawai'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nama Pegawai</label>
                <input required type="text" className="form-control" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Gelar Pendidikan</label>
                <select className="form-control" value={form.gelar} onChange={e => setForm({...form, gelar: e.target.value})}>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Jabatan</label>
                <select required className="form-control" value={form.jabatan_id} onChange={e => setForm({...form, jabatan_id: e.target.value})}>
                  <option value="">-- Pilih Jabatan --</option>
                  {jabatans.map(j => (
                    <option key={j.id} value={j.id}>{j.nama_jabatan}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input required type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Password {form.id && <span style={{ fontSize: '0.8rem', color: '#666' }}>(Kosongkan jika tidak ingin mengubah)</span>}</label>
                <input required={!form.id} type="password" placeholder={form.id ? "••••••••" : ""} className="form-control" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
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
