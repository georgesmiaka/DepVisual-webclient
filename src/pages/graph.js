import React from 'react';

const Graph = ({ centralNode, nodes }) => {
    const centerX = 576;
    const centerY = 400;
    const radius = 200;  // Radius for positioning surrounding nodes

    const calculateNodePositions = (nodes, centerX, centerY, radius) => {
        const angleStep = (2 * Math.PI) / nodes.length;
        return nodes.map((node, index) => {
            const angle = index * angleStep;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return { x, y, node }; // node here is the object {dependency, use}
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
                {/* Draw lines (edges) from central node to surrounding nodes */}
                {nodePositions.map((pos, index) => (
                    <line
                        key={index}
                        x1={centerX}
                        y1={centerY}
                        x2={pos.x}
                        y2={pos.y}
                        stroke="black"
                        strokeWidth="2"
                    />
                ))}
            </svg>

            {/* Central node with adjusted size */}
            <div
                style={{
                    position: "absolute",
                    top: `${centerY - 50}px`, // 50px is half of 100px height
                    left: `${centerX - 50}px`, // 50px is half of 100px width
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: "lightblue",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid black",
                }}
            >
                {centralNode}
            </div>

            {/* Other nodes with color based on use status */}
            {nodePositions.map((pos, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        top: `${pos.y - 20}px`, // Adjust to ensure vertical centering for 40px height
                        left: `${pos.x - 75}px`, // 75px is half of 150px width for centering
                        width: "150px",  // Set the width to 150px
                        height: "40px",  // The height remains 40px
                        backgroundColor: pos.node.used ? "lightgreen" : "red", // Set color based on 'use' status
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid black",
                    }}
                >
                    {pos.node.dependency}
                </div>
            ))}
        </div>
    );
};

export default Graph;
