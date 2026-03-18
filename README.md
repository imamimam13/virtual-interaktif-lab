# Virtual Interaktif Lab

https://doi.org/10.5281/zenodo.19080233

![Virtual Lab Logo](/public/logo.png)

Platform pembelajaran laboratorium virtual yang interaktif dan modern, dibangun dengan Next.js 15, Prisma, dan shadcn/ui.

## 🚀 Fitur Utama

-   **Manhemen Lab & Modul**: Buat dan kelola materi praktikum dengan mudah.
-   **Video Interaktif (Baru)**: Unggah video (YouTube atau File Direct/Drive) dan sisipkan kuis yang akan muncul otomatis sesuai durasi video.
-   **Kuiz & Penilaian**: Sistem penilaian otomatis dengan bobot nilai yang dapat dikonfigurasi.
-   **Manajemen Pengguna**: Kelola akses mahasiswa, dosen, dan asisten lab berdasarkan departemen.
-   **Laporan & Ekspor**: Unduh rekap nilai mahasiswa dalam format CSV.

## 🛠️ Teknologi

-   **Framework**: [Next.js 15](https://nextjs.org) (App Router)
-   **Database**: SQLite (Dev) / PostgreSQL (Prod) via [Prisma ORM](https://www.prisma.io)
-   **UI Library**: [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS
-   **Auth**: NextAuth.js

## 📦 Cara Menjalankan

### Persiapan

Pastikan Node.js dan npm/yarn/pnpm/bun sudah terinstal.

1.  **Clone repositori**
    ```bash
    git clone https://github.com/imamimam13/virtual-interaktif-lab.git
    cd virtual-interaktif-lab
    ```

2.  **Instal dependensi**
    ```bash
    npm install
    ```

3.  **Setup Database**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Jalankan Server Development**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 🎥 Fitur Video Interaktif

Fitur ini memungkinkan Dosen untuk membuat materi video yang "memaksa" mahasiswa berinteraksi sebelum melanjutkan tontonan.

### Cara Menggunakan:
1.  Buat Modul baru dengan tipe **INTERACTIVE_VIDEO**.
2.  Siapkan JSON konten.

**Format JSON:**
```json
{
  "videoUrl": "https://youtu.be/VIDEO_ID_HERE", 
  "questions": [
    {
      "timestamp": 60, 
      "question": "Pertanyaan yang muncul di detik ke-60?",
      "options": ["Opsi A", "Opsi B", "Opsi C"],
      "answer": 0 
    }
  ]
}
```
*Catatan: `answer` adalah index dari array `options` (dimulai dari 0).*

### Dukungan Video:
-   **YouTube**: Gunakan link standar (misal: `https://youtu.be/...`).
-   **Google Drive / Cloud**: Gunakan **Direct Link** (link yang langsung mengarah ke file `.mp4` atau stream, bukan halaman preview Google Drive).

## 🐳 Deployment (Docker)

Aplikasi ini sudah siap untuk containerization.

```bash
# Build & Run dengan Docker Compose
docker-compose up -d --build
```

Aplikasi akan berjalan di port `8795` (sesuai konfigurasi produksi).

## 📄 Lisensi

[MIT](LICENSE)
