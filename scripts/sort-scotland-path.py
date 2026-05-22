"""
Reads public/Scotland.svg, splits its single <path> into subpaths,
computes the absolute start position of each subpath by tracking the
SVG path cursor, sorts the subpaths clockwise by angle from the centre
of all their start-points, then writes the result to
src/components/scotland-path.ts.

The pulse travels: mainland first, then islands in clockwise order.
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

def split_subpaths(tokens):
    """
    Walk the token list tracking cursor position.

    Returns a list of dicts:
        {
          'start': (abs_x, abs_y),  # absolute start of this subpath
          'slice': tokens[a:b],     # original tokens for this subpath
        }

    Cursor tracking is used ONLY to find absolute start positions for
    sorting.  The original tokens are returned verbatim so no
    reconstruction bugs can corrupt the path data.
    """
    subpaths = []
    cx = cy = 0.0      # current cursor (absolute, raw path coords)
    sx = sy = 0.0      # subpath start (for Z)

    cur_start_idx = None
    cur_abs_start = None

    n = len(tokens)
    i = 0

    def flush(end_i):
        if cur_start_idx is not None:
            subpaths.append({
                'start': cur_abs_start,
                'slice': tokens[cur_start_idx:end_i],
            })

    while i < n:
        cmd = tokens[i]
        i += 1

        # ── moveto ─────────────────────────────────────────────────────
        if cmd in ('M', 'm'):
            flush(i - 1)
            cmd_start = i - 1

            dx, dy = float(tokens[i]), float(tokens[i + 1])
            i += 2
            if cmd == 'm':
                cx += dx; cy += dy
            else:
                cx, cy = dx, dy
            sx, sy = cx, cy
            cur_abs_start = (cx, cy)
            cur_start_idx = cmd_start

            # implicit lineto args (cursor only — tokens kept verbatim)
            while i < n and not tokens[i].isalpha():
                dx, dy = float(tokens[i]), float(tokens[i + 1])
                i += 2
                if cmd == 'm':
                    cx += dx; cy += dy
                else:
                    cx, cy = dx, dy

        # ── cubic bezier ───────────────────────────────────────────────
        elif cmd in ('C', 'c'):
            while i < n and not tokens[i].isalpha():
                nums = [float(tokens[i + j]) for j in range(6)]
                i += 6
                if cmd == 'c':
                    cx += nums[4]; cy += nums[5]
                else:
                    cx, cy = nums[4], nums[5]

        # ── lineto ─────────────────────────────────────────────────────
        elif cmd in ('L', 'l'):
            while i < n and not tokens[i].isalpha():
                dx, dy = float(tokens[i]), float(tokens[i + 1])
                i += 2
                if cmd == 'l':
                    cx += dx; cy += dy
                else:
                    cx, cy = dx, dy

        # ── horizontal line ────────────────────────────────────────────
        elif cmd in ('H', 'h'):
            while i < n and not tokens[i].isalpha():
                val = float(tokens[i]); i += 1
                cx = cx + val if cmd == 'h' else val

        # ── vertical line ──────────────────────────────────────────────
        elif cmd in ('V', 'v'):
            while i < n and not tokens[i].isalpha():
                val = float(tokens[i]); i += 1
                cy = cy + val if cmd == 'v' else val

        # ── close ──────────────────────────────────────────────────────
        elif cmd in ('Z', 'z'):
            cx, cy = sx, sy

    flush(n)
    return subpaths


# ── clockwise sort ─────────────────────────────────────────────────────────

def clockwise_angle(cx, cy, px, py):
    """
    Clockwise angle (SVG coords, y-down) from centre to point.
    0 = due north, increases clockwise.
    """
    dx = px - cx
    dy = py - cy
    angle = math.atan2(dx, -dy)
    if angle < 0:
        angle += 2 * math.pi
    return angle


# ── bounding-box estimator ─────────────────────────────────────────────────

def approx_bbox(sp, tx, ty):
    """
    Walk a single subpath's tokens tracking the cursor.
    Returns (x0, x1, y0, y1) in the transformed (viewBox) coordinate space.
    Cubic control points are ignored; only endpoint coords are collected.
    """
    toks = sp['slice']
    cx, cy = sp['start']
    sx, sy = cx, cy
    xs = [cx + tx]
    ys = [cy + ty]

    i = 3          # skip original M x y — we already have the abs start
    n = len(toks)

    while i < n:
        cmd = toks[i]; i += 1

        if cmd in ('M', 'm'):
            x, y = float(toks[i]), float(toks[i + 1]); i += 2
            if cmd == 'M': cx, cy = x, y
            else:          cx += x; cy += y
            sx, sy = cx, cy
            xs.append(cx + tx); ys.append(cy + ty)
            while i < n and not toks[i].isalpha():
                x, y = float(toks[i]), float(toks[i + 1]); i += 2
                if cmd == 'm': cx += x; cy += y
                else:          cx, cy = x, y
                xs.append(cx + tx); ys.append(cy + ty)

        elif cmd in ('C', 'c'):
            while i < n and not toks[i].isalpha():
                nums = [float(toks[i + j]) for j in range(6)]; i += 6
                if cmd == 'c': cx += nums[4]; cy += nums[5]
                else:          cx, cy = nums[4], nums[5]
                xs.append(cx + tx); ys.append(cy + ty)

        elif cmd in ('L', 'l'):
            while i < n and not toks[i].isalpha():
                x, y = float(toks[i]), float(toks[i + 1]); i += 2
                if cmd == 'l': cx += x; cy += y
                else:          cx, cy = x, y
                xs.append(cx + tx); ys.append(cy + ty)

        elif cmd in ('H', 'h'):
            while i < n and not toks[i].isalpha():
                v = float(toks[i]); i += 1
                cx = cx + v if cmd == 'h' else v
                xs.append(cx + tx); ys.append(cy + ty)

        elif cmd in ('V', 'v'):
            while i < n and not toks[i].isalpha():
                v = float(toks[i]); i += 1
                cy = cy + v if cmd == 'v' else v
                xs.append(cx + tx); ys.append(cy + ty)

        elif cmd in ('Z', 'z'):
            cx, cy = sx, sy

    return min(xs), max(xs), min(ys), max(ys)


# ── subpath serialiser ─────────────────────────────────────────────────────

def render_subpath(sp, tx, ty):
    """
    Return the subpath as a string.
    - Replaces the leading m/M + first two coords with absolute M (x+tx, y+ty).
    - All remaining tokens are kept exactly as they appear in the source SVG,
      so no reconstruction bugs can corrupt relative curve commands.
    """
    toks = list(sp['slice'])
    ax, ay = sp['start']
    # toks[0] = 'm' or 'M', toks[1] = raw x, toks[2] = raw y
    head = ['M', f'{ax + tx:.6f}', f'{ay + ty:.6f}']
    tail = toks[3:]   # rest of subpath verbatim
    return ' '.join(head + tail)


# ── main ───────────────────────────────────────────────────────────────────

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    svg_path = os.path.join(repo_root, 'public', 'Scotland.svg')
    out_path = os.path.join(repo_root, 'src', 'components', 'scotland-path.ts')

    with open(svg_path, encoding='utf-8') as f:
        svg_text = f.read()

    # ── viewBox ────────────────────────────────────────────────────────
    vb_match = re.search(r'viewBox="([^"]+)"', svg_text)
    viewbox = vb_match.group(1) if vb_match else '0 0 114.38154 180.80124'
    vb_x, vb_y, vb_w, vb_h = [float(v) for v in viewbox.split()]

    # ── extract path d ─────────────────────────────────────────────────
    d_match = re.search(r'\bd="(m\s[-\d.]+[^"]{1000,})"', svg_text, re.DOTALL)
    if not d_match:
        raise RuntimeError("Could not find the Scotland path in the SVG.")
    d = d_match.group(1)

    tokens = tokenise(d)
    subpaths = split_subpaths(tokens)
    print(f"Found {len(subpaths)} subpaths.")

    # ── transforms ─────────────────────────────────────────────────────
    def parse_translate(tag):
        m = re.search(rf'<{tag}[^>]*transform="translate\(([^)]+)\)"', svg_text, re.DOTALL)
        if not m:
            return 0.0, 0.0
        parts = re.split(r'[,\s]+', m.group(1).strip())
        return float(parts[0]), float(parts[1])

    gx, gy = parse_translate('g')
    px, py = parse_translate('path')
    tx, ty = gx + px, gy + py
    print(f"Combined transform: translate({tx:.6f}, {ty:.6f})")

    # ── mainland: the two longest subpaths (both halves of the outline) ─
    # There's a clear gap: top-2 are ~2700 tokens, next is ~473.
    MAINLAND_THRESHOLD = 1000
    mainland_group = [sp for sp in subpaths if len(sp['slice']) > MAINLAND_THRESHOLD]
    islands        = [sp for sp in subpaths if len(sp['slice']) <= MAINLAND_THRESHOLD]
    print(f"Mainland halves: {len(mainland_group)}, island candidates: {len(islands)}")

    # Drop islands whose transformed starts fall outside the viewBox
    # (Shetland/Orkney) or appear to have bad cursor-tracking (start is
    # implausibly outside the expected Scotland bounding box).
    margin = 2.0
    def in_viewbox(sp):
        ax, ay = sp['start']
        sx, sy = ax + tx, ay + ty
        return (vb_x - margin <= sx <= vb_x + vb_w + margin and
                vb_y - margin <= sy <= vb_y + vb_h + margin)

    visible = [s for s in islands if in_viewbox(s)]
    dropped = len(islands) - len(visible)
    print(f"Islands: keeping {len(visible)}, dropping {dropped} (out of viewBox / bad position)")

    # Drop islands whose approximate bounding box has an extreme aspect ratio.
    # A ratio > 4x indicates a cursor-tracking artefact (path renders as a
    # thin line rather than a closed island shape).
    MAX_ASPECT = 4.0
    def reasonable_aspect(sp):
        x0, x1, y0, y1 = approx_bbox(sp, tx, ty)
        w = max(x1 - x0, 0.01)
        h = max(y1 - y0, 0.01)
        return max(w, h) / min(w, h) <= MAX_ASPECT

    valid = [s for s in visible if reasonable_aspect(s)]
    aspect_dropped = len(visible) - len(valid)
    if aspect_dropped:
        print(f"Islands: dropping {aspect_dropped} with aspect ratio > {MAX_ASPECT}x (artefacts)")
    visible = valid

    # Sort visible islands clockwise from their centroid
    if visible:
        cx = sum(s['start'][0] for s in visible) / len(visible)
        cy = sum(s['start'][1] for s in visible) / len(visible)
        visible.sort(key=lambda s: clockwise_angle(cx, cy, s['start'][0], s['start'][1]))

    ordered = mainland_group + visible

    # ── build output path ──────────────────────────────────────────────
    full_d = ' '.join(render_subpath(sp, tx, ty) for sp in ordered)

    # ── build pulse path: longest single mainland subpath only ────────
    # Using one closed loop guarantees a single continuous pulse.
    # Both mainland halves start at the same geographic point (south
    # Scotland), so animating both together makes the pulse appear to
    # come from two directions. One half gives a clean single lap.
    longest_mainland = max(mainland_group, key=lambda sp: len(sp['slice']))
    pulse_d = render_subpath(longest_mainland, tx, ty)

    # ── write TypeScript ───────────────────────────────────────────────
    ts = (
        f'// Auto-generated by scripts/sort-scotland-path.py — do not edit by hand.\n'
        f'// Source: public/Scotland.svg\n'
        f'// SCOTLAND_PATH: {len(ordered)} subpaths (dim base outline — mainland + islands).\n'
        f'// SCOTLAND_PULSE_PATH: single mainland loop for the animated pulse.\n'
        f'\n'
        f'export const SCOTLAND_VIEWBOX = "{viewbox}";\n'
        f'export const SCOTLAND_PATH = "{full_d}";\n'
        f'export const SCOTLAND_PULSE_PATH = "{pulse_d}";\n'
    )

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(ts)

    print(f"Written {len(ordered)} subpaths, {len(full_d):,} chars -> {out_path}")


if __name__ == '__main__':
    main()
