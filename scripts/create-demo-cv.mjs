import { writeFileSync } from "node:fs";
export function demoPdf() {
  const text =
    "BT /F1 18 Tf 60 760 Td (Mariana Torres - CV de demostracion) Tj 0 -35 Td /F1 12 Tf (Ingenieria de Sistemas - Semestre 8) Tj 0 -25 Td (Habilidades: Python, SQL, Git, Trabajo en equipo) Tj 0 -25 Td (Proyecto: Analisis de ventas con Python y PostgreSQL) Tj 0 -45 Td (Documento ficticio para pruebas academicas de TalentMatch.) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n",
    offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const start = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return Buffer.from(pdf);
}
if (process.argv[1]?.endsWith("create-demo-cv.mjs")) {
  writeFileSync("documents/CV-demostracion.pdf", demoPdf());
  console.log("Creado documents/CV-demostracion.pdf");
}
