<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JabatanController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\PresensiController;
use App\Http\Controllers\DashboardController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    Route::get('/dashboard', [DashboardController::class, 'dashboard']);
    Route::get('/rekap-gaji', [DashboardController::class, 'rekapGaji']);
    
    Route::get('/pegawai', [PegawaiController::class, 'index']);
    Route::get('/pegawai/{id}', [PegawaiController::class, 'show']);
    
    Route::get('/presensi', [PresensiController::class, 'index']);
    Route::get('/presensi/{id}', [PresensiController::class, 'show']);
    Route::post('/presensi', [PresensiController::class, 'store']);
    Route::put('/presensi/{id}', [PresensiController::class, 'update']);

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('jabatan', JabatanController::class);
        
        Route::post('/pegawai', [PegawaiController::class, 'store']);
        Route::put('/pegawai/{id}', [PegawaiController::class, 'update']);
        Route::delete('/pegawai/{id}', [PegawaiController::class, 'destroy']);
        
        Route::delete('/presensi/{id}', [PresensiController::class, 'destroy']);
    });
});
