import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Collapse, CardBody, Card, CardHeader } from "reactstrap";

import arrowUpIcon from "../../assets/img/faq/arrow_up_new.svg";
import arrowDownIcon from "../../assets/img/faq/arrow_down_new.svg";

const FAQCardItem = ({ children, name, icon }) => {
	const [collapse, setCollapse] = useState(null);
	const { t } = useTranslation("FAQ");

	const cardToggle = (id) => {
		setCollapse(collapse === id ? null : id);
	};

	return (
		<Card key={`card_${name}`} id={`card_${name}`}>
			<CardHeader onClick={() => cardToggle(`card_${name}`)} className="">
				<div className={`card-faq-header card-flex-header ${collapse === `card_${name}` ? "collapsed" : ""}`}>
					<div className="card-flex-questions">
						<div className="ico-faq">
							<img className="ico-img" src={`/static/img/faq/cards/${icon}`} width={24} height={24} alt={icon} />
						</div>
						<div className="text-faq-header" dangerouslySetInnerHTML={{ __html: t(`faqCards.${name}.question`) }} />
					</div>
					<div className="collapse-btn-wrapper">
						<img src={collapse === `card_${name}` ? arrowUpIcon : arrowDownIcon} alt="toggle" />
					</div>
				</div>
			</CardHeader>
			<Collapse isOpen={collapse === `card_${name}`} className="card-content">
				<CardBody>{children}</CardBody>
			</Collapse>
		</Card>
	);
};

FAQCardItem.propTypes = {
	children: PropTypes.node.isRequired,
	name: PropTypes.number.isRequired,
	icon: PropTypes.string.isRequired,
};

export default FAQCardItem;
