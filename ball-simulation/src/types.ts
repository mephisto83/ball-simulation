// src/types.ts

export interface Point {
    x: number;
    y: number;
}

export interface Line {
    start: Point;
    end: Point;
}

export interface Ball {
    position: Point;
    velocity: Point;
    radius: number;
}
