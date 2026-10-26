# حارس الشعاب العميقة · Deep Reef Warden

استوديو أصول بكسل كامل مكتوب بالكود: الشخصية، العالم، الحركة، اللوحة اللونية، والتصدير.
لا توجد أي صورة جاهزة — كل بكسل يُولَّد في كل إطار.

A complete pixel-art asset studio written entirely in code: character, world, animation,
palette and export pipeline. No pre-made art — every pixel is generated per frame.

![world](docs/hero-world.png)

---

## ما الذي يوجد هنا؟ · What's inside

| | |
|---|---|
| **الشخصية** | `src/art/guardian.js` — بنية مبنية على قياسات الشكل المرجعي (قبعة 108px، رأس 72px، كتفان، جيبوب مرجاني r24، أكمام r33، حذاء عند 350). |
| **العالم** | `src/engine/scene.js` — عمود ماء، أشعة ضوء، ثلاث طبقات عمق، طحالب تهتز، مرجان، فقاعات، ذرات، فينييت. |
| **اللوحة** | `src/art/palette.js` — 66 لونًا في 8 رامبات (ثوب/صدر/جوهرة/ذهب/بنفسج/جلد/حذاء/معدن). |
| **خط البكسل** | `src/engine/pixel.js` — تلوين ناعم ثم تكميم إلى اللوحة مع ترتيب Bayer (8×8) لتوليد ملمس بكسل أصيل. |
| **الهيكل** | `src/engine/rig.js` — 26 قناة تحويل + 8 حركات كدوال رياضية `t → rig` (قابلة للتدقيق والتوليد المحدد). |
| **العرض** | `src/engine/renderer.js` — تصيير عند 320×360 ثم تكبير بدون تنعيم (`image-rendering: pixelated`). |
| **التصدير** | شرائح PNG شفافة، إطار PNG بدقة 4×، وGIF متحرك عبر مُرمِّز GIF89a مكتوب من الصفر (`src/engine/gif.js`). |
| **الواجهة** | `index.html` + `src/app/main.js` — واجهة عربية RTL، مكتبة حركات، خط زمني، تحكم بالسرعة/التكبير/الحدّة. |

## التشغيل · Run

```bash
npm install          # للتطوير فقط (أدوات المعاينة) — الواجهة نفسها تعمل بالمتصفح دون أي حزم
npm run dev          # http://localhost:5173
```

المشروع **بدون أي مكتبات في المتصفح** (لا React ولا Canvas libs) — وحدات ES أصلية.

## الحركات الثمانية · The eight animations

| مفتاح | الاسم | المدة | الفكرة |
|---|---|---|---|
| `idle` | وقوف | 4.2s | تنفّس هادئ + نبض الجوهرة + رمشة |
| `breathe` | تنفّس عميق | 3.4s | تمدد الصدر وتوقيت ثقيل |
| `talk` | كلام | 2.6s | حركة فم متعددة الترددات + إيماءة رأس |
| `bow` | انحناء | 3.6s | تحية ثقيلة ثم رفع |
| `roar` | زئير | 3.2s | شهيق، فتح الفك 17px، ارتجاف القبعة والجسم |
| `cast` | استدعاء | 4.4s | شحن الجوهرة (تكبير + توهّج) ثم إطلاق |
| `walk` | مشي | 1.9s | خطوة متمايلة مع تمايل الثوب |
| `float` | طَفْو | 5.0s | ارتفاع 18px عن الأرض مع رفرفة |

كل حركة دالة مستمرة (`sin`/`smoothstep`) — لا يوجد قطع مفاجئ، والتبديل بينها يعمل بتلاشٍ متقاطع 0.45s.

## أدوات التطوير · Dev tools

```bash
node tools/preview.mjs out.png 3 idle     # إطار واحد مكبّر
node tools/preview.mjs out.png 1 roar 8 4 # شريحة إطارات لحركة
node tools/sheet.mjs 8 1                  # شرائح لكل الحركات → docs/sheets
node tools/gif-test.mjs out.gif cast 16    # GIF متحرك
node tools/smoke.mjs                      # اختبار الواجهة عبر DOM وهمي
node tools/perf.mjs                       # قياس زمن الإطار (المتصفح ~2-4ms/إطار)
```

`@napi-rs/canvas` مستخدم فقط في هذه الأدوات (Node)، وليس في التطبيق.

## مواصفات الأصل · Asset spec

