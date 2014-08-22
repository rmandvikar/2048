//{ stubs

if (typeof console === "undefined") {
    console = {
        log: function () { },
        info: function () { },
        warn: function () { },
        error: function () { }
    };
}

//}

//{ Game

function Game(size) {
    if (!IsPowerOf2(size)) {
        throw TypeError("size should be power of 2.");
    }
    this.size = size;
    this.grid = Create2DArray(size, size);
    this.buffer = new Array(size);
    this.flatindexes = range(0, size * size - 1, 1);
    this.isWinner = false;
    this.isOkToGenerate = true;
    this.newElements = [2, 2, 2, 2, 2, 2, 2, 2, 4, 4]; //80-20%
    this.score = 0;
}

Game.prototype.Init = function () {
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            this.grid[x][y] = 0;
        }
    }
    this.isOkToGenerate = true;
    this.GenerateNew();
};

Game.prototype.InitWith = function (state) {
    if (typeof (state) === "undefined" || state === null) {
        return;
    }
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            if (state[x][y] != 0) {
                Validate(state[x][y]);
            }
            this.grid[x][y] = state[x][y];
        }
    }
    this.isOkToGenerate = true;
}

Game.prototype.GenerateNew = function () {
    if (this.isOkToGenerate) {
        var tries = 0;
        var shuffled = this.GetRandomXY(Shuffle(this.flatindexes));
        for (var i = 0; i < shuffled.length; i++) {
            var xy = shuffled[i];
            var x = xy.x;
            var y = xy.y;
            if (this.grid[x][y] == 0) {
                this.grid[x][y] = this.newElements[rng.Next(this.newElements.length)];
                break;
            }
            tries++;
        }
    }
    this.isOkToGenerate = false;
    return xy;
};

function Validate(x) {
    var isValid = IsPowerOf2(x);
    if (!isValid) {
        throw TypeError("invalid x");
    }
    return isValid;
}

function IsPowerOf2(x) {
    return (x > 0 && (x & (x - 1)) == 0);
}

function Create2DArray(rows, cols) {
    var arr = [];
    for (var i = 0; i < rows; i++) {
        arr[i] = new Array(cols);
    }
    return arr;
}

function range(start, end, step) {
    var range = [];
    var typeofStart = typeof start;
    var typeofEnd = typeof end;

    if (step === 0) {
        throw TypeError("Step cannot be zero.");
    }

    if (typeofStart == "undefined" || typeofEnd == "undefined") {
        throw TypeError("Must pass start and end arguments.");
    } else if (typeofStart != typeofEnd) {
        throw TypeError("Start and end arguments must be of same type.");
    }

    typeof step == "undefined" && (step = 1);

    if (end < start) {
        step = -step;
    }

    if (typeofStart == "number") {

        while (step > 0 ? end >= start : end <= start) {
            range.push(start);
            start += step;
        }

    } else if (typeofStart == "string") {

        if (start.length != 1 || end.length != 1) {
            throw TypeError("Only strings with one character are supported.");
        }

        start = start.charCodeAt(0);
        end = end.charCodeAt(0);

        while (step > 0 ? end >= start : end <= start) {
            range.push(String.fromCharCode(start));
            start += step;
        }

    } else {
        throw TypeError("Only string and number types are supported");
    }

    return range;
}

var rng = new Random();
function Shuffle(a) {
    var shuffled = [];
    for (var i = a.length - 1; i >= 0; i--) {
        var next = rng.Next(i + 1);
        shuffled.push(a[next]);
        var t = a[next];
        a[next] = a[i];
        a[i] = t;
    }
    return shuffled;
}

Game.prototype.GetRandomXY = function (shuffled) {
    var xys = [];
    for (var i = 0; i < shuffled.length; i++) {
        var xy = shuffled[i];
        var x = (xy & (~(this.size - 1))) >> CountOf1Bits(this.size - 1); // xy / size
        var y = xy & (this.size - 1); // xy % size
        xys.push({ x: x, y: y });
    }
    return xys;
}

function CountOf1Bits(n) {
    var count = 0;
    while (n > 0) {
        n &= n - 1;
        count++;
    }
    return count;
}

//{ Slide

Game.prototype.Slide = function (buffer) {
    var backup = this.buffer.slice();
    var target = 0;
    var s1 = 0;
    var s2 = 0;
    while (true) {
        while (s1 < this.size && this.buffer[s1] == 0) {
            s1++;
        }
        if (s1 >= this.size) {
            break;
        }
        s2 = s1 + 1;
        while (s2 < this.size && this.buffer[s2] == 0) {
            s2++;
        }
        if (s2 < this.size && this.buffer[s1] == this.buffer[s2] && this.buffer[s1] != 0) {
            this.buffer[target] = this.buffer[s1] << 1;
            this.isWinner |= (this.buffer[target] == 2048);
            this.isOkToGenerate |= true;
            this.score += this.buffer[target];
            s1 = s2 + 1;
        } else {
            this.buffer[target] = this.buffer[s1];
            this.isOkToGenerate |= (target != s1);
            s1 = s2;
        }
        target++;
    }
    while (target < this.size) {
        this.buffer[target] = 0;
        target++;
    }
    return backup;
}

