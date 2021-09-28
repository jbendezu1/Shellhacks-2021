const express = require('express');
const app = express();
const port = 3000;
const pug = require('pug');
const util = require('util');

app.set('view engine','pug');
app.use(express.urlencoded({ extended: true }));

/*-------Canvas Library----------*/
const Canvas = require('canvas');
const canvas = Canvas.createCanvas(700, 416);
/*----Pokemon Showdown Libray-------*/
const Sim = require('pokemon-showdown');
const {Dex} = require('pokemon-showdown');

/*---Create stream to read and write pokemon showdown information-----*/
class battleStream{

    constructor(){
        this.stream = new Sim.BattleStream();
        this.run = async()  => {
        
            let damage = {
                challenger: {
                    percent: 1,
                    raw: 0
                },
                opponent: {
                    percent: 1,
                    raw: 0
                }
            };
            let status = {challenger:null,opponent:null};
            let percentFlag = false;
            let trainer = "";
            
            for await (const output of this.stream) {
                const outputArr = output.split("\n");
                let outputMessage = "";
                // Read each line from the output
                for await (const line of outputArr){
                    const strings = line.split("|");
                    strings.shift();// Shift out the empty string

                    switch (strings[0]){
                        case 'p1':
        
                            break;
                        case 'p2':
        
                            break;
                        case 'move':
                            trainer = strings[1];
                            let move = strings[2];
        
                            if (trainer.startsWith("p1a")) trainer = "You";
                            else
                                trainer = "Your Opponent";
                            
                            outputMessage += `${trainer} used ${move}!\n`;
                            break;
                        case '-supereffective':
                            outputMessage += "It was super effective!\n";
                            break;
                        case '-resisted':
                            outputMessage += "It wasn't very effective\n";
                            break;
                        case '-damage':
                            trainer = strings[1];
        
                            if (percentFlag){
                                switch(strings[3]){
                                    case '[from] confusion':
                                        outputMessage += "It hurt itself in confusion!\n";
                                        break;
                                    case undefined:
                                        break;
                                    case '[from] Leech Seed':
                                        outputMessage += `${strings[1].substring(5)}'s health is sapped by ${strings[3].substring(7)}!\n`;
                                        break;
                                    default:
                                        outputMessage += `It's hurt from ${strings[3].substring(7)}\n`;
                                }
                                if (trainer.startsWith('p1'))
                                    damage.challenger.percent = strings[2];
                                else
                                    damage.opponent.percent = strings[2];
                            }
                            else{
                                if (trainer.startsWith('p1'))
                                    damage.challenger.raw = strings[2];
                                else
                                damage.opponent.raw = strings[2];
                            }
                            percentFlag = !percentFlag;
                            break;
                        case '-miss':
                            outputMessage += `${strings[2].substring(5)} avoided the attack!\n`;
                            break;
                        case '-heal':
                            trainer = strings[1];
        
                            if (percentFlag){
                                if (trainer.startsWith('p1'))
                                    damage.challenger.percent = strings[2];
                                else
                                    damage.opponent.percent = strings[2];
                            }
                            else{
                                if (trainer.startsWith('p1'))
                                    damage.challenger.raw = strings[2];
                                else
                                damage.opponent.raw = strings[2];
                            }
                            percentFlag = !percentFlag;
                            break;
                        case '-immune':
                            trainer = strings[1];
                            if (trainer.startsWith('p1'))
                                trainer = "You";
                            else trainer = "Your Opponent";

                            outputMessage += `It doesn't affect ${trainer}.`;
                            break;
                        case '-status':
                            outputMessage += `status${strings[1]} ${strings[2]}\n`;
                            break;
                        case '-start':
                            switch(strings[2]){
                                case 'move: Leech Seed':
                                    outputMessage += `${strings[1].substring(5)} was seeded!\n`;
                                    break;
                                default:
                                    outputMessage += `${strings[1].substring(5)} is now confused!\n`;
                                    break;
                            }
                            break;
                        case '-end':
                            outputMessage += `The pokemon is no longer effected by ${strings[2]}\n`;
                            break;
                        case '-activate':
                            switch(strings[2]){
                                case 'confusion':
                                    outputMessage +=  `${strings[1].substring(5)} is confused!\n`
                                    break;
                                case 'trapped':
                                    outputMessage += `${strings[1].substring(5)} can no longer escape!\n`;
                                    break;
                                case 'move: Protect':
                                    outputMessage += `${strings[1].substring(5)} protected itself!\n`;
                                    break;
                                default:
                                    outputMessage += `${strings[2]}\n`;
                            }
                            break;
                        case '-crit':
                            outputMessage += "A critical hit!\n";
                            break;
                        case '-fail':
                            outputMessage += "But it failed!\n";
                            break;
                        // A volatile status has been inflicted on pokemon
                        case '-start':
                            outputMessage += "";
                            break;
                        case '-boost':
                            outputMessage += `${strings[1].substring(5)}'s ${convert[strings[2]]} `;
                            switch(strings[3]){
                                case "0":
                                    outputMessage += "cannot be raised!\n";
                                    break;
                                case "1":
                                    outputMessage += "rose!\n";
                                    break;
                                case "2":
                                    outputMessage += "sharply raised!\n";
                                    break;
                                case "3":
                                    outputMessage += "durastically rose!\n";
                                    break;
                            }
                            break;
                        case 'poke':
        
                            break;
                        // Start of a new turn
                        case 'turn':
                                await drawBattle(damage,status,outputMessage);
                            break;
                        case 'faint':
                            outputMessage += `${strings[1].substring(5)} fainted!\n`;
                            break;
                        case 'win':
                            outputMessage += `${strings[1]} won!\n`;
                            await drawBattle(damage,status,outputMessage);
                            break;
                    }
                }
            }
        };
    }
}
let mainStream = null;

