#!/usr/bin/env python3
"""
Stage-1 sample: bee humanoid RUN (right), 8 frames, 128x128 native pixels.

Drawn programmatically at native resolution with a locked palette and a
parameterised pose table, so identity (face/head/wings/stripes/antennae)
is literally the same drawing code in every frame -- only limbs, body
bounce, antenna wobble and wing flutter change. No per-frame regeneration,
therefore no character drift.

Outputs (assets/bee_run/):
  bee_run_right_sheet.png    1024x128 transparent sheet (8 x 128x128)
  frames/bee_run_frame_NN.png individual transparent frames
  bee_run_preview.gif        looping preview, ~11 FPS (90 ms/frame)
  bee_run_contact_sheet.png  inspection sheet (2x, grid + numbers)
"""
from PIL import Image, ImageDraw, ImageFont, ImageChops
import math
import os

W = H = 128
N = 8
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "bee_run")

# ---------------- locked palette (sampled from the references) -------------
Y_MAIN   = (245, 176,  12, 255)   # warm golden yellow
Y_LIGHT  = (255, 212,  62, 255)
Y_PALE   = (255, 232, 140, 255)
Y_SHADOW = (214, 132,   8, 255)   # amber
Y_DARK   = (166,  98,   6, 255)   # ochre / dark golden brown
Y_FAR    = (222, 148,  10, 255)   # far-side arm (darker)
OUTLINE  = ( 46,  38,  22, 255)   # warm near-black outline
STRIPE   = ( 38,  40,  48, 255)   # charcoal stripes
STRIPE_H = ( 74,  78,  92, 255)   # stripe highlight
FACE     = (205, 212, 219, 255)   # pale grey face / near leg
FACE_SH  = (156, 166, 178, 255)
LEG_NEAR = (205, 212, 219, 255)
LEG_FAR  = (150, 160, 172, 255)
GREY_D   = ( 96, 104, 116, 255)
EYE      = ( 24,  26,  32, 255)
WING_N   = (188, 198, 212, 255)   # near wing silver
WING_N_D = (150, 162, 182, 255)
WING_F   = (150, 162, 182, 255)   # far wing darker
WING_F_D = (116, 128, 150, 255)
WING_HI  = (226, 234, 244, 255)
WING_OUT = ( 92, 104, 124, 255)

GROUND = 117   # baseline: soles touch here in contact poses

# ---------------- pose table -------------------------------------------------
# per frame: bounce (px added to body y; + = lower), antenna lag (x px),
# wing flutter (px added to wing-tip y; - = raised),
# legs: (hip, knee, ankle, toe) absolute-ish points; hip y/x ride the bounce.
# arms: (shoulder, elbow, hand).
# Frames 4-7 mirror 0-3 with the legs/arms swapped.
POSES = [
    # 0 CONTACT A - near leg reaches forward, far leg trails
    dict(b=0, ant=-1, wing=0,
         near_leg=((63, 80), (75, 97), (81, 114), (89, 115)),
         far_leg =((59, 80), (52, 96), (43, 107), (36, 110)),
         near_arm=((70, 50), (72, 64), (64, 76)),
         far_arm =((49, 50), (43, 65), (48, 78))),
    # 1 DOWN / COMPRESSION A - body lowest, support knee bent
    dict(b=3, ant=0, wing=2,
         near_leg=((63, 83), (72, 100), (72, 114), (80, 115)),
         far_leg =((59, 83), (49, 99), (42, 103), (36, 108)),
         near_arm=((70, 53), (72, 67), (66, 79)),
         far_arm =((49, 53), (44, 68), (49, 80))),
    # 2 PASSING A - far leg swings through tucked under the body
    dict(b=1, ant=-2, wing=-2,
         near_leg=((63, 81), (64, 99), (62, 114), (70, 115)),
         far_leg =((59, 81), (71, 100), (64, 111), (57, 114)),
         near_arm=((70, 51), (73, 65), (71, 78)),
         far_arm =((49, 51), (41, 66), (40, 79))),
    # 3 PUSH-OFF / FLIGHT A - body highest, support leg extends behind
    dict(b=-3, ant=-3, wing=-4,
         near_leg=((63, 77), (55, 95), (45, 108), (38, 111)),
         far_leg =((59, 77), (74, 92), (85, 104), (92, 103)),
         near_arm=((70, 47), (75, 60), (82, 69)),
         far_arm =((49, 47), (40, 61), (35, 73))),
    # 4 CONTACT B - leg/arm phases swapped (shoulders & hips stay put)
    dict(b=0, ant=-1, wing=0,
         far_leg =((59, 80), (74, 97), (81, 114), (89, 115)),
         near_leg=((63, 80), (54, 96), (43, 107), (36, 110)),
         far_arm =((49, 50), (40, 64), (36, 76)),
         near_arm=((70, 50), (75, 63), (82, 72))),
    # 5 DOWN B
    dict(b=3, ant=0, wing=2,
         far_leg =((59, 83), (70, 100), (72, 114), (80, 115)),
         near_leg=((63, 83), (51, 99), (42, 103), (36, 108)),
         far_arm =((49, 53), (41, 67), (38, 79)),
         near_arm=((70, 53), (75, 66), (80, 75))),
    # 6 PASSING B
    dict(b=1, ant=-2, wing=-2,
         far_leg =((59, 81), (62, 99), (62, 114), (70, 115)),
         near_leg=((63, 81), (73, 100), (66, 111), (59, 114)),
         far_arm =((49, 51), (44, 66), (45, 79)),
         near_arm=((70, 51), (72, 65), (69, 78))),
    # 7 PUSH-OFF / FLIGHT B -> loops into frame 0
    dict(b=-3, ant=-3, wing=-4,
         far_leg =((59, 77), (53, 95), (45, 108), (38, 111)),
         near_leg=((63, 77), (76, 92), (85, 104), (92, 103)),
         far_arm =((49, 47), (44, 62), (49, 75)),
         near_arm=((70, 47), (71, 61), (64, 72))),
]

