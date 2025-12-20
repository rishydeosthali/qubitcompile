/**
 * Qiskit/IBM Quantum compatible gates for Quirk
 */

import {Gate, GateBuilder} from "../circuit/Gate.js"
import {GatePainting} from "../draw/GatePainting.js"
import {Matrix} from "../math/Matrix.js"
import {ketArgs, ketShader, ketShaderPermute} from "../circuit/KetShaderUtil.js"
import {HalfTurnGates} from "./HalfTurnGates.js"
import {QuarterTurnGates} from "./QuarterTurnGates.js"
import {Config} from "../Config.js"
import {ParametrizedRotationGates} from "./ParametrizedRotationGates.js"

let QiskitGates = {};

// Identity gate (I) - does nothing
QiskitGates.Identity = new GateBuilder().
    setSerializedIdAndSymbol("I").
    setTitle("Identity Gate").
    setBlurb("Does nothing to the qubit.").
    promiseHasNoNetEffectOnStateVector().
    promiseEffectIsUnitary().
    setDrawer(args => {
        if (args.isInToolbox || args.isHighlighted) {
            GatePainting.paintBackground(args);
            GatePainting.paintOutline(args);
        }
        GatePainting.paintGateSymbol(args);
    }).
    setKnownEffectToMatrix(Matrix.identity(2)).
    gate;

// CNOT - Controlled NOT as a single gate
// Note: In Quirk, this is typically Control + X, but we'll create a standalone version
QiskitGates.CNOT = HalfTurnGates.X; // Uses existing X, controlled via Control gate

// SX - Square root of X gate
QiskitGates.SX = QuarterTurnGates.SqrtXForward;

// SX dagger
QiskitGates.SXd = QuarterTurnGates.SqrtXBackward;

// P gate - Phase gate (parameterized RZ, but commonly used with fixed angles)
// We'll use ParametrizedRotationGates.ZToA for parameterized version
// For fixed phase gate, we can alias to S or create a specific instance
QiskitGates.P = ParametrizedRotationGates.ZToA; // Parameterized phase gate

// Reset gate - resets qubit to |0⟩
// Note: In Quirk, reset is typically handled via measurement + conditional operations
// For now, we'll create a placeholder that users can understand
// Reset is non-unitary, so it's not included in the standard gate set

// Barrier gate - visual separator with no effect
QiskitGates.Barrier = new GateBuilder().
    setSerializedIdAndSymbol("barrier").
    setTitle("Barrier").
    setBlurb("Visual separator with no effect on the circuit.").
    promiseHasNoNetEffectOnStateVector().
    markAsNotInterestedInControls().
    setDrawer(args => {
        let ctx = args.painter.ctx;
        let rect = args.rect;
        if (args.isInToolbox || args.isHighlighted) {
            GatePainting.paintBackground(args);
            GatePainting.paintOutline(args);
        }
        ctx.save();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.center().y);
        ctx.lineTo(rect.right(), rect.center().y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        if (!args.isInToolbox && !args.isHighlighted) {
            // In circuit, just show dashed line
        } else {
            GatePainting.paintGateSymbol(args);
        }
    }).
    gate;

// Note: RXX, RZZ, U, RCCX, RC3X, Toffoli, Reset are complex gates
// that would require additional implementation. For now, use existing Quirk functionality:
// - CNOT: Use Control + X
// - Toffoli (CCX): Use Control + Control + X  
// - Reset: Not available as a gate (non-unitary)
// - Conditional: Use Controls.Control
// - RXX, RZZ: Would need two-qubit rotation implementation
// - U: Would need 3-parameter universal gate implementation
// - RCCX, RC3X: Would need multi-controlled gate implementation

QiskitGates.all = [
    QiskitGates.Identity,
    QiskitGates.Barrier
    // Note: SX, SXd are aliases to existing gates, so not included in all
];

export {QiskitGates}

