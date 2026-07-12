#!/usr/bin/env python3
"""Generate realistic Omnify dashboard reference screenshots (PNG)."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1120, 700
OUT = Path(__file__).resolve().parent.parent / "assets" / "references"

# Colors (match demo-dashboard)
BG = (3, 7, 18)
PANEL = (11, 17, 32)
SURFACE = (17, 24, 39)
BORDER = (31, 41, 55)
TEXT = (249, 250, 251)
MUTED = (156, 163, 175)
DIM = (107, 114, 128)
BLUE = (59, 130, 246)
GREEN = (16, 185, 129)
VIOLET = (139, 92, 246)
ORANGE = (249, 115, 22)
PINK = (236, 72, 153)

FONT_PATHS = [
    "C:/Windows/Fonts/malgun.ttf",
    "C:/Windows/Fonts/malgunbd.ttf",
    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    paths = [FONT_PATHS[1], FONT_PATHS[0]] if bold else [FONT_PATHS[0], FONT_PATHS[1]]
    paths.extend(FONT_PATHS[2:])
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rnd_seed(key: str) -> random.Random:
    return random.Random(sum(ord(c) for c in key))


def round_rect(d: ImageDraw.ImageDraw, xy, r, fill, outline=None):
    d.rounded_rectangle(xy, radius=r, fill=fill, outline=outline)


def draw_sidebar(d: ImageDraw.ImageDraw, active: int, items: list[str]):
    d.rectangle((0, 0, 196, H), fill=PANEL)
    d.rectangle((196, 0, 200, H), fill=BORDER)
    round_rect(d, (16, 18, 180, 50), 8, SURFACE)
    d.text((28, 28), "Omnify", font=load_font(13, True), fill=TEXT)
    round_rect(d, (16, 62, 180, 108), 10, (BLUE[0], BLUE[1], BLUE[2], 40), BORDER)
    d.text((24, 72), "Enterprise Plan", font=load_font(9, True), fill=BLUE)
    d.text((24, 88), "API 무중단 모니터링", font=load_font(8), fill=DIM)
    y = 122
    for i, label in enumerate(items):
        bg = (BLUE[0] // 5, BLUE[1] // 5, BLUE[2] // 3) if i == active else None
        if bg:
            round_rect(d, (12, y - 4, 184, y + 22), 8, bg)
        d.text((20, y), label, font=load_font(10, i == active), fill=TEXT if i == active else MUTED)
        y += 30


def draw_topbar(d: ImageDraw.ImageDraw, title: str, channels: list[tuple[str, tuple]]):
    d.rectangle((200, 0, W, 56), fill=PANEL)
    d.line((200, 56, W, 56), fill=BORDER, width=1)
    d.text((220, 18), title, font=load_font(15, True), fill=TEXT)
    x = W - 20
    for name, color in reversed(channels):
        tw = len(name) * 9 + 20
        x -= tw + 6
        round_rect(d, (x, 16, x + tw, 40), 6, SURFACE, BORDER)
        d.ellipse((x + 8, 24, x + 16, 32), fill=color)
        d.text((x + 20, 22), name, font=load_font(9), fill=MUTED)


def draw_kpi_row(d: ImageDraw.ImageDraw, cards: list[tuple[str, str, str, tuple]], y=72):
    x = 220
    for label, value, sub, accent in cards:
        round_rect(d, (x, y, x + 200, y + 88), 12, SURFACE, BORDER)
        d.text((x + 14, y + 12), label, font=load_font(9), fill=DIM)
        d.text((x + 14, y + 34), value, font=load_font(20, True), fill=accent)
        d.text((x + 14, y + 62), sub, font=load_font(8), fill=MUTED)
        x += 212


def draw_line_chart(d: ImageDraw.ImageDraw, box, color, rng, points=9):
    x0, y0, x1, y1 = box
    round_rect(d, box, 12, PANEL, BORDER)
    d.text((x0 + 16, y0 + 14), "매출 추이", font=load_font(10, True), fill=MUTED)
    pad_l, pad_b = 24, 28
    cw, ch = x1 - x0 - pad_l - 16, y1 - y0 - pad_b - 24
    base_y = y1 - pad_b
    vals = [rng.uniform(0.3, 1.0) for _ in range(points)]
    pts = []
    for i, v in enumerate(vals):
        px = x0 + pad_l + int(cw * i / (points - 1))
        py = int(base_y - ch * v)
        pts.append((px, py))
    for i in range(len(pts) - 1):
        d.line((pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]), fill=color, width=3)
    for px, py in pts:
        d.ellipse((px - 3, py - 3, px + 3, py + 3), fill=color)


def draw_bars(d: ImageDraw.ImageDraw, box, colors, heights):
    x0, y0, x1, y1 = box
    round_rect(d, box, 12, PANEL, BORDER)
    d.text((x0 + 16, y0 + 14), "채널별 매출", font=load_font(10, True), fill=MUTED)
    bw = (x1 - x0 - 80) // len(heights)
    bx = x0 + 40
    max_h = y1 - y0 - 70
    for h, c in zip(heights, colors):
        bh = int(max_h * h)
        round_rect(d, (bx, y1 - 30 - bh, bx + bw - 16, y1 - 30), 4, c)
        bx += bw


def draw_donut(d: ImageDraw.ImageDraw, cx, cy, r, pct, color, label):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=BORDER, width=18)
    # arc approximation with thick arc
    bbox = (cx - r, cy - r, cx + r, cy + r)
    d.arc(bbox, start=90, end=90 - int(360 * pct / 100), fill=color, width=18)
    d.text((cx - 18, cy - 10), f"{pct}%", font=load_font(14, True), fill=TEXT)
    d.text((cx - 28, cy + r + 10), label, font=load_font(9), fill=MUTED)


def draw_table_rows(d: ImageDraw.ImageDraw, box, rows):
    x0, y0, x1, y1 = box
    round_rect(d, box, 12, PANEL, BORDER)
    d.text((x0 + 16, y0 + 14), "최근 주문 · 재고", font=load_font(10, True), fill=MUTED)
    y = y0 + 40
    for cols in rows:
        d.text((x0 + 16, y), cols[0], font=load_font(9), fill=TEXT)
        d.text((x0 + 200, y), cols[1], font=load_font(9), fill=MUTED)
        d.text((x0 + 360, y), cols[2], font=load_font(9, True), fill=cols[3] if len(cols) > 3 else GREEN)
        y += 26


def draw_crm_cards(d: ImageDraw.ImageDraw, y0):
    cards = [
        ("발송 예정", "12,480명", "재구매 타겟", VIOLET),
        ("오픈율", "68.3%", "알림톡 캠페인", PINK),
        ("전환 매출", "₩2,940만", "이번 주", GREEN),
    ]
    x = 220
    for title, val, sub, c in cards:
        round_rect(d, (x, y0, x + 270, y0 + 110), 12, SURFACE, BORDER)
        d.text((x + 16, y0 + 14), title, font=load_font(9), fill=DIM)
        d.text((x + 16, y0 + 38), val, font=load_font(22, True), fill=c)
        d.text((x + 16, y0 + 78), sub, font=load_font(8), fill=MUTED)
        x += 286


def draw_briefing(d: ImageDraw.ImageDraw, y0):
    round_rect(d, (220, y0, 580, y0 + 280), 12, SURFACE, BORDER)
    d.text((236, y0 + 16), "카카오 브리핑 미리보기", font=load_font(10, True), fill=GREEN)
    lines = [
        "어제 매출  ₩3,820만  ·  마진 35.1%",
        "주문 142건  ·  전일 대비 ▲ 8.2%",
        "발주 대기 5건  ·  재고 알림 2건",
        "API 동기화 5/5 채널 정상",
    ]
    y = y0 + 48
    for line in lines:
        round_rect(d, (236, y, 564, y + 44), 8, (5, 46, 31))
        d.text((248, y + 12), line, font=load_font(10), fill=(209, 250, 229))
        y += 54
    round_rect(d, (600, y0, 1080, y0 + 280), 12, PANEL, BORDER)
    draw_line_chart(d, (616, y0 + 40, 1064, y0 + 260), GREEN, rnd_seed("f"))


def add_realism(img: Image.Image, key: str) -> Image.Image:
    rng = rnd_seed(key)
    # subtle vignette
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(0, 40):
        a = int(i * 1.2)
        od.rectangle((0, i, W, i + 1), fill=(0, 0, 0, a))
        od.rectangle((0, H - i - 1, W, H - i), fill=(0, 0, 0, a))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    # light noise
    px = img.load()
    for _ in range(1800):
        x, y = rng.randint(200, W - 1), rng.randint(0, H - 1)
        r, g, b = px[x, y]
        n = rng.randint(-4, 4)
        px[x, y] = (max(0, min(255, r + n)), max(0, min(255, g + n)), max(0, min(255, b + n)))
    return img.filter(ImageFilter.GaussianBlur(radius=0.3))


def frame_browser(img: Image.Image) -> Image.Image:
    """Add macOS-style window chrome for screenshot feel."""
    chrome_h = 36
    out = Image.new("RGB", (W + 48, H + chrome_h + 48), (15, 23, 42))
    shadow = Image.new("RGB", out.size, (15, 23, 42))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((20, 16, W + 28, H + chrome_h + 32), 14, fill=(8, 12, 24))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    out = Image.blend(out, shadow, 0.5)
    d = ImageDraw.Draw(out)
    d.rounded_rectangle((24, 20, W + 24, H + chrome_h + 28), 12, fill=(17, 24, 39), outline=BORDER)
    d.rectangle((24, 20, W + 24, 20 + chrome_h), fill=(31, 41, 55))
    for i, c in enumerate([(239, 68, 68), (234, 179, 8), (34, 197, 94)]):
        d.ellipse((40 + i * 22, 30, 52 + i * 22, 42), fill=c)
    d.text((W // 2 - 80, 28), "Omnify Command Center", font=load_font(10), fill=MUTED)
    out.paste(img, (24, 20 + chrome_h))
    return out


NAV = ["홈 · 통합 대시보드", "매일 보는 리포트", "주문 · 재고", "CRM · 알림톡", "API · 연동", "설정"]

SHOTS = [
    {
        "file": "ref-shot-a.png",
        "title": "통합 대시보드",
        "nav_active": 0,
        "channels": [("Cafe24", (59, 130, 246)), ("스마트스토어", (16, 185, 129)), ("쿠팡", (249, 115, 22)), ("지그재그", (236, 72, 153))],
        "kpis": [("오늘 매출", "₩4,280만", "▲ 12.4% vs 어제", BLUE), ("마진율", "38.2%", "목표 35%", GREEN),
                 ("주문", "186건", "실시간", TEXT), ("연동 채널", "5개", "전체 정상", VIOLET)],
        "layout": "dashboard",
    },
    {
        "file": "ref-shot-b.png",
        "title": "마진 · 수익성 분석",
        "nav_active": 1,
        "channels": [("스마트스토어", (16, 185, 129)), ("쿠팡", (249, 115, 22))],
        "kpis": [("이번 달 순마진", "₩1.12억", "▲ 12.4%", GREEN), ("실마진율", "34.8%", "채널 수수료 반영", BLUE),
                 ("원가 대비", "62%", "자동 산출", TEXT), ("ROI", "218%", "전월 대비", VIOLET)],
        "layout": "margin",
    },
    {
        "file": "ref-shot-c.png",
        "title": "CRM · 알림톡 캠페인",
        "nav_active": 3,
        "channels": [("Cafe24", (59, 130, 246)), ("지그재그", (236, 72, 153)), ("스마트스토어", (16, 185, 129))],
        "kpis": [],
        "layout": "crm",
    },
    {
        "file": "ref-shot-d.png",
        "title": "주문 · 재고 관리",
        "nav_active": 2,
        "channels": [("Cafe24", (59, 130, 246)), ("쿠팡", (249, 115, 22))],
        "kpis": [("안전재고 미달", "7 SKU", "발주 필요", ORANGE), ("발주 대기", "23건", "오늘 처리", (234, 179, 8)),
                 ("창고 가용", "94.2%", "전 채널", GREEN), ("당일 출고", "156건", "정상", BLUE)],
        "layout": "inventory",
    },
    {
        "file": "ref-shot-e.png",
        "title": "통합 대시보드 · 채널",
        "nav_active": 0,
        "channels": [("스마트스토어", (16, 185, 129)), ("Cafe24", (59, 130, 246)), ("쿠팡", (249, 115, 22)), ("에이블리", (236, 72, 153))],
        "kpis": [("통합 매출", "₩6,120만", "4채널 합산", BLUE), ("스마트스토어", "38%", "채널 1위", GREEN),
                 ("쿠팡", "31%", "전일 ▲", ORANGE), ("자사몰", "22%", "Cafe24", VIOLET)],
        "layout": "channels",
    },
    {
        "file": "ref-shot-f.png",
        "title": "매일 보는 리포트 · 브리핑",
        "nav_active": 1,
        "channels": [("Cafe24", (59, 130, 246)), ("스마트스토어", (16, 185, 129))],
        "kpis": [("브리핑 발송", "08:00", "카카오톡 자동", GREEN), ("어제 매출", "₩3,820만", "마진 35.1%", BLUE),
                 ("API 상태", "5/5", "정상 동기화", GREEN), ("알림", "0건", "장애 없음", TEXT)],
        "layout": "briefing",
    },
]


def render_shot(spec: dict) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    draw_sidebar(d, spec["nav_active"], NAV)
    draw_topbar(d, spec["title"], spec["channels"])
    if spec["kpis"]:
        draw_kpi_row(d, spec["kpis"], 72)
    layout = spec["layout"]
    rng = rnd_seed(spec["file"])
    if layout == "dashboard":
        draw_line_chart(d, (220, 180, 720, 660), BLUE, rng)
        draw_donut(d, 900, 400, 72, 42, VIOLET, "마진 비중")
        round_rect(d, (760, 180, 1080, 320), 12, PANEL, BORDER)
        d.text((776, 196), "채널 현황", font=load_font(10, True), fill=MUTED)
        for i, (ch, pct) in enumerate([("스마트스토어", "38%"), ("쿠팡", "31%"), ("Cafe24", "22%")]):
            d.text((776, 224 + i * 28), ch, font=load_font(9), fill=MUTED)
            d.text((980, 224 + i * 28), pct, font=load_font(9, True), fill=TEXT)
    elif layout == "margin":
        draw_donut(d, 380, 400, 90, 35, GREEN, "순마진")
        draw_bars(d, (560, 180, 1080, 660), [BLUE, GREEN, VIOLET, ORANGE], [0.85, 0.62, 0.48, 0.35])
        draw_line_chart(d, (220, 180, 520, 660), GREEN, rng)
    elif layout == "crm":
        draw_crm_cards(d, 72)
        round_rect(d, (220, 200, 1080, 660), 12, PANEL, BORDER)
        d.text((236, 216), "캠페인 퍼널", font=load_font(10, True), fill=MUTED)
        round_rect(d, (236, 248, 1064, 268), 6, BORDER)
        round_rect(d, (236, 248, 860, 268), 6, VIOLET)
        d.text((236, 290), "발송 → 오픈 → 클릭 → 전환", font=load_font(9), fill=DIM)
    elif layout == "inventory":
        draw_table_rows(d, (220, 180, 1080, 660), [
            ("린넨 쿠션 M", "재고 12 / 안전 30", "발주대기", ORANGE),
            ("우드 트레이 L", "재고 45 / 안전 20", "정상", GREEN),
            ("디퓨저 세트", "재고 3 / 안전 15", "긴급", (239, 68, 68)),
            ("와인잔 4P", "재고 88 / 안전 40", "정상", GREEN),
        ])
    elif layout == "channels":
        draw_bars(d, (220, 180, 1080, 420), [GREEN, ORANGE, BLUE, PINK], [0.38, 0.31, 0.22, 0.09])
        draw_line_chart(d, (220, 440, 1080, 660), BLUE, rng)
    elif layout == "briefing":
        draw_briefing(d, 180)

    img = add_realism(img, spec["file"])
    return frame_browser(img)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for spec in SHOTS:
        path = OUT / spec["file"]
        shot = render_shot(spec)
        shot.save(path, "PNG", optimize=True)
        print("wrote", path.name, shot.size)


if __name__ == "__main__":
    main()
