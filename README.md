Sorting Visualizer

Overview

Sorting Visualizer is an interactive web application that visually demonstrates five popular sorting algorithms: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, and Quick Sort. Developed by Lokesh Kumar, it offers a responsive, user-friendly interface for educational purposes, allowing users to input custom arrays, adjust sorting speed and array size, and observe real-time animations of sorting processes with labeled bars and algorithm-specific sounds.

Features





Interactive Visualization: Displays sorting with animated bars (blue, red for comparisons, green for sorted) and numerical labels.



Five Sorting Algorithms: Implements Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, and Quick Sort.



Custom Input: Accepts comma-separated integers (2–100 elements) with validation.



Random Array Generation: Creates arrays of adjustable size (5–50 elements).



Responsive Controls: Includes buttons for loading arrays, starting/stopping sorting, and sliders for speed and size.



Algorithm Hints: A toggleable sidebar provides concise steps and time/space complexity for each algorithm.



Audio Feedback: Plays unique tones for comparisons, swaps, and sorting steps using the Web Audio API.



Responsive Design: Adapts to desktop and mobile devices, with a collapsible sidebar for smaller screens.



Footer: Credits "Developed by Lokesh Kumar".

Tech Stack





HTML: Structures the webpage with input fields, buttons, and a sidebar.



CSS: Uses Tailwind CSS (via CDN) for modern, responsive styling and custom CSS for bar animations and labels.



JavaScript: Implements sorting logic, visualizations, and audio in vanilla JavaScript.



Web Audio API: Generates short, distinct tones for each algorithm's steps.
