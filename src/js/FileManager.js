const electron = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os')

class FileManager {
  constructor(opts) {
   
    const userDataPath = os.type === "Windows_NT" ? path.join((electron.app || electron.remote.app).getPath('userData'), ".undervolt") : path.join(os.homedir(), ".undervolt");
   
    if(!fs.existsSync(userDataPath)){
        fs.mkdirSync(userDataPath)
    }

    this.path = path.join(userDataPath, opts.configName + '.json');
    
    this.data = parseDataFile(this.path, opts.defaults);
  }
  
  get(key) {
    return this.data[key];
  }
  
  set(key, val) {
    this.data[key] = val;  
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    return defaults;
  }
}

module.exports = FileManager;