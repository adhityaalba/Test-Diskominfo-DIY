<?php

namespace App\Http\Controllers;

use App\Models\Presensi;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PresensiController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    public function index()
    {
        $user = auth()->user();
        if ($user->role === 'user') {
            $pegawaiIds = $user->pegawai ? [$user->pegawai->id] : [];
            $presensis = Presensi::with('pegawai')->whereIn('pegawai_id', $pegawaiIds)->orderBy('tanggal', 'desc')->get();
        } else {
            $presensis = Presensi::with('pegawai')->orderBy('tanggal', 'desc')->get();
        }
        return response()->json(['success' => true, 'data' => $presensis]);
    }

    public function show($id)
    {
        $presensi = Presensi::with('pegawai')->find($id);
        if (!$presensi) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $user = auth()->user();
        if ($user->role === 'user' && (!$user->pegawai || $presensi->pegawai_id !== $user->pegawai->id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        return response()->json(['success' => true, 'data' => $presensi]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role === 'user' && (!$user->pegawai || $request->pegawai_id != $user->pegawai->id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        $validated = $request->validate([
            'pegawai_id' => 'required|exists:pegawais,id',
            'tanggal' => ['required', 'date', Rule::unique('presensis')->where(function ($query) use ($request) {
                return $query->where('pegawai_id', $request->pegawai_id);
            })],
            'status_hadir' => 'required|in:hadir,alpa',
            'jam_masuk' => 'nullable',
            'jam_keluar' => 'nullable',
        ]);

        if ($validated['status_hadir'] === 'alpa') {
            $validated['jam_masuk'] = null;
            $validated['jam_keluar'] = null;
            $validated['terlambat_menit'] = 0;
            $validated['lembur_menit'] = 0;
        } else {
            $validated['terlambat_menit'] = $this->attendanceService->hitungTerlambatMenit($validated['jam_masuk']);
            $validated['lembur_menit'] = $this->attendanceService->hitungLemburMenit($validated['jam_keluar']);
        }

        $presensi = Presensi::create($validated);
        return response()->json(['success' => true, 'message' => 'Presensi berhasil ditambahkan', 'data' => $presensi->load('pegawai')]);
    }

    public function update(Request $request, $id)
    {
        $presensi = Presensi::find($id);
        if (!$presensi) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $user = auth()->user();
        if ($user->role === 'user' && (!$user->pegawai || $presensi->pegawai_id != $user->pegawai->id || $request->pegawai_id != $user->pegawai->id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        $validated = $request->validate([
            'pegawai_id' => 'required|exists:pegawais,id',
            'tanggal' => ['required', 'date', Rule::unique('presensis')->where(function ($query) use ($request) {
                return $query->where('pegawai_id', $request->pegawai_id);
            })->ignore($id)],
            'status_hadir' => 'required|in:hadir,alpa',
            'jam_masuk' => 'nullable',
            'jam_keluar' => 'nullable',
        ]);

        if ($validated['status_hadir'] === 'alpa') {
            $validated['jam_masuk'] = null;
            $validated['jam_keluar'] = null;
            $validated['terlambat_menit'] = 0;
            $validated['lembur_menit'] = 0;
        } else {
            $validated['terlambat_menit'] = $this->attendanceService->hitungTerlambatMenit($validated['jam_masuk']);
            $validated['lembur_menit'] = $this->attendanceService->hitungLemburMenit($validated['jam_keluar']);
        }

        $presensi->update($validated);
        return response()->json(['success' => true, 'message' => 'Presensi berhasil diupdate', 'data' => $presensi->load('pegawai')]);
    }

    public function destroy($id)
    {
        $presensi = Presensi::find($id);
        if (!$presensi) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $presensi->delete();
        return response()->json(['success' => true, 'message' => 'Presensi berhasil dihapus']);
    }
}
