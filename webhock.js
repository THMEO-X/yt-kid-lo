const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const WEBHOOK_URL = "https://discord.com/api/webhooks/1355134247974731777/6ha_PLkzz7csiWQ5bkMDGZVitbCK4-WbFALeQehvCz7EfTofaDjLLX4_itq6nDPjNOzS";

let queue = [];
let running = false;

// =====================
// WATCH FILE
// =====================
fs.watchFile("imyt.js", { interval: 1500 }, () => {
    try {
        const data = fs.readFileSync("imyt.js", "utf8")
            .split("\n")
            .filter(Boolean);

        if (!data.length) return;

        const url = data[0].replace(/"/g, "").trim();
        if (!url) return;

        queue.push(url);
        processQueue();

    } catch (err) {
        console.error(err.message);
    }
});

// =====================
// PROCESS QUEUE
// =====================
async function processQueue() {
    if (running) return;
    running = true;

    while (queue.length > 0) {
        const url = queue.shift();

        await handleUpload(url);

        // ⏱ delay 3s theo yêu cầu
        await sleep(3000);
    }

    running = false;
}

// =====================
// DOWNLOAD + UPLOAD
// =====================
async function handleUpload(imageUrl) {
    try {
        console.log("[NEW]", imageUrl);

        // 1. tải ảnh
        const image = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://www.youtube.com/"
            }
        });

        // 2. tạo form upload discord
        const form = new FormData();
        form.append("file", Buffer.from(image.data), "image.jpg");

        // 3. upload discord
        const res = await axios.post(
            WEBHOOK_URL + "?wait=true",
            form,
            { headers: form.getHeaders() }
        );

        const cdn = res.data.attachments?.[0]?.url;

        if (!cdn) {
            console.log("[ERROR] No CDN returned");
            return;
        }

        // 4. ghi file imdis.js
        saveCDN(cdn);

        console.log("[UPLOADED]", cdn);

    } catch (err) {
        console.error("[ERROR]", err.message);
    }
}

// =====================
// SAVE CDN
// =====================
function saveCDN(url) {
    let old = "";

    if (fs.existsSync("imdis.js")) {
        old = fs.readFileSync("imdis.js", "utf8");
    }

    const list = old.split("\n").filter(Boolean);

    list.unshift(`"${url}"`);

    fs.writeFileSync("imdis.js", list.join("\n"));
}

// =====================
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// =====================
console.log("Running webhook uploader...");