import html2canvas from "html2canvas";
import "./css/style.css";

const canvas = document.getElementById("canvas");
// prevent canvas from being dragged
canvas.setAttribute("draggable", false);

/* Variable definitions */
let canvas_style = getComputedStyle(canvas);
// you can tweak these to your liking
const DEFAULT_GRID_SIZE = 20;
const MIN_GRID_SIZE = 2;
const MAX_GRID_SIZE = 64;

let current_grid_size = DEFAULT_GRID_SIZE;

let drawing = false; // the drawing state of the canvas
let grid_lines = false; // default grid lines is false
let hasChanges = false; // the canvas starts with no changes on the pixels
let current_tool_name = "pencil"; // default drawing tool set to 'pencil'

/*  
creates and adds squares to a multi-dimensional array and a canvas
The array will be useful when it comes to performing grid search and
color fill and posibilities of other operations in the future
 */
function createSquares(size) {
  // define the number of rows by given size
  let squares = new Array(size);
  // populate the each row with columns of given size
  for (let i = 0; i < squares.length; i++) {
    squares[i] = new Array(squares.length);
  }

  // calculate the size in % for each square to occupy
  // in a column and row
  let sq_size = `${(1 / size) * 100}%`;

  // create and add the pixles/square to the multi-dimensional array
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
  // define the pixel size
  square.style.width = size;
  square.style.height = size;
  // give its the default classes and style
  square.classList.toggle("pixel");
  square.style.backgroundColor = "tranparent";
  // if the grid_line default setting is not set to true then clear the default
  // border lines that make the pixels appear like a grid structure
  if (!grid_lines) square.classList.toggle("remove-grid-lines");

  square.setAttribute("draggable", false); // TODO: this is useless as we already prevent the default dragging behaviour
  // store the position the pixel has relative to the canvas (useful in "mapFill" function)
  square.setAttribute("row", row);
  square.setAttribute("col", col);

  // prevent drag behaviour
  square.addEventListener("dragstart", (e) => {
    // when a dragstart is fired,
    // prevent default behaviour of dragging the element
    // we won't need to set draggable to false
    e.preventDefault();
  });

  // set up mouse event listeners
  square.addEventListener("mousedown", handleMouseDown);
  square.addEventListener("mouseenter", handleMouseEnter);
  // Set up touch event listeners
  square.addEventListener("touchstart", handleTouchStart);
  square.addEventListener("touchmove", handleTouchMove, false);

  /*  Note: no mouseup and touchend event was set up because we have a general one set at the body
   since it is bubbled
 */

  //  add pixel square to parent_canvas
  canvas.appendChild(square);

  return square;
}

/* Updates the pixels size with the fixed grid dimensions
 */
function updatePixelSize(size) {
  //remove all current squares
  removeAllSquares();
  // create new grid with updated size
  grid_map = createSquares(size);
}

function removeAllSquares() {
  // remove all current squares/pixes from the canvas
  // canvas.innerHTML = ''; // ?? Alternative

  while (canvas.firstChild) {
    canvas.removeChild(canvas.firstChild);
  }

  grid_map = null;
  hasChanges = false;
}

/* SLIDER SECTION:
Handles slider and allows it to manipulate the canvas/grid size
*/
let slider = document.querySelector(".slider#size-slider");
let value_display = document.querySelector(".size.settings span");
slider.setAttribute("min", MIN_GRID_SIZE);
slider.setAttribute("max", MAX_GRID_SIZE);
slider.value = DEFAULT_GRID_SIZE;
value_display.textContent = `${DEFAULT_GRID_SIZE}x${DEFAULT_GRID_SIZE}`;
slider.style.setProperty("--thumb-pos", `${getThumbPos()}px`);

let dragging = false;
// when slider value is changed
slider.addEventListener("change", (e) => {
  const value = e.currentTarget.value;
  value_display.textContent = `${value}x${value}`;
  handleSliderEvent(e);
});

// when slider is being dragged
slider.addEventListener("input", (e) => {
  // update the track style
  slider.style.setProperty("--thumb-pos", `${getThumbPos()}px`);
});

//  Handles slider touch and mouse events
function handleSliderEvent(e) {
  const value = e.currentTarget.value;
  if (value != current_grid_size) updatePixelSize(parseInt(value)); // ! Why doesn't work without parse int when its still a string
}

