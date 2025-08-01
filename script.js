let array = [];
let isSorting = false;
let currentAlgorithm = 'bubble';
let delay = 100;

function loadArray() {
    if (isSorting) {
        console.log('Cannot load array: sorting in progress');
        return;
    }
    const input = document.getElementById('array-input').value;
    const error = document.getElementById('error');
    
    try {
        array = input.split(',').map(num => {
            const value = parseInt(num.trim());
            if (isNaN(value)) throw new Error('Invalid number');
            return value;
        });
        if (array.length < 2 || array.length > 50) throw new Error('Array size must be between 2 and 50');
        console.log('Array loaded:', array);
        error.classList.add('hidden');
        renderArray();
    } catch (e) {
        error.textContent = `Invalid input! Please enter numbers separated by commas (e.g., 5, 2, 8). ${e.message}`;
        error.classList.remove('hidden');
        console.error('Error loading array:', e.message);
    }
}

function generateRandomArray() {
    if (isSorting) {
        console.log('Cannot generate array: sorting in progress');
        return;
    }
    document.getElementById('error').classList.add('hidden');
    const size = Math.min(parseInt(document.getElementById('size').value) || 20, 50);
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    document.getElementById('array-input').value = array.join(', ');
    console.log('Random array generated:', array);
    renderArray();
}

function renderArray() {
    const container = document.getElementById('bar-wrapper');
    if (!container) {
        console.error('Bar wrapper not found in DOM!');
        return;
    }
    if (!array || array.length === 0) {
        console.error('Array is empty or undefined, cannot render!');
        document.getElementById('error').textContent = 'Error: No array to render.';
        document.getElementById('error').classList.remove('hidden');
        return;
    }
    container.innerHTML = '';
    const maxHeight = 384;
    const maxValue = Math.max(...array, 1);
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
    console.log('Array rendered:', array);
}

function updateAlgorithm() {
    currentAlgorithm = document.getElementById('algorithm').value;
    console.log('Algorithm updated:', currentAlgorithm);
}

function stopSorting() {
    isSorting = false;
    console.log('Sorting stopped');
}

function startVisualization() {
    if (array.length === 0) {
        console.log('No array provided, generating random array');
        generateRandomArray();
    }
    const arrayParam = encodeURIComponent(array.join(','));
    const speed = 1000 - (parseInt(document.getElementById('speed').value) || 900);
    const size = parseInt(document.getElementById('size').value) || 10;
    const url = `visualizer.html?algorithm=${currentAlgorithm}&speed=${speed}&size=${size}&array=${arrayParam}&autoStart=true`;
    console.log('Navigating to:', url);
    window.location.href = url;
}

function initializeFromURL() {
    console.log('Initializing from URL...');
    const urlParams = new URLSearchParams(window.location.search);
    const arrayParam = urlParams.get('array');
    const algorithm = urlParams.get('algorithm') || 'bubble';
    const speed = parseInt(urlParams.get('speed')) || 20;
    const size = parseInt(urlParams.get('size')) || 10;
    const error = document.getElementById('error');

    try {
        if (arrayParam) {
            array = decodeURIComponent(arrayParam).split(',').map(num => {
                const value = parseInt(num.trim());
                if (isNaN(value)) throw new Error('Invalid number in array');
                return value;
            });
            if (array.length < 2 || array.length > 50) throw new Error('Array size must be between 2 and 50');
            document.getElementById('array-input').value = array.join(', ');
            console.log('Array loaded from URL:', array);
            error.classList.add('hidden');
        } else {
            throw new Error('No array provided in URL');
        }
    } catch (e) {
        console.error('Failed to parse array from URL:', e.message);
        error.textContent = `Error loading array: ${e.message}. Using random array.`;
        error.classList.remove('hidden');
        generateRandomArray();
    }

    // Set UI elements
    try {
        currentAlgorithm = ['bubble', 'selection', 'insertion', 'merge', 'quick'].includes(algorithm) ? algorithm : 'bubble';
        document.getElementById('algorithm').value = currentAlgorithm;
        document.getElementById('speed').value = Math.min(Math.max(1000 - speed, 100), 1000); // Ensure within range
        document.getElementById('size').value = Math.min(Math.max(size, 2), 50); // Ensure within range
        console.log('UI updated: algorithm=', currentAlgorithm, 'speed=', 1000 - speed, 'size=', size);
    } catch (e) {
        console.error('Error setting UI elements:', e.message);
        error.textContent = `Error setting UI: ${e.message}. Using defaults.`;
        error.classList.remove('hidden');
    }

    renderArray();
}

// Initialize with URL parameters or random array
document.addEventListener('DOMContentLoaded', initializeFromURL);
