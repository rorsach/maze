# Maze Generation #

Simple JavaScript recursive backtracking implementation of a maze with shortest path from top left to center of maze overlaid on the maze.

## TODO ##

- Redo with AMD instead of contructor fn + prototype.
- Performance tests.
- Unit tests.
- Typed Arrays for speed.
- Without using a grid, cells as linked list.
- Use adjacency list, adjacency matrix.
- Animate shortest path drawing.

## Reference Documentation ##

### Steps ###

- Start with a grid that has every possible wall filled in.
- Choose a cell to start from.
- From your current cell, choose a random neighbor that you haven't visited before and move to that cell, knocking down the wall between them.
- If there are no unvisited neighbors, backtrack to the previous cell you were in and repeat.
- Otherwise, repeat from your new cell.

### Links ###

- Recursive Backtracking: http://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking
- https://www.quora.com/What-are-the-algorithms-to-generate-a-random-maze
- http://www.astrolog.org/labyrnth/algrithm.htm
- Wikipedia:Spanning Tree https://en.wikipedia.org/wiki/Spanning_tree
- Useful for quick rendering: https://en.wikipedia.org/wiki/Box-drawing_character
