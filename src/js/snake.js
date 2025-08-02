class Snake {
    constructor(canvas) {
        this.canvas = canvas;
        this.size = 20;
        this.direction = 'right';
        this.body = [
            { x: 60, y: 200 },
            { x: 40, y: 200 },
            { x: 20, y: 200 }
        ];
        this.nextDirection = 'right';
    }

    draw(ctx) {
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 10;

        this.body.forEach(segment => {
            ctx.fillRect(segment.x, segment.y, this.size, this.size);
        });

        ctx.shadowBlur = 0;
    }

    move() {
        this.direction = this.nextDirection;
        const head = {...this.body[0] };

        switch (this.direction) {
            case 'up':
                head.y -= this.size;
                break;
            case 'down':
                head.y += this.size;
                break;
            case 'left':
                head.x -= this.size;
                break;
            case 'right':
                head.x += this.size;
                break;
        }

        this.body.unshift(head);
        return this.body.pop();
    }

    grow() {
        const tail = this.body[this.body.length - 1];
        this.body.push({...tail });
    }

    checkCollision() {
        const head = this.body[0];

        // Wall collision
        if (head.x < 0 || head.x >= this.canvas.width ||
            head.y < 0 || head.y >= this.canvas.height) {
            return true;
        }

        // Self collision
        return this.body.slice(1).some(segment =>
            segment.x === head.x && segment.y === head.y
        );
    }

    setDirection(direction) {
        const opposites = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };

        if (opposites[direction] !== this.direction) {
            this.nextDirection = direction;
        }
    }
}