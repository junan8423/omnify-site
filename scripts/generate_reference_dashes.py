#!/usr/bin/env python3
"""Generate reference dashboard mock SVG images for Omnify landing page."""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "references"
OUT.mkdir(parents=True, exist_ok=True)

SVGS = {
    "ref-dash-a.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none">
  <rect width="800" height="450" fill="#030712"/>
  <rect x="0" y="0" width="148" height="450" fill="#0b1120"/>
  <rect x="12" y="16" width="124" height="28" rx="6" fill="#1f2937"/>
  <rect x="12" y="56" width="124" height="32" rx="8" fill="#3b82f6" fill-opacity="0.25" stroke="#3b82f6" stroke-opacity="0.4"/>
  <rect x="12" y="96" width="124" height="24" rx="6" fill="#111827"/>
  <rect x="12" y="128" width="124" height="24" rx="6" fill="#111827"/>
  <text x="168" y="38" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="11">패션 · 멀티채널</text>
  <text x="168" y="68" fill="#f9fafb" font-family="system-ui,sans-serif" font-size="20" font-weight="700">통합 매출 대시보드</text>
  <rect x="168" y="84" width="140" height="72" rx="10" fill="#111827" stroke="#1f2937"/>
  <text x="182" y="108" fill="#6b7280" font-size="10" font-family="system-ui">오늘 매출</text>
  <text x="182" y="136" fill="#60a5fa" font-size="22" font-weight="700" font-family="system-ui">₩4,280만</text>
  <rect x="320" y="84" width="140" height="72" rx="10" fill="#111827" stroke="#1f2937"/>
  <text x="334" y="108" fill="#6b7280" font-size="10" font-family="system-ui">마진율</text>
  <text x="334" y="136" fill="#34d399" font-size="22" font-weight="700" font-family="system-ui">38.2%</text>
  <rect x="472" y="84" width="140" height="72" rx="10" fill="#111827" stroke="#1f2937"/>
  <text x="486" y="108" fill="#6b7280" font-size="10" font-family="system-ui">주문</text>
  <text x="486" y="136" fill="#f9fafb" font-size="22" font-weight="700" font-family="system-ui">186건</text>
  <rect x="168" y="172" width="612" height="250" rx="12" fill="#0b1120" stroke="#1f2937"/>
  <polyline points="200,360 260,310 320,330 380,250 440,270 500,200 560,220 620,160 720,190" stroke="#3b82f6" stroke-width="3" fill="none"/>
  <polyline points="200,380 320,350 440,300 560,280 720,240" stroke="#8b5cf6" stroke-width="2" fill="none" opacity="0.7"/>
</svg>''',
    "ref-dash-b.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none">
  <rect width="800" height="450" fill="#050a14"/>
  <rect x="0" y="0" width="132" height="450" fill="#0f172a"/>
  <rect x="16" y="60" width="100" height="28" rx="6" fill="#10b981" fill-opacity="0.2"/>
  <text x="152" y="42" fill="#94a3b8" font-size="11" font-family="system-ui">식품 · D2C</text>
  <text x="152" y="72" fill="#f8fafc" font-size="19" font-weight="700" font-family="system-ui">마진 · 원가 분석</text>
  <rect x="152" y="92" width="200" height="100" rx="10" fill="#111827"/>
  <text x="168" y="118" fill="#6b7280" font-size="10" font-family="system-ui">이번 달 순마진</text>
  <text x="168" y="152" fill="#10b981" font-size="26" font-weight="700" font-family="system-ui">₩1.12억</text>
  <rect x="368" y="92" width="412" height="100" rx="10" fill="#111827"/>
  <rect x="388" y="118" width="60" height="56" rx="4" fill="#10b981" fill-opacity="0.8"/>
  <rect x="460" y="134" width="60" height="40" rx="4" fill="#059669" fill-opacity="0.6"/>
  <rect x="152" y="208" width="628" height="214" rx="12" fill="#0b1120" stroke="#1f2937"/>
  <circle cx="420" cy="315" r="72" fill="none" stroke="#1f2937" stroke-width="24"/>
  <circle cx="420" cy="315" r="72" fill="none" stroke="#10b981" stroke-width="24" stroke-dasharray="180 280" transform="rotate(-90 420 315)"/>
</svg>''',
    "ref-dash-c.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none">
  <rect width="800" height="450" fill="#08051a"/>
  <rect x="0" y="0" width="800" height="52" fill="#110b24"/>
  <text x="24" y="34" fill="#e9d5ff" font-size="14" font-weight="700" font-family="system-ui">CRM · 알림톡 캠페인</text>
  <rect x="24" y="72" width="240" height="160" rx="10" fill="#1a1030" stroke="#4c1d95"/>
  <text x="40" y="132" fill="#f5f3ff" font-size="24" font-weight="700" font-family="system-ui">12,480명</text>
  <rect x="280" y="72" width="240" height="160" rx="10" fill="#1a1030" stroke="#312e81"/>
  <text x="296" y="132" fill="#f5f3ff" font-size="24" font-weight="700" font-family="system-ui">68.3%</text>
  <rect x="536" y="72" width="240" height="160" rx="10" fill="#1a1030" stroke="#312e81"/>
  <text x="552" y="132" fill="#f5f3ff" font-size="24" font-weight="700" font-family="system-ui">₩2,940만</text>
  <rect x="24" y="252" width="752" height="174" rx="12" fill="#110b24" stroke="#312e81"/>
  <rect x="48" y="280" width="680" height="12" rx="4" fill="#1f2937"/>
  <rect x="48" y="280" width="480" height="12" rx="4" fill="#8b5cf6"/>
</svg>''',
    "ref-dash-d.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none">
  <rect width="800" height="450" fill="#0c0a09"/>
  <rect x="0" y="0" width="156" height="450" fill="#1c1917"/>
  <text x="180" y="40" fill="#fb923c" font-size="11" font-family="system-ui">리빙 · 재고관리</text>
  <text x="180" y="68" fill="#fafaf9" font-size="19" font-weight="700" font-family="system-ui">실시간 재고 · 발주</text>
  <rect x="180" y="88" width="180" height="80" rx="8" fill="#1c1917" stroke="#44403c"/>
  <text x="196" y="142" fill="#f97316" font-size="28" font-weight="700" font-family="system-ui">7건</text>
  <rect x="376" y="88" width="180" height="80" rx="8" fill="#1c1917" stroke="#44403c"/>
  <text x="392" y="142" fill="#fbbf24" font-size="28" font-weight="700" font-family="system-ui">23건</text>
  <rect x="180" y="184" width="588" height="242" rx="10" fill="#0c0a09" stroke="#292524"/>
  <rect x="200" y="210" width="120" height="180" rx="4" fill="#f97316" fill-opacity="0.7"/>
  <rect x="336" y="250" width="120" height="140" rx="4" fill="#ea580c" fill-opacity="0.5"/>
  <rect x="472" y="230" width="120" height="160" rx="4" fill="#fb923c" fill-opacity="0.6"/>
</svg>''',
    "ref-dash-e.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none">
  <rect width="800" height="450" fill="#020617"/>
  <rect x="24" y="20" width="752" height="36" rx="8" fill="#0f172a"/>
  <text x="40" y="44" fill="#38bdf8" font-size="12" font-weight="600" font-family="system-ui">채널별 매출 비교 · 실시간</text>
  <rect x="24" y="72" width="178" height="120" rx="10" fill="#0f172a" stroke="#0ea5e9" stroke-opacity="0.3"/>
  <text x="40" y="128" fill="#38bdf8" font-size="20" font-weight="700" font-family="system-ui">38%</text>
  <rect x="214" y="72" width="178" height="120" rx="10" fill="#0f172a" stroke="#1e293b"/>
  <text x="230" y="128" fill="#7dd3fc" font-size="20" font-weight="700" font-family="system-ui">31%</text>
  <rect x="404" y="72" width="178" height="120" rx="10" fill="#0f172a" stroke="#1e293b"/>
  <text x="420" y="128" fill="#bae6fd" font-size="20" font-weight="700" font-family="system-ui">22%</text>
  <rect x="24" y="208" width="752" height="218" rx="12" fill="#0b1120" stroke="#1e293b"/>
  <path d="M60 380 L300 280 L540 250 L760 160" stroke="#0ea5e9" stroke-width="3" fill="none"/>
</svg>''',
    "ref-dash-f.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none">
  <rect width="800" height="450" fill="#04120d"/>
  <rect x="0" y="0" width="800" height="64" fill="#052e1f"/>
  <text x="24" y="40" fill="#6ee7b7" font-size="13" font-weight="700" font-family="system-ui">오늘의 브리핑 · 08:00 발송</text>
  <rect x="24" y="84" width="360" height="330" rx="12" fill="#0a1f16" stroke="#065f46"/>
  <text x="60" y="162" fill="#ecfdf5" font-size="13" font-family="system-ui">어제 매출 ₩3,820만 · 마진 35.1%</text>
  <rect x="404" y="84" width="372" height="150" rx="10" fill="#0a1f16" stroke="#047857"/>
  <circle cx="440" cy="150" r="6" fill="#10b981"/>
  <text x="456" y="154" fill="#d1fae5" font-size="12" font-family="system-ui">5/5 채널 정상</text>
  <rect x="404" y="250" width="372" height="164" rx="10" fill="#0a1f16" stroke="#047857"/>
  <polyline points="430,380 550,360 670,260" stroke="#34d399" stroke-width="3" fill="none"/>
</svg>''',
}

for name, content in SVGS.items():
    (OUT / name).write_text(content, encoding="utf-8")
    print("wrote", name)
