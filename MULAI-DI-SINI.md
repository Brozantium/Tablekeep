# MULAI DI SINI — TABLEKEEP 0.5.0

## Tes lokal di Windows
1. Extract ZIP ke folder biasa.
2. Pastikan Python 3 terpasang.
5. Biarkan jendela server tetap terbuka. Tutup jendela itu untuk menghentikan server.

Jangan buka `index.html` dengan double-click biasa (`file://`), karena aplikasi mengambil katalog JSON melalui HTTP.

## Tes di GitHub Pages
Upload isi folder ini ke root repository, lalu pastikan **Settings → Pages → Source: GitHub Actions**. Push ke branch `main` dan tunggu workflow selesai. Buka URL Pages dari job deployment.

## Tes di Owlbear Rodeo
Setelah GitHub Pages aktif, daftarkan URL `manifest.json` dari situs tersebut sebagai extension manifest. Ukuran popover awal di manifest disetel 400×625; tampilan tetap responsif jika panel host lebih lebar atau sempit.

## Perubahan utama v0.5.0
- Character Maker mengikuti urutan Play5e dan memvalidasi pilihan sebelum lanjut/simpan.
- Pilihan kelas, species, background, subclass, feat, ASI dan equipment tidak dicentang otomatis tanpa dasar.
- Homebrew memakai field sesuai jenis konten dan bisa diedit setelah disimpan.
- Sidebar bisa dilipat di desktop dan berubah menjadi drawer di layar kecil.
- Builder diringkas untuk layar 400×625.

Baca `REBUILD-NOTES-v0.5.0.md` dan `TEST-PLAN-v0.5.0.md` sebelum tes.