const canvas = document.querySelector(".canvas");
// prevent canvas from being dragged
canvas.setAttribute("draggable", false);
let canvas_style = getComputedStyle(canvas);
let default_grid_size = 16;
let drawing = false;
let fill = true;
let grid_lines = true;
let hasChanges = false;

// creates and adds squares to a multi-dimensional array and a canvas
function createSquares(size) {
  // delete grid_map;
  let squares = new Array(size);
  for (let i = 0; i < squares.length; i++) {
    squares[i] = new Array(squares.length);
  }

  let sq_size = `${(1 / size) * 100}%`;

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
  square.style.backgroundColor = 'tranparent';
  if (!grid_lines) square.classList.toggle("remove-grid-lines");
  square.setAttribute("draggable", false);

  square.addEventListener("mousedown", (e) => {
    drawing = true;
    changeColor(e.currentTarget);
  });

  square.addEventListener("mouseup", (e) => {
    drawing = false;
  });

  square.addEventListener("mouseover", (e) => {
    if (drawing) changeColor(e.currentTarget);
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
  //remove all current squares
  removeAllSquares();

  grid_map = createSquares(size);
}

function removeAllSquares() {
  grid_map.forEach((row) => {
    row.forEach((sq) => {
      sq.remove();
    });
  });
  grid_map = null;
  hasChanges = false;
}
/* SLIDER SECTION */
let slider = document.getElementById("size-slider");
let value_display = document.querySelector(".size.settings span");
slider.setAttribute("min", "1");
slider.setAttribute("max", "100");
slider.value = default_grid_size;
let current_grid_size = default_grid_size;

let dragging = false;
slider.addEventListener("input", (e) => {
  const value = e.currentTarget.value;
  value_display.textContent = `${value}x${value}`;
});
slider.onmousedown = () => {
  dragging = true; // !not necessary
};

slider.onmouseup = (e) => {
  if (dragging) {
    // ! checking if dragging not necessary
    const value = e.currentTarget.value;
    if (value != current_grid_size) updatePixelSize(parseInt(value)); // ! Why doesn't work without parse int when its still a string
  }
};

/* CHANGE COLOR */
let pencil_color = null;
let bg_color = '#ffffff';  // default white
let rainbow = false;

// Pencil
let pencil_color_selector = document.getElementById("pencil-color-selector");
// default color #000000
pencil_color = pencil_color_selector.value;

// allow user to set custom colour from picker
pencil_color_selector.addEventListener("input", () => {
  pencil_color = pencil_color_selector.value;
});

// Background
const bg_color_selector = document.getElementById('bg-color-selector')
bg_color_selector.value = bg_color
bg_color_selector.addEventListener('input', ()=>{
  changeBgColor(bg_color_selector.value)
})

// Rainbow
const rainbow_selector = document.querySelector('.icon.rainbow')
rainbow_selector.addEventListener('click', (e)=>{
  e.currentTarget.classList.toggle('selected')
  rainbow = (rainbow)?false:true
  console.log('rainbow: ' + `${(rainbow)?"on":"off"}`);
})

function changeColor(square) {
  hasChanges = true;
  if(rainbow){
    let r_int = (max) => Math.floor(Math.random() * (max+1))
    let r_float = () => {
      let rf = Math.random()
      if (rf < 0.5) rf+=0.5
      return rf.toFixed(3)
    }

    let random_color = 
      `rgba(${r_int(255)}, ${r_int(255)}, ${r_int(255)}, ${r_float()})`
    square.style.background = random_color
  }else square.style.background = pencil_color;
}

function changeBgColor(color){
  canvas.style.backgroundColor = color;
}

/* FILL FUNCTION */
function mapFill(square) {
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
  grid_lines = grid_lines ? false : true;
});

/* CLEAR SCREEN */
const clr_btn = document.querySelector(".icon.clear");
clr_btn.addEventListener("click", clear);
function clear() {
  // can be optimized to only clear if there are any changes
  if (hasChanges && grid_map) {
    console.log("clear");
    grid_map.forEach((row) => {
      if (row) {
        row.forEach((sq) => {
          sq.style.backgroundColor = "transparent";
        });
      }
    });
  }

  hasChanges = false;
}
