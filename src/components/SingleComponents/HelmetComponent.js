import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import { notProtectedRoutes, onlyNotAuthRoutes, privateRoutes } from "../../routes/Routes";

const defaultHelmetData = {
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
		default: "",
		en: "",
		cn: "",
	},
	canonical: "",
	robots: { index: false, follow: true },
};
const HelmetComponent = ({ location, language }) => {
	const [helmetData, setHelmetData] = useState({
		title: "",
		description: "",
		keywords: "",
		hreflang: "",
		canonical: "",
		robots: "",
	});

	useEffect(() => {
		updateSEO();
	}, [location.pathname]);

	useEffect(() => {
		if (location.search && location.pathname === "/rank") {
			updateSEO();
		}
	}, [location.search]);

	const replacePublicProfileLink = (route) => {
		if (route.startsWith("/p/") && ["/games", "/power", "/rank"].some((path) => route.endsWith(path))) {
			const urlComponents = route.split("/");
			urlComponents[2] = ":id";
			return urlComponents.join("/");
		}
		return route;
	};

	const updateSEO = () => {
		const searchRoute = location.pathname.replace(getLanguagePrefix(language), "") || "/";
		const routers = [...notProtectedRoutes, ...privateRoutes, ...onlyNotAuthRoutes];
		const routeData = routers.find((route) => route.path === searchRoute || (Array.isArray(route.path) && route.path.includes(replacePublicProfileLink(searchRoute))));

		if (routeData) {
			const preparedHreflang = {};
			const searchParams = new URLSearchParams(window.location.search);
			if (searchRoute !== "/" || (searchRoute === "/" && !searchParams.get("r"))) {
				preparedHreflang.en = routeData.helmet.hreflang.en ? decodeURI(`${window.origin}${getLanguagePrefix("en")}${searchRoute}`).replace(/\/$/, "") : "";
				preparedHreflang.cn = routeData.helmet.hreflang.cn ? decodeURI(`${window.origin}${getLanguagePrefix("cn")}${searchRoute}`).replace(/\/$/, "") : "";
				preparedHreflang.default = decodeURI(`${window.origin}${searchRoute}`).replace(/\/$/, "");
			}
			let preparedCanonical = routeData.helmet.canonical
				? decodeURI(`${window.origin}${getLanguagePrefix(language)}${routeData.helmet.canonical}`).replace(/\/$/, "")
				: decodeURI(`${window.origin}${location.pathname}`).replace(/\/$/, "");
			if (searchRoute === "/rank") {
				preparedCanonical += location.search;
				preparedHreflang.en += location.search;
				preparedHreflang.cn += location.search;
				preparedHreflang.default += location.search;
			}
			const newRobots = location.search ? { index: false, follow: true } : routeData.helmet.robots;
			return setHelmetData({
				title: routeData.helmet.title[language] || routeData.helmet.title.en,
				description: routeData.helmet.description[language] || routeData.helmet.description.en,
				keywords: routeData.helmet.keywords[language] || routeData.helmet.keywords.en,
				hreflang: preparedHreflang,
				canonical: preparedCanonical,
				robots: newRobots,
			});
		}

		setHelmetData({
			title: defaultHelmetData.title[language] || defaultHelmetData.title.en,
			description: defaultHelmetData.description[language] || defaultHelmetData.description.en,
			keywords: defaultHelmetData.keywords[language] || defaultHelmetData.keywords.en,
			hreflang: defaultHelmetData.hreflang,
			canonical: defaultHelmetData.canonical,
			robots: defaultHelmetData.robots,
		});
	};

	return (
		<Helmet>
			<title>{helmetData.title}</title>
			<meta name="description" content={helmetData.description} />
			<meta property="og:title" content={helmetData.title} />
			<meta property="og:description" content={helmetData.description} />
			<link rel="canonical" href={helmetData.canonical || `${window.origin}${location.pathname}`.replace(/\/$/, "")} />
			<meta httpEquiv="Content-Language" content={language === "en" ? "EN" : "ZH"} />
			{!!helmetData.hreflang.default && <link rel="alternate" href={helmetData.hreflang.default} hrefLang="x-default" />}
			{!!helmetData.hreflang.en && <link rel="alternate" href={helmetData.hreflang.en} hrefLang="en" />}
			{!!helmetData.hreflang.cn && <link rel="alternate" href={helmetData.hreflang.cn} hrefLang="zh-cn" />}
			<meta name="keywords" content={helmetData.keywords} />
			<meta name="robots" content={`${helmetData.robots.index ? "index" : "noindex"}, ${helmetData.robots.follow ? "follow" : "nofollow"}`} data-react-helmet="true" />
		</Helmet>
	);
};

HelmetComponent.propTypes = {
	language: PropTypes.string.isRequired,
	location: PropTypes.object.isRequired,
};

export default HelmetComponent;