Game.prototype.SlideRight = function () {
    for (var x = 0; x < this.size; x++) {
        var i = 0;
        for (var y = this.size - 1; y >= 0; y--) {
            this.buffer[i] = this.grid[x][y];
            i++;
        }
        var before = this.Slide(this.buffer);
        i = 0;
        for (var y = this.size - 1; y >= 0; y--) {
            this.grid[x][y] = this.buffer[i];
            i++;
        }
    }
}
Game.prototype.SlideLeft = function () {
    for (var x = 0; x < this.size; x++) {
        var i = 0;
        for (var y = 0; y < this.size; y++) {
            this.buffer[i] = this.grid[x][y];
            i++;
        }
        var before = this.Slide(this.buffer);
        i = 0;
        for (var y = 0; y < this.size; y++) {
            this.grid[x][y] = this.buffer[i];
            i++;
        }
    }
}
Game.prototype.SlideDown = function () {
    for (var y = 0; y < this.size; y++) {
        var i = 0;
        for (var x = this.size - 1; x >= 0; x--) {
            this.buffer[i] = this.grid[x][y];
            i++;
        }
        var before = this.Slide(this.buffer);
        i = 0;
        for (var x = this.size - 1; x >= 0; x--) {
            this.grid[x][y] = this.buffer[i];
            i++;
        }
    }
}
Game.prototype.SlideUp = function () {
    for (var y = 0; y < this.size; y++) {
        var i = 0;
        for (var x = 0; x < this.size; x++) {
            this.buffer[i] = this.grid[x][y];
            i++;
        }
        var before = this.Slide(this.buffer);
        i = 0;
        for (var x = 0; x < this.size; x++) {
            this.grid[x][y] = this.buffer[i];
            i++;
        }
    }
}

//}

Game.prototype.IsWinner = function () {
    return this.isWinner;
}

Game.prototype.HasEnded = function () {
    var hasEnded = true;
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            if (this.grid[x][y] == 0) {
                hasEnded = false;
                return hasEnded;
            }
            if (y + 1 < this.size && this.grid[x][y] == this.grid[x][y + 1]) {
                hasEnded = false;
                return hasEnded;
            }
            if (x + 1 < this.size && this.grid[x][y] == this.grid[x + 1][y]) {
                hasEnded = false;
                return hasEnded;
            }
        }
    }
    return hasEnded;
}

//}

//{ Random

function Random() {
}
Random.prototype.Next = function (limit) {
    return Math.floor((Math.random() * limit));
}

//}

//{ Game2048Console

function Game2048Console(game) {
    this.game = game;
}

Game2048Console.prototype.Start = function () {
    this.game.Init();
    /*
    this.game.InitWith([
        //[2, 0, 0, 2],
        //[2, 2, 2, 2],
        //[0, 0, 2, 2],
        //[0, 2, 2, 4],
        [0, 4, 2, 2],
        [4, 0, 2, 2],
        [2, 4, 4, 2],
        [2, 4, 2, 4],
        //[1024, 1024, 0, 0],
    ]);
    */
    this.Print();
}

Game2048Console.prototype.Print = function (newtile) {
    for (var x = 0; x < this.game.size; x++) {
        for (var y = 0; y < this.game.size; y++) {
            var $tile = $('.row' + x + '.col' + y);
            if (this.game.grid[x][y] != 0) {
                $tile.text(this.game.grid[x][y]);
            } else {
                $tile.text('');
            }
            $tile.removeClassPrefix('tilecolor');
            $tile.addClass(this.Decorate(this.game.grid[x][y]));
        }
    }
    if (newtile) {
        $('.row' + newtile.x + '.col' + newtile.y).hide().fadeIn('slow');
    }
    var diff = this.game.score - $('#score span').first().text();
    if (diff > 0) {
        $('#score span').first().text(this.game.score).stop(true).hide().fadeIn();
        $('#score span').last().text('  +' + diff).stop(true).fadeIn().fadeOut();
    }
}

Game2048Console.prototype.Decorate = function (n) {
    return 'tilecolor' + (n);
}

Game2048Console.prototype.GetExponentBase2 = function (n) {
    var e = 0;
    while (n > 1) {
        n = n >> 1;
        e++;
    }
    return e;
}

//}

//{ jquery

$.fn.removeClassPrefix = function (prefix) {
    this.each(function (i, el) {
        var classes = el.className.split(" ").filter(function (c) {
            return c.lastIndexOf(prefix, 0) !== 0;
        });
        el.className = $.trim(classes.join(" "));
    });
    return this;
};

//}

//{ init

function feedback(message) {
    $('#feedback').text(message).stop().hide().fadeIn(1000);
}

$(document).ready(function () {
    console.log('ready!');
    var continueplay = true;
    var gameconsole = new Game2048Console(new Game(4));
    document.addEventListener('keydown', function (event) {
        if (continueplay) {
            //{ slide
            if (event.keyCode == 37) {
                console.log('Left was pressed');
                gameconsole.game.SlideLeft();
                var newtile = gameconsole.game.GenerateNew();
                gameconsole.Print(newtile);
                event.preventDefault();
            }
            else if (event.keyCode == 38) {
                console.log('Up was pressed');
                gameconsole.game.SlideUp();
                var newtile = gameconsole.game.GenerateNew();
                gameconsole.Print(newtile);
                event.preventDefault();
            }
            else if (event.keyCode == 39) {
                console.log('Right was pressed');
                gameconsole.game.SlideRight();
                var newtile = gameconsole.game.GenerateNew();
                gameconsole.Print(newtile);
                event.preventDefault();
            }
            else if (event.keyCode == 40) {
                console.log('Down was pressed');
                gameconsole.game.SlideDown();
                var newtile = gameconsole.game.GenerateNew();
                gameconsole.Print(newtile);
                event.preventDefault();
            }
            //}

            if (gameconsole.game.IsWinner()) {
                feedback("Winner!!1");
                continueplay = false;
            }
            if (gameconsole.game.HasEnded()) {
                feedback("Sorry, you lost. Try again!");
                continueplay = false;
            }
        }
    }, true);
    gameconsole.Start();
});

//}