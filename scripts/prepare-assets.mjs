// Menyiapkan aset MediaPipe agar aplikasi bisa berjalan offline setelah dipasang:
// 1. menyalin file wasm dari paket npm ke public/wasm
// 2. mengunduh model hand_landmarker.task ke public/models (sekali saja, dengan percobaan ulang)
import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const wasmSrc = join(root, 'node_modules/@mediapipe/tasks-vision/wasm');
const wasmDst = join(root, 'public/wasm');
const modelUrl = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const modelDst = join(root, 'public/models/hand_landmarker.task');
const MIN_MODEL_BYTES = 1_000_000; // model asli sekitar 7 MB; di bawah ini berarti unduhan rusak
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (existsSync(wasmSrc)) {
  mkdirSync(wasmDst, { recursive: true });
  cpSync(wasmSrc, wasmDst, { recursive: true });
  console.log('wasm disalin:', readdirSync(wasmDst).length, 'berkas');
} else {
  console.warn('Paket @mediapipe/tasks-vision belum terpasang. Jalankan npm install dulu.');
}

async function downloadModel() {
  let lastErr;
  for (let i = 1; i <= 4; i++) {
    try {
      console.log(`mengunduh model hand_landmarker (percobaan ${i}/4)...`);
      const res = await fetch(modelUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_MODEL_BYTES) throw new Error('ukuran berkas tidak wajar: ' + buf.length + ' byte');
      mkdirSync(dirname(modelDst), { recursive: true });
      writeFileSync(modelDst, buf);
      console.log('model tersimpan di public/models (' + buf.length + ' byte)');
      return;
    } catch (err) {
      lastErr = err;
      console.warn('gagal:', err.message);
      if (i < 4) await sleep(2000 * i);
    }
  }
  throw new Error('Gagal mengunduh model setelah 4 percobaan: ' + lastErr.message);
}

// Buang berkas model yang rusak dari unduhan sebelumnya
if (existsSync(modelDst) && statSync(modelDst).size < MIN_MODEL_BYTES) rmSync(modelDst);

if (!existsSync(modelDst)) {
  await downloadModel();
} else {
  console.log('model sudah ada, dilewati');
}
