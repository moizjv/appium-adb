import { prettyExec } from '../helpers/helpers.js';

let manifestMethods = {};

// android:process= may be defined in AndroidManifest.xml
// http://developer.android.com/reference/android/R.attr.html#process
// note that the process name when used with ps must be truncated to the last 15 chars
// ps -c com.example.android.apis becomes ps -c le.android.apis
manifestMethods.processFromManifest = async function (localApk) {
  if(await this.isAaptPresent()) {
    //  logger.debug("Retrieving process from manifest.");
    try {
      let {stdout} = await prettyExec(this.binaries.aapt, ['dump', 'xmltree', localApk, 'AndroidManifest.xml'],
                 { maxBuffer: 524288 });
      let result = null;
      let lines = stdout.split("\n");
      let applicationRegex = new RegExp(/\s+E: application \(line=\d+\).*/);
      let applicationFound = false;
      let attributeRegex = new RegExp(/\s+A: .+/);
      let processRegex = new RegExp(/\s+A: android:process\(0x01010011\)="([^"]+).*"/);
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (!applicationFound) {
          if (applicationRegex.test(line)) {
            applicationFound = true;
          }
        } else {
          let notAttribute = !attributeRegex.test(line);
          // process must be an attribute after application.
          if (notAttribute) {
            break;
          }

          let process = processRegex.exec(line);
          // this is an application attribute process.
          if (process && process.length > 1) {
            result = process[1];
            // must trim to last 15 for android's ps binary
            if (result.length > 15) result = result.substr(result.length - 15);
            break;
          }
        }
      }
      return result;
    } catch (e) {
      throw new Error("processFromManifest failed. " + e);
    }
  } else {
    throw new Error("Could not find aapt");
  }
};

manifestMethods.packageAndLaunchActivityFromManifest = async function (localApk) {
  if(await this.isAaptPresent()) {
    //logger.debug("Extracting package and launch activity from manifest.");
    try {
      let {stdout} = await prettyExec(this.binaries.aapt, ['dump', 'badging', localApk], { maxBuffer: 524288 });
      let apkPackage = new RegExp(/package: name='([^']+)'/g).exec(stdout);
      if (apkPackage && apkPackage.length >= 2) {
        apkPackage = apkPackage[1];
      } else {
        apkPackage = null;
      }
      let apkActivity = new RegExp(/launchable-activity: name='([^']+)'/g).exec(stdout);
      if (apkActivity && apkActivity.length >= 2) {
        apkActivity = apkActivity[1];
      } else {
        apkActivity = null;
      }
      //logger.debug("badging package: " + apkPackage);
      //logger.debug("badging act: " + apkActivity);
      return {apkPackage, apkActivity};
    } catch (e) {
    //  logger.warn(e);
      return new Error("packageAndLaunchActivityFromManifest failed. " + e);
    }
  } else {
    throw new Error("aapt not found.");
  }


};

export default manifestMethods;
