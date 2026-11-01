# Tiles the review capture frames into motion strips and contact sheets for the critics.
#   python tools/review/compose.py screenshots/review-loop-N
# Writes <set>/strips/<viewport>-S<n>.png (6 frames side by side) and <set>/sheets/<viewport>-<k>.png.
import os, sys, glob
from PIL import Image, ImageDraw
root = sys.argv[1]
for vp in ('desktop', 'mobile'):
    d = os.path.join(root, vp)
    if not os.path.isdir(d): continue
    os.makedirs(os.path.join(root, 'strips'), exist_ok=True)
    for s in sorted({os.path.basename(p).split('-')[0] for p in glob.glob(os.path.join(d, 'S*-*.png'))}):
        frames = sorted(glob.glob(os.path.join(d, f'{s}-*.png')), key=lambda p: int(p.rsplit('-', 1)[1][:-4]))
        ims = [Image.open(p).convert('RGB') for p in frames]
        scale = 0.5 if vp == 'desktop' else 0.35
        ims = [im.resize((int(im.width * scale), int(im.height * scale))) for im in ims]
        W = sum(i.width for i in ims) + 8 * (len(ims) - 1)
        strip = Image.new('RGB', (W, ims[0].height + 24), (20, 20, 20))
        x = 0
        dr = ImageDraw.Draw(strip)
        for k, im in enumerate(ims):
            strip.paste(im, (x, 24)); dr.text((x + 6, 5), f'{s} frame {k + 1}', fill=(255, 255, 255)); x += im.width + 8
        strip.save(os.path.join(root, 'strips', f'{vp}-{s}.png'))
    frames = sorted(glob.glob(os.path.join(d, 'R*.png')))
    os.makedirs(os.path.join(root, 'sheets'), exist_ok=True)
    per, cols = (6, 3) if vp == 'desktop' else (8, 4)
    for k in range(0, len(frames), per):
        group = frames[k:k + per]
        ims = [Image.open(p).convert('RGB') for p in group]
        tw = 640 if vp == 'desktop' else 300
        ims = [im.resize((tw, int(im.height * tw / im.width))) for im in ims]
        th = max(i.height for i in ims) + 22
        rows = (len(ims) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * tw + (cols - 1) * 6, rows * th), (20, 20, 20))
        dr = ImageDraw.Draw(sheet)
        for j, (im, p) in enumerate(zip(ims, group)):
            x, y = (j % cols) * (tw + 6), (j // cols) * th
            sheet.paste(im, (x, y + 22)); dr.text((x + 4, y + 5), os.path.basename(p)[:-4], fill=(255, 255, 255))
        sheet.save(os.path.join(root, 'sheets', f'{vp}-{k // per + 1}.png'))
print('composed', root)
