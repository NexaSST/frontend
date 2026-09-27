import type { Risk } from "./types.js";
export const riskDefault: Risk = {
  taskStep: "",
  hazard: "",
  consequence: "",
  severityCode: "",
  likelihoodCode: "",
  controls: [{ description: "" }],
};
