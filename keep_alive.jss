const express = require("express");
const fs = require("fs");
const os = require("os");
const ytdl = require("@distube/ytdl-core");

function keepAlive() {

    const app = express();
    const port = 3000;
    const envPath = ".env";

    app.use(express.urlencoded({ extended: true }));

    function page(result = "") {
        return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Token Manager</title>

<style>
body{
    font-family:Arial;
    padding:20px;
}

.container{
    display:flex;
    gap:40px;
    flex-wrap:wrap;
}

.box{
    border:1px solid #ccc;
    padding:20px;
    border-radius:10px;
    width:400px;
}

input{
    width:100%;
    padding:8px;
    margin-top:5px;
}

button{
    padding:10px 20px;
    margin-top:10px;
    cursor:pointer;
}
</style>

</head>
<body>

<div class="container">

<div class="box">
<h2>Token Manager</h2>

<form method="POST" action="/save">

<input name="token" placeholder="TOKEN" required>
<br><br>

<input name="image" placeholder="IMAGE URL" required>
<br><br>

<button type="submit">Lưu</button>

</form>
</div>

<div class="box">
<h2>YouTube Duration</h2>

<form method="POST" action="/youtube">

<input name="youtube" placeholder="YouTube URL" required>
<br><br>

<button type="submit">Lấy thời lượng</button>

</form>

${result}

</div>

</div>

</body>
</html>
`;
    }

    app.get("/", (req, res) => {
        res.send(page());
    });

    app.post("/save", (req, res) => {

        const token = req.body.token;

        let envData = "";

        if (fs.existsSync(envPath)) {
            envData = fs.readFileSync(envPath, "utf8");
        }

        const matches = envData.match(/DISCORD_TOKENS(\d+)=/g);

        let nextNumber = 1;

        if (matches) {
            const numbers = matches.map(x =>
                parseInt(x.match(/\d+/)[0])
            );

            nextNumber = Math.max(...numbers) + 1;
        }

        fs.appendFileSync(
            envPath,
            `DISCORD_TOKENS${nextNumber}=${token}\n`
        );

        res.send(page(`
            <hr>
            <p>✅ Token đã lưu.</p>
        `));
    });

    function formatDuration(seconds) {

        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        let result = "";

        if (hrs > 0) result += hrs + " giờ ";
        if (mins > 0 || hrs > 0) result += mins + " phút ";
        result += secs + " giây";

        return result;
    }

    app.post("/youtube", async (req, res) => {

        try {

            const url = req.body.youtube;

            if (!ytdl.validateURL(url)) {
                return res.send(page(`
                    <hr>
                    <p>❌ Link YouTube không hợp lệ</p>
                `));
            }
            let oldUrlData = "";

if (fs.existsSync("url.js")) {
    oldUrlData = fs.readFileSync(
        "url.js",
        "utf8"
    );
}

fs.writeFileSync(
    "url.js",
    `"${url}"\n` + oldUrlData
);

            const info = await ytdl.getBasicInfo(url);

            const title = info.videoDetails.title;
            const videoId = info.videoDetails.videoId;

const imageUrl =
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

let oldImageData = "";

if (fs.existsSync("imyt.js")) {
    oldImageData = fs.readFileSync(
        "imyt.js",
        "utf8"
    );
}

fs.writeFileSync(
    "imyt.js",
    `"${imageUrl}"\n` + oldImageData
);

            const seconds = parseInt(
                info.videoDetails.lengthSeconds
            );

            const duration = formatDuration(seconds);

            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            let timeString = "";

            if (hrs > 0) {

                timeString =
                    `"${hrs} * 60 * 60 * 1000 + ${mins} * 60 * 1000 + ${secs} * 1000"`;

            } else if (mins > 0) {

                timeString =
                    `"${mins} * 60 * 1000 + ${secs} * 1000"`;

            } else {

                timeString =
                    `"${secs} * 1000"`;

            }                                     
            let oldData = "";

if (fs.existsSync("timenev.js")) {
    oldData = fs.readFileSync(
        "timenev.js",
        "utf8"
    );
}

fs.writeFileSync(
    "timenev.js",
    timeString + "\n" + oldData
);

            res.send(page(`
                <hr>
                <h3>📺 ${title}</h3>
                <p>⏱️ ${duration}</p>
                <p>💾 Đã lưu:</p>
                <pre>${timeString}</pre>
            `));

} catch (err) {
    console.log(err);
    console.log(err.stack);

    res.send(page(`
        <hr>
        <p>❌ ${err.message}</p>
    `));
}
           
    });

    app.listen(port, () => {

        const interfaces = os.networkInterfaces();
        let ip = "localhost";

        for (const name of Object.keys(interfaces)) {
            for (const net of interfaces[name]) {

                if (
                    net.family === "IPv4" &&
                    !net.internal
                ) {
                    ip = net.address;
                }
            }
        }

        console.log("🚀 Server đang chạy");
        console.log(`👉 Local: http://localhost:${port}`);
        console.log(`👉 Network: http://${ip}:${port}`);                                                });
}

module.exports = keepAlive;
