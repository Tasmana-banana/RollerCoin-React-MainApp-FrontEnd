import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { Row, Col } from "reactstrap";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { ContactForm, BuyTokenForm } from "../../components/Wallet";
import TransactionsList from "../../components/Wallet/TransactionsList";
import InfoBlockWithIcon from "../../components/SingleComponents/InfoBlockWithIcon";
import getTokensList from "../../services/getTokensList";
import fetchWithToken from "../../services/fetchWithToken";

class Token extends Component {
	static propTypes = {
		wsReact: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		isMobile: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			contactInformationExists: null,
			transactionsList: [],
			showContactForm: false,
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		this.checkContactInformationExists();
		getTokensList(this.signal, this.setTransactionsList).catch((error) => console.error(error));
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	setContactInformationExists = (value) => {
		this.setShowContactForm(false);
		this.setState({
			contactInformationExists: value,
		});
	};

	checkContactInformationExists = async () => {
		this.createSignalAndController();
		try {
			const json = await fetchWithToken("/api/profile/contact-information", {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success || !Object.keys(json.data).length) {
				return this.setContactInformationExists(false);
			}
			this.setContactInformationExists(true);
		} catch (e) {
			console.error(e);
		}
	};

	setTransactionsList = (data) => {
		this.setState({
			transactionsList: data,
		});
	};

	setShowContactForm = (value) => {
		this.setState({ showContactForm: value });
	};

	render() {
		const { t, isMobile } = this.props;
		const { contactInformationExists, transactionsList, showContactForm } = this.state;
		return (
			<Fragment>
				{<InfoBlockWithIcon tName="Wallet" message="withdrawInfoTooltipMessage" obj="infoHints" showButtons={isMobile} />}
				<Row className="route-content buy-token" noGutters={true}>
					<Col xs="12" lg={{ size: 10, offset: 1 }}>
						<Helmet>
							<title>{t("tokenTitle")}</title>
						</Helmet>
						<BuyTokenForm
							wsReact={this.props.wsReact}
							setTransactionsList={this.setTransactionsList}
							contactInformationExists={contactInformationExists}
							showContactForm={showContactForm}
							setShowContactForm={this.setShowContactForm}
						/>
						{contactInformationExists === false && showContactForm && <ContactForm setContactInformationExists={this.setContactInformationExists} />}
					</Col>
				</Row>
				<TransactionsList data={transactionsList} />
			</Fragment>
		);
	}
}

export default withTranslation("Wallet")(Token);
