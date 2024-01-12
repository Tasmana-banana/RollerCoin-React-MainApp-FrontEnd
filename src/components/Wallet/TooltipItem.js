import React, { Fragment } from "react";
import { Tooltip } from "reactstrap";
import PropTypes from "prop-types";

export default class TooltipItem extends React.Component {
	constructor(props) {
		super(props);

		this.toggle = this.toggle.bind(this);
		this.state = {
			tooltipOpen: false,
		};
	}

	toggle() {
		this.setState({
			tooltipOpen: !this.state.tooltipOpen,
		});
	}

	render() {
		const { text, image, id, tooltipContent } = this.props;
		return (
			<Fragment>
				<span className="icon">
					<img src={`/static/img/wallet/bonuses/${image}.svg`} alt={image} />
				</span>
				<span>{text}</span>
				<img src="/static/img/wallet/info_tooltip.svg" alt="info_tooltip" id={`Tooltip-${id}`} className="tooltip-image" />
				<Tooltip placement="top" isOpen={this.state.tooltipOpen} target={`Tooltip-${id}`} toggle={this.toggle}>
					{tooltipContent}
				</Tooltip>
			</Fragment>
		);
	}
}

TooltipItem.propTypes = {
	text: PropTypes.string.isRequired,
	image: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	tooltipContent: PropTypes.string.isRequired,
};
