import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { isAlphanumeric, isLength } from "validator";
import { Form, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setNewFullname } from "../../../actions/userInfo";
import ProfileModal from "./ProfileModal";
import ModalActionButtons from "./ModalActionButtons";
import fetchWithToken from "../../../services/fetchWithToken";

const EditNameModal = ({ isOpen, toggleModal }) => {
	const dispatch = useDispatch();

	const { t } = useTranslation("Profile");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const controller = new AbortController();
	const { signal } = controller;

	const onSubmitHandler = async (event) => {
		event.preventDefault();
		if (!name || !isLength(name, { min: 3, max: 32 })) {
			return setError(t("nameRequired"));
		}
		if (!isAlphanumeric(name.replace(/\s/g, ""))) {
			return setError(t("invalidName"));
		}
		setIsLoading(true);
		try {
			const response = await fetchWithToken("/api/profile/change-fullname", {
				signal,
				method: "POST",
				body: JSON.stringify({ full_name: name }),
			});
			if (!response.success) {
				setError(response.error);
				setIsLoading(false);
				return false;
			}
			dispatch(setNewFullname(name.trim()));
			onCancelHandler();
		} catch (e) {
			setIsLoading(false);
			console.error(e);
		}
	};

	const onChangeHandler = (value) => {
		if (isLength(value, 0, 32)) {
			setName(value);
		}
	};

	const onCancelHandler = () => {
		setName("");
		setError("");
		setIsLoading(false);
		toggleModal();
	};

	useEffect(() => {
		if (name.length === 1) {
			setError("");
		}
	}, [name]);

	return (
		<ProfileModal toggleModal={onCancelHandler} isOpen={isOpen} titleText={"Edit username"}>
			<Form onSubmit={onSubmitHandler} className="one-input-modal-wrapper">
				<FormGroup className={error ? "error" : ""}>
					<Label for="nameChange">{"Enter your new username"}</Label>
					<Input invalid={!!error} type="text" id="nameChange" onChange={(event) => onChangeHandler(event.target.value)} value={name} />
					<FormFeedback>{error}</FormFeedback>
				</FormGroup>
				<ModalActionButtons isSubmitDisable={isLoading} onCancelHandler={onCancelHandler} />
			</Form>
		</ProfileModal>
	);
};

EditNameModal.propTypes = {
	toggleModal: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
};

export default EditNameModal;
