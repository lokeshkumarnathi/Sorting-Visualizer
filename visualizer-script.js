let array = [];
let isSorting = false;
let currentAlgorithm = 'bubble';
let delay = 100;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration = 0.1) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    currentAlgorithm = urlParams.get('algorithm') || 'bubble';
    delay = parseInt(urlParams.get('speed')) || 100;
    const size = parseInt(urlParams.get('size')) || 20;
    document.getElementById('algorithm-title').textContent = `${currentAlgorithm.charAt(0).toUpperCase() + currentAlgorithm.slice(1)} Sort`;
    setAlgorithmDescription();
    generateRandomArray(size);
    startSorting();
}

function setAlgorithmDescription() {
    const descriptions = {
        bubble: "Bubble Sort compares adjacent elements and swaps them if they are in the wrong order, repeating until no swaps are needed. Time: O(n²), Space: O(1).",
        selection: "Selection Sort finds the minimum element in the unsorted portion and swaps it with the first unsorted element. Time: O(n²), Space: O(1).",
        insertion: "Insertion Sort builds a sorted portion by inserting the next element into its correct position. Time: O(n²), Space: O(1).",
        merge: "Merge Sort divides the array into halves, recursively sorts them, and merges them back. Time: O(n log n), Space: O(n).",
        quick: "Quick Sort selects a pivot, partitions the array, and recursively sorts subarrays. Time: O(n log n) average, O(n²) worst, Space: O(log n)."
    };
    document.getElementById('algorithm-description').textContent = descriptions[currentAlgorithm] || "No description available.";
}

function generateRandomArray(size = 20) {
    document.getElementById('error').classList.add('hidden');
    array = Array.from({ length: Math.min(size, 50) }, () => Math.floor(Math.random() * 100) + 1);
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

function stopSorting() {
    isSorting = false;
}

async function startSorting() {
    if (isSorting || array.length === 0) return;
    isSorting = true;
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
    if (isSorting) {
        await markSorted();
        const sortedResult = document.getElementById('sorted-result');
        const sortedArraySpan = document.getElementById('sorted-array');
        sortedArraySpan.textContent = array.join(', ');
        sortedResult.classList.remove('hidden');
        console.log('Sorted Array:', array);
    }
    isSorting = false;
}

async function bubbleSort() {
    const bars = document.getElementsByClassName('bar');
    for (let i = 0; i < array.length - 1 && isSorting; i++) {
        for (let j = 0; j < array.length - i - 1 && isSorting; j++) {
            bars[j].classList.add('comparing');
            bars[j + 1].classList.add('comparing');
            playSound(440);
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                const maxHeight = 384;
                const maxValue = Math.max(...array);
                if (maxValue === 0) maxValue = 1;
                bars[j].style.height = `${(array[j] / maxValue) * maxHeight}px`;
                bars[j].querySelector('.bar-label').textContent = array[j];
                bars[j + 1].style.height = `${(array[j + 1] / maxValue) * maxHeight}px`;
                bars[j + 1].querySelector('.bar-label').textContent = array[j + 1];
                playSound(523.25);
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
            playSound(493.88);
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
            await sleep(delay / 2);
            bars[j].classList.remove('comparing');
        }
        if (minIdx !== i) {
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
            const maxHeight = 384;
            const maxValue = Math.max(...array);
            if (maxValue === 0) maxValue = 1;
            bars[i].style.height = `${(array[i] / maxValue) * maxHeight}px`;
            bars[i].querySelector('.bar-label').textContent = array[i];
            bars[minIdx].style.height = `${(array[minIdx] / maxValue) * maxHeight}px`;
            bars[minIdx].querySelector('.bar-label').textContent = array[minIdx];
            playSound(587.33);
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
            playSound(466.16);
            array[j + 1] = array[j];
            const maxHeight = 384;
            const maxValue = Math.max(...array);
            if (maxValue === 0) maxValue = 1;
            bars[j + 1].style.height = `${(array[j + 1] / maxValue) * maxHeight}px`;
            bars[j + 1].querySelector('.bar-label').textContent = array[j + 1];
            j--;
            await sleep(delay);
        }
        array[j + 1] = key;
        bars[j + 1].style.height = `${(key / Math.max(...array)) * 384}px`;
        bars[j + 1].querySelector('.bar-label').textContent = key;
        playSound(659.25);
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
        playSound(415.30);
        if (leftArray[i] <= rightArray[j]) {
            array[k] = leftArray[i];
            const maxHeight = 384;
            const maxValue = Math.max(...array);
            if (maxValue === 0) maxValue = 1;
            bars[k].style.height = `${(array[k] / maxValue) * maxHeight}px`;
            bars[k].querySelector('.bar-label').textContent = array[k];
            i++;
        } else {
            array[k] = rightArray[j];
            const maxHeight = 384;
            const maxValue = Math.max(...array);
            if (maxValue === 0) maxValue = 1;
            bars[k].style.height = `${(array[k] / maxValue) * maxHeight}px`;
            bars[k].querySelector('.bar-label').textContent = array[k];
            j++;
        }
        playSound(698.46);
        await sleep(delay);
        bars[k].classList.remove('comparing');
        k++;
    }

    while (i < leftArray.length && isSorting) {
        array[k] = leftArray[i];
        const maxHeight = 384;
        const maxValue = Math.max(...array);
        if (maxValue === 0) maxValue = 1;
        bars[k].style.height = `${(array[k] / maxValue) * maxHeight}px`;
        bars[k].querySelector('.bar-label').textContent = array[k];
        bars[k].classList.add('comparing');
        playSound(698.46);
        await sleep(delay);
        bars[k].classList.remove('comparing');
        i++;
        k++;
    }

    while (j < rightArray.length && isSorting) {
        array[k] = rightArray[j];
        const maxHeight = 384;
        const maxValue = Math.max(...array);
        if (maxValue === 0) maxValue = 1;
        bars[k].style.height = `${(array[k] / maxValue) * maxHeight}px`;
        bars[k].querySelector('.bar-label').textContent = array[k];
        bars[k].classList.add('comparing');
        playSound(698.46);
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
        playSound(392.00);
        if (array[j] <= pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
            const maxHeight = 384;
            const maxValue = Math.max(...array);
            if (maxValue === 0) maxValue = 1;
            bars[i].style.height = `${(array[i] / maxValue) * maxHeight}px`;
            bars[i].querySelector('.bar-label').textContent = array[i];
            bars[j].style.height = `${(array[j] / maxValue) * maxHeight}px`;
            bars[j].querySelector('.bar-label').textContent = array[j];
            playSound(783.99);
        }
        await sleep(delay);
        bars[j].classList.remove('comparing');
    }

    [array[i + 1], array[right]] = [array[right], array[i + 1]];
    const maxHeight = 384;
    const maxValue = Math.max(...array);
    if (maxValue === 0) maxValue = 1;
    bars[i + 1].style.height = `${(array[i + 1] / maxValue) * maxHeight}px`;
    bars[i + 1].querySelector('.bar-label').textContent = array[i + 1];
    bars[right].style.height = `${(array[right] / maxValue) * maxHeight}px`;
    bars[right].querySelector('.bar-label').textContent = array[right];
    playSound(783.99);
    bars[right].classList.remove('comparing');
    await sleep(delay);
    return i + 1;
}

async function markSorted() {
    const bars = document.getElementsByClassName('bar');
    for (let i = 0; i < array.length && isSorting; i++) {
        bars[i].classList.add('sorted');
        playSound(880.00);
        await sleep(delay / 2);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize and start visualization based on URL parameters
initializeFromURL();
