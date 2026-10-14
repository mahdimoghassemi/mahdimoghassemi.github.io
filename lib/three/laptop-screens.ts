import type { ScreenId } from "@/lib/content"

export const SCREEN = { width: 1024, height: 640 }

type Ctx = CanvasRenderingContext2D
type Fonts = { sans: string; mono: string }

const C = {
  bg: "#0c0f15",
  bar: "#151a22",
  panel: "#141922",
  line: "#2a313d",
  fg: "#e9edf3",
  muted: "#8b93a2",
  accent: "#93d8ff",
  green: "#5be49b",
}

function box(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: string,
  stroke?: string
) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function windowChrome(ctx: Ctx, fonts: Fonts, title: string) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, SCREEN.width, SCREEN.height)
  ctx.fillStyle = C.bar
  ctx.fillRect(0, 0, SCREEN.width, 44)
  ;["#ff5f57", "#febc2e", "#28c840"].forEach((color, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(26 + i * 22, 22, 7, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.font = `500 16px ${fonts.mono}`
  ctx.fillStyle = C.muted
  ctx.textAlign = "center"
  ctx.fillText(title, SCREEN.width / 2, 28)
  ctx.textAlign = "left"
}

const CODE: [string, string][][] = [
  [
    ["#c792ea", "export default "],
    ["#82aaff", "function "],
    ["#ffcb6b", "Portfolio"],
    [C.fg, "() {"],
  ],
  [
    [C.fg, "  const "],
    [C.accent, "craft"],
    [C.fg, " = "],
    ["#82aaff", "useCraft"],
    [C.fg, "();"],
  ],
  [
    [C.fg, "  const "],
    [C.accent, "home"],
    [C.fg, " = "],
    ["#c3e88d", "'UAE'"],
    [C.fg, ";"],
  ],
  [
    [C.fg, "  const "],
    [C.accent, "pair"],
    [C.fg, " = "],
    ["#82aaff", "useModel"],
    [C.fg, "();"],
  ],
  [[C.fg, ""]],
  [
    ["#c792ea", "  return "],
    [C.fg, "("],
  ],
  [
    ["#89ddff", "    <World "],
    ["#ffcb6b", "pin"],
    [C.fg, "={home}"],
    ["#89ddff", ">"],
  ],
  [
    ["#89ddff", "      <Me "],
    ["#ffcb6b", "wave"],
    ["#89ddff", " />"],
  ],
  [
    ["#89ddff", "      <BitField "],
    ["#ffcb6b", "clickable"],
    ["#89ddff", " />"],
  ],
  [["#89ddff", "    </World>"]],
  [[C.fg, "  );"]],
  [[C.fg, "}"]],
]

export const CODE_LENGTH = CODE.flat().reduce(
  (sum, [, text]) => sum + text.length,
  0
)

export function drawCode(ctx: Ctx, fonts: Fonts, t: number, typed: number) {
  windowChrome(ctx, fonts, "portfolio.tsx")
  ctx.font = `500 25px ${fonts.mono}`
  let left = typed
  CODE.forEach((line, i) => {
    const y = 100 + i * 44
    ctx.fillStyle = "#3a4250"
    ctx.fillText(String(i + 1).padStart(2, " "), 22, y)
    let x = 78
    for (const [color, text] of line) {
      const part = text.slice(0, Math.max(0, left))
      left -= text.length
      ctx.fillStyle = color
      ctx.fillText(part, x, y)
      x += ctx.measureText(part).width
      if (left <= 0 && left > -text.length && Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = C.accent
        ctx.fillRect(x + 2, y - 22, 12, 28)
      }
    }
  })
}

function drawDashboard(ctx: Ctx, fonts: Fonts, t: number) {
  windowChrome(ctx, fonts, "bozy.ai / curves")
  ctx.fillStyle = "#11151d"
  ctx.fillRect(0, 44, 170, 596)
  box(ctx, 24, 70, 34, 34, 9, C.accent)
  for (let i = 0; i < 7; i++)
    box(
      ctx,
      24,
      140 + i * 46,
      i === 1 ? 118 : 92,
      12,
      6,
      i === 1 ? C.accent : "#262d3a"
    )

  ctx.font = `600 32px ${fonts.sans}`
  ctx.fillStyle = C.fg
  ctx.fillText("Brent · forward curve", 210, 98)
  ctx.font = `500 20px ${fonts.mono}`
  ctx.fillStyle = C.green
  ctx.fillText("+1.42%  82.16", 210, 132)

  const [x0, y0, w, h] = [210, 160, 780, 260]
  ctx.strokeStyle = "#1b2029"
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath()
    ctx.moveTo(x0, y0 + (i * h) / 4)
    ctx.lineTo(x0 + w, y0 + (i * h) / 4)
    ctx.stroke()
  }
  const points = Array.from({ length: 61 }, (_, k) => [
    x0 + (k / 60) * w,
    y0 +
      h *
        (0.62 -
          (0.3 * k) / 60 +
          0.08 * Math.sin(k * 0.35 + t * 1.2) +
          0.03 * Math.sin(k * 1.3 + t * 2)),
  ])
  const trace = () => {
    ctx.beginPath()
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  }
  const fill = ctx.createLinearGradient(0, y0, 0, y0 + h)
  fill.addColorStop(0, "rgba(147,216,255,.35)")
  fill.addColorStop(1, "rgba(147,216,255,0)")
  trace()
  ctx.lineTo(x0 + w, y0 + h)
  ctx.lineTo(x0, y0 + h)
  ctx.fillStyle = fill
  ctx.fill()
  trace()
  ctx.strokeStyle = C.accent
  ctx.lineWidth = 4
  ctx.stroke()
  const [ex, ey] = points[points.length - 1]
  ctx.fillStyle = C.accent
  ctx.beginPath()
  ctx.arc(ex, ey, 8, 0, Math.PI * 2)
  ctx.fill()

  ;["Dec 26", "Jan 27", "Feb 27"].forEach((month, r) => {
    const y = 450 + r * 54
    box(ctx, 210, y, 780, 44, 8, C.panel)
    ctx.font = `500 19px ${fonts.mono}`
    ctx.fillStyle = C.muted
    ctx.fillText(month, 232, y + 29)
    ctx.fillStyle = C.fg
    ctx.fillText(
      (81.9 - r * 0.37 + Math.sin(t + r) * 0.05).toFixed(2),
      860,
      y + 29
    )
  })
}

function drawGraph(ctx: Ctx, fonts: Fonts, t: number) {
  windowChrome(ctx, fonts, "curve-builder")
  const nodes: [number, number, string][] = [
    [110, 130, "Brent"],
    [110, 400, "Dubai"],
    [430, 265, "Spread"],
    [750, 150, "Curve"],
    [750, 390, "Chart"],
  ]
  const [W, H] = [170, 70]
  ;[
    [0, 2],
    [1, 2],
    [2, 3],
    [2, 4],
  ].forEach(([a, b], i) => {
    const [x1, y1] = [nodes[a][0] + W, nodes[a][1] + H / 2]
    const [x2, y2] = [nodes[b][0], nodes[b][1] + H / 2]
    const cx = (x1 + x2) / 2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.bezierCurveTo(cx, y1, cx, y2, x2, y2)
    ctx.strokeStyle = "#2c3442"
    ctx.lineWidth = 3
    ctx.stroke()
    const p = (t * 0.45 + i * 0.25) % 1
    const q = 1 - p
    ctx.fillStyle = C.accent
    ctx.beginPath()
    ctx.arc(
      q ** 3 * x1 + 3 * q * q * p * cx + 3 * q * p * p * cx + p ** 3 * x2,
      q ** 3 * y1 + 3 * q * q * p * y1 + 3 * q * p * p * y2 + p ** 3 * y2,
      6,
      0,
      Math.PI * 2
    )
    ctx.fill()
  })
  nodes.forEach(([x, y, name], i) => {
    box(ctx, x, y, W, H, 12, C.panel, i === 2 ? C.accent : C.line)
    ctx.font = `500 22px ${fonts.mono}`
    ctx.fillStyle = i === 2 ? C.accent : C.fg
    ctx.fillText(name, x + 22, y + 44)
  })
  ctx.font = `500 18px ${fonts.mono}`
  ctx.fillStyle = C.muted
  ctx.fillText("= Brent - Dubai", 410, 370)
}

function drawChat(ctx: Ctx, fonts: Fonts, t: number) {
  windowChrome(ctx, fonts, "ask bozy")
  const r = 46 + Math.sin(t * 2) * 4
  const orb = ctx.createRadialGradient(512, 120, 4, 512, 120, r)
  orb.addColorStop(0, "#e9f7ff")
  orb.addColorStop(0.5, C.accent)
  orb.addColorStop(1, "rgba(147,216,255,0)")
  ctx.fillStyle = orb
  ctx.beginPath()
  ctx.arc(512, 120, r, 0, Math.PI * 2)
  ctx.fill()

  box(ctx, 530, 196, 430, 62, 20, "#1c2330")
  ctx.font = `500 22px ${fonts.sans}`
  ctx.fillStyle = C.fg
  ctx.fillText("How did Brent close today?", 556, 235)
  box(ctx, 64, 282, 620, 300, 20, "#121721", "#1f2631")
  ctx.fillText("Brent settled at 82.16, up 1.42%.", 92, 326)
  ctx.fillStyle = C.muted
  ctx.fillText("Front spread widened on tighter supply.", 92, 360)
  for (let i = 0; i < 12; i++) {
    const h = 40 + (Math.sin(i * 0.9 + t * 1.5) * 0.5 + 0.5) * 110 + i * 4
    box(ctx, 96 + i * 46, 560 - h, 30, h, 6, i === 11 ? C.accent : C.line)
  }
}

export const SCREENS: Record<
  Exclude<ScreenId, "code">,
  (ctx: Ctx, fonts: Fonts, t: number) => void
> = {
  dashboard: drawDashboard,
  graph: drawGraph,
  chat: drawChat,
}
