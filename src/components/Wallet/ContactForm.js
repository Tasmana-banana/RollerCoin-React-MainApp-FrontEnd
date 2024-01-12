import React, { Component } from "react";
import { Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import validator from "validator";
import Select from "react-select";
import ReactPhoneInput from "react-phone-input-2";
import FadeAnimation from "../Animations/FadeAnimation";
import countryCodes from "../../services/countryWithCode";
import fetchWithToken from "../../services/fetchWithToken";

import "react-phone-input-2/lib/style.css";

class ContactForm extends Component {
	static propTypes = {
		setContactInformationExists: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			form: {
				full_name: "",
				age: "",
				profession: "",
				country: "",
				phone: "",
			},
			validate: {
				full_name: null,
				age: null,
				phone: null,
			},
			professions: [],
			professionSelected: null,
			countries: countryCodes.map((country) => ({ value: country.code, label: country.name })),
			errorSave: null,
			errorsTypes: {
				full_name: null,
				age: null,
			},
		};
		this.requiredFieldsContact = ["full_name", "age"];
		this.config = {
			age: {
				min: 18,
				max: 100,
			},
			amount: {
				min: 0,
				max: 0,
			},
			full_name: {
				min: 3,
				max: 30,
			},
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.getProfessions();
		this.setState({
			form: {
				...this.state.form,
				...{
					country: this.state.countries[0].value,
				},
			},
		});
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	setField = (value, field) => {
		if (field === "profession") {
			this.setState({
				professionSelected: this.state.professions.find((prof) => prof.value === value),
			});
		}
		if (value !== "" && field === "age") {
			value = validator.toInt(value) || 0;
		}
		if (Object.keys(this.state.validate).includes(field)) {
			this.validateInput(value, field);
		}
		const setValue = {};
		setValue[field] = value;
		this.setState({
			errorSave: null,
			form: { ...this.state.form, ...setValue },
		});
	};

	validateInput = (value, field) => {
		switch (field) {
			case "phone":
				this.setState({
					validate: { ...this.state.validate, ...{ phone: validator.isMobilePhone(value.replace(/[^\d]/g, ""), "any") } },
				});
				break;
			case "full_name":
				this.setState({
					validate: {
						...this.state.validate,
						...{
							full_name: validator.isAlphanumeric(value.replace(/\s/g, "")) && value.trim().length >= this.config.full_name.min && value.trim().length < this.config.full_name.max,
						},
					},
				});
				if (value.trim().length === 0) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								full_name: "required",
							},
						},
					});
				}
				if (!validator.isAlphanumeric(value.replace(/\s/g, ""))) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								full_name: "en",
							},
						},
					});
				}
				if (value.trim().length >= this.config.full_name.max) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								full_name: "max_length",
							},
						},
					});
				}
				if (value.trim().length < this.config.full_name.min) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								full_name: "min_length",
							},
						},
					});
				}
				this.setState({
					errorsTypes: {
						...this.state.errorsTypes,
						...{
							full_name: null,
						},
					},
				});
				break;
			case "age":
				this.setState({
					validate: { ...this.state.validate, ...{ age: validator.isInt(value.toString(), { min: this.config.age.min, max: this.config.age.max }) } },
				});
				if (value.length === 0) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								age: "required",
							},
						},
					});
				}
				if (+value > this.config.age.max) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								age: "max_number",
							},
						},
					});
				}
				if (+value < this.config.age.min) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								age: "min_number",
							},
						},
					});
				}
				this.setState({
					errorsTypes: {
						...this.state.errorsTypes,
						...{
							age: null,
						},
					},
				});
				break;
			default:
				break;
		}
	};

	submitContactForm = async (e) => {
		e.preventDefault();
		try {
			this.createSignalAndController("submitContactForm");
			const json = await fetchWithToken("/api/crowdfunding/save-contact-information", {
				method: "POST",
				signal: this.signals.submitContactForm,
				body: JSON.stringify(this.state.form),
			});
			if (!json.success) {
				return this.setState({
					errorSave: json.error,
				});
			}
			this.props.setContactInformationExists(true);
		} catch (error) {
			console.error(error);
		}
	};

	getProfessions = async () => {
		try {
			this.createSignalAndController("getProfessions");
			const json = await fetchWithToken("/api/crowdfunding/professions", {
				method: "GET",
				signal: this.signals.getProfessions,
			});
			if (!json.success) {
				return false;
			}
			const professions = json.data.map((item, i) => ({ value: item.id, label: item.title, selected: i === 0 }));
			if (!professions.length) {
				return null;
			}
			this.setState({
				professions,
			});
			this.setField(professions[0].value, "profession");
		} catch (error) {
			console.error(error);
		}
	};

	render() {
		const { form, professions, countries, validate, errorsTypes, errorSave, professionSelected } = this.state;
		const { t } = this.props;
		const checkShowError = (field) => !validate[field] && validate[field] !== null;

		const codeToError = {
			required: () => t("tokens.required"),
			min_length: (field) => `${t("tokens.minLength")} ${this.config[field].min} ${t("tokens.characters")}`,
			max_length: (field) => `${t("tokens.maxLength")} ${this.config[field].max} ${t("tokens.characters")}`,
			en: () => t("tokens.onlyEnglish"),
			min_number: (field) => `${t("tokens.minAge")} ${this.config[field].min}+`,
			max_number: (field) => `${t("tokens.maxValue")} ${this.config[field].max}`,
		};

		return (
			<FadeAnimation>
				<div className="header-form text-center bold-text cyan-text" id="contact-form">
					<p>{t("tokens.kyc")}</p>
					<p className="small-contact-text">{t("tokens.verification")}</p>
				</div>
				<Form onSubmit={this.submitContactForm}>
					<Row noGutters={true}>
						<Col xs="12">
							<FormGroup>
								<Label for="full_name">
									{t("tokens.name")} <span className="text-danger">*</span>
								</Label>
								<Input
									name="full_name"
									id="full_name"
									type="text"
									required
									value={form.full_name}
									onChange={(e) => this.setField(e.target.value, e.target.id)}
									className={`roller-input-text${checkShowError("full_name") ? " has-error" : ""}`}
								/>
								{checkShowError("full_name") && !!errorsTypes.full_name && <p className="danger-text error-text">{codeToError[errorsTypes.full_name]("full_name")}</p>}
							</FormGroup>
						</Col>
						<Col xs="12" lg="6">
							<FormGroup>
								<Label for="age">
									{t("tokens.age")} <span className="text-danger">*</span>
								</Label>
								<Input
									type="text"
									name="age"
									id="age"
									required
									value={form.age}
									onChange={(e) => this.setField(e.target.value, e.target.id)}
									className={`roller-input-text${checkShowError("age") ? " has-error" : ""}`}
								/>
								{checkShowError("age") && !!errorsTypes.age && <p className="danger-text error-text">{codeToError[errorsTypes.age]("age")}</p>}
							</FormGroup>
						</Col>
						<Col xs="12" lg="6" className="pdl-lg-10">
							<FormGroup>
								<Label for="profession">
									{t("tokens.occupation")} <span className="text-danger">*</span>
								</Label>
								<Select
									className="rollercoin-select-container"
									classNamePrefix="rollercoin-select"
									id="profession"
									name="profession"
									value={professionSelected}
									onChange={(selected) => this.setField(selected.value, "profession")}
									options={professions}
									isClearable={false}
									isSearchable={false}
								/>
							</FormGroup>
						</Col>
						<Col xs="12" lg="6">
							<FormGroup>
								<Label for="country">
									{t("tokens.country")} <span className="text-danger">*</span>
								</Label>
								<Select
									className="rollercoin-select-container"
									classNamePrefix="rollercoin-select"
									id="country"
									name="country"
									onChange={(selected) => this.setField(selected.value, "country")}
									defaultValue={countries[0]}
									options={countries}
									isClearable={false}
								/>
							</FormGroup>
						</Col>
						<Col xs="12" lg="6" className="pdl-lg-10">
							<FormGroup>
								<Label for="phone">{t("tokens.phone")}</Label>
								<ReactPhoneInput
									defaultCountry={form.country.toLocaleLowerCase()}
									value={form.phone}
									disableDropdown={true}
									countryCodeEditable={false}
									onChange={(value) => this.setField(value, "phone")}
								/>
								{checkShowError("phone") && <p className="field-invalid danger-text error-text">{t("tokens.phoneError")}</p>}
							</FormGroup>
						</Col>
						<Col xs="12" lg={{ size: 6, offset: 3 }}>
							<div className="btn-submit">
								<button type="submit" className="tree-dimensional-button btn-cyan w-100" disabled={!this.requiredFieldsContact.every((val) => validate[val] === true)}>
									<span>{t("tokens.buttonComplete")}</span>
								</button>
							</div>
						</Col>
					</Row>
				</Form>
				{!!errorSave && <p className={"text-danger"}>{errorSave}</p>}
			</FadeAnimation>
		);
	}
}

export default withTranslation("Wallet")(ContactForm);
