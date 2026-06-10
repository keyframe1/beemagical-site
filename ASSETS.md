# Footage asset manifest

Everything below was extracted from four raw Instagram screen recordings
(bee1.mp4 to bee4.mp4, kept untracked in the repo root). The Instagram chrome
(nav, comments, cursor) was cropped away per clip. Stills and grid thumbnails
are footage-resolution placeholders, meant to be swapped for real photos later.

## Video clips (public/video/)

| File | Source | Content | Used in |
| --- | --- | --- | --- |
| celestial-timelapse.mp4 / .webm | bee2, 68s to 86s | The Return, finished UFO glow over standing stones, 18s loop | Hero background |
| celestial-process.mp4 / .webm | bee2, 47s to 65s | The Return mid-paint, sketch to teal underglow, 18s | About panel |
| portrait-timelapse-a.mp4 / .webm | bee2, 6s to 21.5s | Portrait time-lapse, dark background, warm skin tones | Commissions card |
| portrait-timelapse-b.mp4 / .webm | bee3, 32s to 49s | Portrait time-lapse with reference inset | Commissions card |

Each clip also has a `<name>-poster.jpg` extracted from a representative frame.
All clips are muted, h264 (mp4) plus vp9 (webm), faststart, yuv420p, 30fps.

## Stills (src/assets/art/)

From finished-painting posts in bee1 (about 840 to 1040 px wide):

| File | Artwork |
| --- | --- |
| aurora-wolf.jpg | Wolf, purple and green aurora over dark water, 2022 |
| uncreated-nebula.jpg | Uncreated Nebula, 2016 |
| smaragdine-nebula.jpg | Smaragdine, 2016 |
| tardis-nebula.jpg | Time and Relative Dimension in Space, 2018 |
| aurora-borealis.jpg | Aurora, 2016 |
| rocket-girl.jpg | Rocket Girl digital piece, 2022 |
| sketch-girl.jpg | Expressive rainbow-hair sketch |
| luna.jpg | Luna, moon-crowned face in storm clouds |

From the reel final frames (580 px wide):

| File | Artwork |
| --- | --- |
| the-return.jpg | The Return, finished frame |

From the profile grid scroll in bee1 and bee4 (about 210 px, lowest resolution,
first in line for high-res replacements):

| File | Artwork |
| --- | --- |
| bee-moon.jpg | Bee Magical neon bee emblem |
| moon-clouds.jpg | Crescent moon in storm clouds |
| galaxy-fae.jpg | Fae portrait with nebula crown |
| violet-woman.jpg | Violet-haired portrait on stars |
| selkie-girl.jpg | Selkie girl in sealskin |
| amethyst-girl.jpg | Purple and green hair portrait |
| redhead-girl.jpg | Red-haired girl with braids |
| aurora-sky.jpg | Loose aurora study |
| black-cat.jpg | Black cat pet portrait |
| fluffy-cat.jpg | White fluffy cat pet portrait |
| boxer-dog.jpg | Boxer dog pet portrait |
| poodle.jpg | Poodle pet portrait |
| rottweiler.jpg | Rottweiler pet portrait |

Titles for grid-extracted pieces are descriptive placeholders; correct them in
`src/content/art/*.json` when the real titles are known.
