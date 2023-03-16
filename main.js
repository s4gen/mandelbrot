const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const form = document.getElementById('form');
const iterationInput = document.getElementById('iterations');
const button = document.getElementById('render');
const loading = document.getElementById('loadingDisplay');
const speed = document.getElementById('speed');
const zoom = document.getElementById('zoom');
let rendering = false;
function initWasm() {
  return new Promise((resolve) => {
    Module.onRuntimeInitialized = () => {
      resolve(Module);
    };
  });
}

let xmin = -2;
let xmax = 1;
let ymin = -1;
let ymax = 1;

initWasm().then((wasmExports) => {

  function renderRow(y) {
    for (let x = 0; x < canvas.width; x++) {
      mandelbrot(x, y);
    }
  }

  function mandelbrot(x, y) {
    const maxIterations = iterationInput.value;
    const width = canvas.width;
    const height = canvas.height;
    const xcoord = xmin + (xmax - xmin) * x / width;
    const ycoord = ymin + (ymax - ymin) * y / height;

    const iterations = wasmExports.ccall(
      'mandelbrot',
      'number', // return type
      ['number', 'number', 'number'], // argument types
      [xcoord, ycoord, maxIterations] // arguments
    );

    let color = '#000000';
    if (iterations < maxIterations) {
      const hue = 360 * iterations / maxIterations;
      color = `hsl(${hue}, 100%, 50%)`;
    }

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  function renderFractal(xmin, xmax, ymin, ymax) {
    if (rendering) {
      return;
    }
    rendering = true;
    loading.innerHTML = "Rendering...";
  
    let currentRow = 0;
    let interlace = true;
    const rowsPerFrame = speed.value;

    function renderNextRows() {
      if (currentRow < canvas.height) {
          for (let i = 0; i < rowsPerFrame; i++) {
              if (currentRow < canvas.height) {
                  renderRow(currentRow);
                  currentRow += (interlace ? 2 : 1);
              } else {
                  break;
              }
          }

          if (currentRow >= canvas.height && interlace) {
              currentRow = 1;
              interlace = false;
          }

          requestAnimationFrame(renderNextRows)
      } else {
          loading.innerHTML = "";
          rendering = false;
      }
  }
  
    requestAnimationFrame(renderNextRows)
  }

  canvas.addEventListener('click', (e) => {
    if (rendering) {
      return;
    }
  
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
  
    const xCoord = xmin + (xmax - xmin) * mouseX / canvas.width;
    const yCoord = ymin + (ymax - ymin) * mouseY / canvas.height;
  
    const zoomFactor = parseFloat(zoom.value);
    const xRange = (xmax - xmin) / zoomFactor;
    const yRange = (ymax - ymin) / zoomFactor;
  
    xmin = xCoord - xRange / 2;
    xmax = xCoord + xRange / 2;
    ymin = yCoord - yRange / 2;
    ymax = yCoord + yRange / 2;
  
    renderFractal(xmin, xmax, ymin, ymax);
  });
  
  button.addEventListener('click', () => {
    if (rendering) {
      return;
    }
    renderFractal(xmin, xmax, ymin, ymax);
  });
});