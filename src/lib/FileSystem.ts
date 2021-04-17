const fs = require('fs');

class Filesystem {
  writeFileSync(filepath: string, filecontent?: string) {
    return fs.writeFileSync(filepath, filecontent);
  }
}

export default new Filesystem();