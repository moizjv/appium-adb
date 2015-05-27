import _ from 'lodash';
import path from 'path';
import { default as log } from 'appium-logger';
import fs from 'fs';

import { getDirectories, prettyExec, isWindows } from './helpers';

class SystemCallsHelper {

  constructor (sdkRoot) {
    this.sdkRoot = sdkRoot;
  }

  async getSdkBinaryPath (binary) {
    log.info("Checking whether " + binary + " is present");
    let binaryLoc = null;
    let binaryName = binary;
    let cmd = "which";
    if (isWindows) {
      if (binaryName === "android") {
        binaryName += ".bat";
      } else {
        if (binaryName.indexOf(".exe", binaryName.length - 4) === -1) {
          binaryName += ".exe";
        }
      }
      cmd = "where";
    }
    if (this.sdkRoot) {
      let binaryLocs = [path.resolve(this.sdkRoot, "platform-tools", binaryName)
        , path.resolve(this.sdkRoot, "tools", binaryName)];
      // get subpaths for currently installed build tool directories
      let buildToolDirs = [];
      buildToolDirs = await getDirectories(path.resolve(this.sdkRoot, "build-tools"));

      _.each(buildToolDirs, (versionDir) => {
        binaryLocs.push(path.resolve(this.sdkRoot, "build-tools", versionDir, binaryName));
      });

      _.each(binaryLocs, (loc) => {
        if (fs.existsSync(loc)) binaryLoc = loc;
      });
      if (binaryLoc === null) {
        throw new Error("Could not find " + binary + " in tools, platform-tools, " +
                     "or supported build-tools under \"" + this.sdkRoot + "\"; " +
                     "do you have the Android SDK installed at this location?");
      }
      binaryLoc = binaryLoc.trim();
      log.info("Using " + binary + " from " + binaryLoc);
      //this.binaries[binary] = binaryLoc;
      return binaryLoc;
    } else {
      log.warn("The ANDROID_HOME environment variable is not set to the Android SDK root directory path. " +
                  "ANDROID_HOME is required for compatibility with SDK 23+. Checking along PATH for " + binary + ".");
      try {
        let {stdout} = await prettyExec(cmd, [binary], { maxBuffer: 524288 });
        log.info("Using " + binary + " from " + stdout);
        binaryLoc = '"' + stdout.trim() + '"';
        return binaryLoc;
      } catch(e) {
        throw Error("Could not find " + binary + ". Please set the ANDROID_HOME " +
                    "environment variable with the Android SDK root directory path.");
      }
  }
}
}

export { SystemCallsHelper };
