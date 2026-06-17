import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { formatRupiah } from '../../utils/currency';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/dashboard');
      setData(res.data.data);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="empty-state">Memuat data dashboard...</div>;
  if (error) return <div className="empty-state text-error">Gagal memuat data dashboard.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Admin</h1>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <span className="stat-label">Jumlah Pegawai</span>
          <span className="stat-value">{data?.jumlah_pegawai}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Lembur Bulan Ini</span>
          <span className="stat-value text-success">{formatRupiah(data?.total_lembur)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Potongan Bulan Ini</span>
          <span className="stat-value text-danger">{data?.total_potongan > 0 ? '-' : ''}{formatRupiah(data?.total_potongan || 0)}</span>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Ringkasan Rekap Gaji Bulan Ini</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Pegawai</th>
                <th>Jabatan</th>
                <th>Total Potongan</th>
                <th>Total Lembur</th>
                <th>Gaji Bersih</th>
              </tr>
            </thead>
            <tbody>
              {data?.rekap_gaji?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state" style={{ padding: '2rem' }}>Belum ada data rekap gaji.</td>
                </tr>
              ) : (
                data?.rekap_gaji?.map((item) => (
                  <tr key={item.pegawai_id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.pegawai}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.gelar}</div>
                    </td>
                    <td>{item.jabatan}</td>
                    <td style={{ color: 'var(--color-danger)' }}>{formatRupiah(item.total_potongan)}</td>
                    <td style={{ color: 'var(--color-success)' }}>{formatRupiah(item.total_lembur)}</td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(item.gaji_bersih)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
