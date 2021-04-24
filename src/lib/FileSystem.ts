const mv = require('mv');
const fs = require('fs');

class Filesystem {
  writeFileSync(filepath: string, filecontent?: string) {
    return fs.writeFileSync(filepath, filecontent);
  }

  exists(path: string): boolean {
    return fs.existsSync(path);
  }

  createDir(path: string): boolean { 
    fs.mkdirSync(path);
    return this.exists(path);
  }

  read(path: string, encoding: string =undefined): string {
    return fs.readFileSync(path, encoding);
  }

  ls(path: string): string[] {
    return fs.readdirSync(path);
  }

  rm(path: string): boolean {
    return fs.unlinkSync(path);
  }

  isDirectory(path: string) {
    const stats = fs.statSync(path);
    return stats.isDirectory();
  }

  async move(sourcePath: string, destinationPath: string): Promise<boolean> {
    return new Promise((resolve) => { 
      mv(sourcePath, destinationPath, (err: any) => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    })
  }
}

export default new Filesystem();