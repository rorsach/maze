import { Maze } from './maze.js';
import './style.css';

let maze;
let isAnimating = false;
let isPaused = false;
let shouldFinish = false;
let animationFrameId = null;
let stepsPerFrame = 1;
let animationStage = 'idle'; // idle, burrowing, pathfinding, drawingPath, done
let lastFrameTime = 0;
const targetFPS = 30; // Limit to 30fps instead of 60fps
const frameInterval = 1000 / targetFPS;

function animate(currentTime = 0) {
    if (shouldFinish) {
        finishAnimation();
        return;
    }
    
    // Only continue if we're actively animating and not paused
    if (!isAnimating || isPaused) {
        return; // Stop the animation loop completely
    }

    // Throttle to target FPS
    if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(animate);
        return;
    }
    lastFrameTime = currentTime;

    let workDone = false;
    for (let i = 0; i < stepsPerFrame; i++) {
        if (animationStage === 'burrowing') {
            const done = maze.stepBurrowAnimated();
            workDone = true;
            if (done) {
                animationStage = 'pathfinding';
                const start = [0, 0];
                const end = [Math.floor(maze.width / 2), Math.floor(maze.height / 2)];
                maze.initShortestPathAnimated(start, end);
            }
        } else if (animationStage === 'pathfinding') {
            const { done, path } = maze.stepShortestPathAnimated();
            workDone = true;
            if (done) {
                if (path) {
                    animationStage = 'drawingPath';
                    maze.initDrawShortestPathAnimated(path);
                } else {
                    animationStage = 'done';
                }
            }
        } else if (animationStage === 'drawingPath') {
            const done = maze.stepDrawShortestPathAnimated();
            workDone = true;
            if (done) {
                animationStage = 'done';
            }
        } else if (animationStage === 'done') {
            isAnimating = false;
            document.getElementById('pauseResume').disabled = true;
            document.getElementById('finish').disabled = true;
            document.getElementById('generationStatus').textContent = 'Complete!';
            const start = [0, 0];
            const end = [Math.floor(maze.width / 2), Math.floor(maze.height / 2)];
            maze.styleCell(start[0], start[1], 'green', true);
            maze.styleCell(end[0], end[1], 'yellow', true);
            return; // Animation complete, stop the loop
        }
    }

    // Only request next frame if we're still animating
    if (isAnimating) {
        animationFrameId = requestAnimationFrame(animate);
    }
}

function finishAnimation() {
    isAnimating = false;
    shouldFinish = false;
    cancelAnimationFrame(animationFrameId);
    
    maze.burrow(0, 0);
    maze.drawDivs('mazeDivs');
    const start = [0, 0];
    const end = [Math.floor(maze.width / 2), Math.floor(maze.height / 2)];
    const shortestPath = maze.shortestPath(start, end);
    if (shortestPath) {
        maze.drawShortestPath(shortestPath);
    }
    maze.styleCell(start[0], start[1], 'green', true);
    maze.styleCell(end[0], end[1], 'yellow', true);

    document.getElementById('pauseResume').disabled = true;
    document.getElementById('finish').disabled = true;
    document.getElementById('generationStatus').textContent = 'Complete!';
}

function makeMaze(animated) {
    if (isAnimating) {
        shouldFinish = true;
        isPaused = false;
        animationFrameId = requestAnimationFrame(() => makeMaze(animated));
        return;
    }
    
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    const width = 50;
    const height = 25;
    maze = new Maze(width, height);
    
    isPaused = false;
    shouldFinish = false;
    document.getElementById('pauseResume').textContent = 'Pause';
    document.getElementById('generationStatus').textContent = '';

    if (animated) {
        isAnimating = true;
        animationStage = 'burrowing';
        maze.initBurrowAnimated(0, 0);
        document.getElementById('pauseResume').disabled = false;
        document.getElementById('finish').disabled = false;
        animate();
    } else {
        maze.burrow(0, 0);
        maze.drawDivs('mazeDivs');
        const start = [0, 0];
        const end = [Math.floor(maze.width / 2), Math.floor(maze.height / 2)];
        const shortestPath = maze.shortestPath(start, end);
        if (shortestPath) {
            maze.drawShortestPath(shortestPath);
        }
        maze.styleCell(start[0], start[1], 'green', true);
        maze.styleCell(end[0], end[1], 'yellow', true);
        document.getElementById('pauseResume').disabled = true;
        document.getElementById('finish').disabled = true;
    }
}

function initializeApp() {
    document.getElementById('generateMazeAnimated').addEventListener('click', () => {
        makeMaze(true);
    });

    document.getElementById('pauseResume').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('pauseResume').textContent = isPaused ? 'Resume' : 'Pause';
        
        // If we're resuming and still animating, restart the animation loop
        if (!isPaused && isAnimating) {
            animationFrameId = requestAnimationFrame(animate);
        }
    });

    document.getElementById('finish').addEventListener('click', () => {
        shouldFinish = true;
        isPaused = false;
    });

    document.getElementById('stepsPerFrame').addEventListener('input', (event) => {
        stepsPerFrame = parseInt(event.target.value);
        document.getElementById('stepsValue').textContent = stepsPerFrame;
    });
    
    makeMaze(false);
}

document.addEventListener('DOMContentLoaded', initializeApp);

