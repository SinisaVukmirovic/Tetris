const canvas = document.getElementById('tetris');

const context = canvas.getContext('2d');

context.scale(40, 40);

//  function for clearing the row when tetris is made
function arenaSweep() {
    let rowCount = 1;
    // note to self: got lost here with outer
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// function for collission
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

//  function for pieces that dropped
function createMatrix(w, h) {
    const matrix = [];

    while(h--) {
        matrix.push(new Array(w).fill(0));
    }     
    return matrix;
}

//  function for creating new tetris piece
function createPiece(type) {
    if (type === 'T') {
        //  T piece
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    }
    else if (type === 'O') {
        //  box piece
        return [
            [2, 2],
            [2, 2]
        ];
    }
    else if (type === 'L') {
        //  L piece
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    }
    else if (type === 'J') {
        //  J piece
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    }
    else if (type === 'I') {
        //  I piece
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    }
    else if (type === 'S') {
        //  S piece
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
    }
    else if (type === 'Z') {
        //  Z piece
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ];
    }
}

//  general drawing function
function draw() {

    context.fillStyle = '#242424';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

//  function for drawing matrix(tetris piece)
function drawMatrix(matrix, offset) {
    //  drowing this piece
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            //  checking i the value in the row is 0
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

//  function for merging the player's piece with already dropped pieces
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0 ) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

//  function for dropping the piece faster
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);

        playerReset();

        arenaSweep();

        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

//  player reset function for randomly creating a new pieces type
function playerReset() {
    const pieces = 'IOJTLSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]); // |0 insted of Math.floor
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));

        player.score = 0;
        updateScore();
    }
}

//  player rotate
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;

    rotate(player.matrix, dir);

    //  to check collission when rotating agains a wall
    while(collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        //  to stop the loop
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        } 
    }
}

//  function for rotating a tetris piece
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    }
    else {
        matrix.reverse();
    }
}

//  variables for time and interval for dropping the piece after 1 sec
let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
//  function for continuous drawing update
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

//  function for updating score
function updateScore() {
    document.getElementById('score').innerText = player.score;
}

//  colors for tetris pieces
const colors = [
    null,
    'orchid',
    'yellow',
    'orange',
    'blue',
    'aqua',
    'lime',
    'red'
];

const arena = createMatrix(8, 20);

//  player structure
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
}

//  keyboard controls
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    }
    else if (event.keyCode === 39) {
        playerMove(1);
    }
    else if (event.keyCode === 40) {
        playerDrop();
    }
    //  controls for rotate Q and W
    else if (event.keyCode === 81) {
        playerRotate(-1);
    }
    else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

playerReset();
updateScore();
update();