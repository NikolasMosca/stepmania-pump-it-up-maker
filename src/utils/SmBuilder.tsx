export default class {
    songTitle: string //Title of the song
    songDuration: number //Number in seconds of the song
    bpm: number = 0 //Beat per minute of the song
    bpms: Array<number> = [] //List of bpm for every difficult
    barList: Array<number> = [4, 8, 16, 32, 64] //Difficult bar list 
    level: Array<number> = [2, 4, 6, 10, 15] //Level for every difficulty
    difficult: Array<string> = [ //Name of levels
        'BEGINNER',
        'EASY',
        'MEDIUM',
        'HARD',
        'EXPERT'
    ]
    tolerance: Array<number> = [50, 10, 50, 50, 50] //List of each tolerance
    currentIndex: number = 0; //Current difficult that will be executed from script
    minHold: number = 250; //Minimum value for establish an hold note
    
    beats: Array<any> = []; //Current beats finded by findBeats
    notes: Array<string> = []; //Current notes
    emptyNote: string = '00000';

    constructor(title: string, duration: number) {
        console.log('SmBuilder: init')
        this.songTitle = title;
        this.songDuration = duration;
    } 

    getHeader = () => [
        `#TITLE:${this.songTitle};\n`,
        `#ARTIST:SHADOW;\n`,
        `#CREDIT:SHADOW;\n`,
        `#TITLETRANSLIT:;\n`,
        `#SUBTITLETRANSLIT:;\n`,
        `#ARTISTTRANSLIT:;\n`,
        `#CREXPERT:;\n`,
        `#BANNER:banner.jpg;\n`,
        `#BACKGROUND:background.jpg;\n`,
        `#LYRICSPATH:;\n`,
        `#MUSIC:sample.mp3;\n`,
        `#SAMPLESTART:47.994;\n`,
        `#SAMPLELENGTH:30.000;\n`,
        `#SELECTABLE:YES;\n`,
        `#BPMS:0r=${ this.bpm },1r=${ this.bpm },2r=${ this.bpm };\n`,
        `#DISPLAYBPM:${ this.bpm };\n`,
        `#STOPS:;\n`,
        `500.500=background.jpg=1.000=1=0=0,\n`,
        `99999=-nosongbg-=1.000=0=0=0\n\n`
    ].join('');

    writeIntroTrace = () => [
        `\n`,
        `#NOTES:\n`,
        `pump-single:\n`,
        `${ this.getDifficult() }:\n`,
        `${ this.getDifficult() }:\n`,
        `${ this.getLevel() }:\n`,
        `${ this.getGrooveRadar() }\n`
    ].join('')

    randomRange = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(3));
    getBPM = (numberOfBeats: number) => parseFloat(Math.ceil((numberOfBeats / (194 / 60))).toFixed(3));
    getDifficult = () => this.difficult[ this.currentIndex ];
    getLevel = () => this.level[ this.currentIndex ];
    getBarList = () => this.barList[ this.currentIndex ];
    getTolerance = () => this.tolerance[ this.currentIndex ]; 
    getGrooveRadar = () => `0.${ this.randomRange(165, 200) },0.${ this.randomRange(190, 230) },0.${ this.randomRange(130, 170) },0.000,0.000:`;
    getBeatInMilliseconds = () => ((60 / this.bpm) * 1000) / (this.getBarList() / 4)

    //Function that permits to set what difficult use 
    setDifficult = (name: string) => {
        const index: number = this.difficult.findIndex(diff => diff === name);
        this.currentIndex = index;
        return index;
    }

    //Set BPM to create notes
    setBPM = (bpm: number) => this.bpm = bpm;

    //Find beats
    findBeats = (beats: Array<any>) => {
        const msSongDuration = this.songDuration * 1000;
        const tolerance = this.getTolerance();
        const msBeat = this.getBeatInMilliseconds();

        //Reset beats
        this.beats = [];
        //Let's find all the metrics in my song...
        for(let ms = 0; ms < msSongDuration; ms += msBeat) {

            //Find if I have some notes registered for this beat...  
            console.log(ms)
            let findBeat: any = null;
            for(let index = 0; index < beats.length; index++) {
                let item = beats[index];
                let { startTime, endTime } = item;
                if(!item.used && ms >= (startTime - tolerance) && ms <= (endTime + tolerance)) {
                    console.log('find!', ms, index)
                    findBeat = item;
                    beats[index].used = true;
                    break;
                }
            }
            /*let findBeat = beats.find(({ startTime , endTime }, index) => 
                (ms >= (startTime - tolerance) && ms <= (endTime + tolerance))
            )*/

            this.beats.push(findBeat);
        }

        this.beats.splice(this.beats.length - 1, 1)

        console.log('BEATS FINDED FOR DIFFICULT ', this.getDifficult(), this.beats);

        return this;
    }

    //Check the previous note and remove impossible notes to hit in the next
    getAvaiableNotes = () => {
        let notes = [
            '10000',
            '01000',
            '00100',
            '00010',
            '00001'
        ];

        if(this.notes.length === 0) return notes;
        const previousNote = this.notes[ this.notes.length - 1 ];
        console.log('CHECK PREVIOUS NOTE =>' ,previousNote)

        return notes;
    }

    //Choose a random note for this trace
    getRandomNotes = () => {
        const avaiableNotes = this.getAvaiableNotes();
        let randomNote = Math.round(Math.random() * (avaiableNotes.length - 1));
        
        //Check if the note exists 
        if(!avaiableNotes[randomNote]) console.error('Note not found!', randomNote)

        return avaiableNotes[randomNote];
    }

    //Make trace for the song
    make = () => {
        this.beats.map((beat, index) => {
            if(beat) { //If there is a beat then I will create a random notes
                let note = this.getRandomNotes();
                this.notes.push(note);
            } else { //Else I will write an empty note
                this.notes.push(this.emptyNote);
            }
            return true;
        })

        console.log('NOTES GENERATED FOR DIFFICULT', this.getDifficult(), this.notes)
    }

    //Return all notes generated formatted for sm file
    getNotes = () => this.notes.map((note, index) => {
        //Add comma after every beat
        if(index > 0 && index % this.getBarList() === 0) note = ',\n' + note;
        return note;
    }).join('\n')

    //Let's generate this sm file!
    generate() {
        let file = '';
        file += this.getHeader();
        file += this.writeIntroTrace();
        file += this.getNotes();
        return file;
    }
}