let mon1 = null;
let mon2 = null;
let dexEntry1 = null;
let dexEntry2 = null;

let mainPokemon   =  null;
let opposingPokemon = null;
let healthBar = null;
let newImage = "";
let message = "";
let mainRes = null;

// Display website when accessed
app.get('/', function (req, res) {
    mainStream = new battleStream();
    mainStream.run();
    res.render('sample');
  })

// Respond with file when POST request is made to home page
app.post('/', async function (req, res) {
    mainRes = res;

    let val = Object.keys(req.body)[0];
    // If user sent us a pokemon name then start a battle
    if (isNaN(val)){
        mon1 = new pokemon(val,10)
        dexEntry1 = Dex.species.get(mon1.nm);
        const team1 = createTeam(mon1,dexEntry1);
        // AI will have to send me what pokemon they chose
        ////////////////////////////////////////////
        mon2 = new pokemon(val,12);
        mon2.lv = 12;
        dexEntry2 = Dex.species.get(mon2.nm);
        const team2 = createTeam(mon2,dexEntry2);
        /////////////////////////////////////////////////////////////

        mainPokemon   =  await Canvas.loadImage('https://play.pokemonshowdown.com/sprites/gen5-back/'+mon1.nm+'.png');
        opposingPokemon = await Canvas.loadImage('https://play.pokemonshowdown.com/sprites/gen5/'+mon2.nm+'.png');
        healthBar = await Canvas.loadImage('./images/healthbar.png');

        // Create Field
        const background = await Canvas.loadImage('./images/battle2.png');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        newImage =canvas.toDataURL();

        mainStream.stream.write(`>start {"formatid":"anythinggoes"}`);
        mainStream.stream.write(`>player p1 {"name":"You","team":"${team1}"}`);
        mainStream.stream.write(`>player p2 {"name":"Your Opponent","team":"${team2}"}`);
        mainStream.stream.write(`>p1 team 1\n`);
        mainStream.stream.write(`>p2 team 1\n`);

        // res.render('other',{move1:moves[val][0],move2:moves[val][1],move3:moves[val][2],move4:moves[val][3], inputUrl: newImage});
    }
    else{
        mainStream.stream.write(`>p1 move ${parseInt(val)}`);
        let move = Dex.moves.get(val);
        let type = dexEntry1.types[0];
        
        var ret;
        // using spawn instead of exec, prefer a stream over a buffer to avoid maxBuffer issue
        var spawn = require("child_process").spawn;
        var python = await spawn('python', ["../../AI.py",move,type]);
        
        mainStream.stream.write('>p2 move ' + 2);
    }
})

app.listen(port, ()=> console.log('The server running on Port ' +port));

// Create user's pokemon
class pokemon {

