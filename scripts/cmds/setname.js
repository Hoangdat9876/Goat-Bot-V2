async function checkShortCut(nickname, uid, usersData) {
	/\{userName\}/gi.test(nickname) ? nickname = nickname.replace(/\{userName\}/gi, await usersData.getName(uid)) : null;
	/\{userID\}/gi.test(nickname) ? nickname = nickname.replace(/\{userID\}/gi, uid) : null;
	return nickname;
}

module.exports = {
	config: {
		name: "setname",
		version: "1.0",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: "Đổi biệt danh ",
		longDescription: "Đổi biệt danh của tất cả thành viên trong nhóm chat hoặc những thành viên được tag theo một định dạng",
		category: "box chat",
		guide: {
			body: "   {pn} {{<nick name>}}: thay đổi biệt danh của bản thân"
				+ "\n   {pn} {{@tags <nick name>}}: thay đổi biệt danh của những thành viên được tag"
				+ "\n   {pn} {{all <nick name>}}: thay đổi biệt danh của tất cả thành viên trong nhóm chat"
				+ "\n\nVới các shortcut có sẵn:"
				+ "\n   + {userName}: tên của thành viên"
				+ "\n   + {userID}: ID của thành viên"
				+ "\n\nVí dụ: (xem ảnh)",
			attachment: [
				__dirname + "/assets/guide/setname/guide1.png",
				__dirname + "/assets/guide/setname/guide2.png"
			]
		}
	},

	onStart: async function ({ args, message, event, api, usersData }) {
		const mentions = Object.keys(event.mentions);
		let uids = [];
		let nickname = args.join(" ");

		if (args[0] === "all" || mentions.includes(event.threadID)) {
			uids = (await api.getThreadInfo(event.threadID)).participantIDs;
			nickname = args[0] === "all" ? args.slice(1).join(" ") : nickname.replace(event.mentions[event.threadID], "").trim();
		}
		else if (mentions.length) {
			uids = mentions;
			const allName = new RegExp(Object.values(event.mentions).join("|"), "g");
			nickname = nickname.replace(allName, "").trim();
		}
		else {
			uids = [event.senderID];
			nickname = nickname.trim();
		}

		try {
			const uid = uids.shift();
			await api.changeNickname(await checkShortCut(nickname, uid, usersData), event.threadID, uid);
		}
		catch (e) {
			return message.reply(`Đã có lỗi xảy ra, thử tắt tính năng liên kết mời trong nhóm và thử lại sau`);
		}

		for (const uid of uids)
			await api.changeNickname(await checkShortCut(nickname, uid, usersData), event.threadID, uid);
	}
};