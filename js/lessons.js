/**
 * RL Space - Educational Interface Engine
 * Hooks lesson button DOM selectors to game simulation engine events and canvas drawings.
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 RL Space Platform Engine Active.");
    
    const canvas = document.getElementById("simulation-canvas");
    let ctx = null;
    if (canvas) ctx = canvas.getContext("2d");

    // 1. Handle Classic RL Simulation if present
    let activeSimulation = null;
    if (canvas && window.SimulationEngine && window.location.pathname.includes("classic-rl")) {
        activeSimulation = new window.SimulationEngine();
    }

    // 2. Initialize DQN Canvas Drawing Context if on the DQN page
    if (canvas && ctx && window.location.pathname.includes("dqn")) {
        drawInitialDQNCanvas(ctx, canvas);
    }

    // 3. Initialize Policy Gradient Canvas if on the PG page
    if (canvas && ctx && window.location.pathname.includes("policy-gradient")) {
        drawPolicyGradientCanvas(ctx, canvas, [0.25, 0.25, 0.25, 0.25]);
    }

    // --- 01. CLASSIC RL CONTROLS ---
    const btnToggleSim = document.getElementById("btn-toggle-sim");
    const btnResetSim = document.getElementById("btn-reset-sim");

    if (btnToggleSim && activeSimulation) {
        btnToggleSim.addEventListener("click", () => activeSimulation.togglePlayback(btnToggleSim));
    }
    if (btnResetSim && activeSimulation) {
        btnResetSim.addEventListener("click", () => activeSimulation.resetPlatform());
    }

    // --- 02. DEEP Q-NETWORKS (DQN) CONTROLS ---
    const btnSampleBatch = document.getElementById("btn-sample-batch");
    const btnSyncTarget = document.getElementById("btn-sync-target");

    if (btnSampleBatch && ctx && canvas) {
        btnSampleBatch.addEventListener("click", () => {
            const bufferUI = document.getElementById("ui-buffer");
            const lossUI = document.getElementById("ui-loss");
            if (bufferUI) bufferUI.innerText = "64 / 10,000";
            if (lossUI) lossUI.innerText = (Math.random() * 0.04 + 0.01).toFixed(4);
            drawDQNReplayBatch(ctx, canvas);
        });
    }
    if (btnSyncTarget && ctx && canvas) {
        btnSyncTarget.addEventListener("click", () => {
            const syncUI = document.getElementById("ui-sync");
            if (syncUI) {
                syncUI.innerText = "Synced Now";
                syncUI.style.color = "var(--accent-blue)";
            }
            drawDQNReplayBatch(ctx, canvas, true);
        });
    }

    // --- 03. POLICY GRADIENTS CONTROLS ---
    const btnSampleAction = document.getElementById("btn-sample-action");
    const btnUpdatePolicy = document.getElementById("btn-update-policy");

    if (btnSampleAction && ctx && canvas) {
        btnSampleAction.addEventListener("click", () => {
            const softmaxUI = document.getElementById("ui-softmax");
            const logprobUI = document.getElementById("ui-logprob");
            
            // Generate random exploratory probability shifts that sum to 1.0
            let rawVals = [Math.random(), Math.random(), Math.random(), Math.random()];
            let sum = rawVals.reduce((a, b) => a + b, 0);
            let normalized = rawVals.map(v => parseFloat((v / sum).toFixed(2)));
            
            // Adjust last element due to floating point rounding anomalies
            let currentSum = normalized.reduce((a, b) => a + b, 0);
            if (currentSum !== 1.0) {
                normalized[3] = parseFloat((normalized[3] + (1.0 - currentSum)).toFixed(2));
            }
            
            // Randomly select one choice as the "sampled action" (0 to 3)
            let sampledActionIndex = Math.floor(Math.random() * 4);

            if (softmaxUI) softmaxUI.innerText = `[${normalized.join(", ")}]`;
            if (logprobUI) logprobUI.innerText = Math.log(normalized[sampledActionIndex]).toFixed(3);
            
            // Draw the updated distribution and highlight the sampled action!
            drawPolicyGradientCanvas(ctx, canvas, normalized, sampledActionIndex);
        });
    }

    if (btnUpdatePolicy && ctx && canvas) {
        btnUpdatePolicy.addEventListener("click", () => {
            const returnUI = document.getElementById("ui-return");
            // Simulate an episode score return update
            const simulatedReturn = (Math.random() * 15 - 5).toFixed(2);
            if (returnUI) returnUI.innerText = simulatedReturn;
            
            // Flash a policy update notice on the graph
            ctx.fillStyle = simulatedReturn >= 0 ? "#4aff4a" : "#ff4a4a";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(simulatedReturn >= 0 ? "Gradient Step: Rewarding Action ↑" : "Gradient Step: Penalizing Action ↓", canvas.width / 2, 40);
        });
    }
    // --- 04. PROXIMAL POLICY OPTIMIZATION (PPO) CONTROLS ---
    const btnIncreaseStep = document.getElementById("btn-increase-step");
    const btnClipCheck = document.getElementById("btn-clip-check");

    if (btnIncreaseStep && ctx && canvas) {
        btnIncreaseStep.addEventListener("click", () => {
            const ratioUI = document.getElementById("ui-ratio");
            const advantageUI = document.getElementById("ui-advantage");
            const statusUI = document.getElementById("ui-status");
            
            if (ratioUI) ratioUI.innerText = "1.450";
            if (advantageUI) advantageUI.innerText = "+2.310";
            if (statusUI) {
                statusUI.innerText = "Warning: Out of Bounds";
                statusUI.style.color = "#ff4a4a";
            }
            
            // This triggers the canvas drawing
            drawPPOCanvas(ctx, canvas, 1.450, "Unsafe");
        });
    }

    if (btnClipCheck && ctx && canvas) {
        btnClipCheck.addEventListener("click", () => {
            const ratioUI = document.getElementById("ui-ratio");
            const statusUI = document.getElementById("ui-status");
            
            if (ratioUI && ratioUI.innerText === "1.450") {
                ratioUI.innerText = "1.200 (Clipped)";
                if (statusUI) {
                    statusUI.innerText = "Clipped & Stable";
                    statusUI.style.color = "var(--accent-blue)";
                }
                
                // This updates the canvas to its safe clipped layout
                drawPPOCanvas(ctx, canvas, 1.200, "Clipped");
            }
        });
    }
});

/**
 * DQN CANVAS DRAWING HELPERS
 */
function drawInitialDQNCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 210, 255, 0.3)";
    ctx.font = "14px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Click 'Sample Replay Batch' to analyze network parameters...", canvas.width / 2, canvas.height / 2);
}
function drawPPOCanvas(ctx, canvas, currentRatio, statusStr) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 10;
    const scaleFactor = 100; 
    const currentX = centerX + (currentRatio - 1.0) * scaleFactor;

    // 1. Draw Safe Region Bracket Envelope [0.8 to 1.2]
    const safeLeftX = centerX - (0.2 * scaleFactor);
    const safeRightX = centerX + (0.2 * scaleFactor);
    
    ctx.fillStyle = "rgba(74, 255, 74, 0.05)";
    ctx.fillRect(safeLeftX, 80, safeRightX - safeLeftX, 160);
    
    ctx.strokeStyle = "rgba(74, 255, 74, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(safeLeftX, 70); ctx.lineTo(safeLeftX, 250); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(safeRightX, 70); ctx.lineTo(safeRightX, 250); ctx.stroke();

    ctx.fillStyle = "rgba(74, 255, 74, 0.6)";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("1 - ε (0.8)", safeLeftX, 60);
    ctx.fillText("1 + ε (1.2)", safeRightX, 60);

    // 2. Draw Main Axis Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, centerY);
    ctx.lineTo(canvas.width - 30, centerY);
    ctx.stroke();

    // 3. Draw tracking cursor token dot
    if (statusStr === "Unsafe") {
        ctx.fillStyle = "#ff4a4a";
    } else if (statusStr === "Clipped") {
        ctx.fillStyle = "var(--accent-blue)";
    } else {
        ctx.fillStyle = "#4aff4a";
    }
    
    ctx.beginPath();
    ctx.arc(currentX, centerY, 10, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`r_t = ${currentRatio.toFixed(3)}`, currentX, centerY - 20);

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("PPO Clipped Surrogate Objective Space Bounds", 20, 25);
}


