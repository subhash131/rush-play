const friction = 0.99;
export default class Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  c: CanvasRenderingContext2D;
  velocity: { x: number; y: number };
  alpha: number;

  constructor({
    x,
    y,
    radius,
    color,
    velocity,
    ctx,
  }: {
    x: number;
    y: number;
    radius: number;
    color: string;
    ctx: CanvasRenderingContext2D;
    velocity: {
      x: number;
      y: number;
    };
  }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.c = ctx;
  }

  draw() {
    this.c.save();
    this.c.globalAlpha = this.alpha;
    this.c.beginPath();
    this.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.c.fillStyle = this.color;
    this.c.fill();
    this.c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}
