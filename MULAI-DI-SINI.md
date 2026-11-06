# MULAI DI SINI — TABLEKEEP 0.4.0

## Menjalankan di Windows
1. Extract ZIP.
2. Pastikan Python 3 terpasang.
3. Double-click `run-local.bat`.
4. Browser akan membuka `http://127.0.0.1:8000/`.

Jangan membuka `index.html` dengan double-click biasa (`file://`) karena browser dapat memblokir fetch data JSON.

## Upload ke GitHub
Upload seluruh isi folder ke root repository, termasuk `.github/workflows/pages.yml`, folder `assets/`, dan folder `data/`. Di GitHub buka **Settings → Pages → Source: GitHub Actions**. Push ke branch `main` untuk deploy.

## Apa yang berubah di v0.4.0?
Lihat `REBUILD-NOTES-v0.4.0.md` untuk perubahan Character Builder dan `P5E-ARCHIVE-ANALYSIS.md` untuk hasil pemeriksaan arsip P5e. Jalankan dan uji lokal dulu sebelum mengganti versi GitHub Pages yang sedang aktif.

## Di mana mengubah tampilan?
- `index.html`: kerangka halaman dan navigasi.
- `assets/app.css`: seluruh styling, warna, spacing, responsive layout.
- `assets/app.js`: render halaman, interaksi, builder, content library, homebrew, dan loader JSON.

## Di mana data konten?
- `data/2014/`: dataset 2014.
- `data/2024/`: dataset 2024.
- `data/catalogs/monsters.json`: indeks monster hasil scraping sebelumnya.

JSON konten tidak perlu diedit atau diminify ulang. Aplikasi membaca file tersebut langsung. Pertahankan nama file dan foldernya saat upload.
