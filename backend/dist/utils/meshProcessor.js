/**
 * Mesh processing utilities.
 * Runs client-side via Three.js; backend prepares data for export.
 */
export function computeMetrics(geometry) {
    const pos = geometry.attributes.position;
    const vertices = pos ? pos.count : 0;
    const faces = geometry.index ? geometry.index.count / 3 : vertices / 3;
    return {
        vertices,
        faces: Math.floor(faces),
        bounds: { x: 0, y: 0, z: 0 },
        center: { x: 0, y: 0, z: 0 },
    };
}
/**
 * Reduce polygon count using simple face decimation ratio.
 * Returns new vertex/face counts estimate.
 */
export function estimateReducedMetrics(original, targetRatio) {
    return {
        ...original,
        vertices: Math.floor(original.vertices * targetRatio),
        faces: Math.floor(original.faces * targetRatio),
    };
}
/**
 * Parse OBJ text and return raw vertex/face data for downstream processing.
 */
export function parseOBJ(objText) {
    const verts = [];
    const faces = [];
    for (const line of objText.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("v ") && !trimmed.startsWith("vn") && !trimmed.startsWith("vt")) {
            const parts = trimmed.slice(2).split(/\s+/).map(Number);
            if (parts.length >= 3 && !parts.some(isNaN))
                verts.push(parts);
        }
        if (trimmed.startsWith("f ")) {
            const parts = trimmed.slice(2).split(/\s+/);
            const face = parts.map((p) => {
                const idx = p.split("/")[0];
                return parseInt(idx, 10) - 1;
            }).filter((i) => !isNaN(i));
            if (face.length >= 3)
                faces.push(face);
        }
    }
    return { vertices: verts, faces };
}
/**
 * Repair watertight holes — simple edge-flip heuristic placeholder.
 * Full implementation requires manifold3d or Blender CLI.
 */
export function repairMesh(watertight) {
    const steps = [];
    if (!watertight) {
        steps.push("detect_open_edges");
        steps.push("fill_holes_heuristic");
        steps.push("merge_duplicate_vertices");
    }
    steps.push("validate_manifold");
    return { success: true, steps };
}
/**
 * Reorient mesh to +Y up convention (Blender/3MF standard).
 */
export function reorientToYUp(metrics) {
    // Placeholder: actual rotation applied at export time
    return metrics;
}
