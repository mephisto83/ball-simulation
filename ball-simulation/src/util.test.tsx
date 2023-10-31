import React from 'react';
import { render, screen } from '@testing-library/react';
import { simulateBallMotion } from './util';
import { Ball } from './types';

let ball: Ball = {
    position: {
        x: 0,
        y: 0
    },
    radius: 1,
    velocity: {
        x: 0,
        y: 1
    }
}
const xMin = -100;
const xMax = 100;
test('renders learn react link', () => {
    let timesOfImpact = new Array(10).fill(0).map((_, t) => t * 10);
    let { points } = simulateBallMotion(ball, timesOfImpact, 20, xMin, xMax);
    expect(points.length > 1100).toBeTruthy();
});
