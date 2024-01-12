import React from "react";
import { connect } from "react-redux";
import { Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import Select from "react-select";
import PropTypes from "prop-types";

import "../../assets/scss/Offerwall/OfferwallFilter.scss";

const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
});

const OffersFilter = ({ isMobile, itemsOnPage, sortByType, filterBy, updateOptions, options, paginationType, disable, t }) => (
	<Row noGutters={isMobile} className="filters-container">
		<Col xs={12} lg={6}>
			<div className="filters-wrapper">
				{filterBy.map(({ label, value }) => (
					<button
						className={`filter-btn ${label === options.filter ? "active" : ""} ${disable && label !== "all" ? "disabled" : ""}`}
						key={label}
						type="button"
						onClick={() => updateOptions({ ...options, filter: value.type }, true)}
						disabled={disable}
					>
						<p className="btn-text">{t(label)}</p>
					</button>
				))}
			</div>
		</Col>
		<Col xs={12} lg={6} className="selected-column">
			<Row noGutters={isMobile}>
				<Col xs={8} lg={{ size: 6, offset: 4 }}>
					<Row noGutters>
						{!!sortByType.length && (
							<Select
								className="select-filter-container w-100"
								classNamePrefix="select-filter"
								onChange={(e) =>
									updateOptions(
										{
											...options,
											sort: e.value.sort,
											sort_direction: e.value.sort_direction,
										},
										paginationType === "more"
									)
								}
								options={sortByType.map((type) => ({ ...type, label: t(type.label) }))}
								defaultValue={{ ...sortByType[0], label: t(sortByType[0].label) }}
								isDisabled={disable}
								isClearable={false}
								isSearchable={false}
							/>
						)}
					</Row>
				</Col>
				<Col xs={{ size: 3, offset: 1 }} lg={{ size: 2, offset: 0 }}>
					<Row noGutters>
						{!!itemsOnPage.length && (
							<Select
								className="select-filter-container w-100"
								classNamePrefix="select-filter"
								onChange={(e) => updateOptions({ ...options, limit: e.value.limit }, true)}
								options={itemsOnPage}
								defaultValue={itemsOnPage[1]}
								isDisabled={disable}
								isClearable={false}
								isSearchable={false}
							/>
						)}
					</Row>
				</Col>
			</Row>
		</Col>
	</Row>
);

OffersFilter.propTypes = {
	isMobile: PropTypes.bool.isRequired,
	sortByType: PropTypes.array.isRequired,
	itemsOnPage: PropTypes.array.isRequired,
	filterBy: PropTypes.array.isRequired,
	options: PropTypes.object.isRequired,
	updateOptions: PropTypes.func.isRequired,
	paginationType: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
	disable: PropTypes.bool,
};

export default withTranslation("Offerwall")(connect(mapStateToProps, null)(OffersFilter));
