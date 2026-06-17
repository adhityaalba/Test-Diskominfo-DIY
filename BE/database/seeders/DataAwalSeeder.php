<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\Presensi;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DataAwalSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Users (Admin & User)
        $adminUser = User::create([
            'name' => 'Admin System',
            'email' => 'admin@majujaya.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $pegawaiUser = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@majujaya.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        // 2. Create Jabatan
        $jabatanManager = Jabatan::create([
            'nama_jabatan' => 'Manager IT',
            'gaji_pokok' => 15000000,
        ]);

        $jabatanStaff = Jabatan::create([
            'nama_jabatan' => 'Staff Programmer',
            'gaji_pokok' => 8000000,
        ]);

        // 3. Create Pegawai
        $pegawai1 = Pegawai::create([
            'user_id' => $pegawaiUser->id,
            'jabatan_id' => $jabatanStaff->id,
            'nama' => 'Budi Santoso',
            'gelar' => 'S1',
        ]);

        $pegawai2 = Pegawai::create([
            'user_id' => null, // Tidak punya akses login
            'jabatan_id' => $jabatanManager->id,
            'nama' => 'Agus Pratama',
            'gelar' => 'S2',
        ]);

        // 4. Create Presensi (Bulan ini)
        $bulanIni = Carbon::now()->month;
        $tahunIni = Carbon::now()->year;

        // Budi: 1 Hadir Tepat Waktu, 1 Terlambat, 1 Alpa
        Presensi::create([
            'pegawai_id' => $pegawai1->id,
            'tanggal' => Carbon::create($tahunIni, $bulanIni, 1)->format('Y-m-d'),
            'status_hadir' => 'hadir',
            'jam_masuk' => '08:50:00',
            'jam_keluar' => '17:00:00',
            'terlambat_menit' => 0,
            'lembur_menit' => 0,
        ]);

        Presensi::create([
            'pegawai_id' => $pegawai1->id,
            'tanggal' => Carbon::create($tahunIni, $bulanIni, 2)->format('Y-m-d'),
            'status_hadir' => 'hadir',
            'jam_masuk' => '09:30:00', // Terlambat 30 menit
            'jam_keluar' => '18:00:00', // Lembur 60 menit
            'terlambat_menit' => 30,
            'lembur_menit' => 60,
        ]);

        Presensi::create([
            'pegawai_id' => $pegawai1->id,
            'tanggal' => Carbon::create($tahunIni, $bulanIni, 3)->format('Y-m-d'),
            'status_hadir' => 'alpa',
            'jam_masuk' => null,
            'jam_keluar' => null,
            'terlambat_menit' => 0,
            'lembur_menit' => 0,
        ]);
    }
}
