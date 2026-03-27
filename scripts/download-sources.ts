import { existsSync, createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import https from "https";
import http from "http";
import path from "path";
import { execSync } from "child_process";

const RAW_DIR = path.join(__dirname, "..", "data", "raw");

interface Source {
  name: string;
  url: string;
  filename: string;
  extract?: "tar.gz" | "gz" | "git";
  extractDir?: string;
  optional?: boolean;
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
    name: "Hobson-Jobson (Anglo-Indian Etymology)",
    url: "https://www.gutenberg.org/files/58529/58529-0.txt",
    filename: "hobson-jobson.txt",
  },
  {
    name: "1811 Dictionary of the Vulgar Tongue",
    url: "https://www.gutenberg.org/files/5402/5402-0.txt",
    filename: "vulgar-tongue.txt",
  },
  {
    name: "Word Frequency (wordfreq-en)",
    url: "https://raw.githubusercontent.com/aparrish/wordfreq-en-25000/master/wordfreq_en.json",
    filename: "wordfreq.json",
  },
  {
    name: "Black's Law Dictionary 2nd Ed (JSONL)",
    url: "https://gist.github.com/medelman17/55bf480caafbfcc6e9f9d22c273cf2c4/raw",
    filename: "blacks-law-2nd.jsonl",
  },
  // Phase 1: Thesaurus sources
  {
    name: "Moby Thesaurus (Grady Ward)",
    url: "https://www.gutenberg.org/files/3202/files/mthesaur.txt",
    filename: "moby-thesaurus.txt",
  },
  {
    name: "WordNet 3.1 Database Files",
    url: "https://wordnetcode.princeton.edu/wn3.1.dict.tar.gz",
    filename: "wn3.1.dict.tar.gz",
    extract: "tar.gz",
    extractDir: "dict",
    optional: true,
  },
  {
    name: "Roget's Thesaurus (1911 via Gutenberg)",
    url: "https://www.gutenberg.org/files/22/22-0.txt",
    filename: "rogets-thesaurus.txt",
  },
  // Phase 2: Pronunciation
  {
    name: "CMU Pronouncing Dictionary",
    url: "https://svn.code.sf.net/p/cmusphinx/code/trunk/cmudict/cmudict-0.7b",
    filename: "cmudict.txt",
    optional: true,
  },
  // Phase 3: Biblical
  {
    name: "Bible Dictionary Dataset (Easton's + Smith's)",
    url: "https://raw.githubusercontent.com/neuu-org/bible-dictionary-dataset/main/data/01_parsed/_index.json",
    filename: "bible-dict-index.json",
    optional: true,
  },
  {
    name: "Hitchcock's Bible Names (CSV)",
    url: "https://raw.githubusercontent.com/BradyStephenson/bible-data/main/HitchcocksBibleNamesDictionary.csv",
    filename: "hitchcocks-names.csv",
    optional: true,
  },
  {
    name: "Nave's Topical Bible (CSV)",
    url: "https://raw.githubusercontent.com/BradyStephenson/bible-data/main/NavesTopicalDictionary.csv",
    filename: "naves-topical.csv",
    optional: true,
  },
  // Phase 4: Enrichment
  {
    name: "GCIDE (GNU Collaborative International Dictionary)",
    url: "https://mirror.csclub.uwaterloo.ca/gnu/gcide/gcide-0.53.tar.gz",
    filename: "gcide-0.53.tar.gz",
    extract: "tar.gz",
    extractDir: "gcide-0.53",
    optional: true,
  },
  {
    name: "Academic Word List",
    url: "https://raw.githubusercontent.com/lpmi-13/machine_readable_wordlists/master/Academic/AWL/AWL.json",
    filename: "academic-word-list.json",
    optional: true,
  },
  // Phase 5: SCOWL
  {
    name: "SCOWL Word Lists",
    url: "https://downloads.sourceforge.net/project/wordlist/SCOWL/2020.12.07/scowl-2020.12.07.tar.gz",
    filename: "scowl-2020.12.07.tar.gz",
    extract: "tar.gz",
    extractDir: "scowl-2020.12.07",
    optional: true,
  },
  // Phase 5: IPA Dict
  {
    name: "IPA Dictionary (English)",
    url: "https://raw.githubusercontent.com/open-dict-data/ipa-dict/master/data/en_US.txt",
    filename: "ipa-dict-en.txt",
    optional: true,
  },
  // Phase 5: Oxford 5000
  {
    name: "Oxford 5000 Word List",
    url: "https://raw.githubusercontent.com/tyypgzl/Oxford-5000-words/main/full-word.json",
    filename: "oxford-5000.json",
    optional: true,
  },
  // Phase 5: CEFR
  {
    name: "CEFR Word Levels Dataset",
    url: "https://raw.githubusercontent.com/Maximax67/Words-CEFR-Dataset/main/csv/words.csv",
    filename: "cefr-words.csv",
    optional: true,
  },
  // Phase 5: MorphoLex (Excel file)
  {
    name: "MorphoLex English",
    url: "https://raw.githubusercontent.com/hugomailhot/MorphoLex-en/master/MorphoLEX_en.xlsx",
    filename: "morpholex-en.xlsx",
    optional: true,
  },
  // Phase 5: Google 10K
  {
    name: "Google 10,000 Common Words",
    url: "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt",
    filename: "google-10000-english.txt",
    optional: true,
  },
  // Phase 6: Ngrams (Google Books 1-gram, letter-a only as a starter — extend to all letters for full coverage)
  {
    name: "Google Books 1-gram (a)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-a.gz",
    filename: "googlebooks-eng-all-1gram-20120701-a.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (b)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-b.gz",
    filename: "googlebooks-eng-all-1gram-20120701-b.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (c)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-c.gz",
    filename: "googlebooks-eng-all-1gram-20120701-c.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (d)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-d.gz",
    filename: "googlebooks-eng-all-1gram-20120701-d.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (e)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-e.gz",
    filename: "googlebooks-eng-all-1gram-20120701-e.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (f)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-f.gz",
    filename: "googlebooks-eng-all-1gram-20120701-f.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (g)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-g.gz",
    filename: "googlebooks-eng-all-1gram-20120701-g.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (h)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-h.gz",
    filename: "googlebooks-eng-all-1gram-20120701-h.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (i)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-i.gz",
    filename: "googlebooks-eng-all-1gram-20120701-i.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (j)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-j.gz",
    filename: "googlebooks-eng-all-1gram-20120701-j.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (k)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-k.gz",
    filename: "googlebooks-eng-all-1gram-20120701-k.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (l)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-l.gz",
    filename: "googlebooks-eng-all-1gram-20120701-l.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (m)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-m.gz",
    filename: "googlebooks-eng-all-1gram-20120701-m.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (n)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-n.gz",
    filename: "googlebooks-eng-all-1gram-20120701-n.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (o)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-o.gz",
    filename: "googlebooks-eng-all-1gram-20120701-o.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (p)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-p.gz",
    filename: "googlebooks-eng-all-1gram-20120701-p.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (q)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-q.gz",
    filename: "googlebooks-eng-all-1gram-20120701-q.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (r)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-r.gz",
    filename: "googlebooks-eng-all-1gram-20120701-r.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (s)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-s.gz",
    filename: "googlebooks-eng-all-1gram-20120701-s.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (t)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-t.gz",
    filename: "googlebooks-eng-all-1gram-20120701-t.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (u)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-u.gz",
    filename: "googlebooks-eng-all-1gram-20120701-u.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (v)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-v.gz",
    filename: "googlebooks-eng-all-1gram-20120701-v.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (w)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-w.gz",
    filename: "googlebooks-eng-all-1gram-20120701-w.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (x)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-x.gz",
    filename: "googlebooks-eng-all-1gram-20120701-x.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (y)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-y.gz",
    filename: "googlebooks-eng-all-1gram-20120701-y.gz",
    extract: "gz",
    optional: true,
  },
  {
    name: "Google Books 1-gram (z)",
    url: "http://storage.googleapis.com/books/ngrams/books/googlebooks-eng-all-1gram-20120701-z.gz",
    filename: "googlebooks-eng-all-1gram-20120701-z.gz",
    extract: "gz",
    optional: true,
  },
  // Phase 6: Etymology DB (for cognates)
  {
    name: "Etymology Database (Etymdb.org)",
    url: "https://raw.githubusercontent.com/other-linguistics/other-linguistics/main/etymology_db.csv",
    filename: "etymology-db.csv",
    optional: true,
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

    // For extractable sources, check if the extracted directory exists
    if (source.extract === "tar.gz" && source.extractDir) {
      const extractedPath = path.join(RAW_DIR, source.extractDir);
      if (existsSync(extractedPath)) {
        console.log(`[skip] ${source.name} already extracted`);
        continue;
      }
    } else if (source.extract === "gz") {
      const extractedPath = dest.replace(/\.gz$/, "");
      if (existsSync(extractedPath)) {
        console.log(`[skip] ${source.name} already extracted`);
        continue;
      }
    } else if (existsSync(dest)) {
      console.log(`[skip] ${source.name} already downloaded`);
      continue;
    }

    console.log(`[download] ${source.name}...`);
    console.log(`  URL: ${source.url}`);
    try {
      await download(source.url, dest);
      console.log(`  -> ${dest}`);

      // Post-download extraction
      if (source.extract === "tar.gz") {
        console.log(`  Extracting tar.gz...`);
        execSync(`cd "${RAW_DIR}" && tar xzf "${source.filename}"`, { stdio: "inherit" });
        console.log(`  Extracted to ${source.extractDir || source.filename.replace(".tar.gz", "")}`);
      } else if (source.extract === "gz") {
        console.log(`  Decompressing .gz...`);
        execSync(`cd "${RAW_DIR}" && gunzip -k "${source.filename}"`, { stdio: "inherit" });
        console.log(`  Decompressed`);
      }
    } catch (err) {
      if (source.optional) {
        console.log(`  [warn] Failed to download ${source.name}: ${err instanceof Error ? err.message : err}`);
        // Clean up partial file
        try { const { unlinkSync } = await import("fs"); unlinkSync(dest); } catch {}
        continue;
      }
      throw err;
    }
  }

  console.log("\nAll sources downloaded.");
}

main().catch((err) => {
  console.error("Download failed:", err);
  process.exit(1);
});
