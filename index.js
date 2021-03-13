var parser = require('osu-parser');
var fs = require('fs');

// Converter

var args = process.argv.slice(2);

var fnf = {}

parser.parseFile(args[0], function (err, beatmap) {
    if (args[0] != null) {
        var usedBPM = 0;
        var keycount = 0;
        
        fnf.song = {}
        fnf.song.notes = []

        var largestNoteSize = 0;
        beatmap.hitObjects.forEach(function(item, index) {
            if (beatmap.hitObjects[index].position[0] > largestNoteSize) {
                largestNoteSize = beatmap.hitObjects[index].position[0]
            }
        })

        for (i = 1; i <= 8; i++) {
            switch (Math.floor(largestNoteSize * i / 512)) {
                default:
                    keycount = 0;
                    console.log('\x1b[36m%s\x1b[0m',"\n Invalid keycount.")
                    return false;
                    break;
                case 0:
                    keycount = 1;
                    break;
                case 1:
                    keycount = 2;
                    break;
                case 2:
                    keycount = 3;
                    break;
                case 3:
                    keycount = 4;
                    break;
                case 4:
                    keycount = 5;
                    break;
                case 5:
                    keycount = 6;
                    break;
                case 6:
                    keycount = 7;
                    break;
                case 7:
                    keycount = 8;
                    break;
            }
        }   
        
        beatmap.timingPoints.forEach(function(item, index) {
            if (Math.round(1 / beatmap.timingPoints[index].beatLength * 1000 * 60) > 0 && usedBPM <= 0) {
                usedBPM = Math.round(1 / beatmap.timingPoints[index].beatLength * 1000 * 60)
            }
            if (Math.round(1 / beatmap.timingPoints[index].beatLength * 1000 * 60) > 0) {
                fnf.song.notes[index] = {
                    "mustHitSection":true,
                    "typeOfSection":0,
                    "lengthInSteps":6400,
                    "bpm":Math.round(1 / beatmap.timingPoints[index].beatLength * 1000 * 60),
                    "changeBPM":true,
                    "timePosition":beatmap.timingPoints[index].offset,
                    "sectionNotes":[]
                }
            } else {
                fnf.song.notes[index] = {
                    "mustHitSection":true,
                    "typeOfSection":0,
                    "lengthInSteps":6400,
                    "bpm":Math.round(1 / beatmap.timingPoints[index + 1].beatLength * 1000 * 60),
                    "changeBPM":true,
                    "timePosition":beatmap.timingPoints[index].offset,
                    "sectionNotes":[]
                }
            }
        })

        let prevSide = 0;
        beatmap.hitObjects.forEach(function(item, index) {
            let usedIndex = 0;

            fnf.song.notes.forEach(function(item2, index2) {
                if (fnf.song.notes[index2].timePosition <= beatmap.hitObjects[index].startTime) {
                    usedIndex = index2
                }
            })

            fnf.song.notes[usedIndex].sectionNotes[fnf.song.notes[usedIndex].sectionNotes.length] = [
                Math.round(beatmap.hitObjects[index].startTime),
                Math.floor(beatmap.hitObjects[index].position[0] * keycount / 512),
                beatmap.hitObjects[index].endTime -  beatmap.hitObjects[index].startTime || 0
            ]
            
        })
        
        fnf.song.bpm = usedBPM
        fnf.song.sections = fnf.song.notes.length
        fnf.song.needsVoices = false
        fnf.song.player1 = "bf"
        fnf.song.player2 = "gf"
        fnf.song.speed = 3.1
        fnf.song.song = args[1] || "Ballistic"
        fnf.song.sectionLengths = []
        fnf.song.validScore = true

        let content = JSON.stringify(fnf,null,2)

        fs.writeFile('beatmap.json', content, function (err) {
            if (err) throw err;
            console.log('\x1b[36m%s\x1b[0m',"\n Successfully converted " + beatmap.Title + " - " + beatmap.Version)
            console.log('\x1b[36m%s\x1b[0m'," You can find the map as 'beatmap.json' in your folder.")
            console.log('\x1b[36m%s\x1b[0m'," Some maps may have issues, in those cases please report the bugs in the GitHub and manually edit the file.")
        });

    } else {
        console.log("\x1b[31m","\n No valid beatmap linked.")
        console.log("\x1b[37m","Please link your beatmaps .osu file.")
    }
});