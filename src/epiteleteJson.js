import Epitelete from "epitelete";

const readOptions = { readPipeline: "stripAlignment" };
const writeOptions = { writePipeline: "mergeAlignment", ...readOptions };

//Subclass of Epitelete compatible with JsonEditor
class EpiteleteJson extends Epitelete {
  undoDisabled(bookCode) {
    return !this.canUndo(bookCode);
  }
  redoDisabled(bookCode) {
    return !this.canRedo(bookCode);
  }
  async undo(bookCode) {
    return { json: await this.undoPerf(bookCode, readOptions) };
  }
  async redo(bookCode) {
    return { json: await this.redoPerf(bookCode, readOptions) };
  }
  async load(bookCode, perfJSON) {
    if (!perfJSON) await this.fetchPerf(bookCode);
    return perfJSON
      ? { json: await this.sideloadPerf(bookCode, perfJSON, readOptions) }
      : await this.get(bookCode);
  }
  async get(bookCode) {
    return { json: await this.readPerf(bookCode, readOptions) };
  }
  async update(bookCode, sequenceId, sequence) {
    return {
      json: await this.writePerf(bookCode, sequenceId, sequence, writeOptions)
    };
  }
}

export default EpiteleteJson;
