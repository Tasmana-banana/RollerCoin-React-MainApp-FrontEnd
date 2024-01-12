import { lazy } from "react";

const FrontPagePage = lazy(() => import(/* webpackPrefetch: true */ "../views/FrontPage"));
const CustomizeAvatarPage = lazy(() => import("../views/CustomizeAvatarPage"));
const RankPage = lazy(() => import("../views/Leaderboard"));
const WithdrawalConfirmationPage = lazy(() => import("../views/WithdrawalConfirmation"));
const WhatIsRollertokenPage = lazy(() => import("../views/Static/WhatIsRollertoken"));
const HallOfFamePage = lazy(() => import("../views/HallOfFame"));
const ReferralPage = lazy(() => import("../views/Referral"));
const PublicProfilePage = lazy(() => import("../views/PublicProfile"));
const NetworkPowerPage = lazy(() => import("../views/PowerChart"));

const GamePage = lazy(() => import("../views/Game"));
const StoragePage = lazy(() => import("../views/Storage"));
const MarketPage = lazy(() => import("../views/Market"));
const WalletPage = lazy(() => import("../views/Wallet"));
const OfferwallPage = lazy(() => import("../views/Offerwall"));
const ProfilePage = lazy(() => import("../views/Profile"));
const MarketplacePage = lazy(() => import("../views/Marketplace"));
const LandingSaleEventPage = lazy(() => import("../views/Landings/LandingSaleEvent"));
const SystemSaleEvent = lazy(() => import("../views/SystemSaleEvent"));
const SpinEvent = lazy(() => import("../views/SpinEvent"));

const GamesPage = lazy(() => import("../views/Games"));
const GamesPlayPage = lazy(() => import("../views/Games/Play"));
const SignInPage = lazy(() => import("../views/SignIn"));
const SendCodePage = lazy(() => import("../views/SignIn/SendCodePage"));
const CompleteRegistrationPage = lazy(() => import("../views/SignIn/CompleteRegistration"));

