const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const WEBHOOK_URL = "https://discord.com/api/webhooks/YOUR_WEBHOOK";
const INPUT_FILE = "imyt.js";
const OUTPUT_FILE = "imdis.js";

let queue = [];
let processing = false;

// chống spam watchFile
let debounceTimer = null;

// =====================
// ADD QUEUE (CHO PHÉP TRÙNG URL)
// =====================
function addToQueue(url) {
    if (!url) return;

    queue.push(url); // KHÔNG check trùng nữa
    processQueue();
}

// =====================
// PROCESS QUEUE
// =====================
async function processQueue() {
    if (processing) return;
    processing = true;

    while (queue.length > 0) {
        const url = queue.shift();

        await uploadImage(url);

        // chống 429 Discord
        await sleep(2500);
    }

    processing = false;
}

// =====================
// UPLOAD IMAGE + RETRY
// =====================
async function uploadImage(imageUrl, retry = 3) {
    try {
        console.log("[NEW]", imageUrl);

        const image = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const form = new FormData();

        form.append(
            "file",
            Buffer.from(image.data),
            "image.jpg"
        );

        const response = await axios.post(
            WEBHOOK_URL + "?wait=true",
            form,
            {
                headers: form.getHeaders(),
                timeout: 15000
            }
        );

        const attachment = response.data.attachments?.[0];

        if (!attachment) {
            console.log("[ERROR] No attachment");
            return;
        }

        const cdnUrl = attachment.url;

        saveToFile(cdnUrl);

        console.log("[UPLOADED]", cdnUrl);

    } catch (err) {
        console.error("[UPLOAD ERROR]", err.message);

        if (retry > 0) {
            console.log("[RETRY]", retry);
            await sleep(3000);
            return uploadImage(imageUrl, retry - 1);
        }
    }
}

// =====================
// SAVE FILE (LIMIT 50 LINES)
// =====================
function saveToFile(url) {
    let oldData = "";

    if (fs.existsSync(OUTPUT_FILE)) {
        oldData = fs.readFileSync(OUTPUT_FILE, "utf8");
    }

    let list = oldData
        .split("\n")
        .filter(Boolean);

    list.unshift(`"${url}"`);

    list = list.slice(0, 50);

    fs.writeFileSync(OUTPUT_FILE, list.join("\n"));
}

// =====================
// CHECK FILE
// =====================
function checkFile() {
    try {
        if (!fs.existsSync(INPUT_FILE)) return;

        const lines = fs.readFileSync(INPUT_FILE, "utf8")
            .split("\n")
            .filter(Boolean);

        if (!lines.length) return;

        const newest = lines[0].replace(/"/g, "").trim();

        if (!newest) return;

        addToQueue(newest);

    } catch (err) {
        console.error("[CHECK ERROR]", err.message);
    }
}

// =====================
// WATCH FILE (DEBOUNCE)
// =====================
fs.watchFile(INPUT_FILE, { interval: 1500 }, () => {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        checkFile();
    }, 800);
});

// =====================
function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

// =====================
console.log("Đang theo dõi file (TRÙNG URL OK + ANTI 429)...");
checkFile();