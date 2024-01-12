import React from "react";
import { Col, Container, Row } from "reactstrap";
import { Route, Switch } from "react-router-dom";
import { useSelector } from "react-redux";
import DefaultAvatarPage from "../../components/CreateProfile/DefaultAvatarPage";
import NftAvatarPage from "../../components/CreateProfile/NFTAvatarPage";
import getLanguagePrefix from "../../services/getLanguagePrefix";

const CustomizeAvatar = () => {
	const language = useSelector((state) => state.game.language);
	return (
		<Container className="customize-avatar-page-wrapper">
			<Row className="justify-content-center">
				<Col xs="12" lg="10">
					<Switch>
						<Route exact path={`${getLanguagePrefix(language)}/customize-avatar`} render={() => <DefaultAvatarPage />} />
						<Route exact path={`${getLanguagePrefix(language)}/customize-avatar/nft`} render={() => <NftAvatarPage />} />
					</Switch>
				</Col>
			</Row>
		</Container>
	);
};

export default CustomizeAvatar;
