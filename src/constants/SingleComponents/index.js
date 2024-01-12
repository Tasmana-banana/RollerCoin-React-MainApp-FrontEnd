export const POST_TYPE_AUTH = {
	LOGIN: "login",
	ACTIVATE_2FA: "activate_2fa",
	WITHDRAW: "withdraw",
};

export const TYPE_AUTH_API_CONFIRM_CODE = {
	[POST_TYPE_AUTH.ACTIVATE_2FA]: "/api/auth/activation-2fa-confirm",
	[POST_TYPE_AUTH.LOGIN]: "/api/auth/2fa-login",
	[POST_TYPE_AUTH.WITHDRAW]: "/api/auth/validate-confirm-withdrawal-code",
};

export const AUTH_MODAL_TEXTS = {
	login: {
		title: "Two-factor authentication",
		description: "Please enter the 6-digit verification code that was sent to",
		description2: "The code is valid for 30 minutes.",
	},
	activate_2fa: {
		title: "Two-factor authentication",
		description: "Please enter the 6-digit verification code that was sent to",
		description2: "The code is valid for 30 minutes.",
	},
	reset_password: {
		title: "Reset your password",
		description: "Please enter the confirmation code that was sent to your email address, create a new password and click the Submit button.",
	},
	change_password: {
		title: "Change your password",
		description: "Please enter the confirmation code that was sent to your email address and click the Submit button to confirm.",
	},
	withdraw: {
		title: "Confirm your withdrawal",
		description: "Please enter the confirmation code that was sent to your email address and press the Submit button to confirm your withdrawal.",
	},
};

export const SIGN_UP_API = {
	BY_EMAIL: "/api/auth/email-login",
	BY_SOCIAL: "/api/auth/second-step-social-registration",
};

export const SIGN_UP_STEP_TWO_EVENTS = {
	email: {
		mail: "email_check_v2",
		password: "password_check_v2",
		privacy: "terms_true_v2",
		subscribeEmails: "mailing_list_true_v2",
		subscribePush: "notification_true_v2",
		humanVerify: "human_verify_v2",
		errorVerify: "error_human_verify_v2",
		submit: "email_reg_v2",
		submit3step: " email_submit_reg_v2",
	},
	google: {
		mail: "google_email_check_v2",
		password: "google_password_check_v2",
		privacy: "google_terms_true_v2",
		subscribeEmails: "google_mailing_list_true_v2",
		subscribePush: "google_notification_true_v2",
		humanVerify: "google_human_verify_v2",
		errorVerify: "google_error_human_verify_v2",
		submit3step: "google_submit_reg_v2",
	},
	facebook_phone: {
		mail: "facebook_phone_email_check_v2",
		password: "facebook_phone_password_check_v2",
		privacy: "facebook_phone_terms_true_v2",
		subscribeEmails: "facebook_phone_mailing_list_true_v2",
		subscribePush: "facebook_phone_notification_true_v2",
		humanVerify: "facebook_phone_human_verify_v2",
		errorVerify: "facebook_phone_error_human_verify_v2",
		submit3step: "facebook_phone_submit_v2",
	},
	facebook_mail: {
		mail: "facebook_mail_email_check_v2",
		password: "facebook_mail_password_check_v2",
		privacy: "facebook_mail_terms_true_v2",
		subscribeEmails: "facebook_mail_mailing_list_true_v2",
		subscribePush: "facebook_mail_notification_true_v2",
		humanVerify: "facebook_mail_human_verify_v2",
		errorVerify: "facebook_mail_error_human_verify_v2",
		submit3step: "facebook_mail_submit_v2",
	},
	facebook: {
		error: {
			event: "facebook_error_message",
			params: {
				step: "3rd_step",
			},
		},
		gotIt: {
			event: "facebook_click_got_it_error_reg",
			params: {
				step: "3rd_step",
			},
		},
	},
	twitter: {
		mail: "twitter_mail_check_v2",
		password: "twitter_password_check_v2",
		privacy: "twitter_terms_true_v2",
		subscribeEmails: "twitter_mailing_list_true_v2",
		subscribePush: "twitter_notification_true_v2",
		humanVerify: "twitter_human_verify_v2",
		errorVerify: "twitter_error_human_verify_v2",
		submit3step: "twitter_submit_v2",
		error: {
			event: "twitter_error_message",
			params: {
				step: "3rd_step",
			},
		},
		gotIt: {
			event: "twitter_click_got_it_error_reg",
			params: {
				step: "3rd_step",
			},
		},
	},
};

export const BUTTON_AUTH_PROVIDER_EVENT = {
	email: { event: "email_reg_v2", params: { step: "2nd_step" } },
	google: { event: "google_reg_v2", params: { step: "2nd_step" } },
	facebook: { event: "facebook_reg_v2", params: { step: "2nd_step" } },
	twitter: { event: "twitter_reg_v2", params: { step: "2nd_step" } },
	login: { event: "sign_up_login", params: { step: "2nd_step" } },
};

export const AUTH_EVENTS_STEP_FOUR = {
	EDIT_EMAIL: { event: "edit_email", params: { step: "4th_step" } },
	VERIFY_CODE: { event: "verification_code", params: { step: "4th_step" } },
	CODE_ERROR: { event: "error_verification_code", params: { step: "4th_step" } },
	RESEND_CODE: { event: "resend_code", params: { step: "4th_step" } },
	SUBMIT: { event: "submit_verification", params: { step: "4th_step" } },
	DONT_RECEIVE: { event: "dont_receive_the_code", params: { step: "4th_step" } },
};

export const ELECTRICITY_EVENTS = {
	CHOOSE: {
		miner: { event: "choose_miners", params: { step: "2nd_step" } },
		rack: { event: "choose_racks", params: { step: "2nd_step" } },
		battery: { event: "choose_batteries", params: { step: "2nd_step" } },
		mutation_component: { event: "choose_parts", params: { step: "2nd_step" } },
		all: { event: "choose_all", params: { step: "2nd_step" } },
	},
	OPEN_TO_BUY: {
		miner: { event: "open_to_buy_miner", params: { step: "3rd_step" } },
		rack: { event: "open_to_buy_rack", params: { step: "3rd_step" } },
		battery: { event: "open_to_buy_battery", params: { step: "3rd_step" } },
		mutation_component: { event: "open_to_buy_part", params: { step: "3rd_step" } },
	},
	CLICK_BUY: { event: "click_buy_button", params: { step: "4th_step" } },

	PURCHASE: { event: "purchase" },
	SUCCESS_POPUP: {
		miner: { event: "congratulations_buy_miner", params: { step: "5th_step" } },
		rack: { event: "congratulations_buy_rack", params: { step: "5th_step" } },
		battery: { event: "congratulations_buy_battery", params: { step: "5th_step" } },
		mutation_component: { event: "congratulations_buy_part", params: { step: "5th_step" } },
	},
	CLOSE_POPUP: { event: "click_close_pop_up", params: { step: "5th_step" } },
	CONTINUE_SHOPPING: { event: "click_continue_shopping", params: { step: "5th_step" } },
	GO_TO_MARKETPLACE: { event: "click_go_to_marketplace", params: { step: "5th_step" } },
	GO_TO_STORAGE: { event: "click_go_to_storage", params: { step: "5th_step" } },
};

export const ELECTRICITY_PUBLISH_MESSAGES = {
	auto_recharge_activated: { status: true, text: "Auto-recharge activated" },
	auto_recharge_disabled: { status: true, text: "Auto-recharge disabled" },
	electricity_recharged: { status: true, text: "Electricity recharged" },
	not_enough_batteries: { status: false, text: "Not enough batteries" },
};
