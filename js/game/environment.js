/**
 * RL Space - Gridworld Environment Component
 * Models states, actions, step execution, and reward distributions.
 */

class Gridworld {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Grid configuration parameters
        this.gridSize = 5; // 5x5 grid matrix
        this.cellSize = this.canvas.width / this.gridSize;
        
        // Define terminal states and rewards mapping
        this.reset();
    }

    /**
     * Resets the agent position back to start state (0,0)
     * Returns: Initial State vector [x, y]
     */
    reset() {
        this.agent = { x: 0, y: 0 };
        this.target = { x: 4, y: 4 };
        
        // Define dangerous obstacle zones (red blocks)
        this.obstacles = [
            { x: 1, y: 1 },
            { x: 2, y: 3 },
            { x: 3, y: 1 },
            { x: 1, y: 3 }
        ];
        
        this.currentReward = 0;
        this.isTerminal = false;
        this.render();
        
        return this.getDiscreteState();
    }

    /**
     * Converts coordinate points to a discrete single index integer representation
     */
    getDiscreteState() {
        return this.agent.y * this.gridSize + this.agent.x;
    }

    /**
     * Executes an environment transition step based on action index
     * Actions: 0 = Up, 1 = Right, 2 = Down, 3 = Left
     */
    step(action) {
        if (this.isTerminal) return { state: this.getDiscreteState(), reward: 0, done: true };

        let nextX = this.agent.x;
        let nextY = this.agent.y;

        // Process Action direction shifts
        if (action === 0) nextY--;      // UP
        if (action === 1) nextX++;      // RIGHT
        if (action === 2) nextY++;      // DOWN
        if (action === 3) nextX--;      // LEFT

        // Apply boundary logic constraints (wall collisions)
        if (nextX >= 0 && nextX < this.gridSize && nextY >= 0 && nextY < this.gridSize) {
            this.agent.x = nextX;
            this.agent.y = nextY;
        }

        let reward = -0.01; // Small negative living penalty step cost
        let done = false;

        // Check Target condition lookup
        if (this.agent.x === this.target.x && this.agent.y === this.target.y) {
            reward = 1.0;
            done = true;
        }

        // Check Obstacle collision condition lookup
        for (let obs of this.obstacles) {
            if (this.agent.x === obs.x && this.agent.y === obs.y) {
                reward = -1.0;
                done = true;
            }
        }

        this.currentReward = reward;
        this.isTerminal = done;
        
        this.render();

        return {
            state: this.getDiscreteState(),
            reward: reward,
            done: done
        };
    }

    /**
     * Renders the current state onto the viewport canvas frame
     */
    render() {
        if (!this.ctx) return;
        
        // Clear background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw standard layout mesh wiregrid
        this.ctx.strokeStyle = "rgba(0, 210, 255, 0.1)";
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.gridSize; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }

        // Draw Dangerous Obstacles (Red Blocks)
        this.ctx.fillStyle = "rgba(255, 74, 74, 0.6)";
        for (let obs of this.obstacles) {
            this.ctx.fillRect(obs.x * this.cellSize + 4, obs.y * this.cellSize + 4, this.cellSize - 8, this.cellSize - 8);
        }

        // Draw Goal Target Destination (Green Glowing Target)
        this.ctx.fillStyle = "rgba(74, 255, 74, 0.7)";
        this.ctx.shadowColor = "#4aff4a";
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.target.x * this.cellSize + 6, this.target.y * this.cellSize + 6, this.cellSize - 12, this.cellSize - 12);
        
        // Reset Shadow blur properties for other drawings
        this.ctx.shadowBlur = 0;

        // Draw Learning Agent Entity (Vibrant Cyan Neon Sphere)
        this.ctx.fillStyle = "#00d2ff";
        this.ctx.shadowColor = "#00d2ff";
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        let centerX = this.agent.x * this.cellSize + this.cellSize / 2;
        let centerY = this.agent.y * this.cellSize + this.cellSize / 2;
        this.ctx.arc(centerX, centerY, this.cellSize / 3, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
}

// Export instantiation access handle
window.Gridworld = Gridworld;
