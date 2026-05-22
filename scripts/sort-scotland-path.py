"""
Reads public/Scotland.svg, splits its single <path> into subpaths,
computes the absolute start position of each subpath by tracking the
SVG path cursor, sorts the subpaths clockwise by angle from the centre
of all their start-points, then writes the result to
src/components/scotland-path.ts so the pulse travels smoothly:
mainland first (it is the first subpath in the file), then islands
in clockwise order.
"""

import re
import math
import os

# ── tokeniser ──────────────────────────────────────────────────────────────

TOKEN_RE = re.compile(
    r'[MmCcLlHhVvZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?'
)

def tokenise(d: str):
    return TOKEN_RE.findall(d)


# ── cursor tracker ─────────────────────────────────────────────────────────

def track(tokens):
    """
    Walk the token list, tracking the cursor.

    Returns a list of subpaths, each as:
        {
          'start': (abs_x, abs_y),   # absolute start of this subpath
          'raw':   str,              # original raw text of this subpath
                                     # with the leading m replaced by M abs
        }
    """
    subpaths = []
    cx = cy = 0.0          # current cursor (absolute)
    sx = sy = 0.0          # current subpath start (for Z)
    raw_parts = []         # raw tokens for the current subpath
    subpath_start = None

    i = 0
    raw_start = 0          # token index where the current subpath started

    def flush(end_i):
        if subpath_start is not None and raw_parts:
            subpaths.append({
                'start': subpath_start,
                'raw_tokens': list(raw_parts),
            })

    n = len(tokens)

    while i < n:
        cmd = tokens[i]
        i += 1

        # ── moveto ─────────────────────────────────────────────────────
        if cmd in ('M', 'm'):
            flush(i - 1)
            dx, dy = float(tokens[i]), float(tokens[i + 1])
            i += 2
            if cmd == 'm':
                cx += dx
                cy += dy
            else:
                cx, cy = dx, dy
            sx, sy = cx, cy
            subpath_start = (cx, cy)
            raw_parts = ['M', str(cx), str(cy)]  # always absolute M

            # implicit lineto args after initial coord
            while i < n and not tokens[i].isalpha():
                dx, dy = float(tokens[i]), float(tokens[i + 1])
                i += 2
                if cmd == 'm':
                    cx += dx; cy += dy
                else:
                    cx, cy = dx, dy
                raw_parts += ['L', str(cx), str(cy)]  # always absolute L

        # ── cubic bezier ───────────────────────────────────────────────
        elif cmd in ('C', 'c'):
            raw_parts.append(cmd)
            while i < n and not tokens[i].isalpha():
                nums = [float(tokens[i + j]) for j in range(6)]
                i += 6
                if cmd == 'c':
                    cx += nums[4]; cy += nums[5]
                else:
                    cx, cy = nums[4], nums[5]
                raw_parts += [str(v) for v in nums]

        # ── lineto ─────────────────────────────────────────────────────
        elif cmd in ('L', 'l'):
            raw_parts.append(cmd)
            while i < n and not tokens[i].isalpha():
                dx, dy = float(tokens[i]), float(tokens[i + 1])
                i += 2
                if cmd == 'l':
                    cx += dx; cy += dy
                else:
                    cx, cy = dx, dy
                raw_parts += [str(cx), str(cy)]

        # ── horizontal line ────────────────────────────────────────────
        elif cmd in ('H', 'h'):
            raw_parts.append(cmd)
            while i < n and not tokens[i].isalpha():
                val = float(tokens[i]); i += 1
                cx = cx + val if cmd == 'h' else val
                raw_parts.append(str(cx))

        # ── vertical line ──────────────────────────────────────────────
        elif cmd in ('V', 'v'):
            raw_parts.append(cmd)
            while i < n and not tokens[i].isalpha():
                val = float(tokens[i]); i += 1
                cy = cy + val if cmd == 'v' else val
                raw_parts.append(str(cy))

        # ── close ──────────────────────────────────────────────────────
        elif cmd in ('Z', 'z'):
            raw_parts.append('z')
            cx, cy = sx, sy

    flush(i)
    return subpaths


# ── clockwise sort ─────────────────────────────────────────────────────────

def clockwise_angle(cx, cy, px, py):
    """
    Clockwise angle (in SVG coords, y-down) from centre (cx,cy) to point (px,py).
    0 = due north (up), increases clockwise.
    """
    dx = px - cx
    dy = py - cy            # positive = south in SVG
    # atan2 in SVG coords (y-down) gives clockwise angle from east.
    # Rotate so 0 = north: subtract π/2.
    angle = math.atan2(dx, -dy)   # 0 = north, CW positive
    if angle < 0:
        angle += 2 * math.pi
    return angle


