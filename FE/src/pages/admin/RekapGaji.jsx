import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { formatRupiah } from '../../utils/currency';

export default function AdminRekapGaji() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [bulan, tahun]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/rekap-gaji?bulan=${bulan}&tahun=${tahun}`);
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">Rekap Gaji & Laporan</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select className="form-control" value={bulan} onChange={(e) => setBulan(e.target.value)} style={{ width: 'auto' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Bulan {i + 1}</option>
            ))}
          </select>
          <input type="number" className="form-control" value={tahun} onChange={(e) => setTahun(e.target.value)} style={{ width: '100px' }} />
          <button className="btn btn-primary" onClick={handlePrint}>Cetak / Ekspor PDF</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div className="table-wrapper" id="printable-area">
            <div className="print-only" style={{ display: 'none', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-primary)' }}>PT MAJU JAYA TEKNOLOGI</h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Laporan Rekapitulasi Gaji Bulanan - Periode Bulan {bulan}/{tahun}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Pegawai</th>
                  <th>Gaji Pokok</th>
                  <th>Potongan Alpa</th>
                  <th>Potongan Terlambat</th>
                  <th>Total Lembur</th>
                  <th>Gaji Bersih</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.pegawai_id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.pegawai}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.jabatan}</div>
                    </td>
                    <td>{formatRupiah(item.gaji_pokok)}</td>
                    <td style={{ color: 'var(--color-danger)' }}>{formatRupiah(item.potongan_alpa)}</td>
                    <td style={{ color: 'var(--color-danger)' }}>{formatRupiah(item.potongan_terlambat)}</td>
                    <td style={{ color: 'var(--color-success)' }}>{formatRupiah(item.total_lembur)}</td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(item.gaji_bersih)}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="7" className="empty-state">Tidak ada data untuk periode ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-only {
            display: block !important;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}
