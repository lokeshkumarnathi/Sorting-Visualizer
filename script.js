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
        if (array.length > 50) throw new Error('Array too large');
        error.classList.add('hidden');
        renderArray();
    } catch (e) {
        error.classList.remove('hidden');
        return;
    }
}

function generateRandomArray() {
    if (isSorting) return;
    document.getElementById('error').classList.add('hidden');
    const size = document.getElementById('size').value;
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 30) + 1);
    document.getElementById('array-input').value = array.join(', ');
    renderArray();
}

function renderArray() {
    const container = document.getElementById('array-container');
    container.innerHTML = '';
    array.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${Math.min(value * 10, 400)}px`;
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

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

async function startSorting() {
    if (isSorting || array.length === 0) return;
    isSorting = true;
    delay = 1010 - document.getElementById('speed').value;
    switch (currentAlgorithm) {
        case 'bubble':
            await bubbleSort();
            break;
        case 'selection':
            await selectionSort();
            break;
        case 'insertion':
            await insertionSort();
            break;
        case 'merge':
            await mergeSort(0, array.length - 1);
            break;
        case 'quick':
            await quickSort(0, array.length - 1);
            break;
    }
    if (isSorting) await markSorted();
    isSorting = false;
}

async function bubbleSort() {
    const bars = document.getElementsByClassName('bar');
    for (let i = 0; i < array.length - 1 && isSorting; i++) {
        for (let j = 0; j < array.length - i - 1 && isSorting; j++) {
            bars[j].classList.add('comparing');
            bars[j + 1].classList.add('comparing');
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                bars[j].style.height = `${Math.min(array[j] * 10, 400)}px`;
                bars[j].querySelector('.bar-label').textContent = array[j];
                bars[j + 1].style.height = `${Math.min(array[j + 1] * 10, 400)}px`;
                bars[j + 1].querySelector('.bar-label').textContent = array[j + 1];
            }
            await sleep(delay);
            bars[j].classList.remove('comparing');
            bars[j + 1].classList.remove('comparing');
        }
    }
}

async function selectionSort() {
    const bars = document.getElementsByClassName('bar');
    for (let i = 0; i < array.length && isSorting; i++) {
        let minIdx = i;
        bars[i].classList.add('comparing');
        for (let j = i + 1; j < array.length && isSorting; j++) {
            bars[j].classList.add('comparing');
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
            await sleep(delay / 2);
            bars[j].classList.remove('comparing');
        }
        if (minIdx !== i) {
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
            bars[i].style.height = `${Math.min(array[i] * 10, 400)}px`;
            bars[i].querySelector('.bar-label').textContent = array[i];
            bars[minIdx].style.height = `${Math.min(array[minIdx] * 10, 400)}px`;
            bars[minIdx].querySelector('.bar-label').textContent = array[minIdx];
        }
        bars[i].classList.remove('comparing');
        await sleep(delay / 2);
    }
}

async function insertionSort() {
    const bars = document.getElementsByClassName('bar');
    for (let i = 1; i < array.length && isSorting; i++) {
        let key = array[i];
        let j = i - 1;
        bars[i].classList.add('comparing');
        while (j >= 0 && array[j] > key && isSorting) {
            array[j + 1] = array[j];
            bars[j + 1].style.height = `${Math.min(array[j + 1] * 10, 400)}px`;
            bars[j + 1].querySelector('.bar-label').textContent = array[j + 1];
            j--;
            await sleep(delay);
        }
        array[j + 1] = key;
        bars[j + 1].style.height = `${Math.min(key * 10, 400)}px`;
        bars[j + 1].querySelector('.bar-label').textContent = key;
        bars[i].classList.remove('comparing');
        await sleep(delay);
    }
}

async function mergeSort(left, right) {
    if (left < right && isSorting) {
        const mid = Math.floor((left + right) / 2);
        await mergeSort(left, mid);
        await mergeSort(mid + 1, right);
        await merge(left, mid, right);
    }
}

async function merge(left, mid, right) {
    const bars = document.getElementsByClassName('bar');
    let leftArray = array.slice(left, mid + 1);
    let rightArray = array.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArray.length && j < rightArray.length && isSorting) {
        bars[k].classList.add('comparing');
        if (leftArray[i] <= rightArray[j]) {
            array[k] = leftArray[i];
            bars[k].style.height = `${Math.min(array[k] * 10, 400)}px`;
            bars[k].querySelector('.bar-label').textContent = array[k];
            i++;
        } else {
            array[k] = rightArray[j];
            bars[k].style.height = `${Math.min(array[k] * 10, 400)}px`;
            bars[k].querySelector('.bar-label').textContent = array[k];
            j++;
        }
        await sleep(delay);
        bars[k].classList.remove('comparing');
        k++;
    }

    while (i < leftArray.length && isSorting) {
        array[k] = leftArray[i];
        bars[k].style.height = `${Math.min(array[k] * 10, 400)}px`;
        bars[k].querySelector('.bar-label').textContent = array[k];
        bars[k].classList.add('comparing');
        await sleep(delay);
        bars[k].classList.remove('comparing');
        i++;
        k++;
    }

    while (j < rightArray.length && isSorting) {
        array[k] = rightArray[j];
        bars[k].style.height = `${Math.min(array[k] * 10, 400)}px`;
        bars[k].querySelector('.bar-label').textContent = array[k];
        bars[k].classList.add('comparing');
        await sleep(delay);
        bars[k].classList.remove('comparing');
        j++;
        k++;
    }
}

async function quickSort(left, right) {
    if (left < right && isSorting) {
        const pivotIndex = await partition(left, right);
        await quickSort(left, pivotIndex - 1);
        await quickSort(pivotIndex + 1, right);
    }
}

async function partition(left, right) {
    const bars = document.getElementsByClassName('bar');
    const pivot = array[right];
    bars[right].classList.add('comparing');
    let i = left - 1;

    for (let j = left; j < right && isSorting; j++) {
        bars[j].classList.add('comparing');
        if (array[j] <= pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
            bars[i].style.height = `${Math.min(array[i] * 10, 400)}px`;
            bars[i].querySelector('.bar-label').textContent = array[i];
            bars[j].style.height = `${Math.min(array[j] * 10, 400)}px`;
            bars[j].querySelector('.bar-label').textContent = array[j];
        }
        await sleep(delay);
        bars[j].classList.remove('comparing');
    }

    [array[i + 1], array[right]] = [array[right], array[i + 1]];
    bars[i + 1].style.height = `${Math.min(array[i + 1] * 10, 400)}px`;
    bars[i + 1].querySelector('.bar-label').textContent = array[i + 1];
    bars[right].style.height = `${Math.min(array[right] * 10, 400)}px`;
    bars[right].querySelector('.bar-label').textContent = array[right];
    bars[right].classList.remove('comparing');
    await sleep(delay);
    return i + 1;
}

async function markSorted() {
    const bars = document.getElementsByClassName('bar');
    for (let i = 0; i < array.length && isSorting; i++) {
        bars[i].classList.add('sorted');
        await sleep(delay / 2);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize with a random array
generateRandomArray();
