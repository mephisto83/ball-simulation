// src/Line.tsx

import React from 'react';
import { Line as LineType } from './types';

interface LineProps {
    line: LineType;
    color?: string;
    strokeWidth?: number;
}

const Line: React.FC<LineProps> = ({ line, color, strokeWidth }) => {
    return <line x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke={color || "black"}
        strokeWidth={strokeWidth || 2} />;
};

export default Line;
