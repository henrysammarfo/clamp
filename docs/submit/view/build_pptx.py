#!/usr/bin/env python3
"""Build CLAMP Team 14 pitch deck PPTX.

Inspo locked in for this pass:
1) Helix / Pulsecolor dark AI SaaS deck — bold type, one red accent, clean dark panels
2) Tosea Spotlight financial report — #E62B1E on charcoal + white, red underlines, split columns
3) PaneFlow Editorial Serious — accent discipline (one color), mono page marks, hairline rules
   (we take the discipline, not the navy/cream/serif look)

CLAMP twist: cool paper (not warm cream), signal red only for brand / block / emphasis.
No hyphens in spoken copy.
"""

from __future__ import annotations

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

OUT = Path(__file__).resolve().parent / "CLAMP_Team14_Pitch.pptx"

# 16:9
W, H = Inches(13.333), Inches(7.5)
M = Inches(0.7)  # outer margin

CHARCOAL = RGBColor(0x11, 0x13, 0x18)
PANEL = RGBColor(0x1C, 0x1F, 0x26)
PAPER = RGBColor(0xF4, 0xF6, 0xF9)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
INK = RGBColor(0x11, 0x13, 0x18)
SIGNAL = RGBColor(0xE6, 0x2B, 0x1E)
STEEL = RGBColor(0x6B, 0x73, 0x82)
MIST = RGBColor(0xE8, 0xEB, 0xF0)
DIM = RGBColor(0x9A, 0xA3, 0xB2)
ALLOW = RGBColor(0x22, 0x8C, 0x5A)
HOLD = RGBColor(0xC4, 0x92, 0x14)
LINE_DARK = RGBColor(0x2A, 0x2F, 0x38)
LINE_LIGHT = RGBColor(0xD8, 0xDD, 0xE5)


def set_run(run, size, bold=False, color=WHITE, font="Manrope", mono=False):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = "IBM Plex Mono" if mono else font
    rPr = run._r.get_or_add_rPr()
    # Explicit latin typeface for cross app consistency
    for tag in ("latin", "ea", "cs"):
        el = rPr.find(qn(f"a:{tag}"))
        if el is None:
            el = rPr.makeelement(qn(f"a:{tag}"), {})
            rPr.insert(0, el)
        el.set("typeface", "IBM Plex Mono" if mono else font)


