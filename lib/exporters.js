"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeName(name) {
  return (name || "提案書").replace(/[\\/:*?"<>|]/g, "_").slice(0, 60);
}

export function downloadMarkdown(md, baseName) {
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  triggerDownload(blob, `${safeName(baseName)}_提案書.md`);
}

// **bold** を TextRun に分解
function inlineRuns(text) {
  const runs = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith("**") && p.endsWith("**")) {
      runs.push(new TextRun({ text: p.slice(2, -2), bold: true }));
    } else {
      runs.push(new TextRun({ text: p }));
    }
  }
  return runs.length ? runs : [new TextRun({ text: "" })];
}

export async function downloadDocx(md, baseName) {
  const children = [];
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (t === "") continue;
    if (t.startsWith("### ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: inlineRuns(t.slice(4)),
        })
      );
    } else if (t.startsWith("## ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: inlineRuns(t.slice(3)),
        })
      );
    } else if (t.startsWith("# ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: inlineRuns(t.slice(2)),
        })
      );
    } else if (t.startsWith("- ") || t.startsWith("* ")) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: inlineRuns(t.slice(2)),
        })
      );
    } else if (/^\d+\.\s/.test(t)) {
      children.push(
        new Paragraph({
          children: inlineRuns(t),
        })
      );
    } else {
      children.push(new Paragraph({ children: inlineRuns(t) }));
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Yu Gothic", size: 22 }, // 11pt
        },
      },
    },
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${safeName(baseName)}_提案書.docx`);
}
