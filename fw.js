(function () {
    function Scene(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        this._rockets = [];
        this._explosions = [];
        this._running = false;
        this._setCanvasSize();
    };


    Scene.CLEAR_OP = 'source-over';
    Scene.LIGHT_OP = 'lighter';
    Scene.CLEAR_COLOR = 'rgba(0, 0, 0, 0.4)';
    Scene.GRADIENT_STOP_COLOR = 'rgba(255, 255, 255, 0.55)';
    Scene.FREQUENCY = 40;
    Scene.COLORS = ["255, 0, 0", "0, 255, 0", "0, 0, 255", "255, 255, 0", "255, 0, 255",
        "0, 255, 255", "255, 255, 204", "255, 204, 255", "204, 255, 255" ];


    Scene.prototype._clear = function () {
        this._ctx.globalCompositeOperation = Scene.CLEAR_OP;
        this._ctx.fillStyle = Scene.CLEAR_COLOR;
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    };

    Scene.prototype._drawPath = function (x, y, r, fill) {
        this._ctx.beginPath();
        this._ctx.arc(x, y, r, 0, Math.PI * 2, 0);
        this._ctx.fillStyle = fill;
        this._ctx.fill();
    };

    Scene.prototype._loop = function () {
        if (!this._running) return;

        this._clear();

        for (let i = 0; i < this._rockets.length; ++i) {
            this._rockets[i].draw(this._ctx, this._drawPath.bind(this));
            if (this._rockets[i].isDead()) {
                const h = Math.random() * Scene.COLORS.length | 0;
                for (let c = 0; c < Explosion.CLUSTERS_COUNT; c++) {
                    const explosion = new Explosion(this._rockets[i].x(), this._rockets[i].y(), Scene.COLORS[h], true);
                    this._explosions.push(explosion);
                }
                this._rockets[i] = null;
            }
        }

        for (let i = 0; i < this._explosions.length; ++i) {
            this._explosions[i].draw(this._ctx, this._drawPath.bind(this));
            if (this._explosions[i].isDead()) {
                this._explosions[i] = null;
            }
        }

        this._rockets.push(new Rocket(this._canvas));
        this._rockets = this._rockets.filter(r => !!r);
        this._explosions = this._explosions.filter(e => !!e);
    };

    Scene.prototype._setCanvasSize = function () {
        this._canvas.width = document.body.clientWidth;
        this._canvas.height = screen.height;
    };


    Scene.prototype.run = function () {
        this._running = true;
        this._interval = setInterval(this._loop.bind(this), Scene.FREQUENCY);
        window.addEventListener('resize', this._setCanvasSize.bind(this));
    };

    Scene.prototype.toggleRunning = function () {
        this._running = !this._running;
    };

    Scene.prototype.drawToBitmap = function () {
        const wnd = window.open('about:blank', 'The firework screensot');
        const img = w.document.createElement('img');

        img.src = this._canvas.toDataURL('image/png');

        wnd.document.documentElement.appendChild(img);
    };

    Scene.prototype.toggleFullScreen = function () {
        const doc = document.documentElement;
        const state = (document.webkitIsFullScreen || document.isFullScreen);
        const request = (doc.requestFullScreen || doc.webkitRequestFullScreen);
        const cancel = (document.cancelFullScreen || document.webkitCancelFullScreen);

        state ? cancel.call(document) : request.call(doc);
    };




    function Sprite(color, maxTiming) {
        this._timing = 0;
        this._color = color;
        this._maxTiming = maxTiming;
        this._s = Math.random() * 3 + 2;
    };

    Sprite.prototype.draw = function () {
        ++this._timing;
    };

    Sprite.prototype.isDead = function () {
        return this._timing >= this._maxTiming;
    };

    Sprite.prototype.x = function () {
        return this._x;
    };

    Sprite.prototype.y = function () {
        return this._y;
    };



    function Explosion(x, y, color) {
        Sprite.call(this, color, Explosion.MAX_TIMING);
        this._x = x;
        this._y = y;
        this._angle = Math.random() * 360;
    };

    Explosion.MAX_TIMING = 20;
    Explosion.CLUSTERS_COUNT = 16;
    Explosion.RADIUS = 21;
    Explosion.CLUSTER_RADIUS = 5;

    Explosion.prototype = Object.create(Sprite.prototype);

    Explosion.prototype.draw = function (ctx, drawPath) {
        Sprite.prototype.draw.call(this);
        
        const angle = (Math.PI / 180) * this._angle;
    
        this._x += Math.cos(angle) * this._s;
        this._y += Math.sin(angle) * this._s;
        
        ctx.globalCompositeOperation = 'lighter';
        
        const grad = ctx.createRadialGradient(this._x,this._y,1,this._x,this._y,Explosion.CLUSTER_RADIUS);
        grad.addColorStop(0,"rgba(255,255,255,.55)");
        grad.addColorStop(1,"rgba(" + this._color + ",.03)");
        
        drawPath(this._x, this._y, Explosion.RADIUS, grad);
    };




    function Rocket(canvas) {
        Sprite.call(this, Rocket.COLOR, Rocket.MAX_TIMING);
        this._angle = 240 + Math.random() * 70;
        this._x = (Math.random() * (canvas.width - 200)) + 100;
        this._y = canvas.height;
    };


    Rocket.RADIUS = 3;
    Rocket.MAX_TIMING = 70;
    Rocket.COLOR = 'rgb(56, 48, 48)';


    Rocket.prototype = Object.create(Sprite.prototype);

    Rocket.prototype.draw = function (ctx, drawPath) {
        Sprite.prototype.draw.call(this);
        const angle = (Math.PI / 180) * this._angle;
        this._x += Math.cos(angle);
        this._y += Math.sin(angle) * 9;
        drawPath(this._x, this._y,  Rocket.RADIUS, this._color);
    }; 


    const fw = new Scene(document.querySelector('canvas'));

    fw.run();
})();