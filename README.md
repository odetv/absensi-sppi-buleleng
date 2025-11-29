# Absensi SPPI BGN

Web absensi SPPI BGN dibangun guna mempermudah dalam melakukan absensi diberbagai portal. Menggunakan NextJS sebagai framework dalam membangun web ini agar dapat menciptakan pengalaman pengguna yang lebih baik dan optimal.

## 1. Konfigurasi Pengembangan

Pertama, pada saat akan melakukan pengembangan dapat menggunakan cara berikut:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser untuk melihat preview pada saat pengembangan

## 2. Konfigurasi Database

Web ini menggunakan Google Spreadsheets sebagai database dalam menyimpan data absensi. Berikut konfigurasi yang perlu dilakukan.

### Konfigurasi Console Cloud Google:

- Akses http://console.cloud.google.com/
- Buka menu APIs & Services -> Enabled API & Services
- Buka Library dan Enabled Google Sheets API
- Buka Credentials -> Manage service accounts
- Pilih Create service account dan lengkapi datanya
- Buka Action -> Manage keys
- Pilih Add key -> Create new key -> JSON
- Kredensial akan terdownload otomatis dalam bentuk JSON
- Simpan dan amankan isi dari variable client_email dan private_key yang akan digunakan sebagai environment variabel

### Konfigurasi Google Spreadsheets:

- Akses https://docs.google.com/spreadsheets
- Buat spreadsheet baru
- Pilih Bagikan dan isi email sesuai dengan client_email dan buat aksesnya editor
- Dapatkan ID spreadsheet dari url spreadsheet yang telah dibuat, contoh https://docs.google.com/spreadsheets/d/xxxxxxxxxxxx/edit, variable xxxxxxxxxxxx adalah ID dari spreadsheet tersebut
- Simpan dan amankan ID spreadsheet yang akan digunakan sebagai environment variabel

## 3. Marker Geolocation Google My Maps

- Akses https://mymaps.google.com
- Import data tagging lokasi (name, lat, lon)
- Bagikan dan sematkan iframe

## 4. Environment Variabel

```bash
GOOGLE_CLIENT_EMAIL=""
GOOGLE_PRIVATE_KEY=""
SPREADSHEET_ID=""
AUTH_USERNAME=""
AUTH_PASSWORD=""
JWT_SECRET=""
```
