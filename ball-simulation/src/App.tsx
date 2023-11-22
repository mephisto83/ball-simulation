// src/App.tsx

import React, { useState } from 'react';
import './App.css';
import Simulation from './Simulation';
import MidiReader from './MidiReader';
import { Midi } from '@tonejs/midi';

function App() {
  const [midi, setMidi] = useState<Midi | null>(null)
  return (
    <div className="App">
      <MidiReader onMusic={(midi) => {
        setMidi(midi);
       }} />
      <header className="App-header">
        <Simulation midi={midi} />
      </header>
    </div>
  );
}

export default App;
