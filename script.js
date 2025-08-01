let array = [];
let isSorting = false;
let currentAlgorithm = 'bubble';
let delay = 100;

function loadArray() {
    if (isSorting) return;
    const input = document.getElementById('array-input').value;
    const error = document.getElementById('error');
    
    try {
        array = input.split(',').map(num => {
            const value = parseInt(num.trim());
            if (isNaN(value)) throw new Error('Invalid number');
            return value;
        });
        if (array.length < 2) throw new Error('Array too short');
        error.classList.add('hidden');
        renderArray();
    } catch (e) {
        error.textContent = `Invalid input! Please enter numbers separated by commas (e.g., 5, 2, 8). ${e.message}`;
        error.classList.remove('hidden');
        return;
    }
}

function generateRandomArray() {
    if (isSorting) return;
    document.getElementById('error').classList.add('hidden');
    const size = Math.min(document.getElementById('size').value, 50);
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    document.getElementById('array-input').value = array.join(', ');
    renderArray();
}

function renderArray() {
    const container = document.getElementById('bar-wrapper');
    container.innerHTML = '';
    const maxHeight = 384;
    const maxValue = Math.max(...array);
    if (maxValue === 0) maxValue = 1;
    const barWidth = Math.max(12, (90 / array.length) * 0.5);
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.width = `${barWidth}px`;
        const height = (value / maxValue) * maxHeight;
        bar.style.height = `${height}px`;
        const label = document.createElement('span');
        label.classList.add('bar-label');
        label.textContent = value;
        bar.appendChild(label);
        container.appendChild(bar);
    });
}

function updateAlgorithm() {
    currentAlgorithm = document.getElementById('algorithm').value;
}

function stopSorting() {
    isSorting = false;
}

function startVisualization() {
    if (array.length === 0) generateRandomArray();
    const url = `visualizer.html?algorithm=${currentAlgorithm}&speed=${1000 - document.getElementById('speed').value}&size=${document.getElementById('size').value}`;
    window.location.href = url;
}

// Initialize with a random array
generateRandomArray();
