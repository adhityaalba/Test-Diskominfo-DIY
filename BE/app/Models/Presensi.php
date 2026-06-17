<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Presensi extends Model
{
    use HasFactory;

    protected $fillable = [
        'pegawai_id',
        'tanggal',
        'status_hadir',
        'jam_masuk',
        'jam_keluar',
        'jam_masuk_normal',
        'jam_keluar_normal',
        'terlambat_menit',
        'lembur_menit',
    ];

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class);
    }
}
