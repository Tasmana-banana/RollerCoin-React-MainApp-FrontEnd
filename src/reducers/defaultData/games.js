import rewardsList from "./rewardsList";

const games = [
	{
		id: 12,
		description: {
			en: "Guide your adventurous hamsters through a vertical maze of branches and platforms. Use your reaction skills to land on platforms and cling to them. Can you reach the top before time runs out?",
			cn: "Guide your adventurous hamsters through a vertical maze of branches and platforms. Use your reaction skills to land on platforms and cling to them. Can you reach the top before time runs out?",
		},
		name: "Hamster Climber",
		imgSmall: "12-small.png",
		time: 60,
		level: { level: 1, progress: 1, size: 3 },
		coolDown: 15,
		coolDownMaxForGame: 30,
		isNewPhaserGame: true,
		reward: 850,
		status: true,
		tag: "new",
		setReward(diff) {
			return rewardsList[12][diff];
		},
		setTime() {
			return 60;
		},
	},
	{
		id: 2,
		description: {
			en: "While test-driving a new Lambo Huracan Performante Spyder, you were robbed by an alien armada. They stole all your coins and now you must take back what is yours. ATTACK - the enemy can’t stand against you!",
			cn: "您被外星舰队抢劫了，他们偷了你所有的硬币。你現在必须取回属于你的东西！ 攻击 - 敌人无法抵抗你！",
		},
		name: "Token Blaster",
		imgSmall: "2-small.jpg",
		time: 40,
		level: { level: 1, progress: 1, size: 3 },
		coolDown: 0,
		coolDownMaxForGame: 30,
		isNewPhaserGame: true,
		reward: 0,
		status: true,
		setReward(diff) {
			return rewardsList[2][diff];
		},
		setTime() {
			return 40;
		},
	},
	{
		id: 10,
		description: {
			en: "Conquer the rooftops of RollerCoin city! It's just you, skateboard and shiny coins to collect. Jump over the obstacles, avoid angry birds and try not to fall. Press double jump to make a flip. Now GO and get as many coins as you can!",
			cn: "征服 RollerCoin城市， 跳过障碍物避開愤怒小鸟，尽量不要摔倒。 點兩下进行翻転 现在去获得尽可能多的硬币！",
		},
		name: "Token Surfer",
		imgSmall: "10-small.png",
		time: 60,
		level: { level: 1, progress: 1, size: 3 },
		coolDown: 0,
		coolDownMaxForGame: 30,
		isNewPhaserGame: true,
		reward: 840,
		status: true,
		setReward(diff) {
			return rewardsList[10][diff];
		},
		setTime() {
			return 60;
		},
	},
	{
		id: 4,
		description: {
			en: "This game is more like a traditional “arcanoid” game. Hit the hashes with a bitcoin block to get them in and earn mining power. Eventually, it will get to a point when it will be incredibly difficult to bring them all down, but there is no limit to perfection.",
			cn: "这个游戏是一个传统的“打砖块”游戏， 奌比特币來获得挖矿能力将它们全部击倒是非常困难的。當然有很多無限可能",
		},
		name: "Cryptonoid",
		imgSmall: "4-small.jpg",
		time: 60,
		level: { level: 1, progress: 1, size: 3 },
		coolDown: 0,
		coolDownMaxForGame: 30,
		isNewPhaserGame: true,
		reward: 0,
		setReward(diff) {
			return rewardsList[4][diff];
		},
		setTime() {
			return 60;
		},
	},
	{
		id: 5,
		description: {
			en: "Use your skills, logic, and imagination to eliminate more coins in this match-three puzzle game. Click and drag the coin to move it and make matches of up to five coins in a row – vertical or horizontal, but not diagonal. Good luck!",
			cn: "运用您的技能、逻辑和想象力消除更多硬币在这款三消益智游戏中。 单击并拖动硬币以移动它，并使最多五个硬币连续匹配 - 垂直或水平，但不是对角线。 祝你好运！",
		},
		name: "Coin-match",
		imgSmall: "5-small.png",
		coolDown: 0,
		coolDownMaxForGame: 30,
		time: 70,
		level: { level: 1, progress: 1, size: 3 },
		reward: 0,
		status: true,
		isNewPhaserGame: true,
		setReward(diff) {
			return rewardsList[5][diff];
		},
		setTime() {
			return 70;
		},
	},
	{
		id: 6,
		description: {
			en: "Crypto Hamster moves to the moon! The hero jumps automatically. You should use the left and right arrow key to move it from side to side. Be aware of aliens, press the Up-arrow button to kill them. Best of luck!",
			cn: "注意外星人，按向上箭头按钮杀死他们。 祝你好运！",
		},
		name: "Crypto Hamster",
		imgSmall: "6-small.png",
		time: 40,
		coolDown: 0,
		coolDownMaxForGame: 30,
		level: { level: 1, progress: 1, size: 3 },
		reward: 0,
		status: true,
		isNewPhaserGame: true,
		setReward(diff) {
			return rewardsList[6][diff];
		},
		setTime() {
			return 40;
		},
	},
	{
		id: 7,
		description: {
			en: "Slide the deck to stack two matching coins, every merge creates the coin of higher rank. You are playing against the clock, so better think fast! All ranks are listed on the right side. Caution: highly addictive.",
			cn: "滑动甲板堆叠两个匹配的硬币，每次合并都会产生更高等级的硬币。 您正在与时间赛跑，所以最好快点所有等级都列在右侧。",
		},
		name: "2048 Coins",
		imgSmall: "7-small.png",
		time: 60,
		coolDown: 0,
		coolDownMaxForGame: 30,
		level: { level: 1, progress: 1, size: 3 },
		reward: 0,
		status: true,
		isNewPhaserGame: true,
		setReward(diff) {
			return rewardsList[7][diff];
		},
		setTime() {
			return 40;
		},
	},
	{
		id: 8,
		description: {
			en: "Click on the miner to check which coin it has been working for. Try matching the coins to clear them all out and earn the remaining hashrate.",
			cn: "单击矿机检查它为挖个代币，尝试匹配硬币以清除它们并获得剩余的哈希值。",
		},
		name: "Coin-Flip",
		imgSmall: "8-small.png",
		time: 60,
		coolDown: 0,
		coolDownMaxForGame: 30,
		level: { level: 1, progress: 1, size: 3 },
		reward: 0,
		isNewPhaserGame: true,
		status: true,
		setReward(diff) {
			return rewardsList[8][diff];
		},
		setTime() {
			return 60;
		},
	},
	{
		id: 9,
		description: {
			en: "Test your speed and reaction in the latest 3D-Tetris machine. Rotate the blocks faster and be aware of these colorful monsters - they can help you to complete the stack or block your way out!",
			cn: "在最新的 3D-Tetris 机器测试您的速度和反应。 更快地旋转方块并注意这些五颜六色的怪物 - 它们可以帮助您完成堆叠或阻挡您的出路！",
		},
		name: "Dr.Hamster",
		imgSmall: "9-small.png",
		time: 60,
		level: { level: 1, progress: 1, size: 3 },
		coolDown: 0,
		coolDownMaxForGame: 30,
		isNewPhaserGame: true,
		reward: 896,
		status: true,
		setReward(diff) {
			return rewardsList[9][diff];
		},
		setTime() {
			return 60;
		},
	},
	{
		id: 3,
		description: {
			en: "Hamster is making his way through the Crypto Galaxy in search for new planets to build more mining facilities. Make sure he gets to the destination in one piece. Help him avoid candlesticks and market fluctuations!",
			cn: "仓鼠正在穿越加密星系寻找新的行星來建造更多的采矿设施。 确保他能到达目的地快帮助他避免烛台和市场有波动！",
		},
		name: "Flappy Rocket",
		imgSmall: "3-small.jpg",
		time: 40,
		level: { level: 1, progress: 1, size: 3 },
		coolDown: 0,
		coolDownMaxForGame: 30,
		reward: 0,
		status: true,
		isNewPhaserGame: true,
		setReward(diff) {
			return rewardsList[3][diff];
		},
		setTime() {
			return 30;
		},
	},
	{
		id: 11,
		description: {
			en: "Ride your brand new Lambo across the streets of RollerCoin City! Your goal is to avoid other cars, construction sites, and other obstacles while collecting those shiny coins. 1 Lambo, 3 lives, plenty of cryptos. Enjoy!",
			cn: "Ride your brand new Lambo across the streets of RollerCoin City! Your goal is to avoid other cars, construction sites, and other obstacles while collecting those shiny coins. 1 Lambo, 3 lives, plenty of cryptos. Enjoy!",
		},
		name: "Lambo Rider: Miami",
		imgSmall: "11-small-new.png",
		time: 60,
		level: { level: 1, progress: 1, size: 3 },
		coolDown: 0,
		coolDownMaxForGame: 30,
		isNewPhaserGame: true,
		reward: 680,
		status: true,
		setReward(diff) {
			return rewardsList[11][diff];
		},
		setTime() {
			return 60;
		},
	},
	{
		id: 1,
		description: {
			en: "Bring down all the falling coins by clicking on them before they reach the ground. You can hit as many as you can see on the screen. More downed coins means more reward. Be strong!",
			cn: "您在屏幕上看到尽可能多的球击落的硬币越多意味着更多的奖励",
		},
		name: "Coinclick",
		imgSmall: "1-small.jpg",
		time: 40,
		level: { level: 1, progress: 1, size: 3 },
		coolDown: 0,
		coolDownMaxForGame: 30,
		isNewPhaserGame: true,
		reward: 0,
		status: true,
		setReward(diff) {
			return rewardsList[1][diff];
		},
		setTime() {
			return 40;
		},
	},
];
export default games;
