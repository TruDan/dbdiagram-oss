import { boot } from 'quasar/wrappers'
import ace from 'ace-builds';
import 'ace-builds/webpack-resolver';
// import workerJsonUrl from 'file-loader?esModule=false!src/ace/mode/dbml.js'; // For webpack / vue-cli
import workerJsonUrl from 'file-loader?type=commonjs|target=es5|esModule=false!app/public/mode-dbml.js'; // For webpack / vue-cli

export default boot(({ app }) => {
  ace.config.setModuleUrl('ace/mode/dbml', workerJsonUrl)
});