function drawDQNReplayBatch(ctx, canvas, flashSync = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(0, 210, 255, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = (i === 2 || i === 5) ? "rgba(0, 210, 255, 0.6)" : "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(30 + (i * 45), 30, 35, 25);
        ctx.strokeRect(30 + (i * 45), 30, 35, 25);
    }
    ctx.fillStyle = "#768ca3";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Experience Replay Circular Buffer", 30, 20);

    // FIXED: Added missing array values to prevent code crash
    const layers = [4, 5, 4];
    const xCoords = [60, 200, 340];
    const nodeRadius = 12;

    ctx.lineWidth = 1;
    for (let l = 0; l < layers.length - 1; l++) {
        for (let i = 0; i < layers[l]; i++) {
            for (let j = 0; j < layers[l+1]; j++) {
                const y1 = 120 + i * 45 + (l === 2 ? 20 : 0);
                const y2 = 100 + j * 45;
                ctx.strokeStyle = flashSync ? "rgba(74, 255, 74, 0.5)" : `rgba(0, 210, 255, ${Math.random() * 0.3 + 0.1})`;
                ctx.beginPath();
                ctx.moveTo(xCoords[l], y1);
                ctx.lineTo(xCoords[l+1], y2);
                ctx.stroke();
            }
        }
    }
    layers.forEach((nodes, lIndex) => {
        for (let i = 0; i < nodes; i++) {
            const x = xCoords[lIndex];
            const y = (lIndex === 0 ? 120 : lIndex === 2 ? 140 : 100) + i * 45;
            ctx.fillStyle = "#081225";
            ctx.strokeStyle = flashSync ? "#4aff4a" : "var(--accent-blue)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    });
    ctx.fillStyle = "var(--text-muted)";
    ctx.font = "12px sans-serif";
    ctx.fillText("States (S)", xCoords[0] - 15, 310);
    ctx.fillText("Q-Values Q(S,A)", xCoords[2] - 30, 250);
}


/**
 * POLICY GRADIENT CANVAS DRAWING HELPERS
 */
function drawPolicyGradientCanvas(ctx, canvas, probabilities, highlightedIndex = null) {
    // Keep internal canvas layout clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const actions = ["UP (a₀)", "RIGHT (a₁)", "DOWN (a₂)", "LEFT (a₃)"];
    const chartBaseY = 280;
    const maxBarHeight = 180;
    const barWidth = 50;
    const spacing = 40;

    // Draw baseline grid rule
    ctx.strokeStyle = "rgba(118, 140, 163, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, chartBaseY);
    ctx.lineTo(canvas.width - 20, chartBaseY);
    ctx.stroke();

    // Render each categorical action probability bar
    probabilities.forEach((prob, index) => {
        const barHeight = prob * maxBarHeight;
        const x = 45 + index * (barWidth + spacing);
        const y = chartBaseY - barHeight;

        // Visual effects for chosen paths vs alternative pathways
        if (index === highlightedIndex) {
            ctx.fillStyle = "#00d2ff";
            ctx.shadowColor = "#00d2ff";
            ctx.shadowBlur = 15;
        } else {
            ctx.fillStyle = "rgba(0, 210, 255, 0.25)";
            ctx.shadowBlur = 0;
        }

        // Render shape
        ctx.strokeStyle = "var(--accent-blue)";
        ctx.lineWidth = 1.5;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.strokeRect(x, y, barWidth, barHeight);
        ctx.shadowBlur = 0; // Turn blur off for text steps

        // Render probability numbers above bars
        ctx.fillStyle = index === highlightedIndex ? "#ffffff" : "var(--text-muted)";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${(prob * 100).toFixed(0)}%`, x + barWidth / 2, y - 10);

        // Render label nodes below the line
        ctx.fillStyle = "var(--text-muted)";
        ctx.font = "11px sans-serif";
        ctx.fillText(actions[index], x + barWidth / 2, chartBaseY + 20);
    });

    // Subtitle indicator notice
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Softmax Policy Distribution π_θ(a|s)", 20, 25);
}
