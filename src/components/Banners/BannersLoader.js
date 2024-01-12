import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import loadScript from "../../services/loadScript";

const BannersLoader = ({ name, isMobile }) => {
	const scriptRef = useRef(null);
	const [isShow, setIsShow] = useState(false);
	const bannersConfig = {
		gameChooseLeft: {
			code: process.env.GAME_CHOSE_LEFT,
			style: { display: "inline-block", width: "160px", height: "600px" },
			deviceType: ["desktop"],
		},
		gameChooseRight: {
			code: process.env.GAME_CHOSE_RIGHT,
			style: { display: "inline-block", width: "160px", height: "600px" },
			deviceType: ["desktop"],
		},
		gamePlayLeft: {
			code: process.env.GAME_PLAY_LEFT,
			style: { display: "inline-block", width: "160px", height: "600px" },
			deviceType: ["desktop"],
		},
		gamePlayRight: {
			code: process.env.GAME_PLAY_RIGHT,
			style: { display: "inline-block", width: "160px", height: "600px" },
			deviceType: ["desktop"],
		},
		gameEndCenter: {
			code: process.env.GAME_END_CENTER,
			style: { display: "inline-block", width: "300px", height: "250px" },
			deviceType: ["desktop", "mobile"],
		},
		gameMobile: {
			code: process.env.GAME_MOBILE,
			style: { display: "inline-block", width: "320px", height: "100px" },
			deviceType: ["mobile"],
		},
		storeSection: {
			code: process.env.STORE_SECTION,
			style: { display: "inline-block", width: "468px", height: "60px" },
			deviceType: ["desktop"],
		},
		storeEventPassSection: {
			code: process.env.STORE_EVENTPASS_SECTION,
			style: { display: "inline-block", width: "468px", height: "90px" },
			deviceType: ["desktop"],
		},
		marketPlaceMenu: {
			code: process.env.MARKETPLACE_MENU,
			style: { display: "inline-block", width: "300px", height: "250px" },
			deviceType: ["desktop"],
		},
		storageMenu: {
			code: process.env.STORAGE_MENU,
			style: { display: "inline-block", width: "300px", height: "250px" },
			deviceType: ["desktop"],
		},
	};
	let newBannersConfig;

	const changeIsActive = (cfg) => {
		newBannersConfig = Object.keys(cfg).reduce((val, key) => {
			const obj = cfg[key];
			val[key] = { ...obj, isActive: true };
			return val;
		}, {});
	};

	useEffect(() => {
		setCounterBannerLoaded();
		changeIsActive(bannersConfig);
		const showOnThisDevice = (newBannersConfig[name].deviceType.includes("mobile") && isMobile) || (!isMobile && newBannersConfig[name].deviceType.includes("desktop"));
		setIsShow(showOnThisDevice);

		if (showOnThisDevice && newBannersConfig[name].isActive) scriptRef.current = loadScript(`//${process.env.ADV_DOMAIN_URL}/js/${newBannersConfig[name].code}.js`);

		return () => {
			const { current: bmScript } = scriptRef;
			if (bmScript) {
				bmScript.remove();
				if (window.bmblocks && window.bmblocks[newBannersConfig[name].code]) {
					delete window.bmblocks[newBannersConfig[name].code];
				}
			}
		};
	}, [name, isMobile]);

	const setCounterBannerLoaded = () => {
		const dataFromStorage = localStorage.getItem("banners");
		let bannersCounterObj = {};
		const setItem = {};
		setItem[name] = 1;
		if (dataFromStorage) {
			try {
				bannersCounterObj = JSON.parse(dataFromStorage);
				if (bannersCounterObj[name]) {
					setItem[name] += +bannersCounterObj[name];
				}
			} catch (e) {
				bannersCounterObj = {};
			}
		}

		localStorage.setItem("banners", JSON.stringify({ ...bannersCounterObj, ...setItem }));
	};

	const selectedBanner = bannersConfig[name];
	return <div className="banners-container">{isShow ? <ins className={`${selectedBanner.code}`} style={selectedBanner.style} /> : ""}</div>;
};

export default BannersLoader;

BannersLoader.propTypes = {
	name: PropTypes.string.isRequired,
	isMobile: PropTypes.bool.isRequired,
};
