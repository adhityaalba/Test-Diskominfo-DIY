<?php

namespace App\Http\Controllers;

use App\Models\Jabatan;
use Illuminate\Http\Request;

class JabatanController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Jabatan::orderBy('id', 'desc')->get()]);
    }

    public function show($id)
    {
        $jabatan = Jabatan::find($id);
        if (!$jabatan) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        return response()->json(['success' => true, 'data' => $jabatan]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_jabatan' => 'required|string|max:100',
            'gaji_pokok' => 'required|numeric|min:0',
        ]);

        $jabatan = Jabatan::create($validated);
        return response()->json(['success' => true, 'message' => 'Jabatan berhasil ditambahkan', 'data' => $jabatan]);
    }

    public function update(Request $request, $id)
    {
        $jabatan = Jabatan::find($id);
        if (!$jabatan) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $validated = $request->validate([
            'nama_jabatan' => 'required|string|max:100',
            'gaji_pokok' => 'required|numeric|min:0',
        ]);

        $jabatan->update($validated);
        return response()->json(['success' => true, 'message' => 'Jabatan berhasil diupdate', 'data' => $jabatan]);
    }

    public function destroy($id)
    {
        $jabatan = Jabatan::find($id);
        if (!$jabatan) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $jabatan->delete();
        return response()->json(['success' => true, 'message' => 'Jabatan berhasil dihapus']);
    }
}
