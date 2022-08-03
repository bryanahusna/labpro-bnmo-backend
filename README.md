# BNMO Backend
Backend untuk aplikasi BNMO
## Cara Menjalankan
### Development
Pastikan sudah memiliki npm, node, dan TypeScript (tsc)
1. Buat terlebih dahulu database yang akan digunakan, secara default menggunakan MySQL/MariaDB, teruji juga pada PostgreSQL
2. Periksa kecocokan struktur data database dengan yang terdapat pada `src/models/db`. Misal jika menggunakan PostgreSQL, ubah tipe data `datetime` menjadi `timestamp`. Selain itu, perlu juga menginstall driver databasenya, mysql secara default sudah ada pada package.json. Misal menggunakan PostgreSQL perlu install pg (`npm install pg`).
3. Jalankan `npm install` untuk menginstall seluruh dependencies.
4. Atur environment variables (sebagai konfigurasi database, key, dll.). Daftar environment variable yang perlu diatur terdapat pada `src/appconfig.json`.
5. Build backend dengan menjalankan `npm run build`
6. Sebelum menjalankan backend, sinkronisasi terlebih dahulu database (membuat table, foreign key, dll.) dengan menjalankan `npm run synchronizedb`
7. Jalankan backend dengan menjalankan `npm run run`. Server akan berjalan dan bisa menerima request.

## Design Pattern
- Observer. Tiap middleware dan endpoint mendaftarkan diri dan nantinya akan dipanggil (muncul event) jika terdapat request yang sesuai dengan middleware atau endpoint tersebut.
- Singleton. Database merupakan singleton, semua transaksi melewati satu objek tunggal ini (Node men-cache tiap import dari db).

## Technology Stack dan Versi
- Node versi 16
- Express versi 4
- TypeScript

## Daftar Endpoint
/approve
/deposit
/history
/login
/logout
/me
/register
/transfer
/users
/verify
/withdraw

## Created By
Bryan Amirul Husna / 13520146
