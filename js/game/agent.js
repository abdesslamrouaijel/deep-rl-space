/**
 * RL Space - Q-Learning Agent Engine
 * Manages Q-tables, epsilon-greedy action loops, and temporal difference learning updates.
 */

class QLearningAgent {
    constructor(numStates = 25, numActions = 4) {
        this.numStates = numStates;
        this.numActions = numActions;
        
        // Algorithmic Hyperparameters
        this.alpha = 0.1;     // Learning rate
        this.gamma = 0.9;     // Discount factor
        this.epsilon = 0.3;   // Exploration probability
        
        // Initialize structural Q-table matrix with all zeros
        this.qTable = [];
        for (let i = 0; i < this.numStates; i++) {
            this.qTable.push(new Array(this.numActions).fill(0.0));
        }
    }

    /**
     * Chooses an action based on epsilon-greedy policies
     */
    chooseAction(state) {
        // Exploit random odds condition: Explore a random direction
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.numActions);
        }
        
        // Otherwise: Exploit the highest known state weight row index
        let stateValues = this.qTable[state];
        let maxVal = Math.max(...stateValues);
        
        // Handle ties gracefully by tracking duplicates
        let bestActions = [];
        for (let a = 0; a < this.numActions; a++) {
            if (stateValues[a] === maxVal) {
                bestActions.push(a);
            }
        }
        
        return bestActions[Math.floor(Math.random() * bestActions.length)];
    }

    /**
     * Updates the Q-Table weights using the classic Bellman Equation
     */
    learn(state, action, reward, nextState, done) {
        let currentQ = this.qTable[state][action];
        let maxNextQ = done ? 0.0 : Math.max(...this.qTable[nextState]);
        
        // Temporal Difference Target calculation
        let tdTarget = reward + this.gamma * maxNextQ;
        
        // Apply the tracking adjustment back down to the target matrix cell index
        this.qTable[state][action] = currentQ + this.alpha * (tdTarget - currentQ);
    }

    /**
     * Clears weights out and resets training values
     */
    resetTable() {
        for (let i = 0; i < this.numStates; i++) {
            this.qTable[i].fill(0.0);
        }
    }
}

// Export instantiation access handle
window.QLearningAgent = QLearningAgent;
