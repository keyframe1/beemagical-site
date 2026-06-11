# Footage asset manifest

The video clips and the remaining placeholder stills below were extracted from
four raw Instagram screen recordings (bee1.mp4 to bee4.mp4, kept untracked in
the repo root). The Instagram chrome (nav, comments, cursor) was cropped away
per clip. Footage stills are low resolution and meant to be swapped for real
photos as Hannah supplies them.

## Video clips (public/video/)

| File | Source | Content | Used in |
| --- | --- | --- | --- |
| celestial-timelapse.mp4 / .webm | bee2, 68s to 86s | The Return, finished UFO glow over standing stones, 18s loop | Hero background |
| celestial-process.mp4 / .webm | bee2, 47s to 65s | The Return mid-paint, sketch to teal underglow, 18s | About panel |
| portrait-timelapse-a.mp4 / .webm | bee2, 6s to 21.5s | Portrait time-lapse, dark background, warm skin tones | Commissions card |
| portrait-timelapse-b.mp4 / .webm | bee3, 32s to 49s | Portrait time-lapse with reference inset | Commissions card |

Each clip also has a `<name>-poster.jpg` extracted from a representative frame.
All clips are muted, h264 (mp4) plus vp9 (webm), faststart, yuv420p, 30fps.

## High-resolution pieces from Hannah (src/assets/art/)

Cleanly cropped, signed originals supplied directly. They render through
astro:assets `<Image>` and replaced the footage placeholders of the same
pieces. Titles are exact; mediums and unstated years are best-guesses flagged
with a `_todo` in each `src/content/art/*.json` to confirm with Hannah.

| File | Artwork | Used in |
| --- | --- | --- |
| ultraviolet.jpg | Ultraviolet, fae crowned with a violet nebula, digital | Gallery (node `galaxy-fae`) |
| thereturn.jpg | The Return, standing stones under a teal beam, digital | Gallery (node `the-return`) |
| smarag.jpg | Smaragdine, green nebula, acrylic, signed 2018 | Gallery (node `smaragdine-nebula`) |
| timerelative.jpg | Time and Relative Dimension in Space, pink nebula with a blue box, acrylic, 2018 | Gallery (node `tardis-nebula`) |
| aurora2018.jpg | Aurora, green and purple aurora over a treeline, acrylic, 2018 | Gallery (node `aurora-borealis`) |
| mull.jpg | Mull, purple and green aurora over water, acrylic, signed 2022 | Gallery (node `aurora-wolf`) |
| mull2.jpg | Inspired by Mull (unofficial), aurora over hills, digital | Gallery (node `aurora-sky`) |
| unnamedneb.jpg | Nebula (untitled), amber and teal nebula, acrylic | Gallery (node `uncreated-nebula`) |
| taylor.jpg | Taylor, white poodle, watercolour | Commissions and art strip |
| bird.jpg | Bird, black cat with golden eyes, digital | Commissions and art strip |
| bee-untitled-self.jpg | Untitled self-portrait of the artist, digital | About (artist image) and art strip |

The constellation node ids were kept at their old slugs so each piece holds its
existing chart position and links; only the title, image, medium, and note were
corrected. The superseded low-resolution duplicates (`galaxy-fae.jpg`,
`the-return.jpg`, `smaragdine-nebula.jpg`, `tardis-nebula.jpg`,
`aurora-borealis.jpg`, `aurora-wolf.jpg`, `aurora-sky.jpg`,
`uncreated-nebula.jpg`, `black-cat.jpg`, `poodle.jpg`, `violet-woman.jpg`) were
removed.

## Remaining footage placeholders (src/assets/art/)

Still awaiting high-res replacements. Titles for these are descriptive
placeholders; correct them in `src/content/art/*.json` when the real titles are
known.

| File | Artwork | Used in |
| --- | --- | --- |
| bee-moon.jpg | Bee Magical neon bee emblem | Gallery |
| luna.jpg | Luna, moon-crowned face in storm clouds | Gallery (featured) |
| amethyst-girl.jpg | Purple and green hair portrait | Art strip |
| redhead-girl.jpg | Red-haired girl with braids | Art strip |
| sketch-girl.jpg | Expressive rainbow-hair sketch | Art strip |
| selkie-girl.jpg | Selkie girl in sealskin | Art strip |
| fluffy-cat.jpg | White fluffy cat pet portrait | Art strip |
| boxer-dog.jpg | Boxer dog pet portrait | Art strip |
| rottweiler.jpg | Rottweiler pet portrait | Art strip |
