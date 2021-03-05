var parser = require('osu-parser');
var fs = require('fs');
var args = process.argv.slice(2);

var fnf = {}

parser.parseFile(args[0], function (err, beatmap) {
    if (args[0] != null) {
        let usedBPM = 0;
        
        fnf.song = {}
        fnf.song.notes = []
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

        beatmap.hitObjects.forEach(function(item, index) {
            let usedIndex = 0;
            fnf.song.notes.forEach(function(item2, index2) {
                if (fnf.song.notes[index2].timePosition <= beatmap.hitObjects[index].startTime) {
                    usedIndex = index2
                }
            })
            fnf.song.notes[usedIndex].sectionNotes[fnf.song.notes[usedIndex].sectionNotes.length] = [
                Math.round(beatmap.hitObjects[index].startTime),
                Math.floor(beatmap.hitObjects[index].position[0] * 4 / 512),
                beatmap.hitObjects[index].endTime || 0
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