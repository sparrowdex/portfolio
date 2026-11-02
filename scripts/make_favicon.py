"""
Builds the site icons from the wallpaper butterfly (public/images/bg/butterfly.png):

  app/favicon.ico   16, 32, 48 px  (browser tab)
  app/icon.png      512 px         (modern browsers, PWA-ish uses)
  app/apple-icon.png 180 px        (iOS home screen; opaque, iOS rounds the corners)

  python scripts/make_favicon.py

Design: glossy hot-pink Y2K app tile + white glowing butterfly.
Requires: Pillow, numpy.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SPRITE = ROOT / 'public/images/bg/butterfly.png'
S = 1024  # work at high res, downsample at the end


def smooth_butterfly(size: int) -> Image.Image:
    """Upscale the small sprite and re-threshold its alpha so edges stay crisp at large sizes."""
    a = Image.open(SPRITE).split()[-1]
    big = a.resize((size, size), Image.LANCZOS).filter(ImageFilter.GaussianBlur(size / 90))
    arr = np.array(big).astype(float)
    arr = np.clip((arr - 110) * 2.6, 0, 255).astype(np.uint8)  # firm edge, slight anti-alias
    return Image.fromarray(arr)


def tile(rounded: bool) -> Image.Image:
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    # vertical hot-pink gradient
    grad = np.zeros((S, S, 4), dtype=np.uint8)
    top, bottom = np.array([255, 143, 216]), np.array([214, 0, 120])
    for y in range(S):
        t = y / (S - 1)
        grad[y, :, :3] = (top * (1 - t) + bottom * t).astype(np.uint8)
    grad[..., 3] = 255
    body = Image.fromarray(grad, 'RGBA')

    mask = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(mask)
    if rounded:
        d.rounded_rectangle((24, 24, S - 24, S - 24), radius=230, fill=255)
    else:
        d.rectangle((0, 0, S, S), fill=255)
    img.paste(body, (0, 0), mask)

    # dark berry rim
    if rounded:
        ImageDraw.Draw(img).rounded_rectangle((24, 24, S - 24, S - 24), radius=230, outline=(122, 0, 68, 255), width=34)

    # glossy highlight on the top half
    gloss = Image.new('L', (S, S), 0)
    ImageDraw.Draw(gloss).rounded_rectangle((110, 80, S - 110, S * 0.5), radius=200, fill=80)
    gloss = gloss.filter(ImageFilter.GaussianBlur(18))
    gloss = Image.fromarray(np.minimum(np.array(gloss), np.array(mask)))
    img = Image.composite(Image.new('RGBA', (S, S), (255, 255, 255, 255)), img, gloss)

    # butterfly with a soft white + pink glow
    bsize = int(S * 0.62)
    bmask = smooth_butterfly(bsize)
    layer_mask = Image.new('L', (S, S), 0)
    off = ((S - bsize) // 2, (S - bsize) // 2 + 20)
    layer_mask.paste(bmask, off)
    glow = layer_mask.filter(ImageFilter.GaussianBlur(40))
    img = Image.composite(Image.new('RGBA', (S, S), (255, 214, 240, 255)), img, glow.point(lambda v: min(255, int(v * 1.6))))
    img = Image.composite(Image.new('RGBA', (S, S), (255, 255, 255, 255)), img, layer_mask)
    return img


def main():
    rounded = tile(rounded=True)
    rounded.resize((512, 512), Image.LANCZOS).save(ROOT / 'app/icon.png')
    rounded.save(ROOT / 'app/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    tile(rounded=False).convert('RGB').resize((180, 180), Image.LANCZOS).save(ROOT / 'app/apple-icon.png')
    print('wrote app/favicon.ico, app/icon.png, app/apple-icon.png')


if __name__ == '__main__':
    main()
