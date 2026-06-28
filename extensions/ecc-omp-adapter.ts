import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import eccExtension from "../packages/ecc-universal/omp/extension.mjs";

export default function eccOmpAdapter(pi: ExtensionAPI) {
  return eccExtension(pi);
}