- اللوحة: 66 لونًا ثابتًا، 8 رامبات، إضاءة قمرية من أعلى اليسار + انعكاس دافئ من الجوهرة.
- مساحة الرسم: 320×360 بكسل منطقي (الشخصية ~356px طولًا).
- الظل: مستوي (base + ظل صلب + ضوء صلب) مع خطوط نسيج قليلة — أسلوب يبقى مقروءًا بعد التكميم.
- الخطوط الخارجية: 2–3px حبر موحّد `#04101a` للفصل عن الخلفية.
- الحركة: 60fps تحليلي، مستقل عن معدل الإطارات، والتصدير محدَّد النتيجة (deterministic).

![sheet](docs/sheets/warden-idle-8f@1x.png)

---

## ☁️ حزمة Google Drive / Drive package

```
node tools/drive-export.mjs     # يصدّر docs/drive2x (نسخة 2×)
```

| المجلد | Drive folder |
| --- | --- |
| `docs/drive2x/` | https://drive.google.com/drive/folders/1HPwHCazDqHCs5swkiOVXmNouoAptsca4 |

المحتوى: 8 شرائح `@2x` (5120×720)، لقطتان `@6x` (1920×2160)، 4 صور GIF `@2x` (640×720)، بطاقة اللوحة، `README.txt`، و`deep-reef-warden-source.zip`.

---

# 🐝 Bee — side-view platformer character / شخصية منصات جانبية

Second studio in the repo: a tall, mournful bee-person in a honey costume, built for a **side-view platformer** — and, as requested, **with no black outlines at all**. The silhouette is defined by value + temperature: a warm honey shadow inside, a cool lilac rim on the back edge.

الاستوديو الثاني في المستودع: شخصية نحلة طويلة حزينة بسترة عسل، مصمَّمة لمنصات بمنظور جانبي — و**بدون أي حدود سوداء** كما طلبت. الحافة تُعرَّف بقيمة اللون وحرارته: ظل عسلي دافئ من الداخل، وحافة ليلكية باردة على الظهر.

![Bee world](docs/bee/bee-world@3x.png)

## Run / التشغيل
```bash
npm run dev          # → http://localhost:5173/bee.html
```
| Page | What |
| --- | --- |
| `/index.html` | Deep Reef Warden studio |
| `/bee.html` | **Bee studio** — 9 platformer animations, live scene, exports |

## Animations / الحركات (9)
| key | Arabic | duration | loop | notes |
| --- | --- | --- | --- | --- |
| `idle` | وقوف | 3.20 s | ✔ | breathing, antenna sway, blink |
| `walk` | مشي | 0.92 s | ✔ | full stride, counter-swinging arms |
| `run` | جري | 0.62 s | ✔ | forward lean, long stride |
| `jump` | قفز | 0.58 s | one-shot | anticipation → launch → reach |
| `fall` | سقوط | 0.80 s | ✔ | wings open, legs trailing |
| `land` | هبوط | 0.36 s | one-shot | impact squash + settle |
| `fly` | طيران | 0.60 s | ✔ | fast wing beat, dangling legs |
| `sting` | لسعة | 0.78 s | one-shot | wind-up → thrust → recover |
| `hurt` | إصابة | 0.50 s | one-shot | recoil, eyes shut |

## Export / التصدير
In the page: **sprite strip PNG (8 frames @2×)**, **single frame @4×**, **GIF (20 frames @2×)**, **scene still @2×**.
Headless, everything at once:

```bash
node tools/bee-export.mjs        # → docs/bee/ (9 strips, contact sheet, 4 GIFs, world still, palette)
node tools/bee-scene.mjs out.png idle 1.25 2
node tools/bee-preview.mjs out.png walk 6 2 0 0.15
node tools/smoke-bee.mjs         # expect "SMOKE TEST OK"
```

## Sprite spec / مواصفات الأصول
| | |
| --- | --- |
| Frame | 280 × 268 px (design space, feet at y = 240) |
| Character | 150 design units tall (antennae 176) |
| Sheet | 8 frames left→right, **4480 × 536 @2×**, transparent |
| Palette | 102 colours, zero pure black |
| In-scene height | 130 px on a 480 × 270 stage |

## Files
`src/art/bee.js` (drawing) · `src/art/beePalette.js` · `src/engine/beeRig.js` (9 clips) ·
`src/engine/beeScene.js` (twilight meadow: 3 parallax bands, floating islands, pollen) ·
`src/engine/beeRenderer.js` · `src/app/bee-app.js` · `bee.html` · `tools/bee-*.mjs`

### ☁️ Bee on Drive / حزمة النحلة على الدرايف
https://drive.google.com/drive/folders/1i0vdLqurI88B9yAMAOsKTg4cKdWCpzNF — 9 شرائح @2×، شريحة تجميعية، 4 صور GIF، لقطة العالم، بطاقة اللوحة، و`bee-source.zip`.
