import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { formatRupiah } from '../../utils/currency';

export default function UserGaji() {
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
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
        <h1 className="page-title">Gaji Saya</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select className="form-control" value={bulan} onChange={(e) => setBulan(e.target.value)} style={{ width: 'auto' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Bulan {i + 1}</option>
            ))}
          </select>
          <input type="number" className="form-control" value={tahun} onChange={(e) => setTahun(e.target.value)} style={{ width: '100px' }} />
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Memuat data gaji...</div>
      ) : data.length === 0 ? (
        <div className="card"><div className="empty-state">Belum ada rekap gaji untuk periode ini.</div></div>
      ) : (
        <div className="card" id="printable-slip">
          <div className="print-only" style={{ display: 'none', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-primary)' }}>PT MAJU JAYA TEKNOLOGI</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Slip Gaji Pegawai - Periode Bulan {bulan}/{tahun}</p>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{data[0].pegawai}</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>{data[0].jabatan} ({data[0].gelar})</p>
          </div>

          <table style={{ width: '100%', marginBottom: '2rem' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>Gaji Pokok</td>
                <td style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', textAlign: 'right', fontWeight: 500 }}>
                  {formatRupiah(data[0].gaji_pokok)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>Uang Lembur</td>
                <td style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', textAlign: 'right', fontWeight: 500, color: 'var(--color-success)' }}>
                  + {formatRupiah(data[0].total_lembur)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>Potongan Alpa</td>
                <td style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', textAlign: 'right', fontWeight: 500, color: 'var(--color-danger)' }}>
                  - {formatRupiah(data[0].potongan_alpa)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>Potongan Terlambat</td>
                <td style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', textAlign: 'right', fontWeight: 500, color: 'var(--color-danger)' }}>
                  - {formatRupiah(data[0].potongan_terlambat)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '1.5rem 0', fontWeight: 700, fontSize: '1.25rem' }}>Total Gaji Bersih</td>
                <td style={{ padding: '1.5rem 0', textAlign: 'right', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                  {formatRupiah(data[0].gaji_bersih)}
                </td>
              </tr>
            </tbody>
          </table>

          <button className="btn btn-primary" onClick={handlePrint} style={{ width: '100%' }}>
            Ekspor PDF / Cetak Slip Gaji
          </button>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-slip, #printable-slip * { visibility: visible; }
          #printable-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          .print-only { display: block !important; margin-bottom: 20px; }
          .btn { display: none; }
        }
      `}</style>
    </div>
  );
}
