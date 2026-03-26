import { existsSync, createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import https from "https";
import http from "http";
import path from "path";

const RAW_DIR = path.join(__dirname, "..", "data", "raw");

interface Source {
  name: string;
  url: string;
  filename: string;
}

const SOURCES: Source[] = [
  {
    name: "Kaikki.org English Wiktextract",
    url: "https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl",
    filename: "kaikki-english.jsonl",
  },
  {
    name: "Webster's Dictionary (ssvivian/1913)",
    url: "https://raw.githubusercontent.com/ssvivian/WebstersDictionary/master/dictionary.json",
    filename: "webster.json",
  },
  {
    name: "Webster's 1828 Dictionary (kayson-argyle)",
    url: "https://raw.githubusercontent.com/kayson-argyle/websters_1828/master/dictionary.db",
    filename: "webster1828.db",
  },
  {
    name: "Black's Law Dictionary 2nd Ed (JSONL)",
    url: "https://gist.github.com/medelman17/55bf480caafbfcc6e9f9d22c273cf2c4/raw",
    filename: "blacks-law-2nd.jsonl",
  },
];

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const getModule = url.startsWith("https") ? https : http;

    const makeRequest = (requestUrl: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        file.close();
        reject(new Error("Too many redirects"));
        return;
      }

      const client = requestUrl.startsWith("https") ? https : http;
      client.get(requestUrl, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          const newDest = createWriteStream(dest);
          downloadToStream(res.headers.location, newDest, redirectCount + 1).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          file.close();
          reject(new Error(`HTTP ${res.statusCode} for ${requestUrl}`));
          return;
        }

        const totalBytes = parseInt(res.headers["content-length"] || "0", 10);
        let downloaded = 0;
        let lastLog = 0;

        res.on("data", (chunk: Buffer) => {
          downloaded += chunk.length;
          const now = Date.now();
          if (now - lastLog > 5000) {
            const mb = (downloaded / 1024 / 1024).toFixed(1);
            const pct = totalBytes ? ` (${((downloaded / totalBytes) * 100).toFixed(1)}%)` : "";
            console.log(`  ${mb} MB downloaded${pct}`);
            lastLog = now;
          }
        });

        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      }).on("error", (err) => {
        file.close();
        reject(err);
      });
    };

    makeRequest(url);
  });
}

function downloadToStream(url: string, file: ReturnType<typeof createWriteStream>, redirectCount: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        if (redirectCount > 5) {
          reject(new Error("Too many redirects"));
          return;
        }
        const newFile = createWriteStream(file.path as string);
        downloadToStream(res.headers.location, newFile, redirectCount + 1).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let downloaded = 0;
      let lastLog = 0;
      const totalBytes = parseInt(res.headers["content-length"] || "0", 10);

      res.on("data", (chunk: Buffer) => {
        downloaded += chunk.length;
        const now = Date.now();
        if (now - lastLog > 5000) {
          const mb = (downloaded / 1024 / 1024).toFixed(1);
          const pct = totalBytes ? ` (${((downloaded / totalBytes) * 100).toFixed(1)}%)` : "";
          console.log(`  ${mb} MB downloaded${pct}`);
          lastLog = now;
        }
      });

      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      file.close();
      reject(err);
    });
  });
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true });

  for (const source of SOURCES) {
    const dest = path.join(RAW_DIR, source.filename);
    if (existsSync(dest)) {
      console.log(`[skip] ${source.name} already downloaded`);
      continue;
    }
    console.log(`[download] ${source.name}...`);
    console.log(`  URL: ${source.url}`);
    await download(source.url, dest);
    console.log(`  -> ${dest}`);
  }

  console.log("\nAll sources downloaded.");
}

main().catch((err) => {
  console.error("Download failed:", err);
  process.exit(1);
});
