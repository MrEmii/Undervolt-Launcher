const client = require('discord-rich-presence')('411707329336311808');

class Discord{
    setActivity(){
        console.log("owowowowowow");
        client.updatePresence({
            state: "AWA",
            details: "EWE",
            largeImageKey: 'work_large',
            smallImageKey: 'thonkang'
        });
    }
}

module.exports = Discord;