import React, { useState } from 'react';
import { Midi } from '@tonejs/midi';

export default function MidiReader({ onMusic }: { onMusic: (args: Midi) => void }) {
    const [midiInfo, setMidiInfo] = useState<string>('');
    function getMidiInstrumentName(instrumentNumber: number): string {
        const instrumentNames: string[] = [
            'Acoustic Grand Piano', 'Bright Acoustic Piano', 'Electric Grand Piano', 'Honky-tonk Piano', 'Electric Piano 1', 'Electric Piano 2', 'Harpsichord', 'Clavinet',
            'Celesta', 'Glockenspiel', 'Music Box', 'Vibraphone', 'Marimba', 'Xylophone', 'Tubular Bells', 'Dulcimer',
            'Drawbar Organ', 'Percussive Organ', 'Rock Organ', 'Church Organ', 'Reed Organ', 'Accordion', 'Harmonica', 'Tango Accordion',
            'Acoustic Guitar (nylon)', 'Acoustic Guitar (steel)', 'Electric Guitar (jazz)', 'Electric Guitar (clean)', 'Electric Guitar (muted)', 'Overdriven Guitar', 'Distortion Guitar', 'Guitar Harmonics',
            'Acoustic Bass', 'Electric Bass (finger)', 'Electric Bass (pick)', 'Fretless Bass', 'Slap Bass 1', 'Slap Bass 2', 'Synth Bass 1', 'Synth Bass 2',
            'Violin', 'Viola', 'Cello', 'Contrabass', 'Tremolo Strings', 'Pizzicato Strings', 'Orchestral Harp', 'Timpani',
            'String Ensemble 1', 'String Ensemble 2', 'Synth Strings 1', 'Synth Strings 2', 'Choir Aahs', 'Voice Oohs', 'Synth Choir', 'Orchestra Hit',
            'Trumpet', 'Trombone', 'Tuba', 'Muted Trumpet', 'French Horn', 'Brass Section', 'Synth Brass 1', 'Synth Brass 2',
            'Soprano Sax', 'Alto Sax', 'Tenor Sax', 'Baritone Sax', 'Oboe', 'English Horn', 'Bassoon', 'Clarinet',
            'Piccolo', 'Flute', 'Recorder', 'Pan Flute', 'Blown Bottle', 'Shakuhachi', 'Whistle', 'Ocarina',
            'Lead 1 (square)', 'Lead 2 (sawtooth)', 'Lead 3 (calliope)', 'Lead 4 (chiff)', 'Lead 5 (charang)', 'Lead 6 (voice)', 'Lead 7 (fifths)', 'Lead 8 (bass + lead)',
            'Pad 1 (new age)', 'Pad 2 (warm)', 'Pad 3 (polysynth)', 'Pad 4 (choir)', 'Pad 5 (bowed)', 'Pad 6 (metallic)', 'Pad 7 (halo)', 'Pad 8 (sweep)',
            'FX 1 (rain)', 'FX 2 (soundtrack)', 'FX 3 (crystal)', 'FX 4 (atmosphere)', 'FX 5 (brightness)', 'FX 6 (goblins)', 'FX 7 (echoes)', 'FX 8 (sci-fi)',
            'Sitar', 'Banjo', 'Shamisen', 'Koto', 'Kalimba', 'Bagpipe', 'Fiddle', 'Shanai',
            'Tinkle Bell', 'Agogo', 'Steel Drums', 'Woodblock', 'Taiko Drum', 'Melodic Tom', 'Synth Drum', 'Reverse Cymbal',
            'Guitar Fret Noise', 'Breath Noise', 'Seashore', 'Bird Tweet', 'Telephone Ring', 'Helicopter', 'Applause', 'Gunshot'
        ]

        if (instrumentNumber < 0 || instrumentNumber >= instrumentNames.length) {
            return "Invalid instrument number";
        }

        return instrumentNames[instrumentNumber];
    }
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    if (e.target?.result) {
                        const midi = new Midi(e.target.result as ArrayBuffer);
                        let info = `Number of Tracks: ${midi.tracks.length}\n`;
                        let jsonOutput: any = [];
                        midi.tracks.forEach((track, index) => {
                            info += `Track ${index + 1}:\n`;
                            track.notes.forEach((note) => {
                                info += `  Time: ${note.time} | Note: ${note.name}${note.octave} | Duration: ${note.duration}\n`;
                            });
                            if (track.notes?.length)
                                jsonOutput.push({
                                    ...track,
                                    name: track?.instrument?.name || getMidiInstrumentName(track.instrument.number),
                                    notes: track.notes.map((note) => {
                                        return {
                                            ...note,
                                            durationTicks: note.durationTicks,
                                            duration: note.duration,
                                            midi: note.midi,
                                            noteOffVelocity: note.noteOffVelocity,
                                            velocity: note.velocity,
                                            time: note.time
                                        }
                                    })
                                })
                        });
                        console.log(jsonOutput)
                        setMidiInfo(info);
                        onMusic(midi);
                    }
                } catch (error) {
                    console.error('Failed to read MIDI file:', error);
                    setMidiInfo('Failed to read MIDI file');
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <div>
            <input type="file" accept=".midi, .mid" onChange={handleFileChange} />
            {/* <pre>{midiInfo}</pre> */}
        </div>
    );
};

