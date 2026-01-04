import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

export async function ocrPdf(
  input: string,
  output: string
) {
  await exec("ocrmypdf", [
    "--language", "ita",
    "--deskew",
    "--rotate-pages",
    "--optimize", "3",
    input,
    output,
  ]);
}

ocrPdf("../perizia.pdf", "../perizia_ocr.pdf");
