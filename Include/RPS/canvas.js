const PI = Math.PI, radius = 30;
const arrowSize = 20;
const bubbleColor = "white", arrowColor = "white";
const images = {
    "Rock": "/Images/RPS/Rock.svg",
    "Paper": "/Images/RPS/Paper.svg",
    "Scissors": "/Images/RPS/Scissors.svg"
};

export default class Canvas {
    positions = {};
    bubbles = {};

    constructor(canvas) {
        this.setCanvas(canvas);
        this.setPositions();
    }
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx.translate(.5, .5);

        const width = window.innerWidth ||
                document.documentElement.clientWidth ||
                document.body.clientWidth;

        const height = window.innerHeight ||
                document.documentElement.clientHeight ||
                document.body.clientHeight;

        this.canvas.width = width*2/3;
        this.canvas.height = height*1/3;
    }
    setPositions() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.positions["Rock"] = { x: width/4, y: height/3 };
        this.positions["Paper"] = { x: width*3/4, y: height/3 };
        this.positions["Scissors"] = { x: width/2, y: height*2/3 };
    }

    newBubble(type) {
        const { x, y } = this.positions[type];
        const bubble = new Bubble(x, y, type);
        this.bubbles[type] = bubble;
    }
    connectBubble(startType, endType) {
        const startBubble = this.bubbles[startType];
        const endBubble = this.bubbles[endType];
        startBubble.connect(endBubble);
    }
    colorBubble(type, color, otherType=null) {
        const bubble = this.bubbles[type];
        bubble.color = color;
        if(otherType) {
            bubble.setArrowColor(otherType, color);
        }
    }
    resetBubbleColors() {
        for(const bubble of Object.values(this.bubbles)) {
            bubble.resetColor();
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //update physics
        this.draw(this.ctx);
    }

    draw(ctx) {
        for(const bubble of Object.values(this.bubbles)) {
            bubble.draw(ctx);
        }
    }
}


class Bubble {
    circumference = 2 * PI;
    connectors = {};

    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.color = bubbleColor;
    }
    get position() { 
        return [ this.x, this.y ];
    }

    draw(ctx) {
        this.drawCircle(ctx);
        this.drawText(ctx);
        this.drawConnectors(ctx);
    }
    drawCircle(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, radius, 0, this.circumference);
        ctx.stroke();
    }
    drawText(ctx) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = "36px serif";
        ctx.fillText(this.type.substring(0, 1), this.x, this.y);
    }
    drawConnectors(ctx) {
        for(const entry of Object.values(this.connectors)) {
            const connector = entry?.connector;
            const color = entry?.color;
            connector.draw(ctx, color);
        }
    }

    connect(otherBubble) {
        const connector = new Connector(this, otherBubble);
        this.connectors[otherBubble.type] = {
            "connector": connector,
            "color": arrowColor
        };
    }

    resetColor() {
        this.color = bubbleColor;
        for(let type of Object.keys(this.connectors)) {
            this.connectors[type]["color"] = arrowColor;
        }
    }
    setArrowColor(type, color) {
        this.connectors[type]["color"] = color;
    }
}


class Connector {
    constructor(startBubble, endBubble) {
        this.startBubble = startBubble;
        this.endBubble = endBubble;
    }

    get start() {
        return this.startBubble;
    }
    get end() {
        return this.endBubble;
    }

    draw(ctx, color) {
        const [ sx, sy, ex, ey, angle ] = this.getEndpoints();
        this.drawLine(ctx, sx, sy, ex, ey, color);
        this.drawArrow(ctx, ex, ey, angle, color);
    }
    getEndpoints() {
        const [ startX, startY ] = this.startBubble.position;
        const [ endX, endY ] = this.endBubble.position;
        const dx = endX - startX;
        const dy = endY - startY;

        const theta = Math.atan2(dy, dx);
        return [ startX + radius * Math.cos(theta),
                 startY + radius * Math.sin(theta),
                 endX - radius * Math.cos(theta),
                 endY - radius * Math.sin(theta),
                 theta ];
    }
    drawLine(ctx, sx, sy, ex, ey, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    }
    drawArrow(ctx, ex, ey, angle, color) {
        const x1 = ex - arrowSize * Math.cos(angle + PI/6);
        const y1 = ey - arrowSize * Math.sin(angle + PI/6);

        const x2 = ex - arrowSize * Math.cos(angle - PI/6);
        const y2 = ey - arrowSize * Math.sin(angle - PI/6);

        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();
    }
}