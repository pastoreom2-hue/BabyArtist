import { ActivityLevel, ActivityType, COLORS } from './types';

const NUMBER_COLORS = COLORS.slice(0, 7);

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 22
) {
  ctx.save();
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawNumberBadge(
  ctx: CanvasRenderingContext2D,
  num: number,
  x: number,
  y: number
) {
  const color = NUMBER_COLORS[(num - 1) % NUMBER_COLORS.length]?.value ?? '#64748b';
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(String(num), x, y);
  ctx.restore();
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  options?: { fill?: string; stroke?: string; dash?: boolean }
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (options?.fill) {
    ctx.fillStyle = options.fill;
    ctx.fill();
  }
  ctx.strokeStyle = options?.stroke ?? '#6366f1';
  ctx.lineWidth = 3;
  ctx.setLineDash(options?.dash ? [8, 6] : []);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  options?: { fill?: string; stroke?: string; dash?: boolean }
) {
  ctx.beginPath();
  ctx.rect(x - s / 2, y - s / 2, s, s);
  if (options?.fill) {
    ctx.fillStyle = options.fill;
    ctx.fill();
  }
  ctx.strokeStyle = options?.stroke ?? '#6366f1';
  ctx.lineWidth = 3;
  ctx.setLineDash(options?.dash ? [8, 6] : []);
  ctx.strokeRect(x - s / 2, y - s / 2, s, s);
  ctx.setLineDash([]);
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  options?: { fill?: string; stroke?: string; dash?: boolean }
) {
  ctx.beginPath();
  ctx.moveTo(x, y - s / 2);
  ctx.lineTo(x + s / 2, y + s / 2);
  ctx.lineTo(x - s / 2, y + s / 2);
  ctx.closePath();
  if (options?.fill) {
    ctx.fillStyle = options.fill;
    ctx.fill();
  }
  ctx.strokeStyle = options?.stroke ?? '#6366f1';
  ctx.lineWidth = 3;
  ctx.setLineDash(options?.dash ? [8, 6] : []);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(
      Math.cos(((18 + i * 72) / 180) * Math.PI) * r + x,
      -Math.sin(((18 + i * 72) / 180) * Math.PI) * r + y
    );
    ctx.lineTo(
      Math.cos(((54 + i * 72) / 180) * Math.PI) * (r / 2) + x,
      -Math.sin(((54 + i * 72) / 180) * Math.PI) * (r / 2) + y
    );
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
  ctx.fill();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s / 4);
  ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
  ctx.bezierCurveTo(x - s / 2, y + s / 2, x, y + s * 0.7, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.7, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
  ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4);
  ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
  ctx.fill();
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180;
    const px = x + Math.cos(angle) * (r / 2);
    const py = y + Math.sin(angle) * (r / 2);
    drawCircle(ctx, px, py, r / 3, {
      fill: 'rgba(236, 72, 153, 0.1)',
      stroke: '#ec4899',
    });
    drawNumberBadge(ctx, i + 1, px, py);
  }
  drawCircle(ctx, x, y, r / 4, {
    fill: 'rgba(234, 179, 8, 0.15)',
    stroke: '#eab308',
  });
  drawNumberBadge(ctx, 7, x, y);
}

function drawRainbow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const arcColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(x, y, r - i * 22, Math.PI, 0);
    ctx.strokeStyle = arcColors[i];
    ctx.lineWidth = 18;
    ctx.stroke();
    const labelX = x - (r - i * 22) * 0.55;
    const labelY = y - 10;
    drawNumberBadge(ctx, i + 1, labelX, labelY);
  }
}

function drawShapeMatchLevel1(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const shapes = [
    { type: 'circle', x: w * 0.25, y: h * 0.5, size: 70, label: 'Circle' },
    { type: 'square', x: w * 0.5, y: h * 0.5, size: 90, label: 'Square' },
    { type: 'triangle', x: w * 0.75, y: h * 0.5, size: 90, label: 'Triangle' },
  ] as const;

  shapes.forEach(({ type, x, y, size, label }) => {
    const fill = 'rgba(99, 102, 241, 0.08)';
    if (type === 'circle') drawCircle(ctx, x, y, size, { fill, dash: true });
    if (type === 'square') drawSquare(ctx, x, y, size, { fill, dash: true });
    if (type === 'triangle') drawTriangle(ctx, x, y, size, { fill, dash: true });
    drawLabel(ctx, label, x, y + size / 2 + 28, 18);
  });
}

