class Food {
    constructor(canvas) {
        this.canvas = canvas;
        this.size = 20;
        this.position = { x: 0, y: 0 };
        this.generatePosition();
    }

    generatePosition() {
        const maxX = (this.canvas.width / this.size) - 1;
        const maxY = (this.canvas.height / this.size) - 1;
        this.position = {
            x: Math.floor(Math.random() * maxX) * this.size,
            y: Math.floor(Math.random() * maxY) * this.size
        };
    }

    draw(ctx) {
        ctx.fillStyle = '#ff0099';
        ctx.shadowColor = '#ff0099';
        ctx.shadowBlur = 10;
        ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
        ctx.shadowBlur = 0;
    }
}