import React from "react";
import { useTranslation } from "react-i18next";

import lighter from "../../assets/img/game/lighter.svg";
import "../../assets/scss/Game/Tips.scss";

const Tips = () => {
	const { t } = useTranslation("Game");
	const tips = [
		t("tips.tip1"),
		t("tips.tip2"),
		t("tips.tip3"),
		t("tips.tip4"),
		t("tips.tip5"),
		t("tips.tip6"),
		t("tips.tip7"),
		t("tips.tip8"),
		t("tips.tip9"),
		t("tips.tip10"),
		t("tips.tip11"),
		t("tips.tip12"),
		t("tips.tip13"),
		t("tips.tip14"),
		t("tips.tip15"),
		t("tips.tip16"),
		t("tips.tip17"),
	];

	const getTipNumber = () => {
		let currentId = 0;
		const lastId = parseInt(localStorage.getItem("lastTipsId"), 10);

		if (lastId >= 0 && lastId < tips.length - 1) {
			currentId = lastId + 1;
		}
		if (lastId >= tips.length - 1) {
			currentId = Math.floor(Math.random() * tips.length);
		}

		if (Number.isNaN(lastId) || lastId < tips.length - 1) {
			localStorage.setItem("lastTipsId", currentId.toString());
		}

		return currentId;
	};

	const tipsId = getTipNumber();

	return (
		<div className="tips-container">
			<img className="lighter-img" src={lighter} alt="lighter" />
			<p className="description">{tips[tipsId]}</p>
		</div>
	);
};

export default Tips;
