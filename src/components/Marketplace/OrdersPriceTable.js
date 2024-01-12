import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Col } from "reactstrap";
import decimalAdjust from "../../services/decimalAdjust";
import threeDigitDivisor from "../../services/threeDigitDivisor";
import fetchWithToken from "../../services/fetchWithToken";
import getCurrencyConfig from "./helpers/getCurrencyConfig";

import "../../assets/scss/Marketplace/OrdersPriceTable.scss";

const OrdersTable = ({ itemId, itemType, currency, totalOrdersHandler }) => {
	const { t } = useTranslation("Marketplace");
	const currentCurrencyConfig = getCurrencyConfig(currency);
	const [ordersCount, setOrdersCount] = useState(0);
	const [orders, setOrders] = useState([]);
	const [restOrder, setRestOrder] = useState({});
	const wsNode = useSelector((state) => state.webSocket.wsNode);
	const controller = useRef(null);
	const signal = useRef(null);

	useEffect(async () => {
		controller.current = new AbortController();
		signal.current = controller.current.signal;
		await itemOrders();
		return () => {
			if (controller.current) {
				controller.current.abort();
			}
		};
	}, []);

	useEffect(() => {
		if (wsNode && !wsNode.listenersMessage.ordersUpdate) {
			wsNode.setListenersMessage({ ordersUpdate: onWSNodeMessage });
		}
		return () => {
			if (wsNode) {
				wsNode.removeListenersMessage("ordersUpdate");
			}
		};
	}, [wsNode]);

	const onWSNodeMessage = async (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "marketplace_orders_update":
				if (itemId === value.item_id && currency === value.currency) {
					setData(value.data);
				}
				break;
			default:
				break;
		}
	};

	const createSignalAndController = () => {
		if (controller.current) {
			controller.current.abort();
		}
		controller.current = new AbortController();
		signal.current = controller.current.signal;
	};

	const itemOrders = async () => {
		createSignalAndController();
		try {
			const json = await fetchWithToken(`/api/marketplace/item-orders?itemId=${itemId}&itemType=${itemType}&currency=${currency}`, {
				method: "GET",
				signal: signal.current,
			});
			if (!json.success) {
				return false;
			}
			setData(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	const setData = (data) => {
		const sortedOrders = data.list.sort((a, b) => a.price - b.price);
		setOrders(sortedOrders);
		setRestOrder(data.rest);
		setOrdersCount(data.totalCount);
		if (totalOrdersHandler) {
			totalOrdersHandler(data.totalCount);
		}
	};

	return (
		<Col xs={12} lg={4} className="orders-price-table">
			<div className="main-value">
				<p className="main-value-title">{t("buy.sellOrders")}:</p>
				<p className="value">{threeDigitDivisor(ordersCount, "space")}</p>
			</div>
			{!!orders.length && (
				<div className="orders-table">
					<div className="table-header">
						<p className="text-left">{t("main.price")}</p>
						<div className="vertical-divider" />
						<p className="text-right">{t("main.qty")}</p>
					</div>
					{orders.map((order, index) => (
						<div key={`${index}_order`} className="table-item-wrapper">
							<div className="table-item">
								<p className="text-left">{threeDigitDivisor(decimalAdjust(order.price / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision), "space")} RLT</p>
								<div className="vertical-divider" />
								<p className="text-right">{threeDigitDivisor(order.quantity, "space")}</p>
							</div>
						</div>
					))}
					{!!restOrder?.quantity && (
						<div className="table-item-wrapper">
							<div className="table-item">
								<p className="text-left">
									{threeDigitDivisor(decimalAdjust(restOrder.price / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision), "space")} RLT {t("main.orMore")}
								</p>
								<div className="vertical-divider" />
								<p className="text-right">{threeDigitDivisor(restOrder.quantity, "space")}</p>
							</div>
						</div>
					)}
				</div>
			)}
		</Col>
	);
};

OrdersTable.propTypes = {
	itemId: PropTypes.string.isRequired,
	itemType: PropTypes.string.isRequired,
	currency: PropTypes.string.isRequired,
	totalOrdersHandler: PropTypes.func,
};

export default OrdersTable;
