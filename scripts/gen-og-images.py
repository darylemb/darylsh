#!/usr/bin/env python3
"""Generate Open Graph images for daryl.sh portfolio.

Produces 5 images:
  - public/og/es/home.png     1200x630   Spanish home preview
  - public/og/en/home.png     1200x630   English home preview
  - public/og/es/default.png  1200x630   Spanish fallback
  - public/og/en/default.png  1200x630   English fallback
  - public/og/avatar.jpg      400x400    JSON-LD Person photo

Design: matches site glassmorphism theme (dark slate background,
cyan/violet accent gradient, monospace typography).

Usage: python3 scripts/gen-og-images.py
"""

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent
OG_DIR = REPO_ROOT / "public" / "og"
FONT_PATH = "/tmp/RobotoMono.ttf"

# Theme colors (slate dark theme, matching site CSS)
BG_TOP = (15, 23, 42)          # slate-900
BG_BOTTOM = (30, 41, 59)       # slate-800
ACCENT_CYAN = (34, 211, 238)   # cyan-400
ACCENT_VIOLET = (139, 92, 246) # violet-500
TEXT_PRIMARY = (248, 250, 252) # slate-50
TEXT_SECONDARY = (148, 163, 184)  # slate-400


def load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_PATH, size)


def draw_gradient_bg(img: Image.Image) -> None:
    """Vertical gradient background."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    for y in range(h):
        t = y / h
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))


def draw_glass_circle(img: Image.Image, cx: int, cy: int, r: int) -> None:
    """Glass-effect circular avatar container."""
    draw = ImageDraw.Draw(img, "RGBA")
    # Outer soft glow
    for i in range(20, 0, -2):
        alpha = int(8 * (1 - i / 20))
        draw.ellipse(
            (cx - r - i, cy - r - i, cx + r + i, cy + r + i),
            fill=(34, 211, 238, alpha),
        )
    # Glass circle
    draw.ellipse(
        (cx - r, cy - r, cx + r, cy + r),
        fill=(255, 255, 255, 25),
        outline=(255, 255, 255, 60),
        width=4,
    )
    # Inner tint
    draw.ellipse(
        (cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10),
        fill=(34, 211, 238, 40),
    )


def draw_avatar_monogram(img: Image.Image, cx: int, cy: int) -> None:
    """Stylized 'DM' monogram on the avatar circle."""
    draw = ImageDraw.Draw(img)
    font_big = load_font(160)
    text = "DM"
    bbox = draw.textbbox((0, 0), text, font=font_big)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        (cx - tw // 2 - bbox[0], cy - th // 2 - bbox[1]),
        text,
        font=font_big,
        fill=TEXT_PRIMARY,
    )


def draw_title(img: Image.Image, title: str, y: int) -> int:
    """Draw large title, returns next y position."""
    draw = ImageDraw.Draw(img)
    font = load_font(76)
    bbox = draw.textbbox((0, 0), title, font=font)
    th = bbox[3] - bbox[1]
    draw.text((80, y), title, font=font, fill=TEXT_PRIMARY)
    return y + th + 10


def draw_subtitle(img: Image.Image, subtitle: str, y: int) -> int:
    """Draw subtitle in secondary color, returns next y."""
    draw = ImageDraw.Draw(img)
    font = load_font(38)
    draw.text((80, y), subtitle, font=font, fill=TEXT_SECONDARY)
    bbox = draw.textbbox((0, 0), subtitle, font=font)
    return y + (bbox[3] - bbox[1]) + 20


def draw_tagline(img: Image.Image, tagline: str, y: int) -> None:
    """Draw small tagline at bottom."""
    draw = ImageDraw.Draw(img)
    font = load_font(28)
    draw.text((80, y), tagline, font=font, fill=TEXT_SECONDARY)


def draw_footer(img: Image.Image, text: str) -> None:
    """Draw URL footer at bottom-right."""
    draw = ImageDraw.Draw(img)
    font = load_font(32)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    w = img.size[0]
    draw.text((w - tw - 80, img.size[1] - 70), text, font=font, fill=ACCENT_CYAN)


def make_og_image(
    out_path: Path,
    title: str,
    subtitle: str,
    tagline: str,
    accent_color: tuple[int, int, int] = ACCENT_CYAN,
) -> None:
    """Render a 1200x630 OG image."""
    img = Image.new("RGB", (1200, 630), BG_TOP)
    draw_gradient_bg(img)

    # Decorative top accent stripe
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rectangle((0, 0, 1200, 6), fill=accent_color)

    # Avatar circle top-right
    draw_glass_circle(img, 1010, 180, 130)
    draw_avatar_monogram(img, 1010, 180)

    # Title block
    y = 200
    y = draw_title(img, title, y)
    y = draw_subtitle(img, subtitle, y)

    # Tagline below
    draw_tagline(img, tagline, y + 30)

    # URL footer
    draw_footer(img, "daryl.sh")

    img.save(out_path, "PNG", optimize=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"  -> {out_path.relative_to(REPO_ROOT)} ({size_kb:.1f} KB)")


def make_avatar(out_path: Path) -> None:
    """Render 400x400 avatar (square, JPEG)."""
    img = Image.new("RGB", (400, 400), BG_TOP)
    draw_gradient_bg(img)
    draw_glass_circle(img, 200, 200, 160)
    draw_avatar_monogram(img, 200, 200)
    img.save(out_path, "JPEG", quality=88, optimize=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"  -> {out_path.relative_to(REPO_ROOT)} ({size_kb:.1f} KB)")


def main() -> None:
    OG_DIR.mkdir(parents=True, exist_ok=True)
    (OG_DIR / "es").mkdir(exist_ok=True)
    (OG_DIR / "en").mkdir(exist_ok=True)

    print("Generating OG images...")

    # ES home
    make_og_image(
        OG_DIR / "es" / "home.png",
        title="Daryl Mendoza",
        subtitle="DevOps / SRE Engineer",
        tagline="AWS . GCP . Kubernetes . Terraform . CI/CD . GitHub Actions",
    )
    # EN home
    make_og_image(
        OG_DIR / "en" / "home.png",
        title="Daryl Mendoza",
        subtitle="DevOps / SRE Engineer",
        tagline="AWS . GCP . Kubernetes . Terraform . CI/CD . GitHub Actions",
        accent_color=ACCENT_VIOLET,
    )

    # ES default
    make_og_image(
        OG_DIR / "es" / "default.png",
        title="Daryl Mendoza",
        subtitle="Portfolio",
        tagline="DevOps / SRE Engineer en CDMX",
    )
    # EN default
    make_og_image(
        OG_DIR / "en" / "default.png",
        title="Daryl Mendoza",
        subtitle="Portfolio",
        tagline="DevOps / SRE Engineer in Mexico City",
        accent_color=ACCENT_VIOLET,
    )

    # Avatar (JSON-LD Person photo)
    make_avatar(OG_DIR / "avatar.jpg")

    print("Done.")


if __name__ == "__main__":
    main()
