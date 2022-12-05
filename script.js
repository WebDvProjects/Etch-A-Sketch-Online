// todo WORRY ABOUT UNITs OF SIZE px, vw, vh

const canvas = document.querySelector(".canvas");
let canvas_style = getComputedStyle(canvas);
let grid_size = 16;
let mouse_hold = false;

// creates and adds squares to a multi-dimensional array and a canvas
function createSquares() {
  let squares = new Array(grid_size);
  for (let i = 0; i < squares.length; i++) {
    squares[i] = new Array(squares.length);
  }

  // calculate the size of the squares

  let size = getCanvasSize() / grid_size;

  console.log(size + " ");
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[i].length; j++) {
      squares[i][j] = createPixel(`${size}px`);
    }
  }
  return squares;
}

// creates a single square and adds it to the canvas
// returns
function createPixel(size) {
  let square = document.createElement("div");
  square.style.width = size;
  square.style.height = size;
  square.classList.toggle("pixel");
  square.classList.toggle("grid-lines");

  square.addEventListener("mousedown", (e) => {
    mouse_hold = true;
    changeColor(e.currentTarget);
    console.log("Mouse down");
  });

  square.addEventListener("mouseup", (e) => {
    mouse_hold = false;
    console.log("Mouse up");
  });

  square.addEventListener("mouseover", (e) => {
    if (mouse_hold) changeColor(e.currentTarget);
    console.log("Mouse over");
  });

  canvas.appendChild(square);

  return square;
}

function changeColor(square) {
  square.style.background = "blue";
}

function getCanvasSize() {
  let w = canvas_style.width;
  w = w.slice(0, w.length - 2);
  // include border ofsset
  const offset = grid_size * 2;

  return parseFloat(w) - offset;
}

const toggle_grid_btn = document.getElementById("toggle-grid");
toggle_grid_btn.addEventListener("click", function () {
  grid_map.forEach((row) => {
    row.forEach((sq) => {
      sq.classList.toggle("grid-lines");
    });
  });

  {
  }
});

// Function call on load
let grid_map = createSquares();
