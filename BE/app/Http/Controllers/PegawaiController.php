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
            'jabatan_id' => 'required|exists:jabatans,id',
            'nama' => 'required|string|max:150',
            'gelar' => 'required|in:D3,S1,S2',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['nama'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'user',
        ]);

        $pegawai = Pegawai::create([
            'user_id' => $user->id,
            'jabatan_id' => $validated['jabatan_id'],
            'nama' => $validated['nama'],
            'gelar' => $validated['gelar'],
        ]);

        return response()->json(['success' => true, 'message' => 'Pegawai berhasil ditambahkan', 'data' => $pegawai->load('jabatan', 'user')]);
    }

    public function update(Request $request, $id)
    {
        $pegawai = Pegawai::find($id);
        if (!$pegawai) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $userId = $pegawai->user_id;

        $validated = $request->validate([
            'jabatan_id' => 'required|exists:jabatans,id',
            'nama' => 'required|string|max:150',
            'gelar' => 'required|in:D3,S1,S2',
            'email' => 'required|email|unique:users,email,' . ($userId ?? 'NULL'),
            'password' => 'nullable|string|min:6',
        ]);

        if ($userId) {
            $user = \App\Models\User::find($userId);
            if ($user) {
                $userData = [
                    'name' => $validated['nama'],
                    'email' => $validated['email'],
                ];
                if (!empty($validated['password'])) {
                    $userData['password'] = bcrypt($validated['password']);
                }
                $user->update($userData);
            }
        } else {
            // If they are updating a pegawai who has no user, password is required
            if (empty($validated['password'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password wajib diisi untuk membuat user login baru'
                ], 422);
            }
            $user = \App\Models\User::create([
                'name' => $validated['nama'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'role' => 'user',
            ]);
            $pegawai->user_id = $user->id;
        }

        $pegawai->update([
            'jabatan_id' => $validated['jabatan_id'],
            'nama' => $validated['nama'],
            'gelar' => $validated['gelar'],
        ]);

        return response()->json(['success' => true, 'message' => 'Pegawai berhasil diupdate', 'data' => $pegawai->load('jabatan', 'user')]);
    }

    public function destroy($id)
    {
        $pegawai = Pegawai::find($id);
        if (!$pegawai) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        if ($pegawai->user_id) {
            $user = \App\Models\User::find($pegawai->user_id);
            if ($user) {
                $user->delete();
            }
        }

        $pegawai->delete();
        return response()->json(['success' => true, 'message' => 'Pegawai berhasil dihapus']);
    }
}
