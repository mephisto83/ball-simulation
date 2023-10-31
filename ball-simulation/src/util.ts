import { Ball, Line, Point } from "./types";
const gravity = 9.8;
/**
 * Represents a point in 2D space.
 * @typedef {Object} Point
 * @property {number} x - The x-coordinate.
 * @property {number} y - The y-coordinate.
 */

/**
 * Represents a line segment in 2D space defined by two points.
 * @typedef {Object} Line
 * @property {Point} start - The starting point of the line.
 * @property {Point} end - The ending point of the line.
 */

/**
 * Calculates the distance between a point and a line segment.
 * @param {Point} point - The point.
 * @param {Line} line - The line segment.
 * @returns {number} The shortest distance between the point and the line segment.
 */
export function calculateDistance(point: Point, line: Line) {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    const lenSq = dx * dx + dy * dy;
    let param = -1;

    // Line segment is a single point
    if (lenSq !== 0) {
        const t = ((point.x - line.start.x) * dx + (point.y - line.start.y) * dy) / lenSq;
        param = Math.min(1, Math.max(0, t));
    }

    const xx = line.start.x + param * dx;
    const yy = line.start.y + param * dy;

    const distance = Math.sqrt((xx - point.x) * (xx - point.x) + (yy - point.y) * (yy - point.y));

    return distance;
}

export function simulateBallMotion(ball: Ball, timesOfImpact: number[], frameRate: number, xMin: number, xMax: number): {
    points: Point[],
    impactPoints: Point[],
    lines: Line[]
} {
    const allPositions: Point[] = [];
    let currentBall = { ...ball };
    let currentTime = 0;
    let currentLine: Line | null = null;
    let lines: Line[] = [];
    let impactPoints: Point[] = [];

    for (const timeOfImpact of timesOfImpact) {
        // Calculate the time remaining until the next impact
        const timeUntilImpact = timeOfImpact - currentTime;

        // // If this is the first iteration, or if the ball has not hit a line yet, calculate the first impact point and line
        // if (!currentLine) {
        //     const firstImpactPoint = calculateImpactPoint(currentBall, timeUntilImpact); // Adjusted function signature
        //     currentLine = calculateNextLine(firstImpactPoint, -45, 45); // Example angle range from -45 to 45 degrees
        //     impactPoints.push(firstImpactPoint);
        // }

        // Simulate motion until collision with the current line
        const { positions, finalBall, impactLine } = motionUntilCollision(currentBall, timeUntilImpact, frameRate, xMin, xMax);
        if (impactLine) {
            lines.push(impactLine);
            impactPoints.push(impactLine.start);
        }
        allPositions.push(...positions);

        // Calculate the impact point based on the final state of the ball
        const impactPoint = calculateImpactPoint(finalBall, timeUntilImpact); // Adjusted function signature

        // Calculate the next line based on the impact point
        currentLine = calculateNextLine(impactPoint, -45, 45); // Example angle range from -45 to 45 degrees

        // Calculate the collision response and update the ball's velocity
        const collisionResponse = calculateCollisionResponse(finalBall, currentLine);
        currentBall = { ...finalBall, velocity: collisionResponse };

        // Update the current time
        currentTime = timeOfImpact;
    }

    return { points: allPositions, lines, impactPoints };
}


function calculateNextLine(impactPoint: Point, length: number = 12, ballRadius: number): Line {
    // Define a range for horizontal angles
    const minAngle = -45;
    const maxAngle = 45;

    // Convert angles to radians for mathematical calculations
    const minAngleRad = (minAngle * Math.PI) / 180;
    const maxAngleRad = (maxAngle * Math.PI) / 180;

    // Generate a random angle between minAngle and maxAngle
    // Adding Math.PI ensures the angle is closer to the horizontal direction
    const angle = Math.PI + minAngleRad + Math.random() * (maxAngleRad - minAngleRad);

    // Calculate the vector for half of the line length in the direction of the angle
    const halfLineVector: Point = {
        x: (length / 2) * Math.cos(angle),
        y: (length / 2) * Math.sin(angle),
    };

    // Calculate offset based on ball radius
    const offset: Point = {
        x: ballRadius * Math.cos(angle + Math.PI / 2),
        y: ballRadius * Math.sin(angle + Math.PI / 2),
    };

    // Calculate the start and end points of the line
    const startPoint: Point = {
        x: impactPoint.x - halfLineVector.x + offset.x,
        y: impactPoint.y - halfLineVector.y + offset.y,
    };
    const endPoint: Point = {
        x: impactPoint.x + halfLineVector.x + offset.x,
        y: impactPoint.y + halfLineVector.y + offset.y,
    };

    // Create the line segment based on the calculated start and end points
    const line: Line = {
        start: startPoint,
        end: endPoint,
    };

    return line;
}


