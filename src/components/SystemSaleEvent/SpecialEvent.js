import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Row, Col, Container } from "reactstrap";
import { useTranslation } from "react-i18next";
import RollerButton from "../SingleComponents/RollerButton";
import SpecialEventProducts from "./SpecialEvent/SpecialEventProducts";
import SpecialEventBurn from "./SpecialEvent/SpecialEventBurn";
import fetchWithToken from "../../services/fetchWithToken";
import decimalAdjust from "../../services/decimalAdjust";
import getCurrencyConfig from "../../services/getCurrencyConfig";

import "../../assets/scss/SystemSaleEvent/SpecialEvent.scss";

const SpecialEvent = ({ wsReact }) => {
	const { t } = useTranslation("SystemSaleEvent");
	const isMobile = useSelector((state) => state.game.isMobile);
	const [eventConfig, setEventConfig] = useState({});
	const [burningItems, setBurningItems] = useState([]);
	const [userItems, setUserItems] = useState([]);
	const [totalRewardCount, setTotalRewardCount] = useState(0);
	const [isReadyToBurnBlock, setIsReadyToBurnBlock] = useState(false);
	const [isStartBurnProcessing, setIsStartBurnProcessing] = useState(false);
	const [isLoadingBurnProcess, setIsLoadingBurnProcess] = useState(true);
	const [burnProcessingData, setBurnProcessingData] = useState({ user_system_sale_event_id: "", processing_time_ms: 0, processing_date_to: null, reward: { currency: "ECOIN", amount: 0 } });
	const controllers = {};
	const signals = {};

	useEffect(async () => {
		await getSpecialEventConfig();
	}, []);

	useEffect(() => {
		getTotalRewardCount();
	}, [burningItems]);

	useEffect(() => {
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const handleStartBurnProcessing = () => {
		setBurningItems([]);
		if (isStartBurnProcessing) {
			setIsReadyToBurnBlock(false);
		}
		setIsStartBurnProcessing(!isStartBurnProcessing);
	};
	const getSpecialEventConfig = async () => {
		createSignalAndController("getSpecialEventConfig");
		try {
			const json = await fetchWithToken(`/api/system-sales-events/config`, {
				method: "GET",
				signal: signals.getSpecialEventConfig,
			});
			if (!json.success) {
				return false;
			}
			if (json.data) {
				setEventConfig(json.data);
				await getBurnProcessData();
			}
		} catch (err) {
			console.error(err);
		}
	};

	const getBurnProcessData = async (isRefresh = false) => {
		if (isRefresh && !isStartBurnProcessing) {
			return false;
		}
		createSignalAndController("getBurnProcessData");
		if (!isRefresh && isStartBurnProcessing) {
			setIsLoadingBurnProcess(true);
		}
		try {
			const json = await fetchWithToken("/api/system-sales-events/user-active-events", {
				method: "GET",
				signal: signals.getBurnProcessData,
			});
			if (!json.success) {
				return false;
			}

			if (json.data) {
				if (json.data.processing_date_to) {
					setIsStartBurnProcessing(true);
				}
				setTotalRewardCount(json.data.reward.amount);
				setBurnProcessingData(json.data);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoadingBurnProcess(false);
		}
	};

	const handleControlBurningItems = (newBurningItems, itemIdRemoveFromBurn = null) => {
		setBurningItems(newBurningItems);
		if (itemIdRemoveFromBurn) {
			setUserItems(
				userItems.map((item) => {
					if (item.user_item_id === itemIdRemoveFromBurn && item.burning) {
						return { ...item, burning: false };
					}
					return item;
				})
			);
		}
	};

	const handleCancelBurnItems = () => {
		setIsReadyToBurnBlock(false);
		setBurningItems([]);
	};

	const handleProcessingData = (processingData, totalReward) => {
		setBurnProcessingData({ ...burnProcessingData, ...processingData });
		setTotalRewardCount(totalReward);
	};
	const getTotalRewardCount = () => {
		if (burningItems.length) {
			setTotalRewardCount(burningItems.reduce((total, item) => total + item.reward.amount, 0));
		}
		if (isMobile && !burningItems.length) {
			setIsReadyToBurnBlock(false);
		}
		if (!isStartBurnProcessing && !burningItems.length && !burnProcessingData?.reward?.amount) {
			setTotalRewardCount(0);
		}
		return false;
	};

	const currentCurrencyConfig = getCurrencyConfig(eventConfig?.reward_currency) || "ECOIN";
	const isViewBurnBlock = (isMobile && isReadyToBurnBlock) || (!isMobile && !isReadyToBurnBlock) || isStartBurnProcessing;
	const isViewProductsBlock = !isMobile || (isMobile && !isReadyToBurnBlock && !isStartBurnProcessing);

	return (
		<div className="special-event-main">
			<Row noGutters={true}>
				{!!Object.values(eventConfig).length && (
					<>
						<Row noGutters={true} className="special-event-row special-event-column-row">
							{isViewProductsBlock && (
								<Col lg={isMobile ? 12 : 6} className="special-event-col">
									<div className="special-event-wrapper special-event-products">
										<SpecialEventProducts
											userItems={userItems}
											maxAmountProductToBurn={eventConfig.slots}
											setUserItems={setUserItems}
											burningItems={burningItems}
											handleControlBurningItems={handleControlBurningItems}
											isStartBurnProcessing={isStartBurnProcessing}
										/>
									</div>
								</Col>
							)}
							{isViewBurnBlock && (
								<Col lg={6} className="special-event-col">
									<div className="special-event-wrapper special-event-burn">
										<SpecialEventBurn
											eventConfig={eventConfig}
											processingData={burnProcessingData}
											isLoadingBurn={isLoadingBurnProcess}
											burningItems={burningItems}
											handleControlBurningItems={handleControlBurningItems}
											totalRewardCount={totalRewardCount}
											handleStartBurnProcessing={handleStartBurnProcessing}
											handleCancelBurnItems={handleCancelBurnItems}
											setProcessingData={handleProcessingData}
											needToRefreshUserActiveEvent={getBurnProcessData}
											wsReact={wsReact}
										/>
									</div>
								</Col>
							)}
						</Row>
						{isMobile && !!burningItems.length && !isReadyToBurnBlock && (
							<div className="special-control-panel">
								<Container className="special-control-container">
									<div className="special-control-wrapper">
										<div className="special-control-profit-block">
											<p className="special-control-profit-text">{t("specialEvent.exchangeProfit")}</p>
											<div className="special-profit-count-block">
												<img className="special-profit-count-img" src={`/static/img/wallet/${currentCurrencyConfig.img}.svg?v=1.13`} alt="Ecoin icon" width={16} height={17} />
												<span className="special-profit-count">+ {decimalAdjust(totalRewardCount / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision)}</span>
											</div>
										</div>
										<RollerButton color="cyan" text={t("specialEvent.continue")} action={() => setIsReadyToBurnBlock(true)} />
									</div>
								</Container>
							</div>
						)}
					</>
				)}
			</Row>
		</div>
	);
};

SpecialEvent.propTypes = {
	wsReact: PropTypes.object.isRequired,
};

export default SpecialEvent;
