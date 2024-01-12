import React, { Suspense } from "react";
import "abortcontroller-polyfill/dist/polyfill-patch-fetch";
import ReactDOM from "react-dom";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/react";
import Fingerprint2 from "fingerprintjs2";
import UtmTags from "./components/UtmTags/UtmTags";
import { history } from "./reducers";
import store from "./store";
import * as actionsUser from "./actions/userInfo";
import "./services/languageService";

// TODO: Improve method of loading
import "./services/geetest";

import "./assets/scss/Main.scss";

// import middleware
import WSocket from "./services/connectClass";
import Routes from "./routes";
import loaderImg from "./assets/img/icon/hamster_loader.gif";

// Sentry.init({
// 	enabled: true,
// 	dsn: `https://${process.env.SENTRY_PUBLIC_KEY}@sentry.rollercoin.com/${process.env.SENTRY_PROJECT_ID}`,
//  environment: "development",
//  debug: false,
// 	integrations: [new Sentry.BrowserTracing()],
// 	tracesSampleRate: 1.0,
// });
Sentry.init({
	enabled: true,
	dsn: `https://${process.env.SENTRY_PUBLIC_KEY}@sentry.rollercoin.com/${process.env.SENTRY_PROJECT_ID}`,
	ignoreErrors: [
		/Permissions check failed/gi,
		/Cannot read properties of undefined \(reading 'add'\)/gi,
		/ResizeObserver/gi,
		/fullscreen error/gi,
		"Cannot read data",
		"document.getElementsByClassName(...)[0] is undefined",
	],
	replaysSessionSampleRate: 0.01,
	replaysOnErrorSampleRate: 0.2,
	integrations: [new Sentry.Replay()],
});

const setFingerprint = () =>
	new Promise((resolve) => {
		Fingerprint2.get((components) => {
			const values = components.map((component) => component.value);
			const fingerprint = Fingerprint2.x64hash128(values.join(""), 31);
			resolve(fingerprint);
		});
	});

const wsReact = new WSocket(process.env.WS);
if (!document.querySelector(".wrapper")) {
	setFingerprint().then((fingerprint) => {
		store.dispatch(actionsUser.setFingerprint(fingerprint));
	});

	ReactDOM.render(
		<Provider store={store}>
			<ConnectedRouter history={history}>
				<GoogleReCaptchaProvider
					reCaptchaKey="6LekjXkUAAAAANf5HflrfyeFlRriNuiUoxdj2TU6"
					language="en"
					useRecaptchaNet={true}
					scriptProps={{
						async: false,
						defer: false,
						appendTo: "head",
						nonce: undefined,
					}}
				>
					<UtmTags>
						<Suspense
							fallback={
								<div className="preloader">
									<img src={loaderImg} width={195} height={195} className="loader-img" alt="hamster loader" />
								</div>
							}
						>
							<Routes wsReact={wsReact} history={history} />
						</Suspense>
					</UtmTags>
				</GoogleReCaptchaProvider>
			</ConnectedRouter>
		</Provider>,
		document.getElementById("root"),
		() => wsReact.connect()
	);
}
