
let methods = {};

methods.getAdbWithCorrectAdbPath = async function () {
  try {
    this.adb.path = await this.sysCallsHelper.getSdkBinaryPath("adb");
    this.binaries.adb = this.adb.path;
  } catch (err) {
    return err;
  }
  return this.adb;
};

methods.isAaptPresent = async function () {
  try {
    this.binaries.aapt = await this.sysCallsHelper.getSdkBinaryPath("aapt");
    return true;
  } catch (e) {
    // TODO log
    return false;
  }

};

methods.isZiAlignPresent = async function() {
  try {
    this.binaries.zipalign = await this.sysCallsHelper.getSdkBinaryPath("zipalign");
    return true;
  } catch (e) {
    // TODO log
    return false;
  }
};

export default methods;