function calculateLineAngle(ball: Ball): number {
    // Calculate the angle of the ball's velocity vector in degrees
    let angle = Math.atan2(ball.velocity.y, ball.velocity.x) * (180 / Math.PI);

    // Ensure the angle is not too vertical
    const minAngle = 20; // Minimum angle from the vertical axis
    angle = Math.max(minAngle, Math.min(180 - minAngle, angle));

    // Add some randomness to the angle if desired
    const angleAdjustment = (Math.random() - 0.5) * 20; // Randomly adjust angle by up to ±10 degrees
    angle += angleAdjustment;

    return angle;
}


function motionUntilCollision(
    ball: Ball,
    timeUntilImpact: number,
    frameRate: number,
    xMin: number,
    xMax: number,
    lineLength: number = 100
): { positions: Point[], finalBall: Ball, impactLine: Line } {
    const timeStep = 1 / frameRate;
    let positions: Point[] = [];
    let currentBall = { ...ball };
    let timeElapsed = 0;

    while (timeElapsed < timeUntilImpact) {
        // Update ball position and velocity due to gravity
        currentBall.velocity.y += gravity * timeStep;
        currentBall.position.x += currentBall.velocity.x * timeStep;
        currentBall.position.y += currentBall.velocity.y * timeStep;

        // Check for collision with x boundaries
        if (currentBall.position.x - currentBall.radius < xMin || currentBall.position.x + currentBall.radius > xMax) {
            currentBall.velocity.x = -currentBall.velocity.x; // Reflect the velocity
        }

        // Save the current position
        positions.push({ ...currentBall.position });

        // Update the elapsed time
        timeElapsed += timeStep;
    }

    // Now that time has elapsed, create an impact line at the ball's current position
    const angle = calculateLineAngle(currentBall); // This function needs to be implemented
    const impactLine = calculateNextLine(currentBall.position, lineLength, currentBall.radius);

    // Update ball's velocity based on collision with the impact line
    currentBall.velocity = calculateCollisionResponse(currentBall, impactLine);

    return { positions, finalBall: currentBall, impactLine };
}

function calculateImpactPoint(ball: Ball, timeOfImpact: number): Point {
    const impactPoint: Point = {
        x: ball.position.x + ball.velocity.x * timeOfImpact,
        y: ball.position.y + ball.velocity.y * timeOfImpact + 0.5 * gravity * timeOfImpact * timeOfImpact
    };
    return impactPoint;
}


function dotProduct(v1: Point, v2: Point): number {
    return v1.x * v2.x + v1.y * v2.y;
}

function subtractVectors(v1: Point, v2: Point): Point {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

function addVectors(v1: Point, v2: Point): Point {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

function scalarMultiply(v: Point, scalar: number): Point {
    return { x: v.x * scalar, y: v.y * scalar };
}

function vectorLength(v: Point): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalizeVector(v: Point): Point {
    const length = vectorLength(v);
    if (length === 0) {
        throw new Error('Cannot normalize a zero-length vector');
    }
    return { x: v.x / length, y: v.y / length };
}

function checkCollision(ball: Ball, line: Line): { point: Point; normal: Point; } | null {
    const lineVector = subtractVectors(line.end, line.start);
    const lineLength = vectorLength(lineVector);
    const lineDirection = scalarMultiply(lineVector, 1 / lineLength);

    const ballToLineStart = subtractVectors(ball.position, line.start);
    const projectionLength = dotProduct(ballToLineStart, lineDirection);
    const closestPointOnLine = addVectors(line.start, scalarMultiply(lineDirection, projectionLength));

    const collisionVector = subtractVectors(ball.position, closestPointOnLine);
    const distance = vectorLength(collisionVector);

    if (distance <= ball.radius) {
        const normal = normalizeVector(collisionVector);
        const point = subtractVectors(ball.position, scalarMultiply(normal, ball.radius));
        return { point, normal };
    }

    return null;
}


function calculateCollisionResponse(ball: Ball, line: Line): Point {
    // Calculate the reflection of ball's velocity based on the line's normal
    // and apply coefficients of restitution and friction as needed

    // 1. Calculate the normal vector of the line
    const lineVector = {
        x: line.end.x - line.start.x,
        y: line.end.y - line.start.y,
    };
    const normal = {
        x: -lineVector.y,
        y: lineVector.x,
    };
    const normalLength = Math.sqrt(normal.x ** 2 + normal.y ** 2);
    const unitNormal = {
        x: normal.x / normalLength,
        y: normal.y / normalLength,
    };

    // 2. Calculate the dot product of the ball's velocity and the line's normal
    const dotProduct = (ball.velocity.x * unitNormal.x) + (ball.velocity.y * unitNormal.y);

    // 3. Reflect the ball's velocity across the line
    const reflectedVelocity = {
        x: ball.velocity.x - 2 * dotProduct * unitNormal.x,
        y: ball.velocity.y - 2 * dotProduct * unitNormal.y,
    };

    // 4. Reposition the ball just outside the line to prevent it from being inside the line in the next frame
    // You might need to adjust the '0.1' to a suitable small value that works for your simulation
    ball.position.x += 0.1 * unitNormal.x;
    ball.position.y += 0.1 * unitNormal.y;

    // 5. Return the new velocity
    return reflectedVelocity;
}
