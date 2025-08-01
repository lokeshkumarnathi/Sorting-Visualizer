document.addEventListener('DOMContentLoaded', () => {
    let array = [];
    let isSorting = false;
    let currentAlgorithm = 'bubble';
    let delay = 100;
    let lastAlgorithmState = null; // Track last sorting state for resume
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Button event listeners
    const backBtn = document.getElementById('back-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const stopBtn = document.getElementById('stop-btn');
    const restartBtn = document.getElementById('restart-btn');
    const showLabelsCheckbox = document.getElementById('show-labels');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            console.log('Back button clicked, navigating to index.html...');
            stopSorting();
            const urlParams = new URLSearchParams(window.location.search);
            const arrayParam = urlParams.get('array') || array.join(',');
            const size = parseInt(urlParams.get('size')) || 20;
            const speed = parseInt(urlParams.get('speed')) || 100;
            const url = `index.html?algorithm=${currentAlgorithm}&speed=${speed}&size=${size}&array=${encodeURIComponent(arrayParam)}`;
            window.location.href = url;
        });
    } else {
        console.error('Back button not found!');
    }
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            if (!isSorting && array.length > 0) {
                console.log('Resume button clicked, resuming sorting...');
                startSorting();
            } else {
                console.log('Cannot resume: already sorting or no array');
            }
        });
    } else {
        console.error('Resume button not found!');
    }
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            stopSorting();
            console.log('Stop button clicked, sorting stopped.');
        });
    } else {
        console.error('Stop button not found!');
    }
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            console.log('Restart button clicked, restarting sorting...');
            stopSorting();
            initializeFromURL();
            startSorting();
        });
    } else {
        console.error('Restart button not found!');
    }
    if (showLabelsCheckbox) {
        showLabelsCheckbox.addEventListener('change', () => {
            const labels = document.getElementsByClassName('bar-label');
            for (let label of labels) {
                label.style.display = showLabelsCheckbox.checked ? 'block' : 'none';
            }
        });
    }

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
        console.log('Initializing from URL...');
        const urlParams = new URLSearchParams(window.location.search);
        currentAlgorithm = urlParams.get('algorithm') || 'bubble';
        delay = parseInt(urlParams.get('speed')) || 100;
        const size = parseInt(urlParams.get('size')) || 20;
        const arrayParam = urlParams.get('array');
        const autoStart = urlParams.get('autoStart') === 'true';
        const error = document.getElementById('error');

        document.getElementById('algorithm-title').textContent = `${currentAlgorithm.charAt(0).toUpperCase() + currentAlgorithm.slice(1)} Sort`;
        setAlgorithmDescription();
        setAlgorithmCode();

        if (arrayParam) {
            try {
                array = decodeURIComponent(arrayParam).split(',').map(num => {
                    const value = parseInt(num.trim());
                    if (isNaN(value)) throw new Error('Invalid number in array');
                    return value;
                });
                if (array.length < 2 || array.length > 50) throw new Error('Array size must be between 2 and 50');
                console.log('User-defined array loaded:', array);
                error.classList.add('hidden');
            } catch (e) {
                console.error('Failed to parse array from URL:', e);
                error.textContent = `Error loading array: ${e.message}. Using random array.`;
                error.classList.remove('hidden');
                generateRandomArray(size);
            }
        } else {
            generateRandomArray(size);
            error.classList.add('hidden');
        }

        if (document.getElementById('bar-wrapper')) {
            renderArray();
            console.log('Array generated and rendered:', array);
            if (autoStart) {
                console.log('Auto-starting sorting...');
                startSorting();
            }
        } else {
            console.error('Bar wrapper not found!');
            error.textContent = 'Error: Visualization container not found.';
            error.classList.remove('hidden');
        }
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

    function setAlgorithmCode() {
        const codeSnippets = {
            bubble: `function bubbleSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`,
            selection: `function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    return arr;
}`,
            insertion: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
            merge: `function mergeSort(arr, left, right) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
    return arr;
}

function merge(arr, left, mid, right) {
    let leftArray = arr.slice(left, mid + 1);
    let rightArray = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < leftArray.length && j < rightArray.length) {
        if (leftArray[i] <= rightArray[j]) {
            arr[k] = leftArray[i];
            i++;
        } else {
            arr[k] = rightArray[j];
            j++;
        }
        k++;
    }
    while (i < leftArray.length) {
        arr[k] = leftArray[i];
        i++;
        k++;
    }
    while (j < rightArray.length) {
        arr[k] = rightArray[j];
        j++;
        k++;
    }
}`,
            quick: `function quickSort(arr, left, right) {
    if (left < right) {
        const pivotIndex = partition(arr, left, right);
        quickSort(arr, left, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, right);
    }
    return arr;
}

function partition(arr, left, right) {
    const pivot = arr[right];
    let i = left - 1;
    for (let j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    return i + 1;
}`
        };
        const codeDisplay = document.getElementById('code-display');
        if (codeDisplay) {
            codeDisplay.textContent = codeSnippets[currentAlgorithm] || "No code available.";
        } else {
            console.error('Code display element not found!');
        }
    }

    function generateRandomArray(size = 20) {
        console.log('Generating random array with size:', size);
        array = Array.from({ length: Math.min(size, 50) }, () => Math.floor(Math.random() * 100) + 1);
        if (array.length === 0) console.error('Array generation failed!');
    }

    function renderArray() {
        console.log('Rendering array...');
        const container = document.getElementById('bar-wrapper');
        if (!container) {
            console.error('Bar wrapper not found in DOM!');
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
            label.style.display = document.getElementById('show-labels').checked ? 'block' : 'none';
            bar.appendChild(label);
            container.appendChild(bar);
        });
        console.log('Rendering complete, bars should be visible. Array length:', array.length);
    }

    function stopSorting() {
        console.log('Stopping sorting...');
        isSorting = false;
    }

    async function startSorting() {
        console.log('Starting/resuming sorting with algorithm:', currentAlgorithm);
        if (isSorting || array.length === 0) {
            console.log('Sorting aborted: already running or no array');
            return;
        }
        isSorting = true;
        const bars = document.getElementsByClassName('bar');
        if (bars.length === 0) {
            console.error('No bars found to sort!');
            isSorting = false;
            return;
        }

        // Resume from last state or start fresh
        if (lastAlgorithmState && lastAlgorithmState.algorithm === currentAlgorithm) {
            console.log('Resuming from previous state:', lastAlgorithmState);
            switch (currentAlgorithm) {
                case 'bubble':
                    await resumeBubbleSort(lastAlgorithmState.i, lastAlgorithmState.j);
                    break;
                case 'selection':
                    await resumeSelectionSort(lastAlgorithmState.i);
                    break;
                case 'insertion':
                    await resumeInsertionSort(lastAlgorithmState.i);
                    break;
                case 'merge':
                    await mergeSort(lastAlgorithmState.left, lastAlgorithmState.right);
                    break;
                case 'quick':
                    await quickSort(lastAlgorithmState.left, lastAlgorithmState.right);
                    break;
            }
        } else {
            console.log('Starting new sorting process');
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
        lastAlgorithmState = null; // Reset state after completion
        console.log('Sorting completed.');
    }

    async function bubbleSort() {
        console.log('Running Bubble Sort...');
        const bars = document.getElementsByClassName('bar');
        for (let i = 0; i < array.length - 1 && isSorting; i++) {
            for (let j = 0; j < array.length - i - 1 && isSorting; j++) {
                bars[j].classList.add('comparing');
                bars[j + 1].classList.add('comparing');
                playSound(440);
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    const maxHeight = 384;
                    const maxValue = Math.max(...array, 1);
                    bars[j].style.height = `${(array[j] / maxValue) * maxHeight}px`;
                    bars[j].querySelector('.bar-label').textContent = array[j];
                    bars[j + 1].style.height = `${(array[j + 1] / maxValue) * maxHeight}px`;
                    bars[j + 1].querySelector('.bar-label').textContent = array[j + 1];
                    playSound(523.25);
                }
                lastAlgorithmState = { algorithm: 'bubble', i, j };
                await sleep(delay);
                bars[j].classList.remove('comparing');
                bars[j + 1].classList.remove('comparing');
            }
        }
    }

    async function resumeBubbleSort(startI, startJ) {
        console.log('Resuming Bubble Sort from i:', startI, 'j:', startJ);
        const bars = document.getElementsByClassName('bar');
        for (let i = startI; i < array.length - 1 && isSorting; i++) {
            for (let j = (i === startI ? startJ : 0); j < array.length - i - 1 && isSorting; j++) {
                bars[j].classList.add('comparing');
                bars[j + 1].classList.add('comparing');
                playSound(440);
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    const maxHeight = 384;
                    const maxValue = Math.max(...array, 1);
                    bars[j].style.height = `${(array[j] / maxValue) * maxHeight}px`;
                    bars[j].querySelector('.bar-label').textContent = array[j];
                    bars[j + 1].style.height = `${(array[j + 1] / maxValue) * maxHeight}px`;
                    bars[j + 1].querySelector('.bar-label').textContent = array[j + 1];
                    playSound(523.25);
                }
                lastAlgorithmState = { algorithm: 'bubble', i, j };
                await sleep(delay);
                bars[j].classList.remove('comparing');
                bars[j + 1].classList.remove('comparing');
            }
        }
    }

    async function selectionSort() {
        console.log('Running Selection Sort...');
        const bars = document.getElementsByClassName('bar');
        for (let i = 0; i < array.length && isSorting; i++) {
            let minIdx = i;
            bars[i].classList.add('comparing');
            for (let j = i + 1; j < array.length && isSorting; j++) {
                bars[j].classList.add('comparing');
                playSound(493.88);
                if (array[j] < array[minIdx]) minIdx = j;
                await sleep(delay / 2);
                bars[j].classList.remove('comparing');
            }
            if (minIdx !== i) {
                [array[i], array[minIdx]] = [array[minIdx], array[i]];
                const maxHeight = 384;
                const maxValue = Math.max(...array, 1);
                bars[i].style.height = `${(array[i] / maxValue) * maxHeight}px`;
                bars[i].querySelector('.bar-label').textContent = array[i];
                bars[minIdx].style.height = `${(array[minIdx] / maxValue) * maxHeight}px`;
                bars[minIdx].querySelector('.bar-label').textContent = array[minIdx];
                playSound(587.33);
            }
            lastAlgorithmState = { algorithm: 'selection', i };
            bars[i].classList.remove('comparing');
            await sleep(delay / 2);
        }
    }

    async function resumeSelectionSort(startI) {
        console.log('Resuming Selection Sort from i:', startI);
        const bars = document.getElementsByClassName('bar');
        for (let i = startI; i < array.length && isSorting; i++) {
            let minIdx = i;
            bars[i].classList.add('comparing');
            for (let j = i + 1; j < array.length && isSorting; j++) {
                bars[j].classList.add('comparing');
                playSound(493.88);
                if (array[j] < array[minIdx]) minIdx = j;
                await sleep(delay / 2);
                bars[j].classList.remove('comparing');
            }
            if (minIdx !== i) {
                [array[i], array[minIdx]] = [array[minIdx], array[i]];
                const maxHeight = 384;
                const maxValue = Math.max(...array, 1);
                bars[i].style.height = `${(array[i] / maxValue) * maxHeight}px`;
                bars[i].querySelector('.bar-label').textContent = array[i];
                bars[minIdx].style.height = `${(array[minIdx] / maxValue) * maxHeight}px`;
                bars[minIdx].querySelector('.bar-label').textContent = array[minIdx];
                playSound(587.33);
            }
            lastAlgorithmState = { algorithm: 'selection', i };
            bars[i].classList.remove('comparing');
            await sleep(delay / 2);
        }
    }

    async function insertionSort() {
        console.log('Running Insertion Sort...');
        const bars = document.getElementsByClassName('bar');
        for (let i = 1; i < array.length && isSorting; i++) {
            let key = array[i];
            let j = i - 1;
            bars[i].classList.add('comparing');
            while (j >= 0 && array[j] > key && isSorting) {
                playSound(466.16);
                array[j + 1] = array[j];
                const maxHeight = 384;
                const maxValue = Math.max(...array, 1);
                bars[j + 1].style.height = `${(array[j + 1] / maxValue) * maxHeight}px`;
                bars[j + 1].querySelector('.bar-label').textContent = array[j + 1];
                j--;
                await sleep(delay);
            }
            array[j + 1] = key;
            bars[j + 1].style.height = `${(key / maxValue) * 384}px`;
            bars[j + 1].querySelector('.bar-label').textContent = key;
            playSound(659.25);
            lastAlgorithmState = { algorithm: 'insertion', i };
            bars[i].classList.remove('comparing');
            await sleep(delay);
        }
    }

    async function resumeInsertionSort(startI) {
        console.log('Resuming Insertion Sort from i:', startI);
        const bars = document.getElementsByClassName('bar');
        for (let i = startI; i < array.length && isSorting; i++) {
            let key = array[i];
            let j = i - 1;
            bars[i].classList.add('comparing');
            while (j >= 0 && array[j] > key && isSorting) {
                playSound(466.16);
                array[j + 1] = array[j];
                const maxHeight = 384;
                const maxValue = Math.max(...array, 1);
                bars[j + 1].style.height = `${(array[j + 1] / maxValue) * maxHeight}px`;
                bars[j + 1].querySelector('.bar-label').textContent = array[j + 1];
                j--;
                await sleep(delay);
            }
            array[j + 1] = key;
            bars[j + 1].style.height = `${(key / maxValue) * 384}px`;
            bars[j + 1].querySelector('.bar-label').textContent = key;
            playSound(659.25);
            lastAlgorithmState = { algorithm: 'insertion', i };
            bars[i].classList.remove('comparing');
            await sleep(delay);
        }
    }

    async function mergeSort(left, right) {
        console.log('Running Merge Sort...');
        if (left < right && isSorting) {
            const mid = Math.floor((left + right) / 2);
            await mergeSort(left, mid);
            await mergeSort(mid + 1, right);
            await merge(left, mid, right);
            lastAlgorithmState = { algorithm: 'merge', left, right };
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
                const maxValue = Math.max(...array, 1);
                bars[k].style.height = `${(array[k] / maxValue) * maxHeight}px`;
                bars[k].querySelector('.bar-label').textContent = array[k];
                i++;
            } else {
                array[k] = rightArray[j];
                const maxHeight = 384;
                const maxValue = Math.max(...array, 1);
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
            const maxValue = Math.max(...array, 1);
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
            const maxValue = Math.max(...array, 1);
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
        console.log('Running Quick Sort...');
        if (left < right && isSorting) {
            const pivotIndex = await partition(left, right);
            await quickSort(left, pivotIndex - 1);
            await quickSort(pivotIndex + 1, right);
            lastAlgorithmState = { algorithm: 'quick', left, right };
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
                const maxValue = Math.max(...array, 1);
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
        const maxValue = Math.max(...array, 1);
        bars[i + 1].style.height = `${(array[i + 1] / maxValue) * maxHeight}px`;
        bars[i + 1].querySelector('.bar-label').textContent = array[i + 1];
        bars[right].style.height = `${(array[right] / maxValue) * 384}px`;
        bars[right].querySelector('.bar-label').textContent = array[right];
        playSound(783.99);
        bars[right].classList.remove('comparing');
        await sleep(delay);
        return i + 1;
    }

    async function markSorted() {
        console.log('Marking sorted bars...');
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

    // Initialize visualization
    initializeFromURL();
});
