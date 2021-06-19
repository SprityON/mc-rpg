module.exports = class Utils {
  constructor() {
    this.fs = require('fs');
  }

  showCategories() {
    
  }

  getFileName(path) {
    let FileName;
    path.endsWith('.js') 
      ? FileName = path.split("\\")[path.split('\\').length - 1].split(".")[0]
      : FileName = path.split("\\")[path.split('\\').length]

    return FileName;
  }
}