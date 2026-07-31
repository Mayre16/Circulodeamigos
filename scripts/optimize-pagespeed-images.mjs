/**
 * Redimensiona/comprime assets marcados por PageSpeed en Círculo.
 * Uso: node scripts/optimize-pagespeed-images.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const JOBS = [
  {
    rel: "public/img/circulo-amigos/hero-conectate.webp",
    width: 1280,
    height: 598,
    quality: 72,
  },
  {
    rel: "public/img/circulo-amigos/logo-header-cropped.webp",
    width: 1220,
    height: 160,
    quality: 78,
    fit: "inside",
  },
  {
    rel: "public/img/circulo-amigos/grupo-dialogo.webp",
    width: 800,
    height: 624,
    quality: 68,
  },
  {
    rel: "public/img/circulo-amigos/acciones-sociales.webp",
    width: 720,
    height: 580,
    quality: 68,
  },
  {
    rel: "public/img/circulo-amigos/pilar-fraternidad.webp",
    width: 504,
    height: 504,
    quality: 68,
  },
  {
    rel: "public/img/circulo-amigos/pilar-conocimiento.webp",
    width: 504,
    height: 504,
    quality: 68,
  },
  {
    rel: "public/img/circulo-amigos/banner-quienes.webp",
    width: 504,
    height: 504,
    quality: 68,
  },
];

function kib(n) {
  return `${(n / 1024).toFixed(1)} KiB`;
}

for (const job of JOBS) {
  const file = path.join(ROOT, job.rel);
  if (!fs.existsSync(file)) {
    console.warn("SKIP missing", job.rel);
    continue;
  }
  const before = fs.statSync(file).size;
  const meta = await sharp(file).metadata();
  const fit = job.fit ?? "inside";
  const buf = await sharp(file)
    .resize(job.width, job.height, {
      fit,
      withoutEnlargement: true,
    })
    .webp({ quality: job.quality, effort: 5 })
    .toBuffer();

  if (buf.length >= before && (meta.width ?? 0) <= job.width) {
    console.log(`${job.rel}: sin cambio (ya óptimo)`);
    continue;
  }

  const stagingDir = path.join(ROOT, "scripts", "_img-opt");
  const staging = path.join(stagingDir, path.basename(job.rel));
  fs.mkdirSync(stagingDir, { recursive: true });
  fs.writeFileSync(staging, buf);
  try {
    fs.copyFileSync(staging, file);
    fs.unlinkSync(staging);
  } catch {
    console.warn(
      `WARN: no se pudo sobrescribir ${job.rel}. Quedó en ${staging}`,
    );
    continue;
  }
  const afterMeta = await sharp(file).metadata();
  console.log(
    `${job.rel}: ${meta.width}x${meta.height} ${kib(before)} → ${afterMeta.width}x${afterMeta.height} ${kib(buf.length)}`,
  );
}
