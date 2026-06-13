const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const WEBHOOK_URL =  "https://discord.com/api/webhooks/1355134247974731777/6ha_PLkzz7csiWQ5bkMDGZVitbCK4-WbFALeQehvCz7EfTofaDjLLX4_itq6nDPjNOzS";

let lastUrl = "";

async function uploadImage(imageUrl) {
    try {

        console.log("[NEW]", imageUrl);

        const image = await axios.get(
            imageUrl,
            {
                responseType: "arraybuffer"
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
                headers: form.getHeaders()
            }
        );

        const attachment =
            response.data.attachments?.[0];

        if (!attachment) {
            console.log("Không lấy được CDN URL");
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



    } catch (err) {
        console.error(
            "[ERROR]",
            err.message
        );
    }
}

function check() {

    try {

        if (!fs.existsSync("imyt.js")) {
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
            return;
        }

        const newest = lines[0]
            .replace(/"/g, "")
            .trim();

        if (!newest) {
            return;
        }

        if (newest === lastUrl) {
            return;
        }

        lastUrl = newest;

        uploadImage(newest);

    } catch (err) {
        console.error(
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
    check
);

console.log(
    "Đang theo dõi imyt.js..."
);
