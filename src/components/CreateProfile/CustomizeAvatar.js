import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import Select from "react-select";
import { withTranslation } from "react-i18next";
import CanvasObject from "./CanvasObject";
import { ReactSelectOption, ReactSelectValue } from "./ReactSelectOption";
import AvatarComponentCard from "./AvatarComponentCard";

class CustomizeAvatar extends Component {
	constructor(props) {
		super(props);
		const { t } = props;
		this.state = {
			optionsSelect: [
				{ value: "clothes", label: t("clothes") },
				{ value: "face", label: t("face") },
				{ value: "mouth", label: t("mouth") },
				{ value: "hair", label: t("hair") },
				{ value: "eyes", label: t("eyes") },
			],
			optionSelected: { value: "clothes", label: t("clothes") },
		};
	}

	handleSelectChange = (selected) => this.setState({ optionSelected: selected });

	render() {
		const { avatarConfig, gender, avatarComponents, setCustomizeAvatar, updateAvatarConfig, hidden, t } = this.props;
		const { optionSelected, optionsSelect } = this.state;
		return (
			<Col lg="8" className="body-container" hidden={hidden}>
				<Row noGutters={true} className="align-items-start">
					<Col lg={{ size: 5, offset: 1 }} className="avatar-block">
						<div className="avatar-img mgb-16">
							<CanvasObject gender={gender} avatarConfig={avatarConfig} />
						</div>
						<div className="done-customize">
							<button type="submit" className="tree-dimensional-button btn-cyan w-100" onClick={() => setCustomizeAvatar(false)}>
								<span className="w-100">{t("done")}</span>
							</button>
						</div>
					</Col>
					<Col lg="5" className="main-data-block">
						<div className="block-select-data mgb-16">
							<Select
								className="rollercoin-select-container"
								classNamePrefix="rollercoin-select"
								value={optionSelected}
								onChange={this.handleSelectChange}
								options={optionsSelect}
								isClearable={false}
								isSearchable={false}
								components={{ Option: ReactSelectOption, ValueContainer: ReactSelectValue }}
							/>
						</div>
						<Row className="block-select-items">
							{avatarComponents[optionSelected.value].map((code) => (
								<AvatarComponentCard
									key={`${optionSelected.value}${code}`}
									code={code}
									type={optionSelected.value}
									gender={gender}
									updateAvatarConfig={updateAvatarConfig}
									isSelected={avatarConfig[optionSelected.value] === code}
								/>
							))}
						</Row>
					</Col>
				</Row>
			</Col>
		);
	}
}

CustomizeAvatar.propTypes = {
	gender: PropTypes.string.isRequired,
	hidden: PropTypes.bool.isRequired,
	avatarConfig: PropTypes.object.isRequired,
	updateAvatarConfig: PropTypes.func.isRequired,
	setCustomizeAvatar: PropTypes.func.isRequired,
	avatarComponents: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
};

export default withTranslation("Avatar")(CustomizeAvatar);
