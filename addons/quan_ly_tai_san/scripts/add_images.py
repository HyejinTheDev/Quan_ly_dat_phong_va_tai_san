#!/usr/bin/env python3
"""
Script tải ảnh cho tài sản - chạy trong WSL:
  cd /mnt/c/hoinhap/btl
  source venv/bin/activate
  python3 addons/quan_ly_tai_san/scripts/add_images.py
"""
import urllib.request
import base64
import os

# Thư mục lưu ảnh
IMG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'img')
os.makedirs(IMG_DIR, exist_ok=True)

# Danh sách ảnh: tên file → URL từ Unsplash/Picsum (ảnh miễn phí)
IMAGES = {
    'may_chieu.jpg': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=300&fit=crop',
    'loa.jpg': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop',
    'camera.jpg': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
    'micro.jpg': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop',
    'ban_hop.jpg': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    'ghe_van_phong.jpg': 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=300&fit=crop',
    'bang_trang.jpg': 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=400&h=300&fit=crop',
    'man_chieu.jpg': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop',
    'phong_hop.jpg': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop',
    'laptop.jpg': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
}

print("🖼️  Đang tải ảnh cho tài sản...")
for filename, url in IMAGES.items():
    filepath = os.path.join(IMG_DIR, filename)
    if os.path.exists(filepath):
        print(f"  ✅ {filename} - đã có")
        continue
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=10).read()
        with open(filepath, 'wb') as f:
            f.write(data)
        print(f"  ✅ {filename} - tải xong ({len(data)//1024}KB)")
    except Exception as e:
        print(f"  ❌ {filename} - lỗi: {e}")

print(f"\n📁 Ảnh đã lưu tại: {IMG_DIR}")
print("\n💡 Để gán ảnh cho tài sản trong Odoo:")
print("   1. Mở tài sản → click vào ô Ảnh")
print("   2. Chọn ảnh từ thư mục addons/quan_ly_tai_san/static/img/")
print("   Hoặc kéo thả ảnh trực tiếp vào ô hình ảnh trên form!")
