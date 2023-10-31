// src/Ball.tsx

import React from 'react';
import { Ball as BallType } from './types';

interface BallProps {
    ball: BallType;
    color?: string;
}

const Ball: React.FC<BallProps> = ({ ball, color }) => {
    return <circle cx={ball.position.x} cy={ball.position.y} r={ball.radius} fill={color || "blue"} />;
};

export default Ball;
