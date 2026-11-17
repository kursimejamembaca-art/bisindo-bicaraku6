# BISINDO Bicara

Penerjemah bahasa isyarat BISINDO berbasis kamera, dengan MediaPipe Hand Landmarker.
Semua pemrosesan dilakukan di perangkat. Frame kamera tidak dikirim ke server mana pun.

## Fitur

**Penerjemah (halaman utama)**
- Terjemahan langsung dari kamera: kata atau huruf yang dikenali muncul di kotak terjemahan dan dibacakan.
- Huruf dan angka dikenali per frame dari pose tangan. Kata dikenali dari urutan gerakan sekitar 1 detik.
- Kalimat dikenali dari rekaman gerakan utuh yang sudah dilatih.
- Galeri: pilih video, lalu hasil analisisnya tampil di halaman Hasil.

**Latih**
- Rekam latihan: tulis nama kata, huruf, angka, atau kalimat, lalu tekan Mulai rekam dan Berhenti & simpan. Ada hitung mundur sebelum rekaman dimulai.
- Latih dari video: pilih satu atau beberapa video untuk nama yang Anda tulis.
- Daftar kata terlatih: jumlah contoh per kata, Ubah nama, Hapus per kata, dan Contoh untuk melihat dan menghapus contoh satu per satu.
- Uji akurasi per kata, dengan tabel yang bisa disalin.
- Unduh dan Impor data latih (format JSON), sebagai cadangan.

**Panduan**
- Petunjuk penggunaan dan kosakata dasar.

## Menjalankan di komputer

1. Pasang Node.js 18 atau lebih baru.
2. Jalankan `npm install`. Perintah ini menyalin file wasm dan mengunduh model `hand_landmarker.task` (sekitar 7 MB) ke `public/models`. Internet diperlukan saat instalasi.
3. Jalankan `npm run dev`, lalu buka alamat yang ditampilkan.
4. Untuk produksi: `npm run build`. Hasilnya ada di folder `dist/`.

Jika model gagal diunduh saat instalasi, jalankan ulang `npm run prepare-assets`.

## Menjalankan di GitHub Pages

1. Buat repositori di GitHub, lalu unggah seluruh isi folder ini:
   ```
   git init
   git add .
   git commit -m "Versi awal BISINDO Bicara"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
2. Buka **Settings → Pages**, lalu pada **Source** pilih **GitHub Actions**.
3. Setiap `push` ke `main` menjalankan `.github/workflows/deploy.yml`, yang membangun dan menerbitkan aplikasi.
4. Buka `https://USERNAME.github.io/NAMA-REPO/` dari HP. Alamat HTTPS ini membuat kamera aktif.

## Catatan penting

- **Kamera hanya berjalan di HTTPS** atau `localhost`.
- **Data latih disimpan di IndexedDB** pada browser perangkat itu. Data tidak ikut ke perangkat lain, dan hilang jika data situs dihapus. Gunakan tombol **Unduh** di halaman Latih untuk membuat cadangan, lalu **Impor** di perangkat lain.
- Data latih lama dari versi `localStorage` dipindahkan otomatis saat aplikasi pertama kali dibuka.
- Setelah dibuka sekali dengan koneksi, aplikasi dan model disimpan oleh service worker sehingga bisa dipakai offline.

## Batasan yang masih ada

- Kata membutuhkan sekitar setengah detik gerakan sebelum bisa dikenali. Ini bagian dari cara model membaca urutan gerakan, dan mengurangi jeda ini menurunkan akurasi.
- Kalimat dikenali sebagai satu gerakan utuh. Kalimat yang lebih dari 6 detik belum didukung.
- Akurasi bergantung pada jumlah dan variasi contoh latih. Latih setiap kata dengan beberapa orang dan beberapa posisi tangan.

## Struktur

- `index.html` — tampilan
- `src/style.css` — gaya
- `src/main.js` — kamera, MediaPipe, pengenalan, dan latihan
- `src/db.js` — penyimpanan IndexedDB
- `public/` — gambar, manifest, service worker, model, dan wasm
- `scripts/prepare-assets.mjs` — menyiapkan wasm dan model

## Membuat aplikasi Android (APK) dengan Codemagic

Aplikasi dibungkus dengan Capacitor. Halaman dan logikanya sama dengan versi web.

1. Unggah proyek ini ke GitHub memakai **bisindo-upload-android.html**, atau dengan `git push` seperti biasa.
2. Di Codemagic, pilih **Add application**, lalu pilih repositori ini (perlu izin akses GitHub di Codemagic).
3. Pilih workflow **bisindo-android-apk** lalu tekan **Start new build**. `codemagic.yaml` akan:
   - memasang dependensi dan mengunduh model MediaPipe,
   - membangun web (`npm run build`),
   - membuat platform Android (`npx cap add android`, hanya sekali),
   - menambahkan izin kamera,
   - membangun APK debug.
4. Unduh APK dari bagian **Artifacts** lalu pasang di HP Android (izinkan pemasangan dari sumber tidak dikenal).

Repositori ini sebaiknya **publik** supaya Codemagic bisa membacanya tanpa izin tambahan. Jika build gagal dengan **"Authentication failed for https://github.com/..."**:
- Pastikan repositori benar-benar publik (GitHub, Settings, Danger Zone, Change visibility, Public).
- Hapus aplikasi lama di Codemagic (App settings, Delete application), lalu **Add application** lagi.
- Pastikan URL tanpa garis miring di akhir, dan `codemagic.yaml` berada di **akar** repositori, bukan di dalam subfolder.

Catatan:
- Workflow memakai mesin `mac_mini_m2` karena tipe `linux_x2` tidak tersedia di semua paket Codemagic. Jika muncul "instance type is not available with the current billing plan", cek tipe mesin yang diizinkan paketmu di Codemagic (Billing).
- APK yang dihasilkan adalah **debug**. Untuk dipublikasikan ke Google Play perlu sertifikat signing release, yang ditambahkan di Codemagic (Code signing) dan di `codemagic.yaml`.
- Di Android, suara memakai plugin TTS native, karena WebView tidak menyediakan Web Speech API.
- Untuk menguji ulang setelah mengubah kode web, cukup jalankan build baru. Platform Android dibuat ulang oleh Codemagic dan tidak disimpan di repositori.
- Jika izin kamera tidak muncul, buka pengaturan aplikasi di HP lalu aktifkan izin Kamera.

## Catatan perubahan fitur tangan

Tangan kiri kini dicerminkan sebelum dihitung, dan untuk dua tangan tangan kanan selalu di slot pertama. Akibatnya contoh latih yang dibuat sebelum perubahan ini tidak cocok lagi. Aplikasi akan menampilkan tanda "data lama" di halaman Latih. Rekam ulang kata-kata tersebut, atau tekan **Hapus semua** lalu latih ulang.

### Mode tangan dominan kanan

Fitur gerakan dihitung dari tangan kanan. Tangan kiri hanya dipakai jika tangan kanan tidak terlihat. Format data sekarang versi 3. Jika muncul tanda "data lama", rekam ulang kata atau tekan **Hapus semua** lalu latih ulang. Isyarat yang memakai dua tangan belum didukung dalam mode ini.