// get thumb position from right
function getThumbPos() {
  let width = getComputedStyle(slider).width;
  width = RegExp("[0-9]+").exec(width)[0];
  return (slider.value / slider.max) * width - width;
}

/* CHANGE COLOR */
let pencil_color = "#000000";
let bg_color = "#ffffff"; // default white
let rainbow = false;

// Pencil
let pencil_color_selector = document.getElementById("pencil-color-selector");
// default color #000000
pencil_color = pencil_color_selector.value;

// allow user to set custom colour from picker
pencil_color_selector.addEventListener("input", () => {
  pencil_color = pencil_color_selector.value;

  // disable rainbow if selected
  if (rainbow) toggleRainbow(rainbow_selector);
});

// Background
const bg_color_selector = document.getElementById("bg-color-selector");
bg_color_selector.value = bg_color;
bg_color_selector.addEventListener("input", () => {
  changeBgColor(bg_color_selector.value);
});

// Rainbow
const rainbow_selector = document.querySelector(".icon.rainbow");
rainbow_selector.addEventListener("click", (e) =>
  toggleRainbow(e.currentTarget)
);

function toggleRainbow(rainbow_tool) {
  rainbow_tool.classList.toggle("selected");
  rainbow = rainbow ? false : true;
  console.log("rainbow: " + `${rainbow ? "on" : "off"}`);
}

/* COLOR OPERATIONS */

/**
 * performs certain operations on the pixel square
 * such as color fill, change background color and clear bg color
 * @param  {HTMLDivElement} square
 */
function alterGrid(square) {
  if (current_tool_name == "fill") mapFill(square);
  else if (current_tool_name == "eraser")
    square.style.background = "transparent";
  else if (current_tool_name == "pencil") changeColor(square);
}

function changeColor(square) {
  hasChanges = true;
  if (rainbow) {
    let r_int = (max) => Math.floor(Math.random() * (max + 1));
    let r_float = () => {
      let rf = Math.random();
      if (rf < 0.5) rf += 0.5;
      return rf.toFixed(3);
    };

    let random_color = `rgb(${r_int(255)}, ${r_int(255)}, ${r_int(255)}`;
    square.style.background = random_color;
  } else square.style.background = pencil_color;
}

function changeBgColor(color) {
  canvas.style.backgroundColor = color;
}

