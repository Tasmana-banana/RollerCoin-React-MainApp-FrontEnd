import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { useTranslation } from "react-i18next";
import { isLength } from "validator";
import ProfileModal from "./ProfileModal";
import ModalActionButtons from "./ModalActionButtons";
import fetchWithToken from "../../../services/fetchWithToken";

const PublicLinkModal = ({ isOpen, toggleModal, setProfileLink }) => {
	const { t } = useTranslation("Profile");
	const [link, setLink] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const controller = new AbortController();
	const { signal } = controller;

	const onSubmitHandler = async (event) => {
		event.preventDefault();
		if (!link || !isLength(link, { min: 3, max: 32 })) {
			return setError(t("invalidProfileLink"));
		}
		setIsLoading(true);
		try {
			const response = await fetchWithToken("/api/profile/change-profile-link", {
				signal,
				method: "POST",
				body: JSON.stringify({ profile_link: link }),
			});
			if (!response.success) {
				setError(response.error);
				setIsLoading(false);
				return false;
			}
			setProfileLink(link);
			onCancelHandler();
		} catch (e) {
			setIsLoading(false);
			console.error(e);
		}
	};

	const onChangeHandler = (value) => {
		if (RegExp(/^[a-zA-Z0-9_+\-.]*$/).test(value) && value.length <= 32) {
			setLink(value.trim());
		}
	};

	const onCancelHandler = () => {
		setError("");
		setLink("");
		setIsLoading(false);
		toggleModal();
	};

	return (
		<ProfileModal toggleModal={onCancelHandler} isOpen={isOpen} titleText={"Profile link"}>
			<Form onSubmit={onSubmitHandler} className="one-input-modal-wrapper">
				<FormGroup className={error ? "error" : ""}>
					<Label for="profileLink">{"Change your profile link"}</Label>
					<Input invalid={!!error} type="text" id="profileLink" onChange={(event) => onChangeHandler(event.target.value)} value={link} />
					<FormFeedback>{error}</FormFeedback>
				</FormGroup>
				<ModalActionButtons isSubmitDisable={isLoading} onCancelHandler={onCancelHandler} />
			</Form>
		</ProfileModal>
	);
};

PublicLinkModal.propTypes = {
	toggleModal: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setProfileLink: PropTypes.func.isRequired,
};

export default PublicLinkModal;
