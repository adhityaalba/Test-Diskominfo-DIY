<?php

namespace App\Services;

class PayrollService
{
    public const POTONGAN_ALPA = 100000;
    public const POTONGAN_TERLAMBAT_PER_MENIT = 2000;
    public const LEMBUR_PER_MENIT = 1000;

    /**
     * Hitung gaji bersih pegawai.
     */
    public function hitungGajiBersih(
        int $gajiPokok,
        int $jumlahAlpa,
        int $totalTerlambatMenit,
        int $totalLemburMenit
    ): array {
        $potonganAlpa = $jumlahAlpa * self::POTONGAN_ALPA;
        $potonganTerlambat = $totalTerlambatMenit * self::POTONGAN_TERLAMBAT_PER_MENIT;
        $totalPotongan = $potonganAlpa + $potonganTerlambat;

        $totalLembur = $totalLemburMenit * self::LEMBUR_PER_MENIT;

        $gajiBersih = $gajiPokok - $totalPotongan + $totalLembur;

        return [
            'gaji_pokok' => $gajiPokok,
            'jumlah_alpa' => $jumlahAlpa,
            'total_terlambat_menit' => $totalTerlambatMenit,
            'total_lembur_menit' => $totalLemburMenit,
            'potongan_alpa' => $potonganAlpa,
            'potongan_terlambat' => $potonganTerlambat,
            'total_potongan' => $totalPotongan,
            'total_lembur' => $totalLembur,
            'gaji_bersih' => $gajiBersih,
        ];
    }
}
