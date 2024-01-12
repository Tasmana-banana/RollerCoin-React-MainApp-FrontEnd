import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useRouteMatch } from "react-router-dom";
import { Row } from "reactstrap";
import RollerButton from "../SingleComponents/RollerButton";
import OrdersPriceTable from "./OrdersPriceTable";
import PriceChart from "./PriceChart";
import ItemInfo from "./ItemInfo";
import SellItemPriceBlock from "./SellItemPriceBlock";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";
import fetchWithToken from "../../services/fetchWithToken";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../constants/Storage";

import "../../assets/scss/Marketplace/SellItemPage.scss";

import closeIcon from "../../assets/img/header/close_menu.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";

const SellItemPage = () => {
	const match = useRouteMatch();
	const history = useHistory();
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const [isLoading, setIsLoading] = useState(false);
	const [item, setItem] = useState(null);
	const signals = {};
	const controllers = {};

	const currencyFrom = "RLT";

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	useEffect(async () => {
		await itemInfo();
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	const itemInfo = async () => {
		createSignalAndController("itemInfo");
		setIsLoading(!item);
		try {
			const json = await fetchWithToken(`/api/marketplace/inventory-item-info?itemId=${match.params.id}&itemType=${match.params.type}&currency=${currencyFrom}`, {
				method: "GET",
				signal: signals.itemInfo,
			});
			if (!json.success) {
				return false;
			}

			setItem(json.data);
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{<InfoBlockWithIcon tName="Marketplace" message="sellItemPageInfoMessage" obj="infoHints" showButtons={isMobile} />}
			<div className="marketplace-sell-item-page">
				<RollerButton action={() => history.goBack()} className="close-btn" size="small" icon={closeIcon} />
				{isLoading && (
					<div className="item-loader-layout">
						<img src={loaderImg} height={126} width={126} alt="Loading..." />
					</div>
				)}
				{!isLoading && !!item && (
					<Fragment>
						{item.itemType !== "mutation_component" && (
							<h4 className="main-item-title">
								{item.type === MINERS_TYPES.MERGE && <span style={{ color: RARITY_DATA_BY_LEVEL[item?.level || 0].color }}>{RARITY_DATA_BY_LEVEL[item?.level || 0].title} </span>}
								{item.name[language] || item.name.en}
							</h4>
						)}
						{item.itemType === "mutation_component" && (
							<h4 className="main-item-title">
								<span style={{ color: `#${item.rarityGroup?.baseHexColor || "ffffff"}` }}>{item.rarityGroup?.title[language] || item.rarityGroup?.title.en} </span>
								{item.name[language] || item.name.en}
							</h4>
						)}
						<Row noGutters={isMobile} className="item-main-wrapper">
							<ItemInfo item={item}>{isMobile && <SellItemPriceBlock item={item} currencyFrom={currencyFrom} refreshItemInfo={itemInfo} />}</ItemInfo>
							<OrdersPriceTable itemId={item._id} itemType={item.itemType} currency={currencyFrom} />
						</Row>
						{!isMobile && <SellItemPriceBlock item={item} currencyFrom={currencyFrom} refreshItemInfo={itemInfo} />}
						<PriceChart itemType={item.itemType} itemId={item._id} currency={currencyFrom} />
					</Fragment>
				)}
			</div>
		</>
	);
};

export default SellItemPage;