/* TOGGLE GRID-LINES */
const toggle_grid_btn = document.getElementById("toggle-grid");
toggle_grid_btn.addEventListener("click", function () {
  // set the grid to transparent
  for (let i = 0; i < grid_map.length; i++) {
    for (let j = 0; j < grid_map[i].length; j++) {
      grid_map[i][j].classList.toggle("remove-grid-lines");
    }
  }
  grid_lines = !grid_lines;
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

const tools = document.querySelectorAll(".tool.settings div img.icon");
tools.forEach((t) => {
  t.addEventListener("click", (e) => toolManager(e.currentTarget));
});

function toolManager(tool) {
  tool.classList.add("selected");
  const tool_name = tool.getAttribute("alt");
  current_tool_name = tool_name;
  console.log(current_tool_name);
  // sets cursor
  manageCursor(tool_name);
  // unselects all other selection tools
  tools.forEach((t) => {
    if (t.getAttribute("alt") != tool_name) t.classList.remove("selected");
  });
}

// CURSOR SWITCH (default canvas cursor is pencil)
// I set toolNames to be equals to the respective cursor classes
function manageCursor(toolName) {
  let class_list = ["pencil", "eraser", "fill", "no-tool"];
  canvas.classList.remove(...class_list);
  canvas.classList.add(toolName);
}

/* 
DOWNLOAD BUTTON :
*/
/* 
    SAVE AS PNG IMAGE
     */

let download_btn = document.getElementById("download");
download_btn.addEventListener("click", (e) => {
  const input = document.querySelector(".canvas");
  html2canvas(input).then((canvas) => {
    const image = canvas.toDataURL("img/png");
    const anchor = document.createElement("a");
    anchor.setAttribute("href", image);
    anchor.setAttribute("download", "my-canvas.png");
    anchor.click();
    anchor.remove();
  });
});

/* Whenever a mouse is released anywhere 
then drawing action is stopped
?? This is done in body because of the bubbling effect mouseup offers */
const body = document.querySelector("body");
body.addEventListener("mouseup", (e) => {
  drawing = false;
});

body.addEventListener("touchend", (e) => {
  drawing = false;
});

/* MOUSE and TOUCH events for the pixels */
function handleMouseDown(e) {
  // start drawing
  drawing = true;
  // change the color of the pixel
  alterGrid(e.currentTarget);
}

function handleMouseEnter(e) {
  // If we are drawing then Continue drawing
  if (drawing && current_tool_name != "fill") {
    // change the pixel
    alterGrid(e.currentTarget);
  }
}
// TOUCH EVENTS ON MOBILE BROWSER

// Handle touch start events
function handleTouchStart(e) {
  // Prevent the default behavior
  e.preventDefault();

  // Start drawing
  drawing = true;
  console.log("started drawing");
  alterGrid(e.currentTarget);
}

// Handle touch move events
function handleTouchMove(e) {
  // Prevent the default behavior
  e.preventDefault();

  // get the touch element and current touch position
  // ! NOTE: the target will always be the point where touchmove started
  const touch = e.targetTouches[0];
  const x = touch.clientX;
  const y = touch.clientY;

  // ! So we have to check what element is at position
  const element = document.elementFromPoint(x, y);

  // if the element is not a pixel ignore
  if (!element.classList.contains("pixel")) return;

  // Continue drawing
  if (drawing && current_tool_name != "fill") {
    alterGrid(element);
  }
}

// Handle touch end events
function handleTouchEnd(e) {
  // Prevent the default behavior
  e.preventDefault();

  // Stop drawing
  drawing = false;
}

/* 
FILL FUNCTION 
*/
function mapFill(sq) {
  let r = parseInt(sq.getAttribute("row"));
  let c = parseInt(sq.getAttribute("col"));

  // the parent color when fill was used
  const COLOR = sq.style.backgroundColor;

  if (!rainbow) {
    // console.log(COLOR);
    // console.log(hexTorgb(pencil_color));
    if (pencil_color == COLOR || COLOR == hexTorgb(pencil_color)) {
      console.log("no need to fill");
      return;
    }
  }

  // DFS (faster with the use of stack)
  // console.log(r + c);
  let stack = [[r, c]];
  let frontier = new Set(); // frontier is used for optimal search for items in the frontier
  frontier.add([r, c]);
  let visited = new Set();

  while (stack.length > 0) {
    let current = stack.pop();
    visited.add(current);
    frontier.delete(current);

    // fill
    changeColor(grid_map[current[0]][current[1]]);

    // get node children/neighbours
    let states = children(current, COLOR);
    // console.log(states);
    for (let i = 0; i < states.length; i++) {
      // const element = states[i];
      if (!visited.has(states[i]) && !frontier.has(states[i])) {
        stack.push(states[i]);
        frontier.add(states[i]);
      }
    }
  }
}
/* 
Retrieve neighboring nodes from current node
only if they are within the grid dimensions
*/
function children(pos, color) {
  const row = pos[0];
  const col = pos[1];
  /* 
  UP: (-1, 0)
  DOWN:(1, 0)
  LEFT: (0, -1)
  RIGHT: (0, 1)
  */
  let directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  let neighbours = [];

  for (let i = 0; i < directions.length; i++) {
    const d = directions[i];
    let newPos = [row + d[0], col + d[1]];

    // prune
    if (isWithinGrid(newPos) && isOfColor(newPos, color))
      neighbours.push(newPos);
  }
  return neighbours;
}

// check if child node has same color as parent node
function isOfColor(pos, color) {
  return grid_map[pos[0]][pos[1]].style.backgroundColor == color;
}

// check if child/neighbour node is within grid dimensions
function isWithinGrid(pos) {
  return (
    pos[0] < grid_map.length &&
    pos[0] >= 0 &&
    pos[1] < grid_map[0].length &&
    pos[1] >= 0
  );
}

// convers hexadecimal color code to rgb value
function hexTorgb(hex) {
  return `rgb(${("0x" + hex[1] + hex[2]) | 0}, ${
    ("0x" + hex[3] + hex[4]) | 0
  }, ${("0x" + hex[5] + hex[6]) | 0})`;
}

// Load the squares to the canvas
let grid_map = null;
window.onload = () => {
  grid_map = createSquares(DEFAULT_GRID_SIZE);
};
