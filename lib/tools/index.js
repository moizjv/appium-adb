import methods from './adb-commands.js';
import manifestMethods from './android-manifest.js';

Object.assign(
    methods,
    manifestMethods
);

export default methods;
