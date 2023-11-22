import React, { useState, useEffect, useRef } from 'react';
import Ball from './Ball';
import LineComponent from './Line';
import { simulateBallMotion, calculateDistance } from './util';
import { Line, Point } from './types';
import * as types from './types';
import { Midi } from '@tonejs/midi';


const Simulation = ({ midi }: { midi: Midi | null }) => {
    const [ball, setBall] = useState({ position: { x: 50, y: 50 }, radius: 110, velocity: { x: 65, y: 0 } });
    const [trackSims, setTrackSims] = useState<types.TrackSim>()
    const [lines, setLines] = useState<Line[]>([]);
    const [frame, setFrame] = useState(0);
    const [ballSimulation, setBallSimulation] = useState<Point[]>([]);
    const [simulationLength, setSimulationLength] = useState(0);
    const [impactPoints, setImpactPoints] = useState<Point[]>([]);
    const requestId = useRef<any>();
    const svgWidth = 800;
    const svgHeight = 600;
    const [viewBox, setViewBox] = useState(`0 0 ${svgWidth} ${svgHeight}`);

    const xMin = -1223000;
    const xMax = 1223000;
    const frameRate = 30;
    useEffect(() => {
        if (midi) {
            let temp: types.TrackSim = {};
            let maxLength = 0;
            midi.tracks.forEach((track, index) => {
                let ball = { position: { x: 50, y: 50 }, radius: 12, velocity: { x: 65, y: 0 } };

                let timesOfImpact = track.notes.map((note) => {
                    return note.time;
                });
                let { points, lines, impactPoints } = simulateBallMotion(ball, timesOfImpact, frameRate, xMin, xMax);
                maxLength = Math.max(maxLength, points.length)
                temp[`Track ${index + 1}`] = {
                    ball,
                    points,
                    impactPoints,
                    lines
                }
            });
            setSimulationLength(maxLength);
            setTrackSims(temp);
        }
    }, [midi])
    const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

    const updateViewBox = () => {
        const speed = .2;
        // Extract current x, y from viewBox
        const [currentX, currentY, width, height] = viewBox.split(' ').map(Number);
        let ball = trackSims ? Object.keys(trackSims).filter(v => trackSims[v]?.points?.length).map(v => trackSims[v].ball)[0] : null;
        if (ball) {
            // Lerp from the current view box position to the ball's position
            const newX = lerp(currentX, ball.position.x - svgWidth / 2, speed); // speed is the lerp factor, adjust as needed
            const newY = lerp(currentY, ball.position.y - svgHeight / 2, speed);

            // Update the viewBox
            setViewBox(`${newX} ${newY} ${svgWidth} ${svgHeight}`);
        }
    };


    useEffect(() => {
        const animate = () => {
            // Update ball position and velocity here
            // Calculate collision with lines and update lines array if necessary
            setFrame((frame + 1) % simulationLength);
            const newBallPosition = ballSimulation[frame];
            setBall({
                ...ball,
                position: newBallPosition
            })
            let sims = { ...trackSims }
            for (let i in sims) {
                let sim = sims[i];
                sim.ball.position = sim.points[Math.min(frame % sim.points.length, sim.points.length)] || sim.ball.position
            }
            setTrackSims(sims);

            // Update the viewbox to follow the average position of the closest 4 lines
            updateViewBox();
            // Update the viewbox to follow the ball
            // setViewBox(`${newBallPosition.x - svgWidth / 2} ${newBallPosition.y - svgHeight / 2} ${svgWidth} ${svgHeight}`);

            requestId.current = requestAnimationFrame(animate);
        };
        if (simulationLength)
            requestId.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestId.current);
    }, [ball, lines, simulationLength]);

    return (
        <svg width={svgWidth} height={svgHeight} viewBox={viewBox}>
            {trackSims && Object.keys(trackSims).map(key => {
                return <Ball ball={trackSims[key].ball} key={`ball-${key}`} />
            })}
            {trackSims && Object.keys(trackSims).map((key, index) => {
                let lines = trackSims[key].lines
                return lines.map((line, index) => (
                    <LineComponent
                        color={(line.start_frame || 0) < frame && (line.end_frame || 0) > frame ? '#ff0000' : '#000000'}
                        strokeWidth={(line.start_frame || 0) < frame && (line.end_frame || 0) > frame ? 10 : 0}
                        key={index} line={line} />
                ))
            })}

        </svg>
    );
}


export default Simulation;