// Routes
const FrontPageRoute = {
	path: "/",
	helmet: {
		title: {
			en: "Mining Game RollerCoin: Play Now for Free | RollerCoin",
			cn: "比特币挖矿模拟器——开始通过玩挖矿货币游戏获得比特币 | 滾币 RollerCoin",
		},
		description: {
			en: "RollerCoin is the first bitcoin mining simulator game online: gain real cryptocurrencies while playing. Build your virtual data center and start mining BTC now!",
			cn: "滾币RollerCoin是一款在线比特币挖矿模拟游戏，您可通由玩游戏实时获得真的加密货币。建立您的虚拟数据中心，并开始挖矿比特币",
		},
		keywords: {
			en: "bitcoin game, crypto mining game, bitcoin mining game, bitcoin mining simulator, crypto game, play games for bitcoins, bitcoin miner game, bitcoin mining simulator for real bitcoin, bitcoin mine simulator, bitcoin mine game",
			cn: "比特币游戏，加密货币挖矿游戏，比特币挖矿游戏，比特币挖矿模拟器，加密货币游戏，玩比特币游戏，比特币矿机游戏，真实比特币的比特币挖矿模拟器，挖矿比特币模拟器，比特币挖矿游戏",
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
	exact: true,
	layout: "basic",
	component: FrontPagePage,
};
const FrontNewGameRoute = {
	path: "/new-game",
	helmet: {
		title: {
			en: "Mining Game RollerCoin: Play Now for Free | RollerCoin",
			cn: "比特币挖矿模拟器——开始通过玩挖矿货币游戏获得比特币 | 滾币 RollerCoin",
		},
		description: {
			en: "RollerCoin is the first bitcoin mining simulator game online: gain real cryptocurrencies while playing. Build your virtual data center and start mining BTC now!",
			cn: "滾币RollerCoin是一款在线比特币挖矿模拟游戏，您可通由玩游戏实时获得真的加密货币。建立您的虚拟数据中心，并开始挖矿比特币",
		},
		keywords: {
			en: "bitcoin game, crypto mining game, bitcoin mining game, bitcoin mining simulator, crypto game, play games for bitcoins, bitcoin miner game, bitcoin mining simulator for real bitcoin, bitcoin mine simulator, bitcoin mine game",
			cn: "比特币游戏，加密货币挖矿游戏，比特币挖矿游戏，比特币挖矿模拟器，加密货币游戏，玩比特币游戏，比特币矿机游戏，真实比特币的比特币挖矿模拟器，挖矿比特币模拟器，比特币挖矿游戏",
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
	exact: true,
	layout: "basic",
	component: FrontPagePage,
};
const CustomizeAvatarRoute = {
	path: ["/customize-avatar", "/customize-avatar/nft"],
	helmet: {
		title: {
			en: "Customize Your Avatar | RollerCoin.com",
			cn: "自定义您的头像 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: CustomizeAvatarPage,
};
const RankRoute = {
	path: "/rank",
	helmet: {
		title: {
			en: "Game Rankings | RollerCoin.com",
			cn: "游戏排名 | RollerCoin.com",
		},
		description: {
			en: "Check your rankings and find your place among friends and competitors. Get to the top and be the best!",
			cn: "检查您的排名，在朋友和竞争对手中找到您的位置。爬到顶端，做最好的！",
		},
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
	exact: true,
	layout: "basic",
	component: RankPage,
};
const WithdrawalConfirmationRoute = {
	path: "/confirm-withdrawal/:token",
	helmet: {
		title: {
			en: "Confirm withdrawal | RollerCoin.com",
			cn: "确认取款 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: WithdrawalConfirmationPage,
};
const WhatIsRollertokenRoute = {
	path: "/what-is-rollertoken",
	helmet: {
		title: {
			en: "What is RollerToken and Why Do You Need It? | RollerCoin",
			cn: "RollerToken是什么？ | RollerCoin.com",
		},
		description: {
			en: "RollerToken is a new virtual currency that will be the primary minable token and a valid method to purchase in-game items. Get to know more what is it and why do you need this token.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: WhatIsRollertokenPage,
};
const HallOfFameRoute = {
	path: "/hall-of-fame",
	helmet: {
		title: {
			en: "Top Contributors Contest | RollerCoin.com",
			cn: "顶级贡献者比赛 | RollerCoin.com",
		},
		description: {
			en: "We are honored to announce our special event - Top Contributors Contest. This event starts now and will only be active during RLT Pre-Sale that lasts until November 20, 2019.",
			cn: "我们很荣幸地宣布我们的特别活动-顶级贡献者比赛。此活动现在开始，仅在RLT预售期间有效，有效期至2019年11月20日。",
		},
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
	exact: true,
	layout: "basic",
	component: HallOfFamePage,
};
const ReferralMainRoute = {
	path: ["/referral", "/referral/info"],
	helmet: {
		title: {
			en: "Referral | RollerCoin.com",
			cn: "推荐 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	},
	exact: true,
	layout: "basic",
	component: ReferralPage,
};
const ReferralRoute = {
	path: ["/referral/stats", "/referral/promo"],
	helmet: {
		title: {
			en: "Referral | RollerCoin.com",
			cn: "推荐 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
		canonical: "/referral",
	},
	exact: true,
	layout: "basic",
	component: ReferralPage,
	dynamicRouteType: "referral",
};
const PublicProfileRoute = {
	path: ["/p/:id", "/p/:id/power", "/p/:id/power", "/p/:id/games", "/p/:id/rank"],
	helmet: {
		title: {
			en: "User profile | RollerCoin.com",
			cn: "用户配置文件 | RollerCoin.com",
		},
		description: {
			en: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends.",
		},
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
	exact: true,
	layout: "basic",
	component: PublicProfilePage,
};
const NetworkPowerRoute = {
	path: ["/network-power"],
	helmet: {
		title: {
			en: "Network Power – View Your Power Chart for BTC, DOGE, ETH, BNB, MATIC, LTC, SOL, RLT | RollerCoin",
			cn: "网络挖矿功率数据 | RollerCoin.com",
		},
		description: {
			en: "Check out your power chart, current round duration, block daily reward, average time per block and active miners per block for BTC, DOGE, ETH, RLT.",
			cn: "查看RollerCoin挖矿网络的最新实时统计数据，包括网络功率、区块大小和奖励。",
		},
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
	exact: true,
	layout: "basic",
	component: NetworkPowerPage,
	dynamicRouteType: "networkPower",
};
const GameRoute = {
	path: ["/game", "/game/choose_game", "/game/play_game"],
	helmet: {
		title: {
			en: "RollerCoin – Online Bitcoin Mining Simulator Game",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: GamePage,
};
const MarketRoute = {
	path: [
		"/game/market/sales",
		"/game/market/crafting-offer",
		"/game/market/racks",
		"/game/market/miners",
		"/game/market/lootboxes",
		// "/game/market/parts",
		"/game/market/skins",
		"/game/market/avatar-hats",
		"/game/market/trophies",
		"/game/market/season-pass",
		"/game/market/season-store",
		"/game/market/special-event-store",
		"/game/market/season-pass/quests",
		"/game/market",
	],
	helmet: {
		title: {
			en: "RollerCoin – Online Bitcoin Mining Simulator Game",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	dynamicRouteType: "game",
	component: MarketPage,
};
const StorageRoute = {
	path: ["/storage", "/storage/inventory", "/storage/merge", "/storage/merge/parts", "/storage/merge/miners", "/storage/collection"],
	helmet: {
		title: {
			en: "RollerCoin – Online Bitcoin Mining Simulator Game",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: StoragePage,
};

const WalletRoute = {
	path: ["/wallet", "/wallet/token"],
	helmet: {
		title: {
			en: "Your Wallet | RollerCoin.com",
			cn: "您的钱包 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: WalletPage,
	dynamicRouteType: "wallet",
};
const OfferwallRoute = {
	path: ["/taskwall/how-it-works", "/taskwall/payout-history", "/taskwall/task-list", "/taskwall/leaderboard", "/taskwall/leaderboard/weekly", "/taskwall/leaderboard/grand", "/taskwall"],
	helmet: {
		title: {
			en: "Your Offerwall | RollerCoin.com",
			cn: "Your Offerwall | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: OfferwallPage,
};
const ProfileRoute = {
	path: ["/profile/nft-collection", "/profile/income-stats", "/profile/profile-stats", "/profile/personal-profile", "/profile"],
	helmet: {
		title: {
			en: "My profile | RollerCoin.com",
			cn: "我的资料 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: ProfilePage,
};
const GamesRoute = {
	path: "/games",
	helmet: {
		title: {
			en: "Play Free 8-bit Crypto Games to Gain More Mining Power | RollerCoin",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "Play our crypto games, complete missions, get more mining power, which will give you the opportunity to build the coolest mining empire ever. Go for it!",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: GamesPage,
};
const GamesPlayRoute = {
	path: "/games/play",
	helmet: {
		title: {
			en: "Play Free 8-bit Crypto Games to Gain More Mining Power | RollerCoin",
			cn: "RollerCoin——在线比特币挖掘模拟游戏",
		},
		description: {
			en: "Play our crypto games, complete missions, get more mining power, which will give you the opportunity to build the coolest mining empire ever. Go for it!",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "basic",
	component: GamesPlayPage,
};
const MarketplaceRoute = {
	path: [
		"/marketplace/buy",
		"/marketplace/buy/:type/:id",
		"/marketplace/sell",
		"/marketplace/sell/:type",
		"/marketplace/sell/:type/:id",
		"/marketplace/orders",
		"/marketplace/orders/:type",
		"/marketplace",
	], // TODO
	helmet: {
		title: {
			en: "Mining Game RollerCoin: Play Now for Free | RollerCoin",
			cn: "比特币挖矿模拟器——开始通过玩挖矿货币游戏获得比特币 | 滾币 RollerCoin",
		},
		description: {
			en: "RollerCoin is the first bitcoin mining simulator game online: gain real cryptocurrencies while playing. Build your virtual data center and start mining BTC now!",
			cn: "滾币RollerCoin是一款在线比特币挖矿模拟游戏，您可通由玩游戏实时获得真的加密货币。建立您的虚拟数据中心，并开始挖矿比特币",
		},
		keywords: {
			en: "bitcoin game, crypto mining game, bitcoin mining game, bitcoin mining simulator, crypto game, play games for bitcoins, bitcoin miner game, bitcoin mining simulator for real bitcoin, bitcoin mine simulator, bitcoin mine game",
			cn: "比特币游戏，加密货币挖矿游戏，比特币挖矿游戏，比特币挖矿模拟器，加密货币游戏，玩比特币游戏，比特币矿机游戏，真实比特币的比特币挖矿模拟器，挖矿比特币模拟器，比特币挖矿游戏",
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
	exact: true,
	layout: "basic",
	component: MarketplacePage,
};
const LandingSaleEventRoute = {
	path: "/landing-sale-event",
	helmet: {
		title: {
			en: "Landing Sale Event | RollerCoin",
			cn: "Landing Sale Event | RollerCoin",
		},
		description: {
			en: "Welcome to RollerCoin! Join our Landing Sale Event - buy new miners, increase you Mining Power, get bonuses & rewards! Become a part of rollers' community right now!",
			cn: "Welcome to RollerCoin! Join our Landing Sale Event - buy new miners, increase you Mining Power, get bonuses & rewards! Become a part of rollers' community right now!",
		},
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
	exact: true,
	layout: "basic",
	component: LandingSaleEventPage,
};

// Dynamic Rout Start
const SystemSaleEventRoute = {
	path: [],
	helmet: {
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
	exact: true,
	layout: "basic",
	dynamicRouteType: "system_sales_event",
	component: SystemSaleEvent,
};

const SpinEventRoute = {
	path: [],
	helmet: {
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
	exact: true,
	layout: "basic",
	dynamicRouteType: "spin_event",
	component: SpinEvent,
};

// Dynamic Route END

const SignUpRoute = {
	path: "/sign-up",
	helmet: {
		title: {
			en: "Sign-up | RollerCoin.com",
			cn: "注册 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "registration",
	component: SignInPage,
};

const SignInRoute = {
	path: "/sign-in",
	helmet: {
		title: {
			en: "Log In | RollerCoin.com",
			cn: "登录 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "registration",
	component: SignInPage,
};

const SignInStep2Route = {
	path: "/sign-in/step-2",
	helmet: {
		title: {
			en: "Log In | RollerCoin.com",
			cn: "登录 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "registration",
	component: SendCodePage,
};

const SignInStep3Route = {
	path: "/sign-in/step-3",
	helmet: {
		title: {
			en: "Log In | RollerCoin.com",
			cn: "登录 | RollerCoin.com",
		},
		description: {
			en: "❰❰❰ RollerCoin ❱❱❱ is the first online bitcoin mining simulator game ☛ Start Playing Now! ☚ Earn real bitcoins while enjoying the game and competing with your friends.",
			cn: "❰❰❰ RollerCoin ❱❱❱ 是第一款在线比特币挖掘模拟游戏 ☛开始玩吧！ ☚ 在享受游戏和与朋友竞争的同时，赚取真正的比特币。",
		},
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
	exact: true,
	layout: "registration",
	component: CompleteRegistrationPage,
};

export const onlyNotAuthRoutes = [GamesRoute, GamesPlayRoute, SignUpRoute, SignInRoute, SignInStep2Route, SignInStep3Route];
export const privateRoutes = [
	WithdrawalConfirmationRoute,
	CustomizeAvatarRoute,
	GameRoute,
	WalletRoute,
	ProfileRoute,
	HallOfFameRoute,
	MarketRoute,
	MarketplaceRoute,
	StorageRoute,
	LandingSaleEventRoute,
	SpinEventRoute,
	SystemSaleEventRoute,
	OfferwallRoute,
];
export const notProtectedRoutes = [FrontPageRoute, FrontNewGameRoute, RankRoute, WhatIsRollertokenRoute, ReferralMainRoute, ReferralRoute, PublicProfileRoute, NetworkPowerRoute];
// all routes

export default [
	FrontPageRoute,
	FrontNewGameRoute,
	CustomizeAvatarRoute,
	RankRoute,
	WithdrawalConfirmationRoute,
	WhatIsRollertokenRoute,
	HallOfFameRoute,
	ReferralMainRoute,
	ReferralRoute,
	PublicProfileRoute,
	NetworkPowerRoute,
	GameRoute,
	WalletRoute,
	OfferwallRoute,
	ProfileRoute,
	GamesRoute,
	MarketRoute,
	MarketplaceRoute,
	GamesPlayRoute,
	SignUpRoute,
	SignInRoute,
	SignInStep2Route,
	SignInStep3Route,
	StorageRoute,
	LandingSaleEventRoute,
	SystemSaleEventRoute,
	SpinEventRoute,
];
