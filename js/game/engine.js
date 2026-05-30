/**
 * RL Space - Main Simulation Orchestrator
 * Binds environment grids, policy engines, execution clocks, and UI meters.
 */

class SimulationEngine {
    constructor() {
        // Initialize the Core RL components
        this.env = new window.Gridworld("simulation-canvas");
        this.agent = new window.QLearningAgent();

        // Execution states
        this.currentState = this.env.reset();
        this.episodeCount = 0;
        this.runningRewardAccumulator = 0;
        this.isPlaying = false;
        this.loopTimer = null;

        // Map dashboard HTML elements
        this.uiEpisode = document.getElementById("ui-episode");
        this.uiReward = document.getElementById("ui-reward");
        this.uiEpsilon = document.getElementById("ui-epsilon");

        // Sync initial parameter values down to view meters
        this.updateUIDisplay();
    }

    /**
     * Executes a single mathematical frame cycle update
     */
    executeStep() {
        // 1. Agent picks an action index based on current location state
        const action = this.agent.chooseAction(this.currentState);

        // 2. Environment steps forward and evaluates rewards
        const result = this.env.step(action);

        // 3. Agent updates its parameters using the Bellman Equation
        this.agent.learn(this.currentState, action, result.reward, result.state, result.done);

        // Accumulate returns
        this.runningRewardAccumulator += result.reward;
        this.currentState = result.state;

        // 4. Handle terminal state loops
        if (result.done) {
            this.episodeCount++;
            
            // Decelerate exploration over time (Epsilon Decay)
            if (this.agent.epsilon > 0.05) {
                this.agent.epsilon -= 0.02;
            }

            // Sync metrics to display cards
            this.updateUIDisplay();

            // Refresh matrix boundary and clear accumulators for the next episode
            this.currentState = this.env.reset();
            this.runningRewardAccumulator = 0;
        }
    }

    /**
     * Governs the automated running loop state
     */
    togglePlayback(btnElement) {
        if (this.isPlaying) {
            // STOP active loop interval clocks
            clearInterval(this.loopTimer);
            this.isPlaying = false;
            btnElement.innerHTML = '<i class="fas fa-play"></i> Run Training Step';
        } else {
            // START automated clock trigger intervals (Faster training rate)
            this.isPlaying = true;
            btnElement.innerHTML = '<i class="fas fa-pause"></i> Pause Training';
            this.loopTimer = setInterval(() => {
                this.executeStep();
            }, 100); // 10 steps per second
        }
    }

    /**
     * Clears all tracking registers out
     */
    resetPlatform() {
        clearInterval(this.loopTimer);
        this.isPlaying = false;
        this.episodeCount = 0;
        this.runningRewardAccumulator = 0;
        
        this.agent.resetTable();
        this.agent.epsilon = 0.3; // Restore initial exploration rate
        this.currentState = this.env.reset();
        
        this.updateUIDisplay();

        const btnToggleSim = document.getElementById("btn-toggle-sim");
        if (btnToggleSim) {
            btnToggleSim.innerHTML = '<i class="fas fa-play"></i> Run Training Step';
        }
    }

    /**
     * Updates HTML dashboard element nodes safely
     */
    updateUIDisplay() {
        if (this.uiEpisode) this.uiEpisode.innerText = this.episodeCount;
        if (this.uiReward) this.uiReward.innerText = this.runningRewardAccumulator.toFixed(2);
        if (this.uiEpsilon) this.uiEpsilon.innerText = this.agent.epsilon.toFixed(2);
    }
}

// Export initialization hook handle
window.SimulationEngine = SimulationEngine;
