import React, { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import decimalAdjust from "../../services/decimalAdjust";
import fetchWithToken from "../../services/fetchWithToken";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import RollerButton from "./RollerButton";

import "../../assets/scss/SingleComponents/InfluencersRewardsModal.scss";

import checkIcon from "../../assets/img/icon/yes_box.svg";
import threeDigitDivisor from "../../services/threeDigitDivisor";
import { setIsNeedShowInfluencersRewards } from "../../actions/userInfo";

const MS_TO_DAYS = 86400000;

const ImageSourceBuilder = (item) => {
	switch (item.type) {
		case "miner": {
			return `${process.env.STATIC_URL}/static/img/market/miners/${item.item_id}.gif?v=1.0.3`;
		}
		case "rack": {
			return `${process.env.STATIC_URL}/static/img/market/racks/${item.item_id}.png?v=1.0.3`;
		}
		case "mutation_component": {
			return `${process.env.STATIC_URL}/static/img/storage/mutation_components/${item.item_id}.png?v=1.0.3`;
		}
		case "battery": {
			return `${process.env.STATIC_URL}/static/img/market/batteries/${item.item_id}.png?v=1.0.3`;
		}
		case "power": {
			return `/static/img/seasonPass/reward_power.png?v=1.0.1`;
		}
		case "money": {
			return `/static/img/seasonPass/reward_${item.currency}.png?v=1.0.1`;
		}
		case "trophy": {
			return `${process.env.STATIC_URL}/static/img/game/room/trophies/${item.product.file_name}.png?v=1.0.0`;
		}
		case "appearance": {
			return `${process.env.STATIC_URL}/static/img/market/appearances/${item.item_id}.png?v=1.0.2`;
		}
		case "hat": {
			return `${process.env.STATIC_URL}/static/img/market/hats/${item.item_id}.png?v=1.0.0`;
		}
		default:
			return "";
	}
};

const InfluencerRewardsModal = () => {
	const { t } = useTranslation("SingleComponents");
	const language = useSelector((state) => state.game.language);
	const phaserScreenInputManager = useSelector((state) => state.game.phaserScreenInputManager);
	const isNeedShowInfluencersRewards = useSelector((state) => state.user.isNeedShowInfluencersRewards);
	const dispatch = useDispatch();
	const [imagesRewardsList, setImagesRewardsList] = useState([]);
	const [textRewardsList, setTextRewardsList] = useState([]);
	const [isShowModal, setIsShowModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
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
		if (isNeedShowInfluencersRewards) {
			await getInfluencerRewards();
		}
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	useEffect(() => {
		if (phaserScreenInputManager && isShowModal) {
			phaserScreenInputManager.enabled = false;
		}
	}, [phaserScreenInputManager, isShowModal]);

	const getInfluencerRewards = async () => {
		createSignalAndController("getInfluencerRewards");
		try {
			const json = await fetchWithToken(`/api/referral/influencers-rewards-info`, {
				method: "GET",
				signal: signals.getInfluencerRewards,
			});
			if (!json.success) {
				return false;
			}

			const imagesList = json.data.reduce((acc, val) => {
				if (["miner", "rack"].includes(val.type)) {
					for (let i = 0; i < val.amount; i += 1) {
						acc.push(ImageSourceBuilder(val));
					}
					return acc;
				}
				acc.push(ImageSourceBuilder(val));
				return acc;
			}, []);

			const rewardsTextList = json.data.map((reward) => {
				if (reward.type === "money") {
					const currencyConfig = getCurrencyConfig(reward.currency ? reward.currency : "RLT");
					const adjustedPrice = decimalAdjust(reward.amount / currencyConfig.toSmall / (reward.currency === "SAT" ? 100 : 1), currencyConfig.precision);
					return `${adjustedPrice} ${reward.currency}`;
				}
				if (reward.type === "power") {
					const adjustedTTL = Math.round(reward.ttl_time / MS_TO_DAYS);
					return `${threeDigitDivisor(reward.amount)} Gh/s ${adjustedTTL}d`;
				}
				if (["hat"].includes(reward.type)) {
					return `${reward.amount > 1 ? `x${reward.amount} ` : ""}${reward.product.title[language] || reward.product.title.en}`;
				}
				return `${reward.amount > 1 ? `x${reward.amount} ` : ""}${reward.product.name[language] || reward.product.name.en}`;
			});
			setImagesRewardsList(imagesList);
			setTextRewardsList(rewardsTextList);
			setIsShowModal(true);
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const setInfluencersRewardsViewed = async () => {
		createSignalAndController("setInfluencersRewardsViewed");
		try {
			const json = await fetchWithToken(`/api/referral/influencers-rewards-viewed`, {
				method: "POST",
				signal: signals.setInfluencersRewardsViewed,
			});
			if (!json.success) {
				return false;
			}
			dispatch(setIsNeedShowInfluencersRewards(false));
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const handlerCloseButton = async () => {
		phaserScreenInputManager.enabled = true;
		setIsShowModal(false);
		await setInfluencersRewardsViewed();
	};

	return (
		<Fragment>
			{isNeedShowInfluencersRewards && (
				<Modal isOpen={isShowModal} size="lg" centered className="influercers-rewards-modal">
					<ModalBody className="influercers-rewards-modal-body">
						{!!imagesRewardsList.length && (
							<div className="influercers-rewards-wrapper">
								{imagesRewardsList.map((item, index) => (
									<div key={index} className="item-img-wrapper">
										<img className="check-icon" src={checkIcon} width={16} height={16} alt={"check"} />
										<img className="reward-img" src={item} alt="product" />
									</div>
								))}
							</div>
						)}
						<p className="influercers-title">{t("influencers.welcome")}</p>
						{!!textRewardsList.length && (
							<p className="influercers-text">
								<span>{t("influencers.youReceived")}</span>
								{textRewardsList.map((item, index) => (
									<span key={index} className="accent">
										{item}
										{textRewardsList.length === index + 1 ? " " : ", "}
									</span>
								))}
								<span>{t("influencers.toStart")}</span>
							</p>
						)}
						<div className="disclaimer-btn-block">
							<RollerButton color="cyan" className="disclaimer-button" text={t("influencers.startPlay")} action={handlerCloseButton} disabled={isLoading} />
						</div>
					</ModalBody>
				</Modal>
			)}
		</Fragment>
	);
};

export default InfluencerRewardsModal;
