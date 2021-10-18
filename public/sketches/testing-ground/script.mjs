let canvas;
let ctx;
let flowField;
let flowFieldAnimation;

window.onload = function(){
    canvas = document.getElementById('canvas1');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowField = new FlowFieldEffect(ctx,canvas.width,canvas.height)
    flowField.animate(0);

}

window.addEventListener('resize', function(){
    this.cancelAnimationFrame(flowFieldAnimation);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowField = new FlowFieldEffect(ctx,canvas.width,canvas.height)
    flowField.animate(0);
});

const wrist = {
    x: 0,
    y: 0,
}

class FlowFieldEffect {
    #ctx;
    #width;
    #height;
    constructor(ctx, width, height){
        this.#ctx = ctx;
        this.#ctx.strokeStyle = 'white';
        this.#width = width;
        this.#height = height;
        this.lastTime = 0;
        this.interval = 1000/60;
        this.timer = 0;
        this.cellSize = 15;
        this.gradient;
        this.#createGradient();
        this.#ctx.strokeStyle = this.gradient;
    }

    #createGradient(){
        this.gradient = this.#ctx.createLinearGradient(0, 0, this.#width, this.#height);
        this.gradient.addColorStop("0.1", "#ff5c33");
        this.gradient.addColorStop("0.2", "#ff66b3");
        this.gradient.addColorStop("0.4", "#ccccff");
        this.gradient.addColorStop("0.6", "#b3ffff");
        this.gradient.addColorStop("0.8", "#80ff80");
        this.gradient.addColorStop("0.9", "#ffff33");
    }

    #drawLine(x, y) {
        const length = 300;

        this.#ctx.beginPath();
        this.#ctx.moveTo(x,y);
        this.#ctx.lineTo(x + 5, y + 5);
        this.#ctx.stroke();

    }
    animate(timeStamp){
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        if (this.timer > this.interval) {
            this.#ctx.clearRect(0, 0, this.#width,this.#height);

            for(let y = 0; y < this.#height; y += this.cellSize) {
                for(let x = 0; x < this.#width; x += this.cellSize){
                    this.#drawLine(x , y);

                }

            }

            this.timer = 0;

        } else {
            this.timer += deltaTime;
        }
        
        flowFieldAnimation = requestAnimationFrame(this.animate.bind(this));


    }
}