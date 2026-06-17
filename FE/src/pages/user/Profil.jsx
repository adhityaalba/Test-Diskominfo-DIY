import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

export default function UserProfil() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/pegawai');
      if (res.data.data && res.data.data.length > 0) {
        setData(res.data.data[0]); // User sees their own data
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="empty-state">Memuat profil...</div>;
  if (!data) return <div className="empty-state">Profil pegawai belum diatur oleh admin.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profil Saya</h1>
      </div>
      <div className="card" style={{ maxWidth: '600px' }}>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', width: '150px', color: 'var(--color-text-muted)' }}>Nama Lengkap</td>
              <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', fontWeight: 500 }}>{data.nama}</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>Gelar Pendidikan</td>
              <td style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', fontWeight: 500 }}>{data.gelar}</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>Jabatan</td>
              <td style={{ padding: '1rem 0', fontWeight: 500 }}>{data.jabatan?.nama_jabatan}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
