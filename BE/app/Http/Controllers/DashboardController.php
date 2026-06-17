<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Pegawai;
use Carbon\Carbon;

class DashboardController extends Controller
{
    private function getRekapGajiQuery(int $bulan, int $tahun, $pegawaiId = null)
    {
        $sql = "
            SELECT
                p.id AS pegawai_id,
                p.nama AS pegawai,
                p.gelar,
                j.nama_jabatan AS jabatan,
                j.gaji_pokok,

                COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) AS jumlah_alpa,
                COALESCE(SUM(ABS(pr.terlambat_menit)), 0) AS total_terlambat_menit,
                COALESCE(SUM(ABS(pr.lembur_menit)), 0) AS total_lembur_menit,

                COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000 AS potongan_alpa,
                COALESCE(SUM(ABS(pr.terlambat_menit)), 0) * 2000 AS potongan_terlambat,

                (
                    COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000
                    + COALESCE(SUM(ABS(pr.terlambat_menit)), 0) * 2000
                ) AS total_potongan,

                COALESCE(SUM(ABS(pr.lembur_menit)), 0) * 1000 AS total_lembur,

                (
                    j.gaji_pokok
                    - (
                        COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000
                        + COALESCE(SUM(ABS(pr.terlambat_menit)), 0) * 2000
                    )
                    + COALESCE(SUM(ABS(pr.lembur_menit)), 0) * 1000
                ) AS gaji_bersih

            FROM pegawais p
            JOIN jabatans j ON j.id = p.jabatan_id
            LEFT JOIN presensis pr
                ON pr.pegawai_id = p.id
                AND EXTRACT(MONTH FROM pr.tanggal) = :bulan
                AND EXTRACT(YEAR FROM pr.tanggal) = :tahun
        ";

        $params = ['bulan' => $bulan, 'tahun' => $tahun];

        if ($pegawaiId) {
            $sql .= " WHERE p.id = :pegawai_id ";
            $params['pegawai_id'] = $pegawaiId;
        }

        $sql .= "
            GROUP BY
                p.id,
                p.nama,
                p.gelar,
                j.nama_jabatan,
                j.gaji_pokok
            ORDER BY p.nama ASC
        ";

        return DB::select($sql, $params);
    }

    public function dashboard(Request $request)
    {
        $bulan = $request->query('bulan', Carbon::now()->month);
        $tahun = $request->query('tahun', Carbon::now()->year);

        $user = auth()->user();

        if ($user->role === 'user') {
            $pegawaiId = $user->pegawai ? $user->pegawai->id : null;
            if (!$pegawaiId) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'jumlah_pegawai' => 0,
                        'total_lembur' => 0,
                        'total_potongan' => 0,
                        'rekap_gaji' => [],
                    ]
                ]);
            }

            $rekap = $this->getRekapGajiQuery($bulan, $tahun, $pegawaiId);
            $rekapUser = count($rekap) > 0 ? $rekap[0] : null;

            return response()->json([
                'success' => true,
                'data' => [
                    'jumlah_pegawai' => 1,
                    'total_lembur' => $rekapUser ? $rekapUser->total_lembur : 0,
                    'total_potongan' => $rekapUser ? $rekapUser->total_potongan : 0,
                    'rekap_gaji' => $rekap,
                ]
            ]);
        } else {
            // Admin
            $rekap = $this->getRekapGajiQuery($bulan, $tahun);
            
            $jumlahPegawai = Pegawai::count();
            $totalLembur = array_reduce($rekap, function ($carry, $item) {
                return $carry + $item->total_lembur;
            }, 0);
            $totalPotongan = array_reduce($rekap, function ($carry, $item) {
                return $carry + $item->total_potongan;
            }, 0);

            return response()->json([
                'success' => true,
                'data' => [
                    'jumlah_pegawai' => $jumlahPegawai,
                    'total_lembur' => $totalLembur,
                    'total_potongan' => $totalPotongan,
                    'rekap_gaji' => $rekap,
                ]
            ]);
        }
    }

    public function rekapGaji(Request $request)
    {
        $bulan = $request->query('bulan', Carbon::now()->month);
        $tahun = $request->query('tahun', Carbon::now()->year);

        $user = auth()->user();
        if ($user->role === 'user') {
            $pegawaiId = $user->pegawai ? $user->pegawai->id : -1;
            $rekap = $this->getRekapGajiQuery($bulan, $tahun, $pegawaiId);
        } else {
            $rekap = $this->getRekapGajiQuery($bulan, $tahun);
        }

        return response()->json([
            'success' => true,
            'data' => $rekap
        ]);
    }
}
