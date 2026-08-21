const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// -----------------------------------------
// Normaliza cualquier valor a minúsculas para
// comparar sin importar cómo lo mande el frontend
// ("Yes", "yes", " Yes ", etc. todos coinciden).
// -----------------------------------------
function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function isChecked(value, expected) {
  return normalize(value) === expected ? "checked" : "";
}

const generateReportPDF = async (reportData, res) => {
  try {
    // -----------------------------------------
    // 1. Cargar plantilla
    // -----------------------------------------
    const templatePath = path.join(
      __dirname,
      "../templates/serviceReport.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");

    // -----------------------------------------
    // 2. Procesar fecha
    // -----------------------------------------
    let month = reportData.month || "";
    let day = reportData.day || "";
    let year = reportData.year || "";

    // Si React está enviando una fecha tipo:
    // 2026-08-18
    if (reportData.serviceDate) {
      const date = new Date(reportData.serviceDate + "T00:00:00");

      if (!isNaN(date.getTime())) {
        month = String(date.getMonth() + 1).padStart(2, "0");
        day = String(date.getDate()).padStart(2, "0");
        year = String(date.getFullYear());
      }
    }

    // -----------------------------------------
    // 3. Reemplazar información
    // -----------------------------------------
    html = html
      // -----------------------------------------
      // Información general
      // -----------------------------------------
      .replace(/{{employees}}/g, reportData.employees || "")
      .replace(/{{boatName}}/g, reportData.boatName || "")
      .replace(/{{location}}/g, reportData.serviceLocation || "")
      .replace(/{{workingHours}}/g, reportData.workingHours || "")
      .replace(/{{invoiceNumber}}/g, reportData.invoiceNumber || "")
      .replace(/{{serialNumber}}/g, reportData.serialNumber || "")
      .replace(/{{laborDescription}}/g, reportData.laborDescription || "")
      .replace(/{{materials}}/g, reportData.materials || "")

      // -----------------------------------------
      // Fecha
      // -----------------------------------------
      .replace(/{{month}}/g, month)
      .replace(/{{day}}/g, day)
      .replace(/{{year}}/g, year)

      // -----------------------------------------
      // Invoice / Estimate
      // -----------------------------------------
      .replace(
        /{{invoiceOrEstimateInv}}/g,
        isChecked(reportData.invoiceOrEstimate, "invoice")
      )
      .replace(
        /{{invoiceOrEstimateEst}}/g,
        isChecked(reportData.invoiceOrEstimate, "estimate")
      )

      // -----------------------------------------
      // Yard Fee
      // -----------------------------------------
      .replace(/{{yardFeeYes}}/g, isChecked(reportData.yardFee, "yes"))
      .replace(/{{yardFeeNo}}/g, isChecked(reportData.yardFee, "no"))

      // -----------------------------------------
      // Work Finished
      // -----------------------------------------
      .replace(
        /{{workFinishedYes}}/g,
        isChecked(reportData.workFinished, "yes")
      )
      .replace(
        /{{workFinishedNo}}/g,
        isChecked(reportData.workFinished, "no")
      )

      // -----------------------------------------
      // Warranty Case
      // -----------------------------------------
      .replace(
        /{{warrantyCaseYes}}/g,
        isChecked(reportData.warrantyCase, "yes")
      )
      .replace(
        /{{warrantyCaseNo}}/g,
        isChecked(reportData.warrantyCase, "no")
      );

    // -----------------------------------------
    // 4. Convertir imágenes locales a Base64
    // -----------------------------------------
    html = await replaceLocalImagesWithBase64(html, templatePath);

    // -----------------------------------------
    // 5. Abrir Puppeteer
    // -----------------------------------------
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // -----------------------------------------
    // 6. Cargar HTML
    // -----------------------------------------
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // -----------------------------------------
    // 7. Esperar imágenes
    // -----------------------------------------
    await page.evaluate(async () => {
      const images = Array.from(document.images);

      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
    });

    // -----------------------------------------
    // 8. Generar PDF
    // -----------------------------------------
    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    // -----------------------------------------
    // 9. Cerrar navegador
    // -----------------------------------------
    await browser.close();

    // -----------------------------------------
    // 10. Enviar PDF
    // -----------------------------------------
    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="elite-marine-service-report.pdf"'
    );

    res.send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);

    res.status(500).json({
      message: "Error generating PDF",
      error: error.message,
    });
  }
};

// =====================================================
// Convertir imágenes locales a Base64
// =====================================================

async function replaceLocalImagesWithBase64(html, templatePath) {
  const templateDirectory = path.dirname(templatePath);

  const imageRegex = /<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi;

  const matches = [...html.matchAll(imageRegex)];

  for (const match of matches) {
    const fullTag = match[0];
    const beforeSrc = match[1];
    const imageSrc = match[2];
    const afterSrc = match[3];

    // No modificar imágenes remotas
    if (
      imageSrc.startsWith("http://") ||
      imageSrc.startsWith("https://") ||
      imageSrc.startsWith("data:")
    ) {
      continue;
    }

    try {
      const imagePath = path.resolve(templateDirectory, imageSrc);

      if (!fs.existsSync(imagePath)) {
        console.warn(`Image not found: ${imagePath}`);
        continue;
      }

      const extension = path.extname(imagePath).toLowerCase();

      let mimeType = "image/png";

      if (extension === ".jpg" || extension === ".jpeg") {
        mimeType = "image/jpeg";
      } else if (extension === ".gif") {
        mimeType = "image/gif";
      } else if (extension === ".svg") {
        mimeType = "image/svg+xml";
      } else if (extension === ".webp") {
        mimeType = "image/webp";
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const base64 = imageBuffer.toString("base64");
      const newSrc = `data:${mimeType};base64,${base64}`;
      const newTag = `<img${beforeSrc}src="${newSrc}"${afterSrc}>`;

      html = html.replace(fullTag, newTag);
    } catch (error) {
      console.error(`Error loading image ${imageSrc}:`, error);
    }
  }

  return html;
}

module.exports = {
  generateReportPDF,
};