# ---------------- helpers -----------------------------------------------------

def limb(d, pts, fill, outline, ow=6, iw=3):
    """Thin limb: wide dark pass = outline, narrow light pass = fill."""
    d.line(pts, fill=outline, width=ow, joint="curve")
    for x, y in (pts[0], pts[-1]):               # round only the ends
        r = ow // 2
        d.ellipse([x - r, y - r, x + r, y + r], fill=outline)
    d.line(pts, fill=fill, width=iw, joint="curve")
    for x, y in (pts[0], pts[-1]):
        r = iw // 2
        d.ellipse([x - r, y - r, x + r, y + r], fill=fill)


def _rot_ellipse(cx, cy, rx, ry, deg):
    a = math.radians(deg)
    pts = []
    for k in range(24):
        t = 2 * math.pi * k / 24
        x, y = rx * math.cos(t), ry * math.sin(t)
        pts.append((round(cx + x * math.cos(a) - y * math.sin(a)),
                    round(cy + x * math.sin(a) + y * math.cos(a))))
    return pts


def wing(img, center, radii, angle, base, dark, hi, root):
    """Broad elongated wing = rotated ellipse, shading clipped to it."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    cx, cy = center
    rx, ry = radii
    pts = _rot_ellipse(cx, cy, rx, ry, angle)
    ld.polygon(pts, fill=base)
    mask = layer.split()[3].copy()
    # flat shading clusters (clipped below): dark lower rim, pale top streak
    ld.polygon(_rot_ellipse(cx + 1, cy + ry // 2 + 3, rx - 5, max(ry - 5, 3), angle), fill=dark)
    ld.polygon(_rot_ellipse(cx - 4, cy - ry // 2, rx - 12, max(ry - 6, 2), angle), fill=hi)
    # subtle streaks parallel to the long axis (translucent-wing texture)
    a = math.radians(angle)
    ux, uy = math.cos(a), math.sin(a)          # toward root
    vx, vy = -math.sin(a), math.cos(a)         # perpendicular
    for off, ln in ((-3, 0.55), (0, 0.8), (3, 0.5)):
        sx, sy = cx + vx * off, cy + vy * off
        ex, ey = cx - ux * rx * ln + vx * off * 0.4, cy - uy * rx * ln + vy * off * 0.4
        ld.line([(round(sx), round(sy)), (round(ex), round(ey))], fill=dark, width=1)
    ld.line([root, (round(cx - ux * 6), round(cy - uy * 6))], fill=dark, width=1)
    layer.putalpha(ImageChops.darker(layer.split()[3], mask))
    ld = ImageDraw.Draw(layer)
    ld.polygon(pts, outline=WING_OUT, width=2)
    img.alpha_composite(layer)


def draw_character(p):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    b = p["b"]

    # --- wings (both behind torso; far one higher + darker) ---
    fl = p["wing"]
    wing(img, (36, 23 + b + fl // 2), (21, 7), 26 + fl, WING_F, WING_F_D, WING_N_D, (54, 32 + b))
    # --- far leg, far arm (behind body) ---
    limb(d, p["far_leg"], LEG_FAR, GREY_D, 5, 3)
    wing(img, (31, 35 + b + fl // 2), (25, 9), 24 + fl, WING_N, WING_N_D, WING_HI, (53, 45 + b))
    d = ImageDraw.Draw(img)
    limb(d, p["far_arm"], Y_FAR, OUTLINE, 5, 3)

    # --- abdomen + chest, shading & stripes clipped to the body mask ---
    body = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    ab = [41, 39 + b, 84, 89 + b]                 # big rounded abdomen
    bd.ellipse(ab, fill=Y_SHADOW)
    bd.polygon([(50, 54 + b), (78, 54 + b), (76, 38 + b), (56, 36 + b)], fill=Y_SHADOW)  # chest/neck
    mask = body.split()[3].copy()
    bd.ellipse([44, 38 + b, 85, 87 + b], fill=Y_MAIN)      # leaves shade as rim
    bd.ellipse([54, 38 + b, 86, 72 + b], fill=Y_LIGHT)     # lit belly/chest
    bd.ellipse([62, 43 + b, 77, 56 + b], fill=Y_PALE)      # chest highlight
    body.putalpha(ImageChops.darker(body.split()[3], mask))
    stripes = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stripes)
    for sy in (56, 64, 72, 79):                   # 4 stripes, as in reference
        sd.polygon([(36, sy + b), (62, sy + 1 + b), (88, sy + b),
                    (88, sy + 3 + b), (62, sy + 4 + b), (36, sy + 3 + b)], fill=STRIPE)
    stripes.putalpha(ImageChops.darker(stripes.split()[3], mask))
    body.alpha_composite(stripes)
    bd = ImageDraw.Draw(body)
    for sy in (56, 64, 72, 79):                   # 1px sheen on each stripe
        bd.line([(48, sy + b), (76, sy + b)], fill=STRIPE_H, width=1)
    bd.ellipse(ab, outline=OUTLINE, width=2)
    bd.line([(56, 37 + b), (52, 48 + b)], fill=OUTLINE, width=2)   # chest back edge
    img.alpha_composite(body)
    d = ImageDraw.Draw(img)

    # --- near leg & near arm (in front of abdomen) ---
    limb(d, p["near_leg"], LEG_NEAR, GREY_D, 5, 3)
    limb(d, p["near_arm"], Y_MAIN, OUTLINE, 5, 3)
    hx, hy = p["near_arm"][-1]                    # little hand blob
    d.ellipse([hx - 2, hy - 2, hx + 2, hy + 3], fill=Y_MAIN, outline=OUTLINE)

    # --- hood + face (3/4 side view, facing right) ---
    d.ellipse([54, 15 + b, 86, 47 + b], fill=Y_MAIN, outline=OUTLINE, width=1)   # hood
    d.ellipse([57, 18 + b, 75, 33 + b], fill=Y_LIGHT)
    d.ellipse([63, 21 + b, 85, 45 + b], fill=FACE, outline=GREY_D, width=1)      # pale face
    d.line([(65, 32 + b), (66, 41 + b)], fill=FACE_SH, width=2)                  # cheek shade
    # long drooping nose drawn on the 3/4 face: bridge line + blunt tip bump
    d.line([(78, 30 + b), (82, 37 + b)], fill=GREY_D, width=1)
    d.polygon([(80, 33 + b), (86, 36 + b), (84, 40 + b), (80, 38 + b)],
              fill=FACE, outline=GREY_D)
    d.point((83, 38 + b), fill=GREY_D)                                           # nostril
    # droopy bulging eyes: visible whites, dark iris, heavy upper lid (not cute)
    def eye(x0, y0, wdt, hgt):
        d.ellipse([x0, y0 + b, x0 + wdt, y0 + hgt + b],
                  fill=(240, 244, 248, 255), outline=EYE)
        d.ellipse([x0 + wdt // 2 - 1, y0 + 2 + b, x0 + wdt - 1, y0 + hgt + b], fill=EYE)
        d.point((x0 + wdt // 2, y0 + 3 + b), fill=(255, 255, 255, 255))
        d.line([(x0, y0 + b), (x0 + wdt, y0 + b)], fill=GREY_D, width=1)         # lid
    eye(67, 28, 5, 6)          # far eye
    eye(75, 27, 6, 7)          # near eye
    d.line([(66, 26 + b), (71, 26 + b)], fill=FACE_SH, width=1)  # brow shadows
    d.line([(74, 25 + b), (80, 25 + b)], fill=FACE_SH, width=1)
    d.line([(76, 42 + b), (80, 42 + b)], fill=EYE, width=1)      # small flat mouth

    # --- antennae: two black stalks, yellow bulbs, wobble lag ---
    for (bx, by), (tx, ty) in (((63, 17 + b), (58 + p["ant"], 6 + b // 2)),
                               ((73, 16 + b), (76 + p["ant"], 4 + b // 2))):
        d.line([(bx, by), ((bx + tx) // 2, (by + ty) // 2 - 1), (tx, ty)], fill=EYE, width=2)
        d.ellipse([tx - 3, ty - 3, tx + 3, ty + 3], fill=Y_LIGHT, outline=Y_DARK)
        d.point((tx - 1, ty - 1), fill=Y_PALE)
    return img


def main():
    frames_dir = os.path.join(OUT, "frames")
    os.makedirs(frames_dir, exist_ok=True)
    frames = [draw_character(p) for p in POSES]
    for i, f in enumerate(frames):
        f.save(os.path.join(frames_dir, f"bee_run_frame_{i:02d}.png"))

    sheet = Image.new("RGBA", (W * N, H), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.alpha_composite(f, (i * W, 0))
    sheet.save(os.path.join(OUT, "bee_run_right_sheet.png"))

    # GIF: palettised with a dedicated transparent index, ~11 FPS (90 ms; GIF stores delays in centiseconds)
    gif_frames = []
    for f in frames:
        q = f.quantize(colors=255, method=Image.FASTOCTREE)
        q.info["transparency"] = 255
        pal = q.getpalette() or []
        pal = (pal + [0] * (256 * 3))[: 256 * 3]
        alpha = f.split()[3]
        # punch fully-transparent pixels to index 255
        px, ax = q.load(), alpha.load()
        for yy in range(H):
            for xx in range(W):
                if ax[xx, yy] < 128:
                    px[xx, yy] = 255
        q.putpalette(pal)
        gif_frames.append(q)
    gif_frames[0].save(
        os.path.join(OUT, "bee_run_preview.gif"), save_all=True,
        append_images=gif_frames[1:], duration=90, loop=0,
        transparency=255, disposal=2, optimize=False)
    # inspection-only 3x nearest-neighbour preview (same frames, not for engine)
    big = [q.resize((W * 3, H * 3), Image.NEAREST) for q in gif_frames]
    big[0].save(
        os.path.join(OUT, "bee_run_preview_3x.gif"), save_all=True,
        append_images=big[1:], duration=90, loop=0,
        transparency=255, disposal=2, optimize=False)

    # Contact sheet: 2x nearest, checker-free mid grey bg, grid + numbers
    S = 2
    cs = Image.new("RGBA", (W * N * S, (H + 14) * S), (90, 100, 112, 255))
    for i, f in enumerate(frames):
        cs.alpha_composite(f.resize((W * S, H * S), Image.NEAREST), (i * W * S, 0))
    cd = ImageDraw.Draw(cs)
    try:
        font = ImageFont.load_default(size=18)
    except TypeError:
        font = ImageFont.load_default()
    for i in range(N + 1):
        cd.line([(i * W * S, 0), (i * W * S, H * S)], fill=(240, 240, 240, 255), width=1)
        if i < N:
            cd.text((i * W * S + 6, H * S + 4), f"{i:02d}", fill=(255, 255, 255, 255), font=font)
    cd.line([(0, GROUND * S), (W * N * S, GROUND * S)], fill=(255, 90, 90, 255), width=1)
    cs.save(os.path.join(OUT, "bee_run_contact_sheet.png"))

    # ---- validation ----
    sh = Image.open(os.path.join(OUT, "bee_run_right_sheet.png"))
    gf = Image.open(os.path.join(OUT, "bee_run_preview.gif"))
    assert sh.size == (1024, 128) and sh.mode == "RGBA", (sh.size, sh.mode)
    assert gf.n_frames == 8, gf.n_frames
    assert abs(gf.info["duration"] - 90) <= 10, gf.info["duration"]
    for i in range(N):
        cell = sh.crop((i * W, 0, (i + 1) * W, H))
        solo = Image.open(os.path.join(frames_dir, f"bee_run_frame_{i:02d}.png"))
        assert solo.size == (W, H)
        assert cell.tobytes() == solo.tobytes(), f"sheet/frame {i} mismatch"
    print(f"OK  sheet={sh.size} mode={sh.mode}  gif frames={gf.n_frames} "
          f"duration={gf.info['duration']}ms loop={gf.info.get('loop')}")
    for i, f in enumerate(frames):
        print(f" frame {i}: bbox={f.split()[3].getbbox()}")


if __name__ == "__main__":
    main()
