import React from 'react';

const Graph = ({ centralNode, nodes }) => {
    const centerX = 576;
    const centerY = 400;
    const minRadius = 200; // Minimum radius for positioning surrounding nodes

    // Adjust radius based on node count to avoid overlap
    const radius = minRadius + Math.min(nodes.length * 15, 300);
    const angleStep = (2 * Math.PI) / nodes.length;

    // Helper to position nodes in a circular pattern
    const calculateNodePositions = (nodes, centerX, centerY, radius) => {
        return nodes.map((node, index) => {
            const angle = index * angleStep;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return { x, y, node };
        });
    };

    const nodePositions = calculateNodePositions(nodes, centerX, centerY, radius);

    return (
        <div style={{ position: "relative", width: "1200px", height: "800px" }}>
            <svg
                width="100%"
                height="100%"
                style={{ position: "absolute", top: 0, left: 0 }}
            >
                {/* Draw dashed lines from the central node to surrounding nodes */}
                {nodePositions.map((pos, index) => (
                    <line
                        key={index}
                        x1={centerX}
                        y1={centerY}
                        x2={pos.x}
                        y2={pos.y}
                        stroke="black"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.6"
                    />
                ))}
            </svg>

            {/* Central node with styled background and limited text */}
            <div
                style={{
                    position: "absolute",
                    top: `${centerY - 50}px`,
                    left: `${centerX - 50}px`,
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: "lightblue",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    padding: "8px",
                    border: "2px solid lightgray",
                    fontSize: "0.9em",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                }}
                title={centralNode} // Tooltip for full text
            >
                {centralNode}
            </div>

            {/* Render surrounding nodes with styling adjustments */}
            {nodePositions.map((pos, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        top: `${pos.y - 20}px`,
                        left: `${pos.x - 75}px`,
                        width: "150px",
                        height: "40px",
                        backgroundColor: pos.node.maven_analyse_used ? "lightgreen" : "lightcoral",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        padding: "5px",
                        borderRadius: "8px",
                        border: "1.5px dashed gray",
                        fontSize: "0.8em",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                    }}
                    title={pos.node.artifact_id} // Tooltip for full text
                >
                    {pos.node.artifact_id}
                </div>
            ))}
        </div>
    );
};

export default Graph;