def add_rect(slide, l, t, w, h, fill, line=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, l, t, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(1)
    return shape


def add_round(slide, l, t, w, h, fill, radius_hint=True):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.fill.background()
    return shape


def tb(slide, l, t, w, h):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    return box, tf


def write(tf, lines, clear=True):
    """lines: list of (text, size, bold, color, font|mono, space_after)"""
    if clear:
        tf.clear()
    first = True
    for item in lines:
        text, size, bold, color = item[0], item[1], item[2], item[3]
        mono = item[4] if len(item) > 4 else False
        space = item[5] if len(item) > 5 else 6
        font = "Syne" if bold and not mono else "Manrope"
        if isinstance(mono, str):
            font = mono
            mono = False
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.space_after = Pt(space)
        run = p.add_run()
        run.text = text
        set_run(run, size, bold=bold, color=color, font=font, mono=mono)
    return tf


def header(slide, dark, section, page, total=10):
    mark_color = SIGNAL
    meta_color = DIM if dark else STEEL
    # Shared left edge with body content
    _, tf = tb(slide, M, Inches(0.38), Inches(3), Inches(0.32))
    write(tf, [("CLAMP", 13, True, mark_color, "Syne", 0)])
    add_rect(slide, M, Inches(0.72), Inches(0.55), Inches(0.05), SIGNAL)
    _, tf = tb(slide, Inches(7.8), Inches(0.4), Inches(4.8), Inches(0.3))
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    run = p.add_run()
    run.text = f"{section}   {page:02d} / {total:02d}"
    set_run(run, 10, False, meta_color, mono=True)


def footer(slide, dark, left):
    color = DIM if dark else STEEL
    _, tf = tb(slide, M, Inches(7.05), Inches(10), Inches(0.28))
    write(tf, [(left, 10, False, color, True, 0)])


def new_slide(prs, dark=True):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_rect(slide, 0, 0, W, H, CHARCOAL if dark else PAPER)
    return slide


def slide_01(prs):
    s = new_slide(prs, True)
    # Full bleed left rail + right signal slab for cover drama
    add_rect(s, 0, 0, Inches(0.22), H, SIGNAL)
    add_rect(s, Inches(8.55), 0, Inches(4.783), H, SIGNAL)
    add_rect(s, Inches(8.55), Inches(0.22), Inches(4.563), Inches(7.06), PANEL)

    _, tf = tb(s, M, Inches(0.55), Inches(7.2), Inches(0.35))
    write(tf, [("TEAM 14  ·  GWDC 2026  ·  CHALLENGE B", 11, False, DIM, True, 0)])

    _, tf = tb(s, M, Inches(1.85), Inches(7.4), Inches(1.5))
    write(tf, [("CLAMP", 92, True, WHITE, "Syne", 0)])

    _, tf = tb(s, M, Inches(3.45), Inches(7.4), Inches(0.55))
    write(tf, [("Control before action.", 26, True, MIST, "Syne", 0)])

    # Full width accent under tagline (same left edge as type)
    add_rect(s, M, Inches(4.15), Inches(3.4), Inches(0.09), SIGNAL)

    _, tf = tb(s, M, Inches(4.5), Inches(7.2), Inches(1.5))
    write(
        tf,
        [
            (
                "You set a spending mandate. The agent asked outside it. Nothing paid. The refuse is on the audit trail.",
                15,
                False,
                DIM,
                "Manrope",
                0,
            )
        ],
    )

    _, tf = tb(s, M, Inches(6.75), Inches(7.2), Inches(0.4))
    write(tf, [("Henry Sam Marfo  ·  Song Hyewon  ·  FuriosaAI × Bricksum", 11, False, STEEL, True, 0)])

    # Right panel: stacked proof points with dividers
    items = [
        ("01", "LIVE ON", "Base Sepolia"),
        ("02", "PARSE", "Kiln deepseek v4.1 flash"),
        ("03", "DECIDE", "Code gate. Zero inference."),
        ("04", "PROVE", "Audit receipts on chain"),
    ]
    y = Inches(1.0)
    for num, k, v in items:
        _, tf = tb(s, Inches(9.0), y, Inches(3.7), Inches(1.15))
        write(
            tf,
            [
                (f"{num}  {k}", 11, False, SIGNAL, True, 6),
                (v, 18, True, WHITE, "Syne", 0),
            ],
        )
        if num != "04":
            add_rect(s, Inches(9.0), y + Inches(1.2), Inches(3.5), Inches(0.015), LINE_DARK)
        y += Inches(1.35)

    _, tf = tb(s, Inches(9.0), Inches(6.55), Inches(3.7), Inches(0.4))
    write(tf, [("Open on the block.", 16, True, SIGNAL, "Syne", 0)])


def slide_02(prs):
    s = new_slide(prs, False)
    header(s, False, "PROBLEM", 2)

    _, tf = tb(s, M, Inches(1.2), Inches(6.2), Inches(2.4))
    write(
        tf,
        [
            ("AI agents can spend.", 34, True, INK, "Syne", 8),
            ("Soft limits are not enough.", 34, True, INK, "Syne", 0),
        ],
    )
    add_rect(s, M, Inches(3.55), Inches(2.4), Inches(0.08), SIGNAL)

    rows = [
        ("01", "They talk around prompts", "If permission lives only in chat, a clever prompt can walk past it."),
        ("02", "Money needs a hard box", "Purpose, budget, merchants, and an ending. Temporary. Revocable."),
        ("03", "Someone else must read it", "A second person should reconstruct the story from a trail, not a vibe."),
    ]
    y = Inches(1.35)
    for num, title, body in rows:
        add_round(s, Inches(7.3), y, Inches(5.3), Inches(1.55), WHITE)
        add_rect(s, Inches(7.3), y, Inches(0.12), Inches(1.55), SIGNAL)
        _, tf = tb(s, Inches(7.65), y + Inches(0.28), Inches(4.6), Inches(1.2))
        write(
            tf,
            [
                (num + "  " + title, 16, True, INK, "Syne", 6),
                (body, 13, False, STEEL, "Manrope", 0),
            ],
        )
        y += Inches(1.75)

    footer(s, False, "Not a chatbot. Not a wallet clone.")


def slide_03(prs):
    s = new_slide(prs, True)
    header(s, True, "PRODUCT", 3)

    _, tf = tb(s, M, Inches(1.2), Inches(7.2), Inches(1.8))
    write(tf, [("A delegation control layer for agents that spend.", 32, True, WHITE, "Syne", 0)])
    add_rect(s, M, Inches(3.1), Inches(2.4), Inches(0.08), SIGNAL)
    _, tf = tb(s, M, Inches(3.45), Inches(6.8), Inches(1.4))
    write(
        tf,
        [
            (
                "The agent may act alone only inside a temporary mandate you create. Outside that box, money does not move.",
                16,
                False,
                DIM,
                "Manrope",
                0,
            )
        ],
    )

    add_round(s, Inches(8.0), Inches(1.35), Inches(4.6), Inches(5.0), PANEL)
    add_rect(s, Inches(8.0), Inches(1.35), Inches(4.6), Inches(0.12), SIGNAL)
    _, tf = tb(s, Inches(8.35), Inches(1.75), Inches(4.0), Inches(0.4))
    write(tf, [("INSIDE EVERY MANDATE", 11, False, SIGNAL, True, 0)])

    items = ["purpose", "budget including fees", "allowed merchants", "expiry", "revocable anytime"]
    y = Inches(2.4)
    for item in items:
        add_rect(s, Inches(8.45), y + Inches(0.12), Inches(0.18), Inches(0.18), SIGNAL)
        _, tf = tb(s, Inches(8.85), y, Inches(3.4), Inches(0.45))
        write(tf, [(item, 18, True, MIST, "Syne", 0)])
        y += Inches(0.7)

    footer(s, True, "Hard box. Clear story.")


def slide_04(prs):
    s = new_slide(prs, False)
    header(s, False, "DECISION MODEL", 4)
    _, tf = tb(s, M, Inches(1.15), Inches(11.5), Inches(0.35))
    write(tf, [("THREE OUTCOMES. NO FOG.", 11, False, STEEL, True, 0)])
    _, tf = tb(s, M, Inches(1.55), Inches(11.5), Inches(1.1))
    write(tf, [("The model parses. Code decides.", 34, True, INK, "Syne", 0)])
    add_rect(s, M, Inches(2.7), Inches(2.2), Inches(0.08), SIGNAL)

    cards = [
        (ALLOW, "ALLOW", "Clearly inside", "Proceed. Record the settlement receipt."),
        (SIGNAL, "BLOCK", "Clearly outside", "Stop. Pay nothing. Write why on the trail."),
        (HOLD, "NEEDS HUMAN", "Borderline", "Hold. No pay until a person says yes or no."),
    ]
    x = M
    card_w = Inches(3.85)
    gap = Inches(0.3)
    for color, tag, title, body in cards:
        add_round(s, x, Inches(3.15), card_w, Inches(3.2), WHITE)
        add_rect(s, x, Inches(3.15), Inches(0.14), Inches(3.2), color)
        _, tf = tb(s, x + Inches(0.4), Inches(3.5), card_w - Inches(0.7), Inches(2.6))
        write(
            tf,
            [
                (tag, 12, True, color, True, 14),
                (title, 24, True, INK, "Syne", 12),
                (body, 14, False, STEEL, "Manrope", 0),
            ],
        )
        x += card_w + gap

    footer(s, False, "Permission is not a vibe from the model")


def slide_05(prs):
    s = new_slide(prs, True)
    header(s, True, "ARCHITECTURE", 5)
    add_rect(s, M, Inches(1.05), Inches(1.35), Inches(0.07), SIGNAL)
    _, tf = tb(s, M, Inches(1.3), Inches(11), Inches(1.0))
    write(tf, [("Parse once. Gate in code. Leave a receipt.", 30, True, WHITE, "Syne", 0)])

    steps = [
        ("01", "Human UI", "Create the mandate. Review borderline cases."),
        ("02", "FastAPI policy", "Mandate, budget, and gate as source of truth."),
        ("03", "Kiln parse + explain", "deepseek v4.1 flash turns a sentence into fields."),
        ("04", "Deterministic gate", "Zero inference. Allow, Block, or Needs human."),
        ("05", "ClampAudit · Base Sepolia", "Mandate commits and decision receipts on chain."),
    ]
    # vertical rail
    add_rect(s, M + Inches(0.28), Inches(2.55), Inches(0.05), Inches(4.0), SIGNAL)
    y = Inches(2.45)
    for num, title, body in steps:
        add_round(s, Inches(0.18) + M, y + Inches(0.12), Inches(0.28), Inches(0.28), SIGNAL)
        _, tf = tb(s, M + Inches(0.7), y, Inches(1.0), Inches(0.5))
        write(tf, [(num, 16, True, SIGNAL, True, 0)])
        add_round(s, M + Inches(1.9), y, Inches(10.0), Inches(0.72), PANEL)
        _, tf = tb(s, M + Inches(2.15), y + Inches(0.12), Inches(9.4), Inches(0.55))
        write(
            tf,
            [
                (f"{title}    {body}", 14, True, MIST, "Manrope", 0),
            ],
        )
        # Split title/body more cleanly
        tf.clear()
        p = tf.paragraphs[0]
        r1 = p.add_run()
        r1.text = title
        set_run(r1, 15, True, WHITE, "Syne")
        r2 = p.add_run()
        r2.text = "    " + body
        set_run(r2, 13, False, DIM, "Manrope")
        y += Inches(0.82)

    footer(s, True, "Kiln energy by flow  ·  on chain stop or settle hash")


def slide_06(prs):
    s = new_slide(prs, True)
    header(s, True, "LIVE DEMO", 6)
    _, tf = tb(s, M, Inches(1.15), Inches(10), Inches(0.3))
    write(tf, [("OPEN ON THE BLOCK", 11, False, SIGNAL, True, 0)])
    _, tf = tb(s, M, Inches(1.5), Inches(11.5), Inches(0.85))
    write(tf, [("Same mandate. Three real paths.", 32, True, WHITE, "Syne", 0)])

    rows = [
        (SIGNAL, "BestBuy $20", "Merchant not allowed · tx on Base", "BLOCK"),
        (ALLOW, "Amazon $65", "Inside mandate · settlement receipt on Base", "ALLOW"),
        (HOLD, "Apple $120", "Needs human · approved · final Allow on Base", "NEEDS HUMAN"),
    ]
    y = Inches(2.65)
    for color, merchant, why, tag in rows:
        add_round(s, M, y, Inches(11.9), Inches(1.15), PANEL)
        add_rect(s, M, y, Inches(0.18), Inches(1.15), color)
        _, tf = tb(s, M + Inches(0.55), y + Inches(0.28), Inches(3.4), Inches(0.65))
        write(tf, [(merchant, 22, True, WHITE, "Syne", 0)])
        _, tf = tb(s, M + Inches(4.2), y + Inches(0.35), Inches(4.8), Inches(0.55))
        write(tf, [(why, 14, False, DIM, "Manrope", 0)])
        add_round(s, Inches(10.35), y + Inches(0.32), Inches(2.0), Inches(0.5), color)
        _, tf = tb(s, Inches(10.35), y + Inches(0.38), Inches(2.0), Inches(0.4))
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        run = p.add_run()
        run.text = tag
        set_run(run, 11, True, WHITE, mono=True)
        y += Inches(1.3)

    footer(s, True, "Hand the trail to another person. Nothing paid on the refuse.")


def slide_07(prs):
    s = new_slide(prs, False)
    header(s, False, "EFFICIENCY", 7)
    _, tf = tb(s, M, Inches(1.15), Inches(11), Inches(0.3))
    write(tf, [("30 ADVERSARIAL CASES  ·  3 REPS  ·  SAME MODEL", 11, False, STEEL, True, 0)])
    _, tf = tb(s, M, Inches(1.5), Inches(11.5), Inches(0.9))
    write(tf, [("44% fewer tokens. Same decision accuracy.", 30, True, INK, "Syne", 0)])

    # Metric strip
    metrics = [
        ("100%", "CLAMP decision\naccuracy"),
        ("100%", "CLAMP reason\ncode accuracy"),
        ("97.8%", "ALL AI reason\ncode accuracy"),
        ("44.4%", "fewer total\ntokens"),
    ]
    x = M
    for val, label in metrics:
        add_round(s, x, Inches(2.7), Inches(2.85), Inches(1.7), WHITE)
        add_rect(s, x, Inches(2.7), Inches(2.85), Inches(0.1), SIGNAL if "fewer" in label or "CLAMP reason" in label else STEEL)
        _, tf = tb(s, x + Inches(0.2), Inches(2.95), Inches(2.45), Inches(1.3))
        write(
            tf,
            [
                (val, 28, True, INK, "Syne", 6),
                (label.replace("\n", " "), 11, False, STEEL, "Manrope", 0),
            ],
        )
        x += Inches(3.05)

    add_round(s, M, Inches(4.7), Inches(5.7), Inches(1.7), WHITE)
    _, tf = tb(s, M + Inches(0.3), Inches(4.95), Inches(5.1), Inches(1.3))
    write(
        tf,
        [
            ("CLAMP TOKENS", 11, False, SIGNAL, True, 6),
            ("38,420 total  ·  deepseek v4.1 flash", 16, True, INK, "Syne", 0),
        ],
    )
    add_round(s, Inches(6.9), Inches(4.7), Inches(5.7), Inches(1.7), WHITE)
    _, tf = tb(s, Inches(7.2), Inches(4.95), Inches(5.1), Inches(1.3))
    write(
        tf,
        [
            ("ALL AI TOKENS", 11, False, STEEL, True, 6),
            ("69,053 total  ·  same model decides", 16, True, INK, "Syne", 0),
        ],
    )

    footer(s, False, "Do not generalize beyond this dataset and model")


def slide_08(prs):
    s = new_slide(prs, True)
    header(s, True, "ON CHAIN", 8)
    _, tf = tb(s, M, Inches(1.15), Inches(11), Inches(0.9))
    write(tf, [("Real receipts. Verified on Base.", 32, True, WHITE, "Syne", 0)])

    add_round(s, M, Inches(2.2), Inches(11.9), Inches(1.15), PANEL)
    _, tf = tb(s, M + Inches(0.35), Inches(2.4), Inches(11.2), Inches(0.85))
    write(
        tf,
        [
            ("CLAMPAUDIT V2  ·  BASE SEPOLIA", 11, False, SIGNAL, True, 6),
            ("0x4648520fe2b192791c9ae13e46e0cba9544c42d6", 16, True, WHITE, True, 0),
        ],
    )

    txs = [
        ("ALLOW", "0xc24d…de0b"),
        ("HUMAN ALLOW", "0xed1a…869b"),
        ("MERCHANT BLOCK", "0xea0b…41ef"),
        ("HUMAN REJECT", "0x810c…9258"),
        ("REVOKE", "0x9f83…8d93"),
        ("PURPOSE BLOCK", "0x219a…99b3"),
    ]
    x = M
    y = Inches(3.65)
    for i, (label, short) in enumerate(txs):
        if i == 3:
            x = M
            y = Inches(5.05)
        add_round(s, x, y, Inches(3.85), Inches(1.15), PANEL)
        _, tf = tb(s, x + Inches(0.25), y + Inches(0.22), Inches(3.35), Inches(0.85))
        write(
            tf,
            [
                (label, 11, False, SIGNAL, True, 6),
                (short, 16, True, WHITE, True, 0),
            ],
        )
        x += Inches(4.0)

    footer(s, True, "Full links in docs/SUBMISSION_EVIDENCE.md")


def slide_09(prs):
    s = new_slide(prs, False)
    header(s, False, "HONESTY", 9)
    add_rect(s, M, Inches(1.05), Inches(1.35), Inches(0.07), SIGNAL)
    _, tf = tb(s, M, Inches(1.3), Inches(11.5), Inches(1.3))
    write(tf, [("Hard controls. Inspectable trail. No fairy tales.", 30, True, INK, "Syne", 0)])

    cards = [
        ("Live where it matters", "Kiln for parse and explain. Base Sepolia for mandate and decision receipts."),
        ("Testnet labeled", "No fake pays. No pretend chain. Residual risk stays visible."),
        ("Not unhackable", "Control and records for Challenge B. We do not sell invincibility."),
    ]
    x = M
    for title, body in cards:
        add_round(s, x, Inches(3.1), Inches(3.85), Inches(3.0), WHITE)
        add_rect(s, x, Inches(3.1), Inches(3.85), Inches(0.12), SIGNAL)
        _, tf = tb(s, x + Inches(0.35), Inches(3.5), Inches(3.2), Inches(2.3))
        write(
            tf,
            [
                (title, 18, True, INK, "Syne", 12),
                (body, 14, False, STEEL, "Manrope", 0),
            ],
        )
        x += Inches(4.15)

    footer(s, False, "Judges can reconstruct it")


def slide_10(prs):
    s = new_slide(prs, True)
    add_rect(s, 0, 0, Inches(0.18), H, SIGNAL)
    add_rect(s, Inches(8.9), 0, Inches(4.433), H, PANEL)

    _, tf = tb(s, M, Inches(0.55), Inches(7), Inches(0.35))
    write(tf, [("TEAM 14  ·  ASK", 11, False, DIM, True, 0)])

    _, tf = tb(s, M, Inches(2.0), Inches(7.6), Inches(2.2))
    write(tf, [("Ship the control layer agents use before money moves.", 34, True, WHITE, "Syne", 0)])

    add_rect(s, M, Inches(4.4), Inches(1.6), Inches(0.08), SIGNAL)
    _, tf = tb(s, M, Inches(4.7), Inches(7.2), Inches(1.4))
    write(
        tf,
        [
            (
                "You set a spending mandate. The agent asked outside it. Nothing paid. The refuse is on the audit trail.",
                15,
                False,
                DIM,
                "Manrope",
                0,
            )
        ],
    )

    _, tf = tb(s, M, Inches(6.5), Inches(7.5), Inches(0.5))
    write(tf, [("CLAMP  ·  Control before action.", 14, True, SIGNAL, "Syne", 0)])

    _, tf = tb(s, Inches(9.3), Inches(2.3), Inches(3.5), Inches(3.5))
    write(
        tf,
        [
            ("REPO", 10, False, SIGNAL, True, 8),
            ("github.com/henrysammarfo/clamp", 13, True, WHITE, True, 18),
            ("TEAM", 10, False, SIGNAL, True, 8),
            ("Henry Sam Marfo", 16, True, MIST, "Syne", 6),
            ("Song Hyewon", 16, True, MIST, "Syne", 18),
            ("CONTRACT", 10, False, SIGNAL, True, 8),
            ("0x4648…42d6", 14, True, WHITE, True, 0),
        ],
    )


def main():
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    slide_01(prs)
    slide_02(prs)
    slide_03(prs)
    slide_04(prs)
    slide_05(prs)
    slide_06(prs)
    slide_07(prs)
    slide_08(prs)
    slide_09(prs)
    slide_10(prs)
    prs.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
