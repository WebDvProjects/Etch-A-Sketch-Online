
const canvas = document.querySelector(".canvas");
let canvas_style = getComputedStyle(canvas);
let default_grid_size = 16;
let drawing = false;
let fill = true;
let grid_lines = true;


// creates and adds squares to a multi-dimensional array and a canvas
function createSquares(size) {
  // delete grid_map;
  let squares = new Array(size);
  for (let i = 0; i < squares.length; i++) {
    squares[i] = new Array(squares.length);
  }

  let sq_size = `${(1 / size) * 100}%`;

  console.log(typeof(sq_size));
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[i].length; j++) {
      squares[i][j] = createPixel(sq_size);
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
  if (!grid_lines) square.classList.toggle("remove-grid-lines");

  square.addEventListener("mousedown", (e) => {
    drawing = true;
    changeColor(e.currentTarget);
    console.log("Mouse down");
  });

  square.addEventListener("mouseup", (e) => {
    drawing = false;
    console.log("Mouse up");
  });

  square.addEventListener("mouseover", (e) => {
    if (drawing) changeColor(e.currentTarget);
    console.log("Mouse over");
  });

  square.addEventListener("click", (e) => {
    if (fill) mapFill(e.currentTarget);
  });

  canvas.appendChild(square);

  return square;
}

// Load the squares to the canvas
let grid_map = createSquares(default_grid_size);
// removeAllSquares()
// updatePixelSize(19)


function updatePixelSize(size) {
  console.log(typeof(size));
  //remove all current squares
  removeAllSquares()

  grid_map = createSquares(size);
}

function removeAllSquares(){

  grid_map.forEach(row => {
    row.forEach(sq=>{
      sq.remove();
    })
  });
  grid_map = null
}


let slider = document.getElementById('size-slider')
let value_display = document.querySelector('.size.settings span')
slider.setAttribute('min', '1')
slider.setAttribute('max', '100')
slider.value = default_grid_size
let current_grid_size = default_grid_size

let dragging = false;
slider.addEventListener('input', (e)=>{
  const value = e.currentTarget.value
  value_display.textContent = `${value}x${value}`
})
slider.ondragend = () => console.log("what")
slider.onmousedown = () => {
  console.log("started Dragging")
  dragging = true; // !not necessary
}

slider.onmouseup = (e) => {
  console.log("finished draggging...")
  if (dragging){ // ! checking if dragging not necessary
    const value = e.currentTarget.value
    if (value != current_grid_size) updatePixelSize(parseInt(value)) // ! Why doesn't work without parse int when its still a string
  }
}

/* CHANGE COLOR */
function changeColor(square) {
  square.style.background = "blue";
}

/* FILL FUNCTION */
function mapFill(square){
  // BFS
}

/* TOGGLE GRID-LINES */
const toggle_grid_btn = document.getElementById("toggle-grid");
toggle_grid_btn.addEventListener("click", function () {
  grid_map.forEach((row) => {
    row.forEach((sq) => {
      sq.classList.toggle("remove-grid-lines");
    });
  });
  grid_lines = (grid_lines) ? false:true
});
