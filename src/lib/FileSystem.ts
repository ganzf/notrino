import { mkdirSync } from "fs";

const fs = require('fs');

class Filesystem {
  writeFileSync(filepath: string, filecontent?: string) {
    return fs.writeFileSync(filepath, filecontent);
  }

  exists(path: string): boolean {
    return fs.existsSync(path);
  }

  createDir(path: string): boolean { 
    mkdirSync(path);
    return this.exists(path);
  }

  read(path: string): string {
    return fs.readFileSync(path);
  }

  ls(path: string): string[] {
    return fs.readdirSync(path);
  }
}

export default new Filesystem();