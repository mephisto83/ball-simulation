// src/types.ts

export interface Point {
    x: number;
    y: number;
}

export interface Line {
    start: Point;
    end: Point;
    lineThickness?: number;
    start_frame?: number;
    end_frame?: number;
}

export interface Ball {
    position: Point;
    velocity: Point;
    radius: number;
}
export interface Rectangle {
    x: number; // The x-coordinate of the top left corner
    y: number; // The y-coordinate of the top left corner
    width: number; // The width of the rectangle
    height: number; // The height of the rectangle
}
export interface TrackSim {
    [str: string]: {
        ball: Ball,
        points: Point[],
        impactPoints: Point[],
        lines: Line[]
    }
}