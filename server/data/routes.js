const getProfileTitle = require("../helpers/getProfileTitle");

const mainRoutes = [
	{
		route: "/",
		entryPoint: "index",
		title: {
			en: "Mining Game RollerCoin: Play Now for Free | RollerCoin",
			cn: "比特币挖矿模拟器——开始通过玩挖矿货币游戏获得比特币 | 滾币 RollerCoin",
		},
		description: {
			en: "RollerCoin is the first bitcoin mining simulator game online: gain real cryptocurrencies while playing. Build your virtual data center and start mining BTC now!",
			cn: "滾币RollerCoin是一款在线比特币挖矿模拟游戏，您可通由玩游戏实时获得真的加密货币。建立您的虚拟数据中心，并开始挖矿比特币",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "bitcoin game, crypto mining game, bitcoin mining game, bitcoin mining simulator, crypto game, play games for bitcoins, bitcoin miner game, bitcoin mining simulator for real bitcoin, bitcoin mine simulator, bitcoin mine game",
			cn: "比特币游戏，加密货币挖矿游戏，比特币挖矿游戏，比特币挖矿模拟器，加密货币游戏，玩比特币游戏，比特币矿机游戏，真实比特币的比特币挖矿模拟器，挖矿比特币模拟器，比特币挖矿游戏，玩游戏獲取比特币，玩游戏獲取加密货币 ",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: true,
			follow: true,
		},
	},
	{
		route: "/new-game",
		entryPoint: "index",
		title: {
			en: "Mining Game RollerCoin: Play Now for Free | RollerCoin",
			cn: "比特币挖矿模拟器——开始通过玩挖矿货币游戏获得比特币 | 滾币 RollerCoin",
		},
		description: {
			en: "RollerCoin is the first bitcoin mining simulator game online: gain real cryptocurrencies while playing. Build your virtual data center and start mining BTC now!",
			cn: "滾币RollerCoin是一款在线比特币挖矿模拟游戏，您可通由玩游戏实时获得真的加密货币。建立您的虚拟数据中心，并开始挖矿比特币",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "bitcoin game, crypto mining game, bitcoin mining game, bitcoin mining simulator, crypto game, play games for bitcoins, bitcoin miner game, bitcoin mining simulator for real bitcoin, bitcoin mine simulator, bitcoin mine game",
			cn: "比特币游戏，加密货币挖矿游戏，比特币挖矿游戏，比特币挖矿模拟器，加密货币游戏，玩比特币游戏，比特币矿机游戏，真实比特币的比特币挖矿模拟器，挖矿比特币模拟器，比特币挖矿游戏，玩游戏獲取比特币，玩游戏獲取加密货币 ",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/sign-in", "/sign-in/step-2"],
		entryPoint: "index",
		title: {
			en: "Log In | RollerCoin.com",
			cn: "登录 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
		canonical: "/sign-in",
	},
	{
		route: ["/sign-up", "/sign-up/step-2"],
		entryPoint: "index",
		title: {
			en: "Sign Up | RollerCoin.com",
			cn: "注册 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
		canonical: "/sign-up",
	},
	{
		route: ["/restore", "/restore/step-2", "/restore/step-3"],
		entryPoint: "index",
		title: {
			en: "Restore password | RollerCoin.com",
			cn: "登录 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
		canonical: "/restore",
	},
	{
		route: "/reset-password/:token",
		entryPoint: "index",
		title: {
			en: "Reset Password | RollerCoin.com",
			cn: "登录 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: "/rank",
		entryPoint: "index",
		title: {
			en: `Game Rankings | RollerCoin.com`,
			cn: `游戏排名 | RollerCoin.com`,
		},
		titleFunc: (lang, req) => `${lang === "en" ? `Game Rankings | RollerCoin.com | Page #${req.query.page || 1}` : `游戏排名 | RollerCoin.com | Page #${req.query.page || 1}`}`,
		description: {
			en: "Check your rankings and find your place among friends and competitors. Get to the top and be the best!",
			cn: "检查您的排名，在朋友和竞争对手中找到您的位置。爬到顶端，做最好的！",
		},
		hasPageQuery: true,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: "/confirm-withdrawal/:token",
		entryPoint: "index",
		title: {
			en: "Confirm withdrawal | RollerCoin.com",
			cn: "确认取款 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/referral", "/referral/info"],
		entryPoint: "index",
		title: {
			en: "Referral | RollerCoin.com",
			cn: "推荐 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: true,
			follow: true,
		},
		canonical: "/referral",
		dynamicRouteType: "referral",
	},
	{
		route: "/email-verify",
		entryPoint: "index",
		title: {
			en: "Email verify | RollerCoin.com",
			cn: "做得好 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/games", "/games/play"],
		entryPoint: "index",
		title: {
			en: "Play Free 8-bit Crypto Games to Gain More Mining Power | RollerCoin",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "Play our crypto games, complete missions, get more mining power, which will give you the opportunity to build the coolest mining empire ever. Go for it!",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: [
			"/game",
			"/game/market",
			"/game/market/racks",
			"/game/market/miners",
			"/game/market/lootboxes",
			"/game/market/parts",
			"/game/market/sales",
			"/game/market/crafting-offer",
			"/game/market/skins",
			"/game/market/avatar-hats",
			"/game/market/season-pass",
			"/game/market/season-pass/quests",
			"/game/market/season-store",
			"/game/market/trophies",
			"/game/choose_game",
			"/game/play_game",
		],
		entryPoint: "index",
		title: {
			en: "RollerCoin – Online Bitcoin Mining Simulator Game",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
		dynamicRouteType: "game",
	},
	{
		route: ["/storage", "/storage/inventory", "/storage/merge", "/storage/merge/parts", "/storage/merge/miners", "/storage/collection"],
		entryPoint: "index",
		title: {
			en: "RollerCoin – Online Bitcoin Mining Simulator Game",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/taskwall", "/taskwall/payout-history", "/taskwall/task-list", "/taskwall/leaderboard", "/taskwall/leaderboard/weekly", "/taskwall/leaderboard/grand", "/taskwall/how-it-works"],
		entryPoint: "index",
		title: {
			en: "RollerCoin – Online Bitcoin Mining Simulator Game",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: "/game/play_game",
		entryPoint: "index",
		title: {
			en: "RollerCoin – Online Bitcoin Mining Simulator Game",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "/game",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/referral/stats", "/referral/stats/:currency", "/referral/promo"],
		entryPoint: "index",
		title: {
			en: "Referral | RollerCoin.com",
			cn: "推荐 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/profile/nft-collection", "/profile/income-stats", "/profile/profile-stats", "/profile/personal-profile", "/profile"],
		entryPoint: "index",
		title: {
			en: "My profile | RollerCoin.com",
			cn: "我的资料 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: false,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/p/:id", "/p/:id/games", "/p/:id/power", "/p/:id/rank"],
		entryPoint: "index",
		title: {
			en: `User profile | RollerCoin.com`,
			cn: `用户配置文件 | RollerCoin.com`,
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		titleFunc: getProfileTitle,
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/wallet", "/wallet/token"],
		entryPoint: "index",
		title: {
			en: `Your Wallet | RollerCoin.com`,
			cn: `您的钱包 | RollerCoin.com`,
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
		dynamicRouteType: "wallet",
	},
	{
		route: "/what-is-rollertoken",
		entryPoint: "index",
		title: {
			en: `What is RollerToken and Why Do You Need It? | RollerCoin`,
			cn: `RollerToken是什么？ | RollerCoin.com`,
		},
		description: {
			en: "RollerToken is a new virtual currency that will be the primary minable token and a valid method to purchase in-game items. Get to know more what is it and why do you need this token.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: false,
		},
		robots: {
			index: true,
			follow: true,
		},
	},
	{
		route: "/hall-of-fame",
		entryPoint: "index",
		title: {
			en: "Top Contributors Contest | RollerCoin.com",
			cn: "顶级贡献者比赛 | RollerCoin.com",
		},
		description: {
			en: "We are honored to announce our special event - Top Contributors Contest. This event starts now and will only be active during RLT Pre-Sale that lasts until November 20, 2019.",
			cn: "我们很荣幸地宣布我们的特别活动-顶级贡献者比赛。此活动现在开始，仅在RLT预售期间有效，有效期至2019年11月20日。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: false,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/network-power"],
		entryPoint: "index",
		title: {
			en: "Network Power – View Your Power Chart for BTC, DOGE, ETH, RLT | RollerCoin",
			cn: "网络挖矿功率数据 | RollerCoin.com",
		},
		description: {
			en: "Check out your power chart, current round duration, block daily reward, average time per block and active miners per block for BTC, DOGE, ETH, RLT.",
			cn: "查看RollerCoin挖矿网络的最新实时统计数据，包括网络功率、区块大小和奖励。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: false,
		},
		robots: {
			index: false,
			follow: true,
		},
		dynamicRouteType: "networkPower",
	},
	{
		route: [
			"/marketplace/buy",
			"/marketplace/buy/:type/:id",
			"/marketplace/sell",
			"/marketplace/sell/:type",
			"/marketplace/sell/:type/:id",
			"/marketplace/orders",
			"/marketplace/orders/:type",
			"/marketplace",
		],
		entryPoint: "index",
		title: {
			en: "Mining Game RollerCoin: Play Now for Free | RollerCoin",
			cn: "比特币挖矿模拟器——开始通过玩挖矿货币游戏获得比特币 | 滾币 RollerCoin",
		},
		description: {
			en: "RollerCoin is the first bitcoin mining simulator game online: gain real cryptocurrencies while playing. Build your virtual data center and start mining BTC now!",
			cn: "滾币RollerCoin是一款在线比特币挖矿模拟游戏，您可通由玩游戏实时获得真的加密货币。建立您的虚拟数据中心，并开始挖矿比特币",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "bitcoin game, crypto mining game, bitcoin mining game, bitcoin mining simulator, crypto game, play games for bitcoins, bitcoin miner game, bitcoin mining simulator for real bitcoin, bitcoin mine simulator, bitcoin mine game",
			cn: "比特币游戏，加密货币挖矿游戏，比特币挖矿游戏，比特币挖矿模拟器，加密货币游戏，玩比特币游戏，比特币矿机游戏，真实比特币的比特币挖矿模拟器，挖矿比特币模拟器，比特币挖矿游戏，玩游戏獲取比特币，玩游戏獲取加密货币 ",
		},
		hreflang: {
			en: true,
			cn: false,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: "/landing-sale-event",
		entryPoint: "index",
		title: {
			en: "Landing Sale Event | RollerCoin",
			cn: "Landing Sale Event | RollerCoin",
		},
		description: {
			en: "Welcome to RollerCoin! Join our Landing Sale Event - buy new miners, increase you Mining Power, get bonuses & rewards! Become a part of rollers' community right now!",
			cn: "Welcome to RollerCoin! Join our Landing Sale Event - buy new miners, increase you Mining Power, get bonuses & rewards! Become a part of rollers' community right now!",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: false,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	// {
	// 	route: ["/special-event", "/special-event/shop", "/special-event/how-it-works"],
	// 	entryPoint: "index",
	// 	title: {
	// 		en: "Special Event | RollerCoin",
	// 		cn: "Special Sale Event | RollerCoin",
	// 	},
	// 	description: {
	// 		en: "Welcome to RollerCoin! Join our Landing Sale Event - buy new miners, increase you Mining Power, get bonuses & rewards! Become a part of rollers' community right now!",
	// 		cn: "Welcome to RollerCoin! Join our Landing Sale Event - buy new miners, increase you Mining Power, get bonuses & rewards! Become a part of rollers' community right now!",
	// 	},
	// 	hasPageQuery: false,
	// 	middleware: [],
	// 	redirect: "",
	// 	reactRedirect: "",
	// 	keywords: {
	// 		en: "",
	// 		cn: "",
	// 	},
	// 	hreflang: {
	// 		en: true,
	// 		cn: false,
	// 	},
	// 	robots: {
	// 		index: false,
	// 		follow: true,
	// 	},
	// },
	{
		route: "/thank-you-user-save",
		entryPoint: "thank-you",
		title: {
			en: "Thank you for registration | RollerCoin.com",
			cn: "感谢您的注册 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "/game/choose_game",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/thank-you-verify", "/thank-you-fb"],
		entryPoint: "thank-you",
		title: {
			en: "Thank you for registration | RollerCoin.com",
			cn: "感谢您的注册 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "/game/choose_game",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
	{
		route: ["/customize-avatar", "/customize-avatar/nft"],
		entryPoint: "index",
		title: {
			en: "Customize Your Avatar | RollerCoin.com",
			cn: "Customize Your Avatar | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
		hasPageQuery: false,
		middleware: [],
		redirect: "",
		reactRedirect: "",
		keywords: {
			en: "",
			cn: "",
		},
		hreflang: {
			en: true,
			cn: true,
		},
		robots: {
			index: false,
			follow: true,
		},
	},
];
module.exports = mainRoutes;
