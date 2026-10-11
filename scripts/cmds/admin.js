const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

const MAIN_ADMIN_NAME = "亗 𝐎𝐍𝐋𝐘メ𝐌𝐀𝐒𝐓𝐄𝐑メ𝐒𝐀𝐊𝐈𝐁 亗";

// ⚠️ এখানে তোর আসল Facebook UID বসাবি
const OWNER = ["61594665311518"];

module.exports = {
  config: {
    name: "admin",
    version: "2.0.0",
    author: MAIN_ADMIN_NAME,
    countDown: 3,
    role: 0,
    description: "Main Admin and Operator management",
    category: "system",
    guide: {
      en:
        "admin add <UID>\n" +
        "admin remove <UID>\n" +
        "admin list\n" +
        "admin check <UID>"
    }
  },

  onStart: async function ({ message, args, event }) {
    const { threadID, senderID } = event;
    const action = (args[0] || "").toLowerCase();

    // Main Admin verification
    const isMainAdmin = OWNER.includes(String(senderID));

    // Read current operators
    const operators = (config.adminBot || []).map(String);

    if (action === "list") {
      const list = [
        `👑 MAIN ADMIN`,
        MAIN_ADMIN_NAME,
        `UID: ${OWNER[0]}`,
        "",
        `🛡️ OPERATORS (${operators.length}/2)`,
        operators.length
          ? operators.map((uid, i) => `${i + 1}. ${uid}`).join("\n")
          : "কোনো Operator নেই।"
      ];

      return message.reply(list.join("\n"));
    }

    if (action === "check") {
      const uid = String(args[1] || "").trim();

      if (!uid) {
        return message.reply("❌ ব্যবহার: admin check <UID>");
      }

      if (OWNER.includes(uid)) {
        return message.reply(
          `👑 ${MAIN_ADMIN_NAME}\nUID: ${uid}\nRole: Main Admin`
        );
      }

      if (operators.includes(uid)) {
        return message.reply(
          `🛡️ UID: ${uid}\nRole: Operator`
        );
      }

      return message.reply(`❌ UID ${uid} Admin বা Operator নয়।`);
    }

    if (action === "add") {
      if (!isMainAdmin) {
        return message.reply("⛔ শুধু Main Admin Operator যোগ করতে পারবে।");
      }

      const uid = String(args[1] || "").trim();

      if (!uid) {
        return message.reply("❌ ব্যবহার: admin add <UID>");
      }

      if (OWNER.includes(uid)) {
        return message.reply("👑 এই UID Main Admin হিসেবে সেট করা আছে।");
      }

      if (operators.includes(uid)) {
        return message.reply("⚠️ এই UID আগে থেকেই Operator।");
      }

      if (operators.length >= 2) {
        return message.reply("❌ সর্বোচ্চ ২ জন Operator রাখা যাবে।");
      }

      config.adminBot.push(uid);

      try {
        writeFileSync(
          global.client.dirConfig,
          JSON.stringify(config, null, 2),
          "utf8"
        );
      } catch (error) {
        config.adminBot = operators;
        return message.reply(
          "❌ Config save করা যায়নি। File path ও permission চেক কর।"
        );
      }

      return message.reply(
        `✅ Operator যোগ হয়েছে!\nUID: ${uid}\n` +
        `👑 Main Admin: ${MAIN_ADMIN_NAME}\n` +
        `🛡️ Operator: ${config.adminBot.length}/2`
      );
    }

    if (action === "remove") {
      if (!isMainAdmin) {
        return message.reply("⛔ শুধু Main Admin Operator বাদ দিতে পারবে।");
      }

      const uid = String(args[1] || "").trim();

      if (!uid) {
        return message.reply("❌ ব্যবহার: admin remove <UID>");
      }

      if (OWNER.includes(uid)) {
        return message.reply("❌ Main Admin-কে এখান থেকে বাদ দেওয়া যাবে না।");
      }

      if (!operators.includes(uid)) {
        return message.reply("❌ এই UID Operator তালিকায় নেই।");
      }

      config.adminBot = operators.filter(id => id !== uid);

      try {
        writeFileSync(
          global.client.dirConfig,
          JSON.stringify(config, null, 2),
          "utf8"
        );
      } catch (error) {
        config.adminBot = operators;
        return message.reply(
          "❌ Config save করা যায়নি। File path ও permission চেক কর।"
        );
      }

      return message.reply(
        `✅ Operator বাদ দেওয়া হয়েছে!\nUID: ${uid}\n` +
        `🛡️ বাকি Operator: ${config.adminBot.length}/2`
      );
    }

    return message.reply(
      `👑 ${MAIN_ADMIN_NAME}\n\n` +
      `📌 Commands:\n` +
      `admin add <UID>\n` +
      `admin remove <UID>\n` +
      `admin list\n` +
      `admin check <UID>`
    );
  }
};