    constructor(name,level){
        this.nm = name;                 // Set name as field
        this.IV = [31,31,31,31,31,31];  // Max out those IVS
        this.lv = level;                   // Set level

        this.mv = moves[name];          // Set default moves
        // Get db info to apply best stat distribution
        const dexEntry = Dex.species.get(name);

        // Assign nature to boost atk and lower spatk or vice versa
        if (dexEntry.baseStats['atk'] > dexEntry.baseStats['spa'])
            this.nt = "Adamant"
        else
            this.nt = "Modest";
        this.ab = (dexEntry.abilities[0]);
        this.g = dexEntry.gender || "M";    // Set gender to default gender or set default gender to Male
        this.h = 250        // Max happiness :)
    }
}

/** Draw the battle with updates 
 * 
 * @param {Object} damage 
 * @param {Object} status 
 * @param {String} message 
 */
let drawBattle = async(damage,status,output,res)=>{
    // Create battle
    const ctx = canvas.getContext('2d');
    
    // Since the image takes time to load, you should await it
    const background = await Canvas.loadImage('./images/battle2.png');
    
    // This uses the canvas dimensions to stretch the image onto the entire canvas
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    var topCoord = [446,50];
    var bottomCoord = [40,150];
    // Get weight and height to determine placements so they aren't floaty
    if (dexEntry1.weightkg * dexEntry1.heighmt > 10){
        bottomCoord[0] = 48;
        bottomCoord[1] = 130;
    }
    if (dexEntry2.weightkg * dexEntry2.heightm > 10){
        topCoord[0] = 446;
        topCoord[1] = 30;
    }
    
    // Draw opponent pokemon
    function displayOpponent(){
        // Draw pokemon
        ctx.drawImage(opposingPokemon, topCoord[0], topCoord[1], opposingPokemon.width * 2.5, opposingPokemon.height * 2.5);
        // Draw info background
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();        // Start drawing
        ctx.moveTo(480, 30);    // Top right
        ctx.lineTo(435, 96);    // Bottom right
        ctx.lineTo(230, 96);    // Bottom left 
        ctx.lineTo(275, 30);    // Top left
        ctx.closePath();        // End drawing
        ctx.fill();             // Fill polygon
        // Draw health bar 
        ctx.drawImage(healthBar, 255, 52, 190, 40);
        // Draw Name and Gender
        ctx.font = "18px Arial";
        ctx.fillStyle = '#000000';
        let genderSymbol = (mon2.g == "M") ? "♂️": (mon2.g == "F") ? "♀️": "";
        var title = mon2.nm.split(" ")[0] + genderSymbol;
        if (mon2.nm.includes("Alola") || mon2.nm.includes("Galar") || mon2.nm.includes("Rotom"))
            title = mon2.nm.split(" ")[1] + genderSymbol;
        ctx.fillText(title, 285, 55);

        // Display status effect
        switch(status?.opponent) {
            case 'burned':
                ctx.fillStyle = '#e90003';
                ctx.beginPath();        // Start drawing
                ctx.moveTo(430, 78);    // Top right
                ctx.lineTo(430, 92);    // Bottom right
                ctx.lineTo(375, 92);    // Bottom left
                ctx.lineTo(375, 78);    // Top left
                ctx.closePath();        // End drawing
                ctx.fill();             // Fill polygon
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = '#ffffff';
                ctx.fillText(status.opponent.toUpperCase(), 380, 90);
                break;
            case 'frozen':
                ctx.fillStyle = '#71cce3';
                ctx.beginPath();        // Start drawing
                ctx.moveTo(430, 78);    // Top right
                ctx.lineTo(430, 92);    // Bottom right
                ctx.lineTo(375, 92);    // Bottom left
                ctx.lineTo(375, 78);    // Top left
                ctx.closePath();        // End drawing
                ctx.fill();             // Fill polygon
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = '#ffffff';
                ctx.fillText(status.opponent.toUpperCase(), 380, 90);
                break;
            case 'asleep':
                ctx.fillStyle = '#b5b5b5';
                ctx.beginPath();        // Start drawing
                ctx.moveTo(430, 78);    // Top right
                ctx.lineTo(430, 92);    // Bottom right
                ctx.lineTo(375, 92);    // Bottom left
                ctx.lineTo(375, 78);    // Top left
                ctx.closePath();        // End drawing
                ctx.fill();             // Fill polygon
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = '#ffffff';
                ctx.fillText(status.opponent.toUpperCase(), 380, 90);
                break;
            case 'paralysis':
                ctx.fillStyle = '#ffd966';
                ctx.beginPath();        // Start drawing
                ctx.moveTo(430, 78);    // Top right
                ctx.lineTo(430, 92);    // Bottom right
                ctx.lineTo(355, 92);    // Bottom left
                ctx.lineTo(355, 78);    // Top left
                ctx.closePath();        // End drawing
                ctx.fill();             // Fill polygon
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = '#ffffff';
                ctx.fillText(status.opponent.toUpperCase(), 360, 90);
                break;
        }
        // Draw level
        ctx.font = "18px Arial";
        ctx.fillStyle = '#000000';
        let level = "Lv " +mon2.lv;
        ctx.fillText(level, 400, 55);
        
        // Draw health bar loss
        // Total length = 429 - 292 = 137

        var damageLength = 429 - (136 * (1 - eval(damage.opponent.percent)));
        ctx.fillStyle = '#707070';
        ctx.beginPath();        // Start drawing
        ctx.moveTo(429, 64);    // Top right
        ctx.lineTo(429, 74);    // Bottom right
        ctx.lineTo(damageLength, 74);    // Bottom left 
        ctx.lineTo(damageLength, 64);    // Top left
        ctx.closePath();        // End drawing
        ctx.fill();             // Fill polygon
        
        // Only show health ratio when health is lost
        if (eval(damage.opponent.raw) != 0){
            // Display hp ratio if not at full health
            ctx.font = "bold 16px Arial";
            ctx.fillStyle = '#000000';
            let hpRatio = damage.opponent.raw;
            ctx.fillText(hpRatio, 290, 91);
        }
    }

    // Draw challenger pokemon
    function displayChallenger(){
        // Draw pokemon image
        ctx.drawImage(mainPokemon, bottomCoord[0], bottomCoord[1], mainPokemon.width * 3, mainPokemon.height * 3);
        // Draw info background
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();        // Start drawing
        ctx.moveTo(580, 330);    // Top right
        ctx.lineTo(535, 395);    // Bottom right
        ctx.lineTo(330, 395);    // Bottom left
        ctx.lineTo(375, 330);    // Top left
        ctx.closePath();        // End drawing
        ctx.fill();             // Fill polygon
        // Draw health bar
        ctx.drawImage(healthBar, 355, 352, 190, 40);
        // Draw Name and gender
        ctx.font = "18px Arial";
        ctx.fillStyle = '#000000';
        let genderSymbol = (mon1.g == "M") ? "♂️": (mon1.g == "F") ? "♀️": "";
        var title = mon1.nm.split(" ")[0] + genderSymbol;
        if (mon1.nm.includes("Alola") || mon1.nm.includes("Galar") || mon1.nm.includes("Rotom"))
            title = mon1.nm.split(" ")[1] + genderSymbol;
        ctx.fillText(title, 382, 355);
        // Display status effect
        switch(status?.challenger) {
            case 'burned':
                ctx.fillStyle = '#e90003';
                // 92 - 78   = 14 Height
                // 430 - 375 = 55 Width
                ctx.beginPath();        // Start drawing
                ctx.moveTo(530, 378);    // Top right
                ctx.lineTo(530, 392);    // Bottom right
                ctx.lineTo(475, 392);    // Bottom left
                ctx.lineTo(475, 378);    // Top left
                ctx.closePath();        // End drawing
                ctx.fill();             // Fill polygon
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = '#ffffff';
                ctx.fillText(status.challenger.toUpperCase(), 480, 390);
                break;
            case 'frozen':
                ctx.fillStyle = '#71cce3';
                ctx.beginPath();        // Start drawing
                ctx.moveTo(530, 378);    // Top right
                ctx.lineTo(530, 392);    // Bottom right
                ctx.lineTo(475, 392);    // Bottom left
                ctx.lineTo(475, 378);    // Top left
                ctx.closePath();        // End drawing
                ctx.fill();             // Fill polygon
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = '#ffffff';
                ctx.fillText(status.challenger.toUpperCase(), 480, 390);
                break;
            case 'asleep':
                ctx.fillStyle = '#b5b5b5';
                ctx.beginPath();        // Start drawing
                ctx.moveTo(530, 378);    // Top right
                ctx.lineTo(530, 392);    // Bottom right
                ctx.lineTo(475, 392);    // Bottom left
                ctx.lineTo(475, 378);    // Top left
                ctx.closePath();        // End drawing
                ctx.fill();             // Fill polygon
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = '#ffffff';
                ctx.fillText(status.challenger.toUpperCase(), 480, 390);
                break;
            case 'paralysis':
                ctx.fillStyle = '#ffd966';
                ctx.beginPath();        // Start drawing
                ctx.moveTo(530, 378);    // Top right
                ctx.lineTo(530, 392);    // Bottom right
                ctx.lineTo(455, 392);    // Bottom left
                ctx.lineTo(555, 378);    // Top left
                ctx.closePath();        // End drawing
                ctx.fill();             // Fill polygon
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = '#ffffff';
                ctx.fillText(status.challenger.toUpperCase(), 460, 390);
                break;
        }
        // Draw level
        ctx.font = "18px Arial";
        ctx.fillStyle = '#000000';
        let level = "Lv "+mon1.lv;
        ctx.fillText(level, 500, 355);
        // Draw health bar loss
        // Total length = 429 - 292 = 137
        // Damage = 429 - (137 * currHp / totalHp)

        var damageLength = 529 - (136 * (1 -eval(damage.challenger.percent)));                   
        ctx.fillStyle = '#707070';
        ctx.beginPath();                // Start drawing
        ctx.moveTo(529, 364);           // Top right
        ctx.lineTo(529, 374);           // Bottom right
        ctx.lineTo(damageLength, 374);  // Bottom left 
        ctx.lineTo(damageLength, 364);  // Top left
        ctx.closePath();                // End drawing
        ctx.fill();                     // Fill polygon

        // Display hp ratio if not at full health
        if (eval(damage.challenger.raw) != 0){
            ctx.font = "bold 16px Arial";
            ctx.fillStyle = '#000000';
            let hpRatio = damage.challenger.raw;
            ctx.fillText(hpRatio, 390, 391);
        }
    }

    // When a pokemon faints don't draw them
    if (damage.opponent.percent != '0 fnt')
        displayOpponent();
    if (damage.challenger.percent != '0 fnt')
        displayChallenger();
    
    newImage = canvas.toDataURL();
    message = output;
    mainRes.render('other',{move1:moves[mon1.nm][0],move2:moves[mon1.nm][1],move3:moves[mon1.nm][2],move4:moves[mon1.nm][3],output: message,inputUrl: newImage});

}

