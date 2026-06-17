import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { formatRupiah } from '../../utils/currency';
import { useAuthContext } from '../../contexts/AuthContext';

export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/dashboard');
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="empty-state">Memuat data dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Selamat datang, {user?.name}</h1>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <span className="stat-label">Gaji Bersih Bulan Ini</span>
          <span className="stat-value">{formatRupiah(data?.rekap_gaji?.[0]?.gaji_bersih || 0)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Lembur Bulan Ini</span>
          <span className="stat-value text-success">{formatRupiah(data?.total_lembur || 0)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Potongan Bulan Ini</span>
          <span className="stat-value text-danger">{data?.total_potongan > 0 ? '-' : ''}{formatRupiah(data?.total_potongan || 0)}</span>
        </div>
      </div>
    </div>
  );
}
