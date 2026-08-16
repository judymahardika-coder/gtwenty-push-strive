# GPS — GTWENTY PUSH STRIVE
### Train • Ride • Progress

Prototype MVP mobile-first untuk sistem latihan GTWENTY Bali Runbike Squad.

## Sudah tersedia di prototype
- Role Coach / Parent
- Athlete management
- Training Library: custom exercise
- Create Homework
- Homework status
- Submission foto/video (metadata prototype)
- Coach Review, score & feedback
- Performance Metrics custom
- Performance Records
- Grafik progress
- Personal Best & improvement
- PWA manifest
- Dark sporty UI dengan warna logo GTWENTY

## Cara menjalankan
Tidak membutuhkan build system.

1. Ekstrak folder.
2. Jalankan static server, misalnya:
   `python3 -m http.server 8000`
3. Buka:
   `http://localhost:8000`
4. Untuk HP dalam jaringan yang sama, buka IP komputer + port 8000.

## Catatan
Versi ini adalah prototype MVP frontend-first. Data disimpan di localStorage browser. Untuk versi online multi-user, tahap berikutnya adalah menghubungkan Supabase untuk authentication, PostgreSQL database, dan storage video/foto.

## Branding
GPS = GTWENTY PUSH STRIVE
Tagline = Train • Ride • Progress