const moves = {
    bulbasaur:  ["tackle","growl","vinewhip","protect"],
    charmander: ["scratch","growl","ember","protect"],
    squirtle:   ["tackle","tailwhip","watergun","protect"],
    chikorita:  ["tackle","growl","razorleaf","protect"],
    cyndaquil:  ["tackle","leer","ember","protect"],
    totodile:   ["scratch","leer","watergun","protect"],
    treecko:    ["pound","leer","leafage","protect"],
    torchic:    ["scratch","growl","ember","protect"],
    mudkip:     ["tackle","growl","watergun","protect"],
}

// Function calls a python script with user's chosen move as a parameter
// It is up to the AI to store info to learn
async function decideMove(move){
    move = Dex.moves.get(move);
    type = dexEntry1.types[0];
    
    var ret;
    let flag = false
    // using spawn instead of exec, prefer a stream over a buffer to avoid maxBuffer issue
    var spawn = require("child_process").spawn;
    var python = await spawn('python', ["../../AI.py",move,type]);
    // Collect data from script
    python.stdout.on('data', (data)=>{
            ret = data.toString();
        })
    // in close event we are sure that stream fro child process is closed
    python.on('close', (code)=>{
        return ret;
    })
}

// Create input team from pokemon class
const createTeam = function(pokemon,dexEntry){
    return `${pokemon.nn || dexEntry.name}|${(pokemon.nm == dexEntry.name)? "" : dexEntry.baseSpecies || dexEntry.name}|${pokemon.i || ""}|${pokemon.ab.toLowerCase().replace(" ","")}|${pokemon.mv}|${pokemon.nt}|${pokemon.EVS || ""}|${pokemon.g}|${pokemon.IV}|${(pokemon.sh) ? "S":""}|${pokemon.lv}|${pokemon.h}`;
}