import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { formatTanggal } from '../../utils/date';
import { useAuthContext } from '../../contexts/AuthContext';

// Target Coordinates (3 Km radius)
const TARGET_LAT = -7.007806; // 7°00'28.1"S
const TARGET_LON = 110.375083; // 110°22'30.3"E
const MAX_DISTANCE_KM = 3;

// Haversine formula to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export default function UserPresensi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, tanggal: '', jam_masuk: '', jam_keluar: '' });

  const { user } = useAuthContext();

  useEffect(() => {
    fetchData();
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

  const handleOpenModal = (item = null) => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung Geolocation');
      return;
    }

    // Minta akses lokasi
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const dist = getDistanceFromLatLonInKm(
          position.coords.latitude, 
          position.coords.longitude, 
          TARGET_LAT, 
          TARGET_LON
        );

        if (dist <= MAX_DISTANCE_KM) {
          const now = new Date();
          const timeString = now.toTimeString().split(' ')[0].slice(0, 5);
          
          if (item) {
            // Mode Edit Pulang
            setForm({
              id: item.id,
              tanggal: item.tanggal,
              jam_masuk: item.jam_masuk ? item.jam_masuk.slice(0, 5) : '',
              jam_keluar: timeString // Otomatis diset jam saat ini
            });
          } else {
            // Mode Tambah
            setForm({
              id: null,
              tanggal: now.toISOString().split('T')[0],
              jam_masuk: timeString,
              jam_keluar: '' // Akan dinonaktifkan
            });
          }
          
          setIsModalOpen(true);
        } else {
          alert(`Anda berada di luar jangkauan area kantor (Jarak Anda: ${dist.toFixed(2)} km). Jarak maksimal adalah 3 km.`);
        }
      },
      (error) => {
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diizinkan pada browser Anda.');
      }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      // Ambil ID pegawai dari endpoint pegawai karena /api/pegawai mengembalikan data dirinya sendiri untuk role user
      const pegRes = await axiosClient.get('/pegawai');
      const pegawaiId = pegRes.data.data?.[0]?.id;

      if (!pegawaiId) {
        alert('Data pegawai Anda belum dikonfigurasi oleh Admin.');
        return;
      }

      const payload = {
        pegawai_id: pegawaiId,
        tanggal: form.tanggal,
        status_hadir: 'hadir',
        jam_masuk: form.jam_masuk,
        jam_keluar: form.jam_keluar || null
      };

      if (form.id) {
        await axiosClient.put(`/presensi/${form.id}`, payload);
      } else {
        await axiosClient.post('/presensi', payload);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan presensi. Anda mungkin sudah melakukan absen hari ini.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Presensi Saya</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Tambah Presensi</button>
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
                  <th>Status</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Terlambat (m)</th>
                  <th>Lembur (m)</th>
                  <th style={{ width: '100px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const isToday = item.tanggal === todayStr;
                  
                  return (
                    <tr key={item.id}>
                      <td>{formatTanggal(item.tanggal)}</td>
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
                        {isToday ? (
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenModal(item)}>
                            Update Pulang
                          </button>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr><td colSpan="7" className="empty-state">Belum ada riwayat presensi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2 className="card-title">{form.id ? 'Absen Pulang' : 'Absen Hadir'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input type="date" className="form-control" value={form.tanggal} readOnly style={{ backgroundColor: '#f1f5f9' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Jam Masuk</label>
                <input 
                  type="time" 
                  required 
                  className="form-control" 
                  value={form.jam_masuk} 
                  onChange={e => setForm({...form, jam_masuk: e.target.value})} 
                  readOnly={form.id ? true : false} 
                  style={{ backgroundColor: form.id ? '#f1f5f9' : 'white' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jam Keluar</label>
                <input 
                  type="time" 
                  className="form-control" 
                  value={form.jam_keluar} 
                  onChange={e => setForm({...form, jam_keluar: e.target.value})} 
                  disabled={!form.id} 
                  style={{ backgroundColor: !form.id ? '#f1f5f9' : 'white' }}
                />
                {!form.id && (
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                    Dinonaktifkan saat pertama kali absen.
                  </small>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{form.id ? 'Simpan Pulang' : 'Simpan Presensi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
