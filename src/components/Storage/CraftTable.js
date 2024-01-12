import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import listImg from "../../assets/img/storage/list_image.svg";

const CraftTable = ({ item }) => {
	const { t } = useTranslation("Storage");
	const language = useSelector((state) => state.game.language);
	return (
		<div className="craft-details-wrapper">
			<div className="craft-recipe">
				<img className="list-img" src={listImg} alt="List icon" />
				<p className="recipe-text">{t("general.craftingRecipe")}</p>
			</div>
			{item.map(({ component_type: componentType, name, count, rarity_group: rarityGroup }, index) => (
				<div key={index} className="recipe-item">
					<p className="item">
						{componentType.includes("mutation_components") && (
							<span className="rarity" style={{ color: `#${rarityGroup.base_color_hex}` }}>
								{rarityGroup.title[language] || rarityGroup.title.en}
							</span>
						)}
						{name[language] || name.en}
					</p>
					<p className="count">x{count}</p>
				</div>
			))}
		</div>
	);
};

CraftTable.propTypes = {
	item: PropTypes.object.isRequired,
};

export default CraftTable;
