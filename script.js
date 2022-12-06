const canvas = document.querySelector(".canvas");
// prevent canvas from being dragged
canvas.setAttribute("draggable", false);

/* Variable definitions */
let canvas_style = getComputedStyle(canvas);
let default_grid_size = 16;
let drawing = false;
let grid_lines = true;
let hasChanges = false;
let current_tool_name = "pencil"


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
      squares[i][j] = createPixel(sq_size, i, j);
    }
  }
  return squares;
}

// creates a single square and adds it to the canvas
// returns
function createPixel(size, row, col) {
  let square = document.createElement("div");
  square.style.width = size;
  square.style.height = size;
  square.classList.toggle("pixel");
  square.style.backgroundColor = 'tranparent';
  if (!grid_lines) square.classList.toggle("remove-grid-lines");
  square.setAttribute("draggable", false);
  square.setAttribute("row", row)
  square.setAttribute("col", col)

  square.addEventListener("mousedown", (e) => {
    drawing = true;
    alterGrid(e.currentTarget);
  });

  square.addEventListener("mouseup", (e) => {
    drawing = false;
  });

  square.addEventListener("mouseover", (e) => {
    if (drawing && current_tool_name!= "fill") alterGrid(e.currentTarget);
  });

  canvas.appendChild(square);

  return square;
}

// Load the squares to the canvas
let grid_map = createSquares(default_grid_size);

/* Updates the pixels size with the fixed grid dimensions
 */
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
let pencil_color = '#000000';
let bg_color = '#ffffff';  // default white
let rainbow = false;

// Pencil
let pencil_color_selector = document.getElementById("pencil-color-selector");
// default color #000000
pencil_color = pencil_color_selector.value;

// allow user to set custom colour from picker
pencil_color_selector.addEventListener("input", () => {
  pencil_color = pencil_color_selector.value;

  // disable rainbow if selected
  if (rainbow) toggleRainbow(rainbow_selector)
});

// Background
const bg_color_selector = document.getElementById('bg-color-selector')
bg_color_selector.value = bg_color
bg_color_selector.addEventListener('input', ()=>{
  changeBgColor(bg_color_selector.value)
})

// Rainbow
const rainbow_selector = document.querySelector('.icon.rainbow')
rainbow_selector.addEventListener('click', (e) => toggleRainbow(e.currentTarget))

function toggleRainbow(rainbow_tool){
  rainbow_tool.classList.toggle('selected')
  rainbow = (rainbow)?false:true
  console.log('rainbow: ' + `${(rainbow)?"on":"off"}`);
}

/* COLOR OPERATIONS */

/**
 * performs certain operations on the pixel square
 * such as color fill, change background color and clear bg color
 * @param  {HTMLDivElement} square
 */
function alterGrid(square){
  if(current_tool_name == "fill") mapFill(square)
  else if(current_tool_name == "eraser") square.style.background = 'transparent'
  else if(current_tool_name == "pencil") changeColor(square)
}

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
  } else square.style.background = pencil_color
}

function changeBgColor(color){
  canvas.style.backgroundColor = color;
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

/* TOOL SELECTION */

const tools = document.querySelectorAll(".tool.settings div img.icon")
tools.forEach(t=>{
  t.addEventListener('click', (e)=>toolManager(e.currentTarget))
})

function toolManager(tool) {
  tool.classList.add('selected')
  const tool_name = tool.getAttribute('alt')
  current_tool_name = tool_name
  console.log(current_tool_name);
  // sets cursor
  manageCursor(tool_name)
  // unselects all other selection tools
  tools.forEach(t => {
    if (t.getAttribute('alt') != tool_name) t.classList.remove('selected')
  })
}


// CURSOR SWITCH (default canvas cursor is pencil)
// I set toolNames to be equals to the respective cursor classes
function manageCursor(toolName){
  let class_list = ["pencil", "eraser", "fill", "no-tool"];
  canvas.classList.remove(...class_list)
  canvas.classList.add(toolName)
}


/* DOWNLOAD BUTTON */
let download_btn = document.querySelector('a#download')
download_btn.addEventListener('click', ()=>{
  // const a = document.createElement('a')
  // download_btn.append(a)
})

/* FILL FUNCTION */
function mapFill(sq) {
  let r = parseInt(sq.getAttribute('row'))
  let c = parseInt(sq.getAttribute('col'))

  // the parent color when fill was used
  const COLOR = sq.style.backgroundColor

  if(!rainbow){
    console.log(COLOR);
    console.log(hexTorgb(pencil_color));
    if (pencil_color==COLOR || COLOR == hexTorgb(pencil_color)){
      return
    }
  }

  // DFS (faster with the use of stack)
  // console.log(r + c);
  let stack = [[r, c]]
  let frontier = new Set() // frontier is used for optimal search for items in the frontier
  frontier.add([r, c])
  let visited = new Set()

  while(stack.length > 0){
    let current = stack.pop()
    visited.add(current)
    frontier.delete(current)

    // fill
    changeColor(grid_map[current[0]][current[1]])

    // get node children/neighbours
    let states = children(current, COLOR)
    // console.log(states);
    for (let i = 0; i < states.length; i++) {
      // const element = states[i];
      if (!visited.has(states[i]) && !frontier.has(states[i])) {
        stack.push(states[i])
        frontier.add(states[i])
      }
    }
  }
}

function children(pos, color){
  const row = pos[0]
  const col = pos[1]
  /* 
  UP: (-1, 0)
  DOWN:(1, 0)
  LEFT: (0, -1)
  RIGHT: (0, 1)
  */
 let directions = [
  [-1,0],
  [1,0],
  [0,-1],
  [0,1]
 ]

 let neighbours = []

 for (let i = 0; i < directions.length; i++) {
  const d = directions[i];
  let newPos = [row+d[0], col+d[1]]
  
  // prune
  if (isWithinGrid(newPos) && isOfColor(newPos, color)) neighbours.push(newPos)
 }
 return neighbours
}

function isOfColor(pos, color){
  return grid_map[pos[0]][pos[1]].style.backgroundColor == color
}

function isWithinGrid(pos){
  return (pos[0] < grid_map.length && pos[0] >= 0 
    && pos[1] < grid_map[0].length && pos[1] >= 0)
}


function hexTorgb(hex) {
  return `rgb(${'0x' + hex[1] + hex[2] | 0}, ${'0x' + hex[3] + hex[4] | 0}, ${'0x' + hex[5] + hex[6] | 0})`;
}

