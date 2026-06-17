<?php

namespace App\Services;

use Carbon\Carbon;

class AttendanceService
{
    public const JAM_MASUK_NORMAL = '09:00:00';
    public const JAM_KELUAR_NORMAL = '17:00:00';

    /**
     * Hitung keterlambatan dalam menit.
     */
    public function hitungTerlambatMenit($jamMasuk): int
    {
        if (!$jamMasuk) {
            return 0;
        }

        $masuk = Carbon::parse($jamMasuk);
        $normal = Carbon::parse(self::JAM_MASUK_NORMAL);

        if ($masuk->greaterThan($normal)) {
            return abs($masuk->diffInMinutes($normal));
        }

        return 0;
    }

    /**
     * Hitung lembur dalam menit.
     */
    public function hitungLemburMenit($jamKeluar): int
    {
        if (!$jamKeluar) {
            return 0;
        }

        $keluar = Carbon::parse($jamKeluar);
        $normal = Carbon::parse(self::JAM_KELUAR_NORMAL);

        if ($keluar->greaterThan($normal)) {
            return abs($keluar->diffInMinutes($normal));
        }

        return 0;
    }
}
