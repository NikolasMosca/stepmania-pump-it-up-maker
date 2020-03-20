import React, { PureComponent } from "react"
import './App.css';

import Box from './components/Box';
import Beat from './components/Beat';

type State = {
  file: any,
  blob: any,
  beats: Array<any>,
  currentBeat: number,
  refresh?: number,
  play: boolean
}

type Properties = {}

const MAX_TIME_SONG = 200;

class App extends PureComponent<Properties, State> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      file: null,
      blob: window.URL || window.webkitURL,
      beats: [],
      currentBeat: 0,
      play: false
    }; 

    document.addEventListener('keydown', ({ keyCode }) => {
      if(keyCode === 32) this.openBeat();
    })
    document.addEventListener('keyup', ({ keyCode }) => {
      if(keyCode === 32) this.closeBeat();
    })
  }

  //Manage audio tag
  getAudio:any = () => document.getElementById('audio') || {}

  play = () => {
    this.getAudio().play();
    setTimeout(this.updateCurrentTime, 500)
    this.setState({ play: true })
  }

  pause = () => {
    this.getAudio().pause();
    this.setState({ play: false })
  }

  getCurrentTime = () => this.getAudio().currentTime
  updateCurrentTime = () => {
    const { play, file } = this.state;
    file.currentTime = this.getCurrentTime();
    this.setState({
      file
    }, () => this.forceUpdate());
    if(play) setTimeout(this.updateCurrentTime, 500)
  }

  //Function that permits to open a new beat
  openBeat = () => {
    const { currentBeat } = this.state;
    if(currentBeat) {
      this.setState({ refresh: Date.now() });
      return;
    }
    this.setState({
      currentBeat: Date.now()
    });
    console.log('open beat')
  }

  //Function that permits to close the current beat
  closeBeat = () => {
    let { currentBeat, beats } = this.state;
    if(!currentBeat) return;
    console.log('close beat')

    beats.push({
      holdTime: Date.now() - currentBeat
    });

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

    this.setState({
      file: file
    })
  }

  render() {
      const { file, blob, beats, currentBeat } = this.state;
      console.log(file)
      
      return (
          <div className="App">

            {!blob && ( //If the browser doesn't support blob then I will show this message
              <div>Your browser does not support Blob URLs :(</div>
            )}

            <Box title="Upload your song!" className="col-lg-6">
              <input type="file" onChange={this.onChangeFile}/>

              {file && (
                <div className="clearfix">
                  <audio 
                    id="audio" 
                    src={file.url}
                  ></audio>
                  <div className="Play" onClick={this.play}>Play</div>
                  <div className="Pause" onClick={this.pause}>Pause</div>
                  <div className="PlayerBar">
                    <div className="OverlayPlayerBar" style={{ width: ((file.currentTime * 100) / MAX_TIME_SONG) + '%' }}></div>
                  </div>
                </div>
              )}
            </Box>

            <Box title="Song Information" className="col-lg-6">
              <div>{ file ? file.fileName : '' }</div>
            </Box>

            <Box title="Beat Viewer" className="col-lg-12">
              <div className="clearfix">
                { beats.map(({holdTime}) => <Beat holdTime={ holdTime } />) }
                {(currentBeat > 0 && (
                  <Beat holdTime={ Date.now() - currentBeat } />
                ))}
              </div>   
            </Box>

          </div>
      )
  }
}

export default App;