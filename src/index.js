import EpiteleteJson from "./epiteleteJson.js";
import { JSONEditor } from "vanilla-jsoneditor";
import repoRequests from "./dcs";
import { Proskomma } from "proskomma";
import "./styles.css";

(async () => {
  // Document settings
  const doc = {
    docSetId: "eng_ult",
    bookCode: "TIT"
  };

  const pk = new Proskomma();

  const { repoGetRawFile } = repoRequests;

  const usfm = await repoGetRawFile(
    "es-419_gl",
    "es-419_glt",
    "57-TIT.usfm"
  ).then(({ data }) => data);

  await pk.importDocument({ lang: "eng", abbr: "ult" }, "usfm", usfm);
  // Instantiate Epitelete
  const epiJson = new EpiteleteJson({
    proskomma: pk,
    docSetId: doc.docSetId,
    options: { historySize: 10 }
  });

  // Set editor
  const target = document.getElementById("perf-editor");

  const props = {
    onChange: async (updated, previous, patch) => {
      //Find changed sequence Id in patch
      const sequenceId = patch?.redo?.[0].path.match(
        /(?<=sequences\/).+?(?=\/)/
      );
      console.log(await epiJson.getPipelineData(doc.bookCode));
      //Do not make changes if no sequence has been modified
      if (!sequenceId) {
        editor.update(previous);
        // alert("No changes made, only sequences should be edited.");
        return;
      }
      //Update editor with modified sequence
      const sequence = updated.json.sequences[sequenceId];
      console.log("updated " + sequence);
      editor.update(await epiJson.update(doc.bookCode, sequenceId, sequence));
    },
    onRenderMenu: (mode, items) => {
      /*
    Remove code/tree buttons.
    Hook epitelete to undo/redo buttons.
    */
      const [undoItem, redoItem] = items.slice(11, 13);
      const customUndo = {
        ...undoItem,
        disabled: epiJson.undoDisabled(doc.bookCode),
        onClick: async () => {
          editor.update(await epiJson.undo(doc.bookCode));
        }
      };
      const customRedo = {
        ...redoItem,
        disabled: epiJson.redoDisabled(doc.bookCode),
        onClick: async () => {
          editor.update(await epiJson.redo(doc.bookCode));
        }
      };

      const filteredItems = items.slice(3, 11);
      return [...filteredItems, customUndo, customRedo];
    }
  };

  const editor = new JSONEditor({ target, props });
  const initialDoc = await epiJson.load(doc.bookCode);
  editor.set(initialDoc);

  const exportButton = document.getElementById("export");
  exportButton.addEventListener("click", async () => {
    console.log(await epiJson.readUsfm(doc.bookCode));
  });
})();
