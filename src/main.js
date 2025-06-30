import { Maze } from './maze.js';
import './style.css';

// Global animation state
let currentAnimationSpeed = 50;
let isAnimating = false;
let isPaused = false;
let shouldFinish = false;
let animationFrameId = null;

function makeMaze(animated, animationSpeed) {
    const width = 50;
    const height = 25;
    let maze = new Maze(width, height);
    let shortestPath;
    const statusEl = document.getElementById('generationStatus');
    const animatePathfinding = document.getElementById('animatePathfinding');

    isAnimating = false;
    isPaused = false;
    shouldFinish = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    currentAnimationSpeed = animationSpeed || 50;
    
    document.getElementById('generateMazeAnimated').disabled = false;
    document.getElementById('pauseResume').disabled = !animated;
    document.getElementById('finish').disabled = !animated;

    if (animated) {
        isAnimating = true;
        statusEl.textContent = 'Generating maze...';
        maze.drawDivs('mazeDivs');
        
        const onComplete = (finished) => {
            isAnimating = false;
            document.getElementById('pauseResume').disabled = true;
            document.getElementById('finish').disabled = true;
            if (finished) {
                statusEl.textContent = 'Complete!';
                setTimeout(() => statusEl.textContent = '', 2000);
            }
        };

        const finishMaze = () => {
            maze = new Maze(width, height); // Create a fresh maze
            maze.burrow(0, 0);
            maze.drawDivs('mazeDivs');
            const start = [0, 0];
            const end = [Math.floor(maze.width / 2), Math.floor(maze.height / 2)];
            const sp = maze.shortestPath(start, end);
            maze.drawShortestPath(sp);
            maze.styleCell(start[0], start[1], 'green', true);
            maze.styleCell(end[0], end[1], 'yellow', true);
            onComplete(true);
        };

        maze.burrowAnimated(0, 0).then(() => {
            if (shouldFinish) return finishMaze();
            if (!isAnimating) return onComplete(false);

            statusEl.textContent = 'Finding shortest path...';
            const start = [0, 0];
            const end = [Math.floor(maze.width / 2), Math.floor(maze.height / 2)];

            if (animatePathfinding.checked) {
                maze.shortestPathAnimated(start, end).then(pathResult => {
                    if (shouldFinish) return finishMaze();
                    if (!isAnimating) return onComplete(false);
                    
                    if (pathResult) {
                        maze.drawShortestPathAnimated(pathResult).then(() => {
                            if (shouldFinish) return finishMaze();
                            if (!isAnimating) return onComplete(false);
                            maze.styleCell(start[0], start[1], 'green', true);
                            maze.styleCell(end[0], end[1], 'yellow', true);
                            onComplete(true);
                        });
                    } else {
                        onComplete(true);
                    }
                });
            } else {
                shortestPath = maze.shortestPath(start, end);
                maze.drawShortestPath(shortestPath);
                maze.styleCell(start[0], start[1], 'green', true);
                maze.styleCell(end[0], end[1], 'yellow', true);
                onComplete(true);
            }
        });
    } else {
        maze.burrow(0, 0);
        maze.drawDivs('mazeDivs');
        const start = [0, 0];
        const end = [Math.floor(maze.width / 2), Math.floor(maze.height / 2)];
        shortestPath = maze.shortestPath(start, end);
        maze.drawShortestPath(shortestPath);
        maze.styleCell(start[0], start[1], 'green', true);
        maze.styleCell(end[0], end[1], 'yellow', true);
    }
}

function initializeApp() {
    document.getElementById('generateMazeAnimated').addEventListener('click', () => {
        if (isAnimating) {
            shouldFinish = true;
            setTimeout(() => {
                const speed = parseInt(document.getElementById('animationSpeed').value);
                makeMaze(true, speed);
            }, 50);
        } else {
            const speed = parseInt(document.getElementById('animationSpeed').value);
            makeMaze(true, speed);
        }
    });

    document.getElementById('pauseResume').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('pauseResume').textContent = isPaused ? 'Resume' : 'Pause';
    });

    document.getElementById('finish').addEventListener('click', () => {
        shouldFinish = true;
        isPaused = false;
    });

    document.getElementById('animationSpeed').addEventListener('input', (event) => {
        currentAnimationSpeed = parseInt(event.target.value);
        document.getElementById('speedValue').textContent = currentAnimationSpeed + 'ms';
    });
    
    makeMaze(false);
}


document.addEventListener('DOMContentLoaded', initializeApp);

export { currentAnimationSpeed, isPaused, shouldFinish };

