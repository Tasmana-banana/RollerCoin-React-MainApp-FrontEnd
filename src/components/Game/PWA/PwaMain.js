import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { setIsPwaActive } from "../../../actions/userInfo";
import fetchWithToken from "../../../services/fetchWithToken";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import decimalAdjust from "../../../services/decimalAdjust";

import PwaFullscreenModal from "./PwaFullscreenModal";

import "../../../assets/scss/Game/PWA.scss";

import prizeIcon from "../../../assets/img/pwa/gift_box_small.gif";
import closeIcon from "../../../assets/img/header/close_menu.svg";

const renderToast = (text, reward) => (
	<div className="content-with-image">
		<img className="toast-img" width={30} height={30} src={prizeIcon} alt="reward notification" />
		<span>{`${text} ${reward}`}</span>
	</div>
);

const PwaMain = ({ wsReact }) => {
	const { t } = useTranslation("Game");
	const dispatch = useDispatch();
	const [isPWA, setIsPWA] = useState(false);
	const [isShowButton, setIsShowButton] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAppInstalled, setIsAppInstalled] = useState(false);
	const [isUserReceivedReward, setIsUserReceivedReward] = useState(false);
	const [rewardText, setRewardText] = useState("");
	const signals = {};
	const controllers = {};

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	useEffect(async () => {
		window.matchMedia("(display-mode: standalone)").addEventListener("change", (evt) => {
			if (evt.matches) {
				setIsPWA(true);
				localStorage.removeItem("pwa_view_date");
			}
		});
		let isPwaOpened = window.matchMedia("(display-mode: standalone)").matches;
		if (isPwaOpened) {
			setIsPWA(isPwaOpened);
			localStorage.removeItem("pwa_view_date");
		}

		let isAfterDay = true;
		const pwaViewDate = localStorage.getItem("pwa_view_date");
		if (pwaViewDate) {
			isAfterDay = dayjs().isAfter(pwaViewDate, "day");
		}
		if (isAfterDay) {
			await getPwaConfig();
		} else {
			dispatch(setIsPwaActive(false));
		}

		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	useEffect(async () => {
		if (isPWA && isShowButton && !isAppInstalled) {
			await setPwaInstalled();
		}
	}, [isPWA, isShowButton]);

	const getPwaConfig = async () => {
		createSignalAndController("config");
		try {
			const json = await fetchWithToken("/api/game/pwa-config", {
				method: "GET",
				signal: signals.config,
			});
			if (!json.success) {
				dispatch(setIsPwaActive(false));
			}
			if (json.success) {
				setIsAppInstalled(json.data.is_pwa_installed);
				setIsShowButton(true);
				if (json.data.reward_data) {
					if (json.data.reward_data.reward_type === "money") {
						const currentCurrencyConfig = getCurrencyConfig(json.data.reward_data.currency || "RLT");
						const adjustedAmount = decimalAdjust(json.data.reward_data.amount / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision);
						setRewardText(`${adjustedAmount} ${json.data.reward_data.currency}`);
					}
					if (json.data.reward_data.reward_type === "miner") {
						setRewardText(`a Miner!`);
					}
				}
			}
		} catch (e) {
			console.error(e);
		}
	};

	const setPwaInstalled = async () => {
		createSignalAndController("setPwaInstalled");
		try {
			const json = await fetchWithToken("/api/game/pwa-installed", {
				method: "POST",
				signal: signals.setPwaInstalled,
			});
			if (!json.success) {
				return false;
			}
			setIsAppInstalled(true);
		} catch (e) {
			console.error(e);
		}
	};

	const claimReward = async () => {
		if (isUserReceivedReward) {
			closeModalHandler();
			return false;
		}
		createSignalAndController("claimReward");
		try {
			const json = await fetchWithToken("/api/game/pwa-reward", {
				method: "POST",
				signal: signals.claimReward,
			});
			if (!json.success || !json.data) {
				closeModalHandler();
				return false;
			}
			if (json.success) {
				setIsUserReceivedReward(true);
				if (json.data.reward_type === "money") {
					refreshBalance();
					const currentCurrencyConfig = getCurrencyConfig(json.data.currency || "RLT");
					const adjustedAmount = decimalAdjust(json.data.amount / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision);
					toast(renderToast(t("PWA.received"), `${adjustedAmount} ${json.data.currency || "RLT"}`));
				}
				if (json.data.reward_type === "miner") {
					setRewardText(`a Miner!`);
					toast(renderToast(t("PWA.received"), " a Miner!"), { autoClose: 50000, closeOnClick: false });
				}
				closeModalHandler();
			}
		} catch (e) {
			console.error(e);
		}
	};

	const refreshBalance = () => {
		wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};

	const closePwa = () => {
		localStorage.setItem("pwa_view_date", dayjs().toString());
		dispatch(setIsPwaActive(false));
	};

	const closeModalHandler = () => {
		setIsModalOpen(false);
	};

	return (
		<div className="pwa-main">
			{isShowButton && (
				<div className={`pwa-gift ${isUserReceivedReward ? "hide" : ""}`}>
					<button className="pwa-gift-button" onClick={() => setIsModalOpen(true)}>
						<LazyLoadImage width={58} height={58} src={prizeIcon} alt="PWA" threshold={100} className="pwa-prize-image" />
					</button>
					<button className="pwa-gift-close-btn" onClick={closePwa}>
						<LazyLoadImage width={16} height={16} src={closeIcon} alt="close" threshold={100} className="pwa-gift-close-img" />
					</button>
				</div>
			)}
			<PwaFullscreenModal isModalOpen={isModalOpen} closeModalHandler={closeModalHandler} rewardText={rewardText} isAppInstalled={isAppInstalled} claimReward={claimReward} />
		</div>
	);
};

PwaMain.propTypes = {
	wsReact: PropTypes.object.isRequired,
};

export default PwaMain;
