<?php

namespace App\Http\Controllers;

use App\Models\Pegawai;
use Illuminate\Http\Request;

class PegawaiController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if ($user->role === 'user') {
            $pegawais = Pegawai::with('jabatan', 'user')->where('user_id', $user->id)->orderBy('id', 'desc')->get();
        } else {
            $pegawais = Pegawai::with('jabatan', 'user')->orderBy('id', 'desc')->get();
        }
        return response()->json(['success' => true, 'data' => $pegawais]);
    }

    public function show($id)
    {
        $pegawai = Pegawai::with('jabatan', 'user')->find($id);
        if (!$pegawai) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $user = auth()->user();
        if ($user->role === 'user' && $pegawai->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        return response()->json(['success' => true, 'data' => $pegawai]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'jabatan_id' => 'required|exists:jabatans,id',
            'nama' => 'required|string|max:150',
            'gelar' => 'required|in:D3,S1,S2',
        ]);

        $pegawai = Pegawai::create($validated);
        return response()->json(['success' => true, 'message' => 'Pegawai berhasil ditambahkan', 'data' => $pegawai->load('jabatan', 'user')]);
    }

    public function update(Request $request, $id)
    {
        $pegawai = Pegawai::find($id);
        if (!$pegawai) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'jabatan_id' => 'required|exists:jabatans,id',
            'nama' => 'required|string|max:150',
            'gelar' => 'required|in:D3,S1,S2',
        ]);

        $pegawai->update($validated);
        return response()->json(['success' => true, 'message' => 'Pegawai berhasil diupdate', 'data' => $pegawai->load('jabatan', 'user')]);
    }

    public function destroy($id)
    {
        $pegawai = Pegawai::find($id);
        if (!$pegawai) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $pegawai->delete();
        return response()->json(['success' => true, 'message' => 'Pegawai berhasil dihapus']);
    }
}
