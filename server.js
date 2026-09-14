const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const nodemailer = require("nodemailer");

const port = Number(process.env.PORT) || 3000;
const root = __dirname;
const messagesDirectory = path.join(root, "data");
const messagesFile = path.join(messagesDirectory, "messages.json");
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const contactRecipient = process.env.CONTACT_RECIPIENT || "aladexfawaz@gmail.com";
const mailTransport = gmailUser && gmailAppPassword
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailAppPassword }
    })
    : null;
const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
    });
    response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.setEncoding("utf8");
        request.on("data", (chunk) => {
            body += chunk;
            if (body.length > 100000) {
                reject(new Error("Request body is too large."));
                request.destroy();
            }
        });
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

function serveStaticFile(response, pathname) {
    const requestedPath = pathname === "/" ? "index.html" : pathname.replace(/^[/\\]+/, "");
    const filePath = path.normalize(path.join(root, requestedPath));
    const relativePath = path.relative(root, filePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        sendJson(response, 404, { error: "Page not found." });
        return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/api/health") {
        sendJson(response, 200, { status: "ok", service: "aladex-portfolio-api" });
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/contact") {
        try {
            const data = JSON.parse(await readRequestBody(request));
            const name = typeof data.name === "string" ? data.name.trim() : "";
            const email = typeof data.email === "string" ? data.email.trim() : "";
            const message = typeof data.message === "string" ? data.message.trim() : "";

            if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                sendJson(response, 400, { error: "Please provide a valid name, email, and message." });
                return;
            }

            fs.mkdirSync(messagesDirectory, { recursive: true });
            const messages = fs.existsSync(messagesFile)
                ? JSON.parse(fs.readFileSync(messagesFile, "utf8"))
                : [];
            messages.push({ id: randomUUID(), name, email, message, createdAt: new Date().toISOString() });
            fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

            if (!mailTransport || !contactRecipient) {
                sendJson(response, 503, { error: "The message was saved, but email delivery is not configured yet." });
                return;
            }

            await mailTransport.sendMail({
                from: `"Portfolio contact form" <${gmailUser}>`,
                to: contactRecipient,
                replyTo: email,
                subject: `New portfolio message from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\n\n${message}`
            });
            sendJson(response, 201, { message: "Thanks! Your message has been received." });
        } catch (error) {
            sendJson(response, 400, { error: "The message could not be submitted." });
        }
        return;
    }

    if (request.method === "GET") {
        serveStaticFile(response, url.pathname);
        return;
    }

    sendJson(response, 405, { error: "Method not allowed." });
});

server.listen(port, () => {
    console.log(`Portfolio running at http://localhost:${port}`);
});
