import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { setLanguage } from "../../actions/game";
import { changeLanguage } from "../../services/languageService";
import getLanguagePreffix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import "../../assets/scss/SingleComponents/SelectLang.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
	languages: state.game.languages,
	isAuthorizedSocket: state.user.isAuthorizedSocket,
	isAuthorizedNode: state.user.isAuthorizedNode,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setLanguage: (state) => dispatch(setLanguage(state)),
});
class SelectLang extends Component {
	static propTypes = {
		language: PropTypes.string.isRequired,
		languages: PropTypes.array.isRequired,
		setLanguage: PropTypes.func.isRequired,
		changeLanguage: PropTypes.func.isRequired,
		history: PropTypes.object.isRequired,
		location: PropTypes.object.isRequired,
		isAuthorizedSocket: PropTypes.bool.isRequired,
		isAuthorizedNode: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidUpdate(prevProps) {
		if (prevProps.location.pathname !== this.props.location.pathname) {
			// chinese lang available only on main page
			const newLang = this.props.languages.find((lang) => this.props.location.pathname.startsWith(lang.prefix));
			if (newLang.value !== this.props.language) {
				this.props.setLanguage(newLang.value);
				changeLanguage(newLang.value);
			}
		}
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	setLangToLocalStorage = (lang) => {
		try {
			localStorage.setItem("language", lang);
		} catch (e) {
			console.error(e);
		}
	};

	setLangToDB = async (lang) => {
		try {
			const response = await fetchWithToken("/api/profile/update-user-language", {
				method: "POST",
				body: JSON.stringify({ newLanguage: lang }),
				signal: this.signal,
			});
			if (!response.success) {
				throw new Error(response.message);
			}
		} catch (e) {
			console.error(e);
		}
	};

	changeLang = async ({ target }) => {
		const { history, location, language, isAuthorizedSocket, isAuthorizedNode } = this.props;
		if (target.checked) {
			const newUrl = location.pathname.replace(getLanguagePreffix(language), getLanguagePreffix(target.value)).replace(/\/?$/, "") + location.search;
			history.push(newUrl);
			this.props.setLanguage(target.value);
			changeLanguage(target.value);
			this.setLangToLocalStorage(target.value);
			if (isAuthorizedSocket && isAuthorizedNode) {
				await this.setLangToDB(target.value);
			}
		}
	};

	render() {
		const { languages, language } = this.props;
		return (
			<div className="select-lag-container">
				{languages.map((obj) => (
					<div className="select-language" key={obj.value}>
						<input type="radio" hidden name={`language_${obj.value}`} value={obj.value} id={`language_${obj.value}`} checked={language === obj.value} onChange={this.changeLang} />
						<label htmlFor={`language_${obj.value}`}>{obj.label}</label>
					</div>
				))}
			</div>
		);
	}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectLang));
