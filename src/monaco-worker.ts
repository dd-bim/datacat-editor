
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import graphqlWorker from 'monaco-graphql/esm/graphql.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'graphql') {
      return new graphqlWorker();
    }
    return new editorWorker();
  },
};
