import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";
import { Trail } from "react-spring/renderprops";
import LazyLoad from "react-lazyload";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
});
class BountyListClass extends Component {
	constructor(props) {
		super(props);
		this.renderList = this.renderList.bind(this);
	}

	renderList() {
		const statusOption = {
			0: { text: "Pending", color: "yellow" },
			1: { text: "Confirmed", color: "green" },
			2: { text: "Canceled", color: "danger" },
			3: { text: "Postponed", color: "white" },
		};
		if (this.props.data.length) {
			return (
				<Trail items={this.props.data} keys={(item) => item.id} from={{ opacity: 0 }} to={{ opacity: 1 }}>
					{(item) => (props) => (
						<div style={props} className={`list-item justify-content-between flex-wrap`}>
							<div className="list-line d-flex flex-wrap justify-content-between">
								<div className="block-title d-flex align-items-center">
									<div className="icon">
										<LazyLoad offset={100}>
											<img src={`/static/img/referral/bounty/${item.type}.svg`} alt={item.type} width={20} height={20} />
										</LazyLoad>
									</div>
									<p>{item.type}</p>
								</div>
								<p className="d-none d-lg-block">
									<span>Link: </span>
									<a href={item.link} target="_blank" rel="noopener noreferrer" className="txid-link">
										{item.link}
									</a>
								</p>
								<p className="d-lg-none">
									<a href={item.link} target="_blank" rel="noopener noreferrer">
										Link
									</a>
								</p>
							</div>
							<div className="list-line d-flex flex-wrap justify-content-between">
								<p>
									<span>Status: </span>
									<span className={`bold-text ${statusOption[item.status_code].color}-text`}>{statusOption[item.status_code].text}</span>
								</p>
								<p>{moment(new Date(item.created)).format("HH:mm MMMM DD, YYYY")}</p>
							</div>
							{!!item.cancel_message && (
								<div className="list-line d-flex flex-wrap justify-content-between">
									<p>
										<span>Comment: </span>
										<span className="danger-text">{item.cancel_message}</span>
									</p>
								</div>
							)}
						</div>
					)}
				</Trail>
			);
		}
	}

	render() {
		return <div className="list-items">{this.renderList()}</div>;
	}
}
BountyListClass.propTypes = {
	pathName: PropTypes.string.isRequired,
	data: PropTypes.array.isRequired,
};
const BountyList = connect(mapStateToProps, null)(BountyListClass);

export default BountyList;
