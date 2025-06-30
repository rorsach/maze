/**
 * Build a Maze Using recursive backtracking and print out an ascii representation
 */
;(function() {
	'use strict';

	function Cell() {
		this.isVisited = false;
		this.directions = [0,1,2,3];
		this.top	= 1; // 0001 << 0 = 0001 = 1
		this.right	= 2; // 0001 << 1 = 0010 = 2
		this.bottom = 4; // 0001 << 2 = 0100 = 4
		this.left	= 8; // 0001 << 3 = 1000 = 8
		this.walls = this.top | this.right | this.bottom | this.left;
		this.nextCellList = shuffleArray(this.directions);
	}

	Cell.prototype.deleteWall = function (direction) {
		direction  = 0b0001 << direction;
		switch (direction) {
		case this.top:
			this.top = 0;
			break;
		case this.right:
			this.right = 0;
			break;
		case this.bottom:
			this.bottom = 0;
			break;
		case this.left:
			this.left = 0;
			break;
		default:
			// do nothing
		}
		// Update walls otherwise this will contain original value.
		this.walls = this.top | this.right | this.bottom | this.left; 
	};

	Cell.prototype.deleteWallReverse = function(direction) {
		this.deleteWall(this.reverse(direction));
	};

	Cell.prototype.reverse = function(direction) {
		var reverse;
		switch (direction) {
		case 0:
			reverse = 2;
			break;
		case 1:
			reverse = 3;
			break;
		case 2:
			reverse = 0;
			break;
		case 3:
			reverse = 1;
			break;
		default:
			// do nothing;
		}

		return reverse;
	};

    
	function Maze(width, height) {
		this.width = width;
		this.height = height;
		this.grid = this.generateGrid(this.width, this.height);
	}

	Maze.prototype.generateGrid = function (width, height) {
		var length = width * height;
		var grid = [];
		var i;
		
		for (i = 0; i < length; i++) {
			grid.push(new Cell());
		}

		return grid;
	};

	Maze.prototype.getCell = function (x, y) {
		return this.grid[x + this.width * y];
	};

    Maze.prototype.getGridIndex = function (x, y) {
        return x + this.width * y;
    };

	Maze.prototype.isInGrid = function (x, y) {
		var isInHorizontalBound = x < this.width && x >= 0;
		var isInVerticalBound = y < this.height && y >= 0;
		return isInHorizontalBound && isInVerticalBound;
	};
	
	Maze.prototype.getDirectionDelta = function (direction) {
		var dx = 0;
		var dy = 0;

		switch (direction) {
		case 0:
			dy = -1;
			break;
		case 1:
			dx = 1;
			break;
		case 2:
			dy = 1;
			break;
		case 3:
			dx = -1;
			break;
		default:
			// do nothing
		}

		return {
			x: dx,
			y: dy
		};
	};

	// Original synchronous burrow method (kept for reference)
	Maze.prototype.burrow = function (x, y) { 
		var cell = this.getCell(x, y);
		var nextCell;
		var xNext;
		var yNext;
		cell.visited = true;
		cell.nextCellList.forEach(function(nextCellDirection) {
			var delta = this.getDirectionDelta(nextCellDirection);
			xNext = x + delta.x;
			yNext = y + delta.y;
			nextCell = this.getCell(xNext, yNext);
			if (nextCell && !nextCell.visited && this.isInGrid(xNext, yNext)) {
				cell.deleteWall(nextCellDirection);
				nextCell.deleteWallReverse(nextCellDirection);
				this.burrow(xNext, yNext);
			}
		}, this);

		return;
	};

	// New animated burrow method
	Maze.prototype.burrowAnimated = function (x, y, animationSpeed) {
		var self = this;
		animationSpeed = animationSpeed || 50; // Default 50ms delay
		
		return new Promise(function(resolve) {
			var cell = self.getCell(x, y);
			var nextCell;
			var xNext;
			var yNext;
			cell.visited = true;
			
			// Style the current cell being processed
			self.styleCell(x, y, 'current', true);
			
			var processNextDirection = function(directionIndex) {
				if (directionIndex >= cell.nextCellList.length) {
					// Remove current cell styling
					self.styleCell(x, y, 'current', false);
					resolve();
					return;
				}
				
				var nextCellDirection = cell.nextCellList[directionIndex];
				var delta = self.getDirectionDelta(nextCellDirection);
				xNext = x + delta.x;
				yNext = y + delta.y;
				nextCell = self.getCell(xNext, yNext);
				
				if (nextCell && !nextCell.visited && self.isInGrid(xNext, yNext)) {
					cell.deleteWall(nextCellDirection);
					nextCell.deleteWallReverse(nextCellDirection);
					
					// Update the visual representation
					self.drawDivs('mazeDivs');
					
					setTimeout(function() {
						self.burrowAnimated(xNext, yNext, animationSpeed).then(function() {
							processNextDirection(directionIndex + 1);
						});
					}, animationSpeed);
				} else {
					processNextDirection(directionIndex + 1);
				}
			};
			
			processNextDirection(0);
		});
	};

    Maze.prototype.shortestPath = function(start, end) {
        var queue = [];
        var currentNode;
        var neighbors = []; // nodes connected to current node.
        var x;
        var y;
        var cell;
        
        queue.push(new NodeTag(start, null, false));
        var counter = 0;
        
        while (queue.length > 0 && queue.length < 1000) {
            currentNode = queue.shift();
            x = currentNode.node[0];
            y = currentNode.node[1];
            cell = this.getCell(x, y);
            neighbors = this.neighbors(x, y);

            if (cell.isVisited) {
                continue;
            } else {
                cell.isVisited = true;
            }

            if (x === end[0] && y === end[1]) {
                return currentNode;
            }

            for (var i = 0; i < neighbors.length; i++) {
                queue.push(new NodeTag(neighbors[i], currentNode, false));
            }
        }

        return undefined;
    };

    Maze.prototype.shortestPathAnimated = function(start, end, animationSpeed) {
        var self = this;
        animationSpeed = animationSpeed || 100;
        
        return new Promise(function(resolve) {
            var queue = [];
            var currentNode;
            var neighbors = [];
            var x, y, cell;
            
            queue.push(new NodeTag(start, null, false));
            
            var processNextNode = function() {
                if (queue.length === 0 || queue.length >= 1000) {
                    resolve(undefined);
                    return;
                }
                
                currentNode = queue.shift();
                x = currentNode.node[0];
                y = currentNode.node[1];
                cell = self.getCell(x, y);
                neighbors = self.neighbors(x, y);

                if (cell.isVisited) {
                    processNextNode();
                    return;
                } else {
                    cell.isVisited = true;
                    // Visualize the search process
                    self.styleCell(x, y, 'searching', true);
                }

                if (x === end[0] && y === end[1]) {
                    // Remove search visualization
                    self.clearSearchVisualization();
                    resolve(currentNode);
                    return;
                }

                for (var i = 0; i < neighbors.length; i++) {
                    queue.push(new NodeTag(neighbors[i], currentNode, false));
                }
                
                setTimeout(processNextNode, animationSpeed);
            };
            
            processNextNode();
        });
    };
    
    Maze.prototype.clearSearchVisualization = function() {
        var divList = document.querySelectorAll('#mazeDivs div.searching');
        for (var i = 0; i < divList.length; i++) {
            divList[i].classList.remove('searching');
        }
    };

    Maze.prototype.drawShortestPathAnimated = function(node, animationSpeed) {
        var self = this;
        animationSpeed = animationSpeed || 100;
        
        return new Promise(function(resolve) {
            var path = [];
            var parent = node;
            
            // Build path array
            while (parent !== null) {
                path.unshift(parent.node);
                parent = parent.parent;
            }
            
            var drawStep = function(index) {
                if (index >= path.length) {
                    resolve();
                    return;
                }
                
                var coords = path[index];
                self.styleCell(coords[0], coords[1], 'red', true);
                
                setTimeout(function() {
                    drawStep(index + 1);
                }, animationSpeed);
            };
            
            drawStep(0);
        });
    };

    Maze.prototype.neighbors = function(x, y) {
        var cell = this.getCell(x, y);
        var neighbors = [];

        if (cell.isVisited) {
            return [];
        }
        
        if (!cell.top) {
            neighbors.push([x,y-1]);
        }

        if (!cell.right) {
            neighbors.push([x+1, y]);
        }

        if (!cell.bottom) {
            neighbors.push([x, y+1]);
        }

        if (!cell.left) {
            neighbors.push([x-1, y]);
        }

        return neighbors;
    };
    
	Maze.prototype.draw = function(idSelector) {
		var element = document.getElementById(idSelector);
		var output = '';
		var i; // grid index
		var h; // grid row
		var w; // grid column
		var boxCharacterCellHeight = 3;
		var currentCellWalls = 0; // bitmask indicating which walls the current cell has.
		var j; // character element
		for (h = 0; h < this.height; h++) {
			for (j = 0; j < boxCharacterCellHeight; j++) {
				for (w = 0; w < this.width; w++) {
					currentCellWalls = this.grid[w*h].walls;
					output += charMap[currentCellWalls][j];
				}
				output+= '\n';
			}
			if (w*h % this.width === 0) {
				// output += '\n';
			}
		}
		element.innerHTML = output;
	};

    Maze.prototype.drawDivs = function(idSelector) {
        var el = document.getElementById(idSelector);
        var output;
        var frag = document.createDocumentFragment();
        var cell;
        var cellDiv;
        var br;

        el.innerHTML = '';
        
        for (var i = 0; i < this.grid.length; i++) {
            cell = this.grid[i];
            if (!cell) {
                cell = new Cell();
            }
            cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');

            if (cell.visited) {
                cellDiv.classList.add('cellUnvisited');
            }
            
            if (cell.top) { cellDiv.classList.add('cellTop'); }
            if (cell.right) { cellDiv.classList.add('cellRight'); }
            if (cell.bottom) { cellDiv.classList.add('cellBottom'); }
            if (cell.left) { cellDiv.classList.add('cellLeft'); }


            if (i%this.width === 0 && i !== 0) {
                br = document.createElement('br');
                frag.appendChild(br);
            }
            
            frag.appendChild(cellDiv);
        }
        br = document.createElement('br');
        frag.appendChild(br);

        br = document.createElement('br');
        frag.appendChild(br);

        el.appendChild(frag);
    };

    Maze.prototype.drawShortestPath = function(node) {
        var parent = node;

        while (parent !== null) {
            this.styleCell(parent.node[0], parent.node[1], 'red', true);
            parent = parent.parent;
        }
    };
    
    
    Maze.prototype.styleCell = function(x, y, className, isToAdd) {
        var divList = document.querySelectorAll('#mazeDivs div');
        var div = divList[this.getGridIndex(x, y)];
        if (isToAdd) {
            div.classList.add(className);
        } else {
            div.classList.remove(className);
        }
    };
    
    /**
     * 
     * @param {[]} node x, y coordinates of current node. 
     * @param {} parent
     * @param {} isVisited
     */
    function NodeTag(node, parent, isVisited) {
        this.node = node;
        this.parent = parent;
    }
    
	/*************************************************
	 * Utilities
	 */
	var charMap = [
		[ // 00 no-walls
			['&#x00A0;&#x00A0;&#x00A0;'],
			['&#x00A0;&#x00A0;&#x00A0;'],
			['&#x00A0;&#x00A0;&#x00A0;']
		], 
		[ // 01 top
			['&#x2500;&#x2500;&#x2500;'],
			['&#x00A0;&#x00A0;&#x00A0;'],
			['&#x00A0;&#x00A0;&#x00A0;']
		],
		[ // 02 right
			['&#x00A0;&#x00A0;&#x2502;'],
			['&#x00A0;&#x00A0;&#x2502;'],
			['&#x00A0;&#x00A0;&#x2502;']
		],
		[ // 03 top-right
			['&#x2500;&#x2500;&#x2510;'],
			['&#x00A0;&#x00A0;&#x2502;'],
			['&#x00A0;&#x00A0;&#x2502;']			
		],
		[ // 04 bottom
			['&#x00A0;&#x00A0;&#x00A0;'],
			['&#x00A0;&#x00A0;&#x00A0;'],			
			['&#x2500;&#x2500;&#x2500;']
		],
		[ // 05 top and bottom
			['&#x2500;&#x2500;&#x2500;'],
			['&#x00A0;&#x00A0;&#x00A0;'],			
			['&#x2500;&#x2500;&#x2500;']
		],
		[ // 06 bottom-right
			['&#x00A0;&#x00A0;&#x2502;'],
			['&#x00A0;&#x00A0;&#x2502;'],			
			['&#x2500;&#x2500;&#x2518;']
		],
		[ // 07 top, right and bottom
			['&#x2500;&#x2500;&#x2510;'],
			['&#x00A0;&#x00A0;&#x2502;'],			
			['&#x2500;&#x2500;&#x2518;']
		],
		[ // 08 left
			['&#x2502;&#x00A0;&#x00A0;'],
			['&#x2502;&#x00A0;&#x00A0;'],			
			['&#x2502;&#x00A0;&#x00A0;']
		],
		[ // 09 top-left
			['&#x250C;&#x2500;&#x2500;'],
			['&#x2502;&#x00A0;&#x00A0;'],			
			['&#x2502;&#x00A0;&#x00A0;']
		],		
		[ // 10 left and right
			['&#x2502;&#x00A0;&#x2502'],
			['&#x2502;&#x00A0;&#x2502'],			
			['&#x2502;&#x00A0;&#x2502']
		],
		[ // 11 top, left and right
			['&#x250C;&#x2500;&#x2510'],
			['&#x2502;&#x00A0;&#x2502'],			
			['&#x2502;&#x00A0;&#x2502']
		],
		[ // 12 bottom-left
			['&#x2502;&#x00A0;&#x00A0'],
			['&#x2502;&#x00A0;&#x00A0'],			
			['&#x2514;&#x2500;&#x2500']
		],
		[ // 13 top, bottom and left
			['&#x250C;&#x2500;&#x2510'],
			['&#x2502;&#x00A0;&#x00A0'],			
			['&#x2514;&#x2500;&#x2500']
		],
		[ // 14 top, bottom and left
			['&#x250C;&#x2500;&#x2510'],
			['&#x2502;&#x00A0;&#x00A0'],			
			['&#x2514;&#x2500;&#x2500']
		],
		[ // 15 all walls
			['&#x250C;&#x2500;&#x2510'],
			['&#x2502;&#x00A0;&#x2502'],			
			['&#x2514;&#x2500;&#x2518']
		],
	];
	
	function randomRangeInt(min, max) {
		return Math.floor( ( Math.random() * (max-min+1) ) + min);
	}

	function zeroPad(num, len) {
		var output = num.toString();
		while (output.length < len) {
			output = "0" + output;
		}
		return output;
	}

	

	/**
	 * @description Fisher Yates Knuth Shuffle https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	 */
	function shuffleArray(array) {
		var arr = array.slice();
		var i;
		var j;
		var temp;
		for (i = arr.length - 1; i >= 0; i--) {
			j = randomRangeInt(0, i);
			temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}

		return arr;
	};

	
	// clamp : function(c, b, d) {
	// 	return (d > b) ? b : (d < c) ? c : d
	// },

    function makeMaze(animated, animationSpeed) {
        var width = 50;
        var height = 25;
	    var maze = new Maze(width, height);
        var parentNode;
        var shortestPath;
        var statusEl = document.getElementById('generationStatus');
        var buttonsEl = document.querySelectorAll('#generateMazeAnimated, #generateMazeInstant');
        var animatePathfinding = document.getElementById('animatePathfinding').checked;
        
        // Disable buttons during generation
        buttonsEl.forEach(function(btn) {
            btn.disabled = true;
            btn.classList.add('generating');
        });
        
        if (animated) {
            statusEl.textContent = 'Generating maze...';
            // Start with empty maze (all walls)
            maze.drawDivs('mazeDivs');
            
            maze.burrowAnimated(0, 0, animationSpeed).then(function() {
                statusEl.textContent = 'Finding shortest path...';
                
                setTimeout(function() {
                    var start = [0, 0];
                    var end = [Math.floor(maze.width / 2), Math.floor(maze.height / 2)];
                    
                    if (animatePathfinding) {
                        maze.shortestPathAnimated(start, end, Math.max(animationSpeed / 2, 10)).then(function(pathResult) {
                            if (pathResult) {
                                maze.drawShortestPathAnimated(pathResult, Math.max(animationSpeed / 3, 5)).then(function() {
                                    maze.styleCell(start[0], start[1], 'green', true);
                                    maze.styleCell(end[0], end[1], 'yellow', true);
                                    
                                    statusEl.textContent = 'Complete!';
                                    setTimeout(function() {
                                        statusEl.textContent = '';
                                    }, 2000);
                                    
                                    // Re-enable buttons
                                    buttonsEl.forEach(function(btn) {
                                        btn.disabled = false;
                                        btn.classList.remove('generating');
                                    });
                                });
                            }
                        });
                    } else {
                        shortestPath = maze.shortestPath(start, end);
                        maze.drawShortestPath(shortestPath);
                        maze.styleCell(start[0], start[1], 'green', true);
                        maze.styleCell(end[0], end[1], 'yellow', true);
                        
                        statusEl.textContent = 'Complete!';
                        setTimeout(function() {
                            statusEl.textContent = '';
                        }, 2000);
                        
                        // Re-enable buttons
                        buttonsEl.forEach(function(btn) {
                            btn.disabled = false;
                            btn.classList.remove('generating');
                        });
                    }
                }, 500);
            });
        } else {
            statusEl.textContent = 'Generating maze...';
            
	        maze.burrow(0, 0);
            maze.drawDivs('mazeDivs');

            var start = [0, 0];
            var end = [Math.floor(maze.width / 2), Math.floor(maze.height / 2)];
            shortestPath = maze.shortestPath(start, end);
            maze.drawShortestPath(shortestPath);
            maze.styleCell(start[0], start[1], 'green', true);
            maze.styleCell(end[0], end[1], 'yellow', true);
            
            statusEl.textContent = 'Complete!';
            setTimeout(function() {
                statusEl.textContent = '';
            }, 1000);
            
            // Re-enable buttons
            buttonsEl.forEach(function(btn) {
                btn.disabled = false;
                btn.classList.remove('generating');
            });
        }
    }

    // Initialize with instant generation
    makeMaze(false);
    
    // Event listeners
    document.getElementById('generateMazeAnimated').addEventListener('click', function(event) {
        var speed = parseInt(document.getElementById('animationSpeed').value);
        makeMaze(true, speed);
	});
	
	document.getElementById('generateMazeInstant').addEventListener('click', function(event) {
        makeMaze(false);
	});
	
	// Update speed display
	document.getElementById('animationSpeed').addEventListener('input', function(event) {
	    document.getElementById('speedValue').textContent = event.target.value + 'ms';
	});

	// Base Case
	// All cells visited.
	
	// Recursive work
	// from current cell
	// check in random direction if next cell is visited and if next cell is in grid.
	// if ok -> move to next cell, remove wall
	// if not ok -> pick a different direction
	//


})();
