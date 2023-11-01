import React, { useState, useEffect, useRef } from 'react';
import Ball from './Ball';
import LineComponent from './Line';
import { simulateBallMotion, calculateDistance } from './util';
import { Line, Point } from './types';

const Simulation = () => {
    const [ball, setBall] = useState({ position: { x: 50, y: 50 }, radius: 10, velocity: { x: 15, y: 0 } });
    const [lines, setLines] = useState<Line[]>([]);
    const [frame, setFrame] = useState(0);
    const [ballSimulation, setBallSimulation] = useState<Point[]>([]);
    const [impactPoints, setImpactPoints] = useState<Point[]>([]);
    const requestId = useRef<any>();
    const svgWidth = 800;
    const svgHeight = 600;
    const [viewBox, setViewBox] = useState(`0 0 ${svgWidth} ${svgHeight}`);

    const xMin = -3000;
    const xMax = 3000;
    useEffect(() => {
        let timesOfImpact = new Array(120).fill(0).map((_, t) => t * 2 + 2);
        let { points, lines, impactPoints } = simulateBallMotion(ball, timesOfImpact, ball.radius, xMin, xMax);
        setBallSimulation(points);
        setImpactPoints(impactPoints);
        setLines(lines);
    }, [])
    const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

    const updateViewBox = () => {
        // Extract current x, y from viewBox
        const [currentX, currentY, width, height] = viewBox.split(' ').map(Number);

        // Lerp from the current view box position to the ball's position
        const newX = lerp(currentX, ball.position.x - svgWidth / 2, 0.1); // 0.1 is the lerp factor, adjust as needed
        const newY = lerp(currentY, ball.position.y - svgHeight / 2, 0.1);

        // Update the viewBox
        setViewBox(`${newX} ${newY} ${svgWidth} ${svgHeight}`);
    };


    useEffect(() => {
        const animate = () => {
            // Update ball position and velocity here
            // Calculate collision with lines and update lines array if necessary
            setFrame((frame + 1) % ballSimulation.length);
            const newBallPosition = ballSimulation[frame];
            setBall({
                ...ball,
                position: newBallPosition
            })

            // Update the viewbox to follow the average position of the closest 4 lines
            updateViewBox();
            // Update the viewbox to follow the ball
            // setViewBox(`${newBallPosition.x - svgWidth / 2} ${newBallPosition.y - svgHeight / 2} ${svgWidth} ${svgHeight}`);

            requestId.current = requestAnimationFrame(animate);
        };
        if (ballSimulation.length)
            requestId.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestId.current);
    }, [ball, lines, ballSimulation.length]);

    return (
        <svg width={svgWidth} height={svgHeight} viewBox={viewBox}>
            <Ball ball={ball} />
            {lines.map((line, index) => (
                <LineComponent key={index} line={line} />
            ))}
            {impactPoints.map((point) => {
                return <Ball color='red' ball={{
                    position: point,
                    radius: 3,
                    velocity: { x: 0, y: 0 }
                }} />
            })}
            {new Array(120).fill(0).map((_, t) => {
                let y = t * 400;
                return <line x1={xMin} y1={y} x2={xMax} y2={y} stroke="#666666" strokeWidth="2" />;
            })}
        </svg>
    );
}


export default Simulation;
