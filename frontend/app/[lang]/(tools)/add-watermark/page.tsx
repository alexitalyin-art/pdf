"use client";

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddWatermarkPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>("Confidential");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleApplyWatermark = async () => {
    if (!pdfFile) return;

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - 100,
          y: height / 2,
          size: 40,
          font: helveticaFont,
          color: rgb(0.75, 0.75, 0.75),
          rotate: degrees(45), // ✅ FIX
          opacity: 0.5,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
    } catch (error) {
      console.error("Error applying watermark:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-5xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold">
            Add Watermark
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="file" accept="application/pdf" onChange={handleFileChange} />

          <input
            type="text"
            placeholder="Enter watermark text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />

          <Button onClick={handleApplyWatermark} disabled={!pdfFile}>
            Apply Watermark
          </Button>

          {outputPdfUrl && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Watermarked PDF:</h3>
              <iframe src={outputPdfUrl} width="100%" height="500px"></iframe>
              <a
                href={outputPdfUrl}
                download="watermarked.pdf"
                className="block mt-2 text-blue-600 underline"
              >
                Download PDF
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
