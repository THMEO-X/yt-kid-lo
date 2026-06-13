const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const WEBHOOK_URL = "https://discord.com/api/webhooks/1355134247974731777/6ha_PLkzz7csiWQ5bkMDGZVitbCK4-WbFALeQehvCz7EfTofaDjLLX4_itq6nDPjNOzS";

let lastUrl = "";
let uploading = false;
let sendCount = 0;

async function uploadImage(imageUrl) {

    console.log("[UPLOAD START]", imageUrl);

    if (uploading) {
        console.log("[SKIP] Upload đang chạy");
        return;
    }

    uploading = true;

    try {

        sendCount++;

        console.log(`[SEND #${sendCount}]`, imageUrl);

        const image = await axios.get(
            imageUrl,
            {
                responseType: "arraybuffer",
                timeout: 30000
            }
        );

        const form = new FormData();

        form.append(
            "file",
            Buffer.from(image.data),
            "youtube.jpg"
        );

        const response = await axios.post(
            WEBHOOK_URL + "?wait=true",
            form,
            {
                headers: form.getHeaders(),
                timeout: 30000
            }
        );

        const attachment =
            response.data.attachments?.[0];

        if (!attachment) {
            console.log(
                "[ERROR] Không lấy được CDN URL"
            );
            return;
        }

        const cdnUrl = attachment.url;

        let oldData = "";

        if (fs.existsSync("imdis.js")) {
            oldData = fs.readFileSync(
                "imdis.js",
                "utf8"
            );
        }

        fs.writeFileSync(
            "imdis.js",
            `"${cdnUrl}"\n` + oldData
        );

        console.log(
            "[UPLOAD SUCCESS]",
            cdnUrl
        );

    } catch (err) {

        console.log("////////////////////////////////////////////////////////");

        if (err.response) {

            console.log(
                "Status:",
                err.response.status
            );

            console.log(
                "Data:",
                err.response.data
            );

            console.log(
                "Headers:",
                err.response.headers
            );

        } else {

            console.log(
                "[ERROR]",
                err.message
            );

        }

    } finally {

        uploading = false;

        console.log("[UPLOAD END]");

    }
}

function check() {

    console.log(
        "[CHECK]",
        new Date().toISOString()
    );

    try {

        if (!fs.existsSync("imyt.js")) {
            console.log(
                "[INFO] imyt.js chưa tồn tại"
            );
            return;
        }

        const lines = fs
            .readFileSync(
                "imyt.js",
                "utf8"
            )
            .split("\n")
            .filter(x => x.trim());

        if (!lines.length) {
            console.log(
                "[INFO] imyt.js rỗng"
            );
            return;
        }

        const newest = lines[0]
            .replace(/"/g, "")
            .trim();

        console.log(
            "[COMPARE]",
            "new =",
            newest,
            "| last =",
            lastUrl
        );

        if (!newest) {
            return;
        }

        if (newest === lastUrl) {

            console.log(
                "[SKIP] URL trùng"
            );

            return;
        }

        lastUrl = newest;

        console.log(
            "[NEW URL]",
            newest
        );

        uploadImage(newest);

    } catch (err) {

        console.log(
            "[CHECK ERROR]",
            err.message
        );

    }
}

check();

fs.watchFile(
    "imyt.js",
    {
        interval: 1000
    },
    () => {

        console.log(
            "[WATCH EVENT]"
        );

        check();

    }
);

console.log(
    "Đang theo dõi imyt.js..."
);