# ── main ───────────────────────────────────────────────────────────────────

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    svg_path = os.path.join(repo_root, 'public', 'Scotland.svg')
    out_path = os.path.join(repo_root, 'src', 'components', 'scotland-path.ts')

    with open(svg_path, encoding='utf-8') as f:
        svg_text = f.read()

    # Extract viewBox
    vb_match = re.search(r'viewBox="([^"]+)"', svg_text)
    viewbox = vb_match.group(1) if vb_match else '0 0 114.38154 180.80124'

    # Extract the big path d attribute (the one with 87 subpaths)
    d_match = re.search(r'\bd="(m\s[-\d.]+[^"]{1000,})"', svg_text, re.DOTALL)
    if not d_match:
        raise RuntimeError("Could not find the Scotland path in the SVG.")
    d = d_match.group(1)

    tokens = tokenise(d)
    subpaths = track(tokens)

    print(f"Found {len(subpaths)} subpaths.")

    # ── separate mainland (first, longest) from islands ────────────────
    # Sort all by raw token length descending to find the two longest.
    by_len = sorted(range(len(subpaths)), key=lambda i: len(subpaths[i]['raw_tokens']), reverse=True)
    print("Top 5 by token count:")
    for rank, idx in enumerate(by_len[:5]):
        sp = subpaths[idx]
        print(f"  #{idx}: {len(sp['raw_tokens'])} tokens, start={sp['start']}")

    # The mainland is the first subpath in the file (index 0).
    # It starts at the south of Scotland and is one of the two longest.
    mainland = subpaths[0]
    islands = subpaths[1:]

    # Centre of all island start-points for clockwise sorting
    if islands:
        cx = sum(s['start'][0] for s in islands) / len(islands)
        cy = sum(s['start'][1] for s in islands) / len(islands)
        print(f"Island centroid: ({cx:.2f}, {cy:.2f})")

        islands.sort(key=lambda s: clockwise_angle(cx, cy, s['start'][0], s['start'][1]))

    # ── extract SVG transforms so we can pre-apply them ───────────────
    # The SVG has translate on both the <g> and the <path> element.
    # We bake them in so the output path sits in the viewBox coord space
    # and the component needs no runtime transform.
    def parse_translate(svg_text, selector):
        m = re.search(rf'<{selector}[^>]*transform="translate\(([^)]+)\)"', svg_text, re.DOTALL)
        if not m:
            return 0.0, 0.0
        parts = m.group(1).split(',')
        return float(parts[0]), float(parts[1])

    gx, gy = parse_translate(svg_text, 'g')
    px, py = parse_translate(svg_text, 'path')
    tx, ty = gx + px, gy + py
    print(f"Combined transform: translate({tx:.6f}, {ty:.6f})")

    # ── reconstruct path d (with transforms baked into M coordinates) ──
    # Translations don't affect relative commands, only the M origin.
    def subpath_to_str(sp):
        toks = list(sp['raw_tokens'])
        # toks[0] = 'M', toks[1] = abs_x, toks[2] = abs_y
        toks[1] = str(float(toks[1]) + tx)
        toks[2] = str(float(toks[2]) + ty)
        return ' '.join(toks)

    # ── parse viewBox dims so we can filter out-of-bounds islands ─────
    vb_parts = [float(v) for v in viewbox.split()]
    vb_x, vb_y, vb_w, vb_h = vb_parts
    margin = 2.0  # allow a little overhang

    def in_viewbox(sp):
        ax, ay = sp['start']
        sx_t = ax + tx
        sy_t = ay + ty
        return (vb_x - margin <= sx_t <= vb_x + vb_w + margin and
                vb_y - margin <= sy_t <= vb_y + vb_h + margin)

    visible_islands = [s for s in islands if in_viewbox(s)]
    hidden = len(islands) - len(visible_islands)
    print(f"Keeping {len(visible_islands)} in-viewBox islands, dropping {hidden} (Shetland/Orkney etc.)")

    ordered = [mainland] + visible_islands
    full_d = ' '.join(subpath_to_str(sp) for sp in ordered)

    # ── write TypeScript file ──────────────────────────────────────────
    ts = f'''// Auto-generated by scripts/sort-scotland-path.py — do not edit by hand.
// Source: public/Scotland.svg
// Subpaths: mainland first, then {len(islands)} islands in clockwise order.

export const SCOTLAND_VIEWBOX = "{viewbox}";
export const SCOTLAND_PATH = "{full_d}";
'''

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(ts)

    print(f"Written to {out_path}")
    print(f"Path length: {len(full_d):,} chars, {len(ordered)} subpaths")


if __name__ == '__main__':
    main()
