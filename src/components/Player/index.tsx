import React, { PureComponent } from "react"
import './index.css'
import {
    MAX_TIME_SONG
} from '../../utils/Constants';

type State = {
    refresh?: number
}

type Properties = {
    play: boolean,
    file: any,
    update: Function
}

class Player extends PureComponent<Properties, State> {

    getAudio:any = () => document.getElementById('audio') || {}
    getCurrentTime = () => this.getAudio().currentTime

    updateCurrentTime = () => {
        const { play, file, update } = this.props;
        file.currentTime = this.getCurrentTime();
        update({ file });
        this.setState({ refresh: Date.now() });
        if(file.currentTime >= MAX_TIME_SONG) this.pause();
        if(play) setTimeout(this.updateCurrentTime, 500)
    }

    play = () => {
        this.getAudio().play();
        setTimeout(this.updateCurrentTime, 500);
        this.props.update({ play: true });
    }
    
    pause = () => {
        this.getAudio().pause();
        this.props.update({ play: false });
    }

    render() {
        const { file } = this.props;
        return (
            <div className="clearfix">
                <audio 
                id="audio" 
                src={file.url}
                ></audio>
                <div className="Play" onClick={this.play}>Play</div>
                <div className="Pause" onClick={this.pause}>Pause</div>
                <div className="PlayerBar">
                    <div 
                        className="OverlayPlayerBar" 
                        style={{ width: ((file.currentTime * 100) / MAX_TIME_SONG) + '%' }}
                    ></div>
                </div>
            </div>
        )
    }
}

export default Player