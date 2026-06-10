# Deploy (internet üzerinden paylaşma)

Bu proje statik (HTML/CSS/JS) çalışır. Internette link olarak yayınlamak için en kolay yol: **GitHub Pages**.

## 1) Dosyaları GitHub’a koy
- `cv-builder/` klasörünün içeriğini bir repo içine ekle.

## 2) GitHub Pages ayarı
- Repo ayarlarında: **Settings > Pages**
- Build and deployment: **Deploy from a branch**
- Branch: `main` and folder: `/ (root)` veya `dist` (aşağıdaki adıma göre)

## 3) (Önerilen) Vite build ile dist oluştur
Not: Node/npm gerekiyor.
- Bu adım istersen atlayabilirsin; sadece statik yayınlayacaksan doğrudan `index.html` yeter.

Basit statik yol (Node gerekmez):
- GitHub Pages’e root’tan yayınla.

## 4) Kullanıcı erişimi
- Yayınlanan URL üzerinden herkes CV formunu açıp PDF (tarayıcı print) alır.

## Not
- PDF indirme tarayıcı print/pdfsine dayanır.

