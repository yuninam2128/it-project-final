import React from "react";

function SubtaskLine({ from, to }) {
  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      style={{
        position: 'absolute',
        left: from.x,
        top: from.y,
        width: length,
        height: '2px',
        backgroundColor: '#bdbdbdff',
        transformOrigin: '0 50%',
        transform: `rotate(${angle}deg)`,
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}

export default SubtaskLine;