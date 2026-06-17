# Jawaban Soal 1–4 — Query SQL

> Studi kasus: **PT Maju Jaya Teknologi**   
> Perhitungan rumus pada soal:
>
> - Potongan alpa = jumlah alpa × 100.000
> - Potongan terlambat = total menit terlambat × 2.000
> - Total potongan = potongan alpa + potongan terlambat
> - Total lembur = total menit lembur × 1.000
> - Gaji bersih = gaji pokok - total potongan + total lembur

---

## Soal 1 — Sorting Pegawai Berdasarkan Gelar Pendidikan

**Ketentuan urutan gelar:**

```text
D3 < S1 < S2
```

### Query SQL

```sql
SELECT 
    p.id_pegawai,
    p.nama,
    p.gelar,
    j.nama_jabatan
FROM pegawai p
JOIN jabatan j 
    ON p.id_jabatan = j.id_jabatan
ORDER BY 
    CASE p.gelar
        WHEN 'D3' THEN 1
        WHEN 'S1' THEN 2
        WHEN 'S2' THEN 3
        ELSE 4
    END ASC;
```


---

## Soal 2 — Hitung Total Potongan Presensi Pegawai

**Rumus:**

```text
Potongan Alpa       = jumlah alpa × 100.000
Potongan Terlambat  = total terlambat_menit × 2.000
Total Potongan      = Potongan Alpa + Potongan Terlambat
```

### Query SQL

```sql
SELECT 
    p.id_pegawai,
    p.nama AS pegawai,
    COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) AS jumlah_alpa,
    COALESCE(SUM(pr.terlambat_menit), 0) AS total_terlambat_menit,

    COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000 AS potongan_alpa,
    COALESCE(SUM(pr.terlambat_menit), 0) * 2000 AS potongan_terlambat,

    (
        COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000
        + COALESCE(SUM(pr.terlambat_menit), 0) * 2000
    ) AS total_potongan
FROM pegawai p
LEFT JOIN presensi pr 
    ON p.id_pegawai = pr.id_pegawai
GROUP BY 
    p.id_pegawai,
    p.nama;
```

### Query SQL dengan Filter Bulan dan Tahun

Contoh untuk bulan **Januari 2025**:

```sql
SELECT 
    p.id_pegawai,
    p.nama AS pegawai,
    COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) AS jumlah_alpa,
    COALESCE(SUM(pr.terlambat_menit), 0) AS total_terlambat_menit,

    COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000 AS potongan_alpa,
    COALESCE(SUM(pr.terlambat_menit), 0) * 2000 AS potongan_terlambat,

    (
        COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000
        + COALESCE(SUM(pr.terlambat_menit), 0) * 2000
    ) AS total_potongan
FROM pegawai p
LEFT JOIN presensi pr 
    ON p.id_pegawai = pr.id_pegawai
    AND MONTH(pr.tanggal) = 1
    AND YEAR(pr.tanggal) = 2025
GROUP BY 
    p.id_pegawai,
    p.nama;
```


---

## Soal 3 — Hitung Total Lembur Pegawai

**Rumus:**

```text
Total Lembur = total lembur_menit × 1.000
```

### Query SQL

```sql
SELECT 
    p.id_pegawai,
    p.nama AS pegawai,
    COALESCE(SUM(pr.lembur_menit), 0) AS total_lembur_menit,
    COALESCE(SUM(pr.lembur_menit), 0) * 1000 AS total_lembur
FROM pegawai p
LEFT JOIN presensi pr 
    ON p.id_pegawai = pr.id_pegawai
GROUP BY 
    p.id_pegawai,
    p.nama;
```

### Query SQL dengan Filter Bulan dan Tahun

Contoh untuk bulan **Januari 2025**:

```sql
SELECT 
    p.id_pegawai,
    p.nama AS pegawai,
    COALESCE(SUM(pr.lembur_menit), 0) AS total_lembur_menit,
    COALESCE(SUM(pr.lembur_menit), 0) * 1000 AS total_lembur
FROM pegawai p
LEFT JOIN presensi pr 
    ON p.id_pegawai = pr.id_pegawai
    AND MONTH(pr.tanggal) = 1
    AND YEAR(pr.tanggal) = 2025
GROUP BY 
    p.id_pegawai,
    p.nama;
```


---

## Soal 4 — Hitung Gaji Bersih Pegawai

**Rumus:**

```text
Gaji Bersih = Gaji Pokok - Total Potongan + Total Lembur
```

Output yang diminta:

| Pegawai | Jabatan | Gaji Pokok | Total Potongan | Total Lembur | Gaji Bersih |
|---|---|---:|---:|---:|---:|

### Query SQL

```sql
SELECT 
    p.nama AS Pegawai,
    j.nama_jabatan AS Jabatan,
    j.gaji_pokok AS `Gaji Pokok`,

    (
        COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000
        + COALESCE(SUM(pr.terlambat_menit), 0) * 2000
    ) AS `Total Potongan`,

    COALESCE(SUM(pr.lembur_menit), 0) * 1000 AS `Total Lembur`,

    (
        j.gaji_pokok
        - (
            COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000
            + COALESCE(SUM(pr.terlambat_menit), 0) * 2000
        )
        + COALESCE(SUM(pr.lembur_menit), 0) * 1000
    ) AS `Gaji Bersih`
FROM pegawai p
JOIN jabatan j 
    ON p.id_jabatan = j.id_jabatan
LEFT JOIN presensi pr 
    ON p.id_pegawai = pr.id_pegawai
GROUP BY 
    p.id_pegawai,
    p.nama,
    j.nama_jabatan,
    j.gaji_pokok;
```

### Query SQL dengan Filter Bulan dan Tahun

Contoh untuk bulan **Januari 2025**:

```sql
SELECT 
    p.nama AS Pegawai,
    j.nama_jabatan AS Jabatan,
    j.gaji_pokok AS `Gaji Pokok`,

    (
        COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000
        + COALESCE(SUM(pr.terlambat_menit), 0) * 2000
    ) AS `Total Potongan`,

    COALESCE(SUM(pr.lembur_menit), 0) * 1000 AS `Total Lembur`,

    (
        j.gaji_pokok
        - (
            COUNT(CASE WHEN pr.status_hadir = 'alpa' THEN 1 END) * 100000
            + COALESCE(SUM(pr.terlambat_menit), 0) * 2000
        )
        + COALESCE(SUM(pr.lembur_menit), 0) * 1000
    ) AS `Gaji Bersih`
FROM pegawai p
JOIN jabatan j 
    ON p.id_jabatan = j.id_jabatan
LEFT JOIN presensi pr 
    ON p.id_pegawai = pr.id_pegawai
    AND MONTH(pr.tanggal) = 1
    AND YEAR(pr.tanggal) = 2025
GROUP BY 
    p.id_pegawai,
    p.nama,
    j.nama_jabatan,
    j.gaji_pokok;
```

