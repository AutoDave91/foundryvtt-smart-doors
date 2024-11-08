import { settingsKey } from "../settings.js";

// Tint the source door green when an unlocked alert is hovered
export function onRenderChatMessage(message, html, data) {
	// Tint the door that generated this message
	const source = message.flags.smartdoors?.source;
	if (!source) return;

	// Tint on mouse enter
	const mouseEnter = function () {
		const sourceDoor = canvas.controls.doors.children.find(
			door => door.wall.id === source.wall && door.wall.scene.id === source.scene,
		);
		if (sourceDoor) sourceDoor.icon.tint = 0x00FF00;
	};
	html.on("mouseenter", mouseEnter);

	// Remove tint on mouse leave
	const mouseLeave = function () {
		const sourceDoor = canvas.controls.doors.children.find(
			door => door.wall.id === source.wall && door.wall.scene.id === source.scene,
		);
		if (sourceDoor) sourceDoor.icon.tint = 0xffffff;
	};
	html.on("mouseleave", mouseLeave);

	// Localize the message
	html.find(".message-content")[0].innerText = game.i18n.localize("smart-doors.ui.unlockedDoorAlert");
}

// Creates a chat message stating that a player tried to open an unlocked door
export function onDoorRightClick() {
	// Check if this feature is enabled
	if (!game.settings.get(settingsKey, "unlockedDoorAlert")) return false;

	const state = this.wall.document.ds;
	const states = CONST.WALL_DOOR_STATES;

	// Only create messages when the door is unlocked.
	if (state !== states.UNLOCKED) return false;

	// Generate no message if the gm attempts to open the door
	if (game.user.isGM) return false;

	// Create and send the chat message
	const message = {};
	message.user = game.user.id;
	if (game.user.character) message.speaker = { actor: game.user.character };
	message.content = game.i18n.localize("smart-doors.ui.unlockedDoorAlert");
	message.sound = CONFIG.sounds.lock;
	message.flags = { smartdoors: { source: { wall: this.wall.id, scene: this.wall.scene.id } } };
	ChatMessage.create(message);
	return true;
}
