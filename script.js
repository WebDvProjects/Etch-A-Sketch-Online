const canvas = document.querySelector(".canvas");
let canvas_style = getComputedStyle(canvas);
let grid_size = 16;
let mouse_hold = false

// creates and adds squares to a multi-dimensional array and a canvas
function createSquares() {
  let squares = new Array(grid_size);
  for (let i = 0; i < squares.length; i++) {
    squares[i] = new Array(squares.length);
  }

  // calculate the size of the squares

  let size = getCanvasSize() / grid_size;

  console.log(size + " " + canvas.style.width);
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[i].length; j++) {
      squares[i][j] = createPixel(`${size}px`);
    }
  }
}

// creates a single square and adds it to the canvas
function createPixel(size) {
  let square = document.createElement("div");
  square.style.width = size;
  square.style.height = size;
  square.classList.toggle("pixel");

  square.addEventListener('mousedown', (e)=>{
    mouse_hold = true;
    changeColor(e.currentTarget)
    console.log("Mouse down");
  })

  square.addEventListener('mouseup', (e)=>{
    mouse_hold = false;
    console.log('Mouse up')
  })

  square.addEventListener('mouseover', (e)=>{
    if(mouse_hold) changeColor(e.currentTarget)
    console.log('Mouse over')
  })



  canvas.appendChild(square);

  return square;
}

function changeColor(square){
    square.style.background = 'blue'
}

function getCanvasSize() {
  let w = canvas_style.width;
  w = w.slice(0, w.length - 2);
  return w;
}

// todo WORRY ABOUT UNITs OF SIZE px, vw, vh

function updateCanvasOffset() {
  let w = canvas_style.width;
  const unit = (w = parseFloat(w.slice(0, w.length - 2)));

  const offset = grid_size * 2; // !Assuming the square borders will be 1px on all sides

  w += offset;
  canvas.setAttribute("width", `${w}px`);
  canvas.setAttribute("height", `${w}px`);
}

// Function call on load
createSquares();
