# Mulai di Sini — Tablekeep DM Toolkit v0.2.0

Paket ini adalah **prototype antarmuka** yang sama untuk dua mode:

- **Standalone:** dibuka sebagai website GitHub Pages atau server lokal Windows.
- **Owlbear Rodeo:** dipasang melalui manifest extension dan dibuka dari dalam room.

## Isi prototype saat ini

- Dashboard campaign.
- Combat tracker: initiative, round, HP, conditions, tambah/edit combatant.
- Sinkronisasi token Character layer Owlbear dan penyimpanan metadata combat ke room/token.
- Encounter builder dan saved encounters lokal.
- Character roster sederhana (belum character builder rules-complete).
- Indeks bestiary (351 nama), spellbook (341 nama), dan magic items (259 nama).
- Session notes, dice roller, export data, dan settings.

Data katalog dari crawl pertama hanya mencakup **nama dan URL sumber**. Stat block, spell detail, item properties, dan data kelas/karakter belum diimpor.

## Buat repository GitHub baru

Nama yang disarankan: `owlbear-dm-toolkit-ui`.

1. Buat repository baru di GitHub dengan nama tersebut.
2. Untuk GitHub Free, pilih visibility **Public** jika ingin memakai GitHub Pages. GitHub Pages pada paket Free memerlukan repository publik. Website Pages juga dapat diakses publik, jadi jangan masukkan API key, password, campaign pribadi, atau arsip HTML crawl mentah.
3. Cara paling mudah mengirim seluruh folder (termasuk folder tersembunyi `.github`) adalah memakai **GitHub Desktop**:
   - Ekstrak ZIP ini ke folder biasa, misalnya `Documents\tablekeep-owlbear-dm-toolkit`.
   - Di GitHub Desktop pilih **File → Add Local Repository**. Jika folder belum berupa repository Git, pilih opsi untuk membuat repository di folder tersebut.
   - Isi nama repository `owlbear-dm-toolkit-ui`, pastikan folder lokalnya adalah folder hasil ekstrak, lalu buat repository lokal.
   - Klik **Publish repository**. Pilih akun pemilik, nama repository, dan visibility Public.
   - Pastikan folder `.github\workflows\pages.yml` ikut masuk ke commit pertama.
4. Alternatif untuk pengguna Git: buka terminal di folder proyek lalu jalankan `git init -b main`, `git add .`, `git commit -m "Initial Tablekeep UI"`, kemudian tambahkan remote repository GitHub dan `git push -u origin main`.

## Aktifkan GitHub Pages

1. Buka repository → **Settings → Pages**.
2. Pada **Build and deployment → Source**, pilih **GitHub Actions**.
3. Buka tab **Actions**.
4. Jalankan workflow **Deploy Tablekeep to GitHub Pages** dengan **Run workflow** (workflow juga berjalan otomatis pada push ke `main`).
5. Setelah status hijau, buka URL Pages yang ditampilkan pada ringkasan deployment.

Workflow mengisi URL manifest berdasarkan owner dan nama repository secara otomatis. Tidak perlu mengedit `manifest.json` untuk deploy.

## Pasang ke Owlbear Rodeo

1. Salin URL manifest dari website Pages, dengan format:

   `https://NAMA-AKUN.github.io/NAMA-REPO/manifest.json`

2. Di Owlbear Rodeo, buka profile → **Add Extension**.
3. Tempel URL manifest tersebut.
4. Buat/buka room dan aktifkan **Tablekeep — DM Toolkit**.
5. Buka action Tablekeep di room.
6. Masuk ke **Combat tracker**, lalu pilih **Sync Owlbear tokens**.

SDK Owlbear dimuat dari CDN saat aplikasi berada di dalam iframe Owlbear. Jika pemuatan SDK gagal, website tetap bisa dibuka sebagai standalone, tetapi sinkronisasi token tidak tersedia.

## Uji lokal di Windows

Cara cepat: klik dua kali `run-local.bat` (membutuhkan Python 3). Browser akan membuka `http://localhost:8000`.

Cara manual:

1. Ekstrak ZIP.
2. Buka folder proyek di File Explorer.
3. Ketik `cmd` di address bar File Explorer lalu Enter.
4. Jalankan `py -m http.server 8000`.
5. Buka `http://localhost:8000`.

Untuk menguji extension lokal dari Owlbear, gunakan URL `http://localhost:8000/manifest.local.json` setelah server berjalan.

## Yang belum termasuk

- Stat block monster lengkap, deskripsi spell, dan detail properti magic item.
- Character builder penuh, kelas/subkelas, species, feats, equipment, inventory, spell preparation.
- Conditions reference, travel/rest calculator, session timer, encounter difficulty/XP calculator.
- Player sheet multiplayer dan campaign storage lintas room.

Modul lanjutan akan ditambahkan bertahap sebagai bagian terpisah supaya bisa dinonaktifkan atau dihapus tanpa mengganti keseluruhan UI.

## Catatan data dan lisensi

Daftar nama dan URL katalog berasal dari hasil crawl yang kamu berikan. Sebelum repo dibuat publik, tinjau ketentuan situs sumber. Jangan menambahkan HTML lengkap, gambar, buku ekspansi, atau teks proprietari ke repo publik tanpa hak distribusi yang sesuai. UI original di project ini berlisensi MIT; lihat `LICENSE` dan `THIRD_PARTY_NOTICES.md`.
