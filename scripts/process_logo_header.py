"""Processa o logo do header (wordmark sem estrela): trim + otimização."""
from PIL import Image

SRC = "/home/z/my-project/upload/logo header.png"
DST = "/home/z/my-project/public/brand/logo-header.png"

im = Image.open(SRC).convert("RGBA")

# Trim por alpha (remove padding transparente)
alpha = im.getchannel("A")
bbox = alpha.getbbox()
if bbox:
    # pequena margem de 8px
    l, t, r, b = bbox
    l = max(0, l - 8); t = max(0, t - 8)
    r = min(im.width, r + 8); b = min(im.height, b + 8)
    im = im.crop((l, t, r, b))

# Resize para largura máxima 640px (header usa ~150-200px, retina 3x sobra)
max_w = 640
if im.width > max_w:
    ratio = max_w / im.width
    im = im.resize((max_w, round(im.height * ratio)), Image.LANCZOS)

im.save(DST, "PNG", optimize=True)
print("OK", DST, im.size)
