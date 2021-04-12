var parser = require('osu-parser');
var fs = require('fs');

// Converter

var args = process.argv.slice(2);

var fnf = {}

parser.parseFile(args[0], function (err, beatmap) {
    if (args[0] != null && args[1] != null ) {
        var usedBPM = 0;
        var keycount = args[1];
        
        fnf.song = {}
        fnf.song.notes = []
        
        beatmap.timingPoints.forEach(function(item, index) {
            if (Math.round(1 / beatmap.timingPoints[index].beatLength * 1000 * 60) > 0 && usedBPM <= 0) {
                usedBPM = Math.round(1 / beatmap.timingPoints[index].beatLength * 1000 * 60)
            }
        })

        if (keycount > 4) {
            fnf.song.notes[0] = {
                "mustHitSection":false,
                "typeOfSection":0,
                "lengthInSteps":160000,
                "bpm":usedBPM,
                "changeBPM":true,
                "timePosition":beatmap.timingPoints[0].offset,
                "sectionNotes":[]
            }
        } else {
            fnf.song.notes[0] = {
                "mustHitSection":true,
                "typeOfSection":0,
                "lengthInSteps":160000,
                "bpm":usedBPM,
                "changeBPM":true,
                "timePosition":beatmap.timingPoints[0].offset,
                "sectionNotes":[]
            }
        }

        beatmap.hitObjects.forEach(function(item, index) {
            fnf.song.notes[0].sectionNotes.push([
                Math.round(beatmap.hitObjects[index].startTime),
                Math.floor(beatmap.hitObjects[index].position[0] * keycount / 512),
                beatmap.hitObjects[index].endTime -  beatmap.hitObjects[index].startTime || 0
            ])  
        }) 

        fnf.song.bpm = usedBPM
        fnf.song.sections = fnf.song.notes.length
        fnf.song.needsVoices = false
        fnf.song.player1 = "bf"
        fnf.song.player2 = "gf"
        fnf.song.speed = 3.1
        fnf.song.song = args[2] || "Ballistic"
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
        if (args[0] == null) {
            console.log("\x1b[31m","\n No valid beatmap linked.")
            console.log("\x1b[37m","Please link your beatmaps .osu file.")
        } else if (args[1] == null) {
            console.log("\x1b[31m","\n No keycount set.")
            console.log("\x1b[37m","Because of my keycount detection not working, you now have to set it manually.")
            console.log("\x1b[37m","Type your keycount after the file.")
        }
    }
});