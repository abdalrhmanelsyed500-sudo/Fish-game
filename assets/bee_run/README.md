# Bee Humanoid — Stage 1: RUN Sample (for approval)

Right-facing, in-place run cycle of the supplied bee-humanoid character,
drawn programmatically at native pixel resolution (no AI-generated poses,
no scaledown/pixelate filter), so the character identity cannot drift
between frames: head/hood/face, antennae, wings and the 4 abdominal
stripes are produced by the same drawing code in every frame; only limb
poses, body bounce, antenna wobble and wing flutter vary.

## Files

| File | Contents |
|---|---|
| `bee_run_right_sheet.png` | Production sheet, **1024×128**, 8 cells of 128×128, 0px spacing, transparent, no grid/labels |
| `frames/bee_run_frame_00.png` … `bee_run_frame_07.png` | Individual transparent 128×128 frames (pixel-identical to the sheet cells — verified in code) |
| `bee_run_preview.gif` | Looping animated GIF, 128×128, 8 frames, 90 ms/frame ≈ **11.1 FPS** (GIF stores delays in centiseconds), transparent background |
| `bee_run_preview_3x.gif` | Same 8 frames at 3× nearest-neighbour for easy inspection — **preview only, do not import** |
| `bee_run_contact_sheet.png` | Inspection sheet at 2× with frame boundaries, numbers and the ground line (red) |
| `../../tools/generate_bee_run.py` | Generator + validator (Python 3 + Pillow): `python3 tools/generate_bee_run.py` |

## Specs

- Frame size **128×128** (kept — face, antennae, wings and long legs all
  remain readable; content bounds are x≈8–95, y≈0–118, nothing cropped)
- Anchor: character centred at x≈62; **ground line y = 117** (bottom of a
  contact shoe). Recommended engine pivot: centre-bottom at (64, 117).
- Direction: right, side view with a 3/4 face so both bulging eyes and the
  long nose survive the turn (a pure profile would hide the face that
  defines the character).
- Palette (locked): golds `#F5B00C / #FFD43E / #FFE88C / #D68408 / #A66206`,
  stripes `#262830` + `#4A4E5C`, face/legs `#CDD4DB / #9CA6B2 / #606874`,
  wings `#BCC6D4 / #96A2B6 / #E2EAF4`, outline `#2E2616`.

## Pose loop (loops 07 → 00)

0 contact A · 1 compression A · 2 passing A · 3 push-off/flight A ·
4 contact B · 5 compression B · 6 passing B · 7 push-off/flight B

Body bounce, counter-swinging arms, antenna lag and wing flutter are
synchronised to these phases.

## Known limitations / decisions to approve or change

1. Only **one reference image file** was attached to the request, so it was
   used as both identity and style authority. If you have the second
   (original, non-pixel) reference, share it and the face/proportions can
   be re-locked before any new animation is made.
2. In side view the two wings are shown swept back and overlapping (far
   wing darker/higher) rather than spread to both sides as in the front
   reference — standard for a runner, but easy to change.
3. This is **Stage 1 only**. No idle/walk/jump/fly/etc. will be produced
   until this sample is explicitly approved.
