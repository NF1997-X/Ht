# Gallery App with Neon Database

Modern gallery application dengan backend Node.js + Express dan Neon PostgreSQL Database.

## 🚀 Features

- ✅ Create, Edit, Delete Images
- ✅ Upload by URL or Media File
- ✅ Add/Delete Sections
- ✅ Multiple Pages
- ✅ Share Links dengan Short Code
- ✅ View-Only Mode untuk sharing
- ✅ 3 Themes: Dark, Light, Ocean
- ✅ Responsive Design

## 📋 Prerequisites

- Node.js (v14 atau lebih tinggi)
- npm atau yarn
- Neon Database account

## 🛠️ Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Initialize Database

```bash
npm run init-db
```

Ini akan membuat tables:
- `pages` - Menyimpan halaman gallery
- `sections` - Menyimpan sections dalam halaman
- `items` - Menyimpan gambar
- `share_links` - Menyimpan link sharing

### 3. Start Backend Server

```bash
npm start
```

Atau untuk development mode dengan auto-reload:

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 4. Open Frontend

Buka `index.html` di browser atau gunakan web server:

```bash
# Di root folder
python3 -m http.server 8000
```

Kemudian buka `http://localhost:8000`

## 📊 Database Schema

### Pages Table
- `id` - Unique identifier
- `name` - Nama halaman
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Sections Table
- `id` - Unique identifier
- `page_id` - Reference ke pages
- `headline` - Judul section
- `position` - Urutan section

### Items Table
- `id` - Unique identifier
- `section_id` - Reference ke sections
- `title` - Judul gambar
- `subtitle` - Subtitle gambar
- `image_url` - URL gambar thumbnail
- `image_large` - URL gambar besar
- `position` - Urutan item

### Share Links Table
- `short_code` - Kode pendek untuk sharing
- `page_id` - Reference ke pages

## 🎯 API Endpoints

### Pages
- `GET /api/pages` - Get all pages
- `GET /api/pages/:pageId` - Get single page with data
- `POST /api/pages` - Create new page
- `PUT /api/pages/:pageId` - Update page
- `DELETE /api/pages/:pageId` - Delete page
- `POST /api/pages/:pageId/save` - Save complete page data

### Share
- `POST /api/share/:pageId` - Create share link
- `GET /api/share/:shortCode` - Get page by share code

## 💡 Usage

### Settings Mode
1. Klik menu (☰) → "Settings Mode"
2. Add/Edit/Delete images dan sections
3. Klik "Exit Settings" untuk kembali ke view mode

### Page Manager
1. Klik menu → "Page Manager"
2. Create, Switch, atau Delete pages

### Share Page
1. Klik menu → "Share Page"
2. Copy link yang generated
3. Share link hanya menampilkan view-only mode

## 🔧 Configuration

Edit `backend/.env` untuk mengubah konfigurasi:

```env
DATABASE_URL='your_neon_database_url'
PORT=3000
```

Edit `api-script.js` untuk mengubah API URL:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## 📝 Notes

- Data tersimpan di Neon Database (cloud)
- Share links berfungsi untuk semua device
- Upload gambar menggunakan base64 (untuk demo)
- Untuk production, gunakan cloud storage (AWS S3, Cloudinary, dll)

## 🎨 Themes

Tersedia 3 themes:
- **Dark** - Default dark theme
- **Light** - Light mode
- **Ocean** - Blue ocean theme

## 🐛 Troubleshooting

### Error: Cannot connect to database
- Pastikan DATABASE_URL correct di `.env`
- Check internet connection
- Verify Neon database is active

### Error: Port already in use
- Change PORT di `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

### Share link tidak berfungsi
- Pastikan backend server running
- Check API_BASE_URL di `api-script.js`

## 📄 License

MIT