function drawShapeMatchLevel2(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawCircle(ctx, w * 0.2, h * 0.35, 50, { fill: 'rgba(59,130,246,0.08)', dash: true });
  drawLabel(ctx, 'Circle', w * 0.2, h * 0.35 + 72, 16);
  drawSquare(ctx, w * 0.5, h * 0.35, 70, { fill: 'rgba(34,197,94,0.08)', dash: true });
  drawLabel(ctx, 'Square', w * 0.5, h * 0.35 + 82, 16);
  drawTriangle(ctx, w * 0.8, h * 0.35, 70, { fill: 'rgba(168,85,247,0.08)', dash: true });
  drawLabel(ctx, 'Triangle', w * 0.8, h * 0.35 + 82, 16);
  drawStar(ctx, w * 0.35, h * 0.72, 45);
  drawLabel(ctx, 'Star', w * 0.35, h * 0.72 + 62, 16);
  drawHeart(ctx, w * 0.65, h * 0.72, 55);
  drawLabel(ctx, 'Heart', w * 0.65, h * 0.72 + 62, 16);
}

function drawShapeMatchLevel3(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const x = w * (0.2 + i * 0.3);
      const y = h * (0.25 + j * 0.25);
      drawCircle(ctx, x, y, 38, {
        fill: 'rgba(14,165,233,0.07)',
        stroke: '#0ea5e9',
        dash: true,
      });
    }
  }
  drawLabel(ctx, 'Trace all circles!', w * 0.5, h * 0.92, 20);
}

function drawColorByNumberLevel2(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const letters = [
    { char: 'A', num: 1, x: w * 0.28, y: h * 0.4 },
    { char: 'B', num: 2, x: w * 0.42, y: h * 0.4 },
    { char: 'C', num: 3, x: w * 0.56, y: h * 0.4 },
    { char: 'D', num: 4, x: w * 0.35, y: h * 0.65 },
    { char: 'E', num: 5, x: w * 0.5, y: h * 0.65 },
    { char: 'F', num: 6, x: w * 0.65, y: h * 0.65 },
  ];

  ctx.save();
  ctx.font = 'bold 80px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  letters.forEach(({ char, num, x, y }) => {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.strokeText(char, x, y);
    drawNumberBadge(ctx, num, x + 36, y - 36);
  });
  ctx.restore();
}

export function drawActivityTemplate(
  ctx: CanvasRenderingContext2D,
  activityType: ActivityType,
  level: ActivityLevel,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width * 2, height * 2);
  ctx.save();
  ctx.scale(2, 2);

  if (activityType === 'shape-match') {
    if (level === 1) drawShapeMatchLevel1(ctx, width, height);
    else if (level === 2) drawShapeMatchLevel2(ctx, width, height);
    else drawShapeMatchLevel3(ctx, width, height);
  } else if (activityType === 'color-by-number') {
    if (level === 1) drawFlower(ctx, width * 0.5, height * 0.5, Math.min(width, height) * 0.28);
    else if (level === 2) drawColorByNumberLevel2(ctx, width, height);
    else drawRainbow(ctx, width * 0.5, height * 0.72, Math.min(width, height) * 0.32);
  }

  ctx.restore();
}

export function getActivityHint(activityType: ActivityType, level: ActivityLevel): string {
  if (activityType === 'shape-match') {
    return level === 1
      ? 'Trace the dashed shapes with your pen!'
      : level === 2
        ? 'Trace the circle, square, triangle, star & heart!'
        : 'Trace every circle on the board!';
  }
  if (activityType === 'color-by-number') {
    return level === 1
      ? 'Color each numbered area with the matching color below!'
      : level === 2
        ? 'Fill each letter using the color guide!'
        : 'Paint each rainbow stripe with its number color!';
  }
  return '';
}

export function getColorLegend(max = 7) {
  return NUMBER_COLORS.slice(0, max).map((c, i) => ({
    number: i + 1,
    name: c.name,
    value: c.value,
  }));
}

export function getNumberColor(num: number): string {
  return NUMBER_COLORS[(num - 1) % NUMBER_COLORS.length]?.value ?? COLORS[0].value;
}
