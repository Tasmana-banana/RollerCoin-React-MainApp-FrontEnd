const renderCaptchaV2 = (cb) => {
	if (!window.grecaptcha) {
		window.grecaptcha = {};
	}
	if (!window.grecaptcha.ready) {
		window.grecaptcha.ready = (f) => {
			if (!window.___grecaptcha_cfg) {
				window.___grecaptcha_cfg = {};
			}
			if (!window.___grecaptcha_cfg.fns) {
				window.___grecaptcha_cfg.fns = [];
			}
			window.___grecaptcha_cfg.fns.push(f);
		};
	}
	if (window.grecaptcha && window.grecaptcha.ready) {
		window.grecaptcha.ready(() =>
			window.grecaptcha.render("google-block", {
				sitekey: "6LcndS0aAAAAALgWmnCP4tlnC9MgYZiPi3JoRjYa",
				callback: cb,
				theme: "dark",
			})
		);
	}
};

export default renderCaptchaV2;
