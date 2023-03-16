const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const iterationInput = document.getElementById('iterations');
const button = document.getElementById('render');
const loading = document.getElementById('loadingDisplay');
const zoom = document.getElementById('zoom');
let rendering = false;

const zoomInput = document.getElementById('zoom');
const zoomDisplay = document.getElementById('zoomDisplay');

zoomInput.addEventListener('input', () => {
  switch (zoomInput.value) {
    case '1':
      zoomDisplay.textContent = '1.0x';
      break;
    case '2':
      zoomDisplay.textContent = '2.0x';
      break;
    case '3':
      zoomDisplay.textContent = '3.0x';
      break;
    case '4':
      zoomDisplay.textContent = '4.0x';
      break;
    case '5':
      zoomDisplay.textContent = '5.0x';
      break;
    default:
      zoomDisplay.textContent = `${zoomInput.value}x`;
  }
});

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
  function renderFractal(xmin, xmax, ymin, ymax) {
    if (rendering) {
      return;
    }
    loading.innerHTML = "Rendering...";
    rendering = true;
    const maxIterations = iterationInput.value;
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
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
    }

    loading.innerHTML = "";
    rendering = false;
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
    const aspectRatio = canvas.width / canvas.height;
    const xRange = (xmax - xmin) / (zoomFactor * 2);
    const yRange = xRange / aspectRatio;


    xmin = xCoord - xRange;
    xmax = xCoord + xRange;
    ymin = yCoord - yRange;
    ymax = yCoord + yRange;

    renderFractal(xmin, xmax, ymin, ymax);
  });


  button.addEventListener('click', () => {
    if (rendering) {
      return;
    }
    const start = Date.now()
    renderFractal(xmin, xmax, ymin, ymax);
    console.log(`${(Date.now() - start)/1000}s`);
  });
});