"""
Builds the hero's pixel-portrait frames ("Game Boy Camera" style) from the
transparent expression cutouts in public/images/sreeja/.

  python scripts/make_pixel_avatars.py

Pipeline per frame: shared head-and-shoulders crop (so framing doesn't jump
between expressions) -> grayscale -> unsharp mask (eyes/brows/lips) ->
histogram equalisation over the opaque pixels -> 4x4 Bayer dither into a
4-tone pink palette. Output: tiny PNGs with transparent background, drawn
upscaled with `image-rendering: pixelated`.
Requires: Pillow, numpy.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public/images/sreeja'
OUT = SRC / 'pixel'

FRAMES = [
    ('hmm', 'sreeja_think_left_cutout.webp'),  # opening frame
    ('idea', 'sreeja_think_right_cutout.webp'),
    ('peace', 'sreeja_hello_cutout.png'),
    ('tada', 'sreeja_showing_right_cutout.webp'),
    ('wait', 'sreeja_surprised_cutout.webp'),  # only shown while the window is dragged
]
# Not shown, but kept in the shared-crop calculation so framing stays the same.
CROP_ONLY = ['sreeja_normal_cutout.webp', 'sreeja_full_hello_cutout.webp']

WIDTH = 144  # output pixels across
ASPECT = 0.9  # height / width of the crop
# ink, berry, hot pink, blush
PALETTE = np.array([(26, 15, 31), (163, 0, 90), (255, 95, 176), (255, 225, 241)], dtype=np.uint8)
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16 - 0.5


def head_box(alpha: np.ndarray):
    """Top of the silhouette and horizontal extent of the head."""
    ys, xs = np.where(alpha > 40)
    top = ys.min()
    band = alpha[top: top + 260] > 40  # roughly the hair/head region
    hx = np.where(band.any(0))[0]
    return top, (hx.min() + hx.max()) / 2, hx.max() - hx.min()


def main():
    OUT.mkdir(exist_ok=True)
    images = [(name, Image.open(SRC / f).convert('RGBA')) for name, f in FRAMES]

    # One shared crop for all frames.
    crop_refs = [im for _, im in images] + [Image.open(SRC / f).convert('RGBA') for f in CROP_ONLY]
    boxes = [head_box(np.array(im)[:, :, 3]) for im in crop_refs]
    top = min(b[0] for b in boxes) - 30
    cx = float(np.median([b[1] for b in boxes]))
    head_w = float(np.median([b[2] for b in boxes]))
    w = head_w * 2.1
    h = w * ASPECT
    box = (int(cx - w / 2), int(top), int(cx + w / 2), int(top + h))
    out_h = round(WIDTH * ASPECT)

    for name, im in images:
        crop = im.crop(box).resize((WIDTH, out_h), Image.LANCZOS)
        arr = np.array(crop).astype(float)
        gray = Image.fromarray((0.299 * arr[..., 0] + 0.587 * arr[..., 1] + 0.114 * arr[..., 2]).astype(np.uint8))
        g = np.array(gray.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=1))).astype(float)
        mask = arr[..., 3] > 90
        vals = np.sort(g[mask])
        eq = np.searchsorted(vals, g) / max(1, len(vals))
        thresh = np.tile(BAYER, (out_h // 4 + 1, WIDTH // 4 + 1))[:out_h, :WIDTH]
        levels = np.clip(np.round(eq * 3 + thresh * 0.9), 0, 3).astype(int)
        rgba = np.zeros((out_h, WIDTH, 4), dtype=np.uint8)
        rgba[..., :3] = PALETTE[levels]
        rgba[..., 3] = np.where(mask, 255, 0)
        Image.fromarray(rgba, 'RGBA').save(OUT / f'{name}.png', optimize=True)
        print('wrote', OUT / f'{name}.png')


if __name__ == '__main__':
    main()
