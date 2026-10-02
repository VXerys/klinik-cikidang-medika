"""Generate the PWA icon set from the clinic's existing logo artwork.

No asset in the repository contains the leaf mark on its own: logo-square.png
and logo-emblem.png both cut the wordmark off mid-letter, and a wide wordmark is
unreadable at 192 pixels. The mark is therefore separated from the lockup by
hue, which is unambiguous because the leaf sits at 160-219 degrees and the
wordmark at 340-359 degrees.

Replace PWA_ICON_SOURCE with an emblem-only file when the clinic supplies one.
"""

import colorsys
import os

from PIL import Image

SOURCE = os.environ.get('PWA_ICON_SOURCE', 'public/assets/images/cikidang-medika-transparant.png')
MARK_OUTPUT = 'public/assets/images/logo-mark.png'
ICON_DIR = 'public/assets/icons'
APPLE_TOUCH_ICON = 'public/apple-touch-icon.png'

# Leaf hues in degrees. The wordmark is a warm brown well outside this band.
HUE_MIN = 140
HUE_MAX = 240

GROUP_GAP = 20

# Mark width as a fraction of the canvas. Maskable icons get cropped to a
# circle on Android, so they keep the mark inside the inner 80% safe zone.
SIZES = [
    ('icon-192.png', 192, 0.72),
    ('icon-512.png', 512, 0.72),
    ('icon-maskable-512.png', 512, 0.56),
]

BACKGROUND = (255, 255, 255)


def isolate_leaf(source):
    image = Image.open(source).convert('RGBA')
    width, height = image.size

    leaf = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    source_pixels = image.load()
    leaf_pixels = leaf.load()

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = source_pixels[x, y]
            if alpha == 0:
                continue
            hue, saturation, _ = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
            if saturation < 0.15 or not (HUE_MIN <= hue * 360 <= HUE_MAX):
                continue
            leaf_pixels[x, y] = (red, green, blue, alpha)

    bounds = leaf.getchannel('A').getbbox()
    if not bounds:
        return leaf
    grouped = crop_to_leftmost_group(leaf.crop(bounds))
    inner = grouped.getchannel('A').getbbox()
    return grouped.crop(inner) if inner else grouped


def crop_to_leftmost_group(image):
    """Keep only the leftmost block of content, so the teal 'M' of the wordmark
    does not join the mark. Columns are scanned for the first wide empty gap."""
    width, height = image.size
    pixels = image.load()

    occupied = [
        any(pixels[x, y][3] > 0 for y in range(height)) for x in range(width)
    ]

    start = occupied.index(True) if True in occupied else 0
    run = 0
    for x in range(start, width):
        run = 0 if occupied[x] else run + 1
        if run >= GROUP_GAP:
            return image.crop((0, 0, x - run + 1, height))
    return image


def render(mark, size, width_fraction):
    target_w = round(size * width_fraction)
    target_h = round(mark.height * target_w / mark.width)
    scaled = mark.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # iOS paints transparency black, and Android masks the edges, so every icon
    # is composited on an opaque background.
    canvas = Image.new('RGBA', (size, size), BACKGROUND + (255,))
    canvas.alpha_composite(scaled, ((size - target_w) // 2, (size - target_h) // 2))
    return canvas.convert('RGB')


def main():
    mark = isolate_leaf(SOURCE)
    print(f'{SOURCE} -> mark {mark.size[0]}x{mark.size[1]}')
    mark.save(MARK_OUTPUT, 'PNG')
    print(MARK_OUTPUT)

    os.makedirs(ICON_DIR, exist_ok=True)
    for name, size, fraction in SIZES:
        path = os.path.join(ICON_DIR, name)
        render(mark, size, fraction).save(path, 'PNG')
        print(f'{path} ({size}x{size})')

    render(mark, 180, 0.72).save(APPLE_TOUCH_ICON, 'PNG')
    print(f'{APPLE_TOUCH_ICON} (180x180)')


if __name__ == '__main__':
    main()
