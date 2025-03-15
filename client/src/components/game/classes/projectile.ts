export default class Projectile {
  x: number;
  y: number;
  radius: number;
  color: string;
  c: CanvasRenderingContext2D;
  velocity: { x: number; y: number };

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
    velocity: { x: number; y: number };
    ctx: CanvasRenderingContext2D;
  }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.c = ctx;
  }

  draw() {
    this.c.beginPath();
    this.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.c.fillStyle = this.color;
    this.c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
