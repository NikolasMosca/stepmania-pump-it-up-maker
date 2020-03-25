import React, { PureComponent } from "react"
import './App.css';
import {
  MAX_TIME_SONG
} from './utils/Constants';

import Box from './components/Box';
import Beat from './components/Beat';
import Player from './components/Player';

import SmBuilder from './utils/SmBuilder';

const Test: Array<Object> = require('./dev-data/phoenix.json');
const MusicTempo = require("music-tempo");

type State = {
  file: any,
  blob: any,
  beats: Array<any>,
  currentBeat: number,
  refresh?: number,
  play: boolean,
  result: string
}

type Properties = {}

class App extends PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      file: null,
      blob: window.URL || window.webkitURL,
      beats: Test,
      currentBeat: 0,
      play: false,
      result: ''
    }; 

    document.addEventListener('keydown', ({ keyCode }) => {
      if(keyCode === 32) this.openBeat();
    })
    document.addEventListener('keyup', ({ keyCode }) => {
      if(keyCode === 32) this.closeBeat();
    })
  }

  //Function that emits updates from player
  updateState = (state: any) => {
    console.log('update state', {state})
    this.setState(state, () => this.forceUpdate());
  }

  //Function that permits to open a new beat
  openBeat = () => {
    const { currentBeat, play } = this.state;
    if(!play) return; //If the songs is in pause then I cannot insert beats
    if(currentBeat) { //Keep refresh for seeing changes in DOM
      this.setState({ refresh: Date.now() });
      return;
    }
    this.setState({ currentBeat: Date.now() });

    //Autoscroll beats container
    let e: any = document.querySelector('.BeatViewer:first-child');
    e.scrollTop = e.scrollHeight;
  }

  //Function that permits to close the current beat
  closeBeat = () => {
    let { currentBeat, beats, file } = this.state;
    if(!currentBeat) return;
    const currentTimeMilliseconds: number = file.currentTime * 1000;
    const holdTime: number = Date.now() - currentBeat;

    beats.push({
      startTime: currentTimeMilliseconds - holdTime,
      endTime: currentTimeMilliseconds,
      holdTime
    });

    console.log('close beat', beats)
    this.setState({
      beats,
      currentBeat: 0
    })
  }

  //Onchange event when the user upload the song
  onChangeFile = (e: any) => {
    let { blob } = this.state;
    let file = e.target.files[0], fileURL = blob.createObjectURL(file);
    file.fileName = file.name.split('.');
    file.fileName.splice(file.fileName.length - 1, 1);
    file.fileName = file.fileName.join('.');
    file.url = fileURL;

    //Test lib 
    let context = new AudioContext({ sampleRate: 44100 });
    let reader = new FileReader();
    reader.onload = (fileEvent: any) => {
      console.log('event reader onload', fileEvent)
      context.decodeAudioData(fileEvent.target.result, this.findBpmAndBeats);
    }
    reader.readAsArrayBuffer(e.target.files[0]);
    //Test lib 

    this.setState({
      file: file
    })
  }

  //Find 
  findBpmAndBeats = (buffer: AudioBuffer) => {
    let audioData: any = [];
    // Take the average of the two channels
    if (buffer.numberOfChannels === 2) {
      let channel1Data = buffer.getChannelData(0);
      let channel2Data = buffer.getChannelData(1);
      for (let i = 0; i < channel1Data.length; i++) {
        audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
      }
    } else {
      audioData = buffer.getChannelData(0);
    }
    let mt = new MusicTempo(audioData);
  
    console.log('BUFFER', buffer)
    console.log('BPM', mt.tempo);
    console.log('BEATS', mt.beats);

    let file = this.state.file;
    file.bpm = mt.tempo;
    file.beats = mt.beats;
    this.setState({
      file
    }, () => this.forceUpdate());
  }

  //Generate Sm File
  generateSmFile = () => {
    const { beats, file } = this.state;

    let tempoBeats = file.beats.map((seconds:number) => {
      return {
        startTime: seconds * 1000,
        endTime: (seconds * 1000) + 100,
        holdTime: 100
      }     
    })
    console.log('tempo beats', tempoBeats, tempoBeats.length)
    const Song = new SmBuilder(file.fileName, MAX_TIME_SONG);
    Song.setBPM(file.bpm);
    console.log('bpm', beats.length, Song.getBPM(beats.length))
    console.log('set difficult', Song.setDifficult('EASY'))
    console.log('beat in ms', Song.getBeatInMilliseconds())

    let mergeBeats = tempoBeats.concat(beats);
    Song.findBeats(mergeBeats).make();
    let result = Song.generate();
    this.setState({
      result
    })
  }

  render() {
      console.info('RENDER')
      const { file, blob, beats, currentBeat, play, result } = this.state;
      
      return (
          <div className="App">

            {!blob && ( //If the browser doesn't support blob then I will show this message
              <div>Your browser does not support Blob URLs :(</div>
            )}

            <Box title="Upload your song!" className="col-lg-6">
              <input type="file" onChange={this.onChangeFile}/>

              {file && (
                <Player file={file} play={play} update={this.updateState} />
              )}
            </Box>

            <Box title="Song Information" className="col-lg-6">
              <div>{ file ? file.fileName : '' }</div>
              <div>{ file && file.bpm ? `BPM : ${ file.bpm }` : '' }</div>
            </Box>

            <Box title="Beat Viewer" className="col-lg-12">
              <div className="BeatViewer clearfix">
                { beats.map(({holdTime}, index) => <Beat key={ index } holdTime={ holdTime } />) }
                {(currentBeat > 0 && (
                  <Beat key={beats.length} holdTime={ Date.now() - currentBeat } />
                ))}
              </div>   
            </Box>

            <Box title="Beats" className="col-lg-12">
              <button onClick={this.generateSmFile}>Generate SM File!</button>
              <pre className="BeatViewer">{ JSON.stringify(beats, null, 2) }</pre>  
              <pre>{ result }</pre>
            </Box>

          </div>
      )
  }
}

export default App;