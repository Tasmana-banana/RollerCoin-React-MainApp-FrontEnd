import React, { Component } from "react";
import { Col } from "reactstrap";
import LazyLoad from "react-lazyload";
import bonusTopOne from "../../assets/img/hall_of_fame/bonus/bonus_top_1.png";
import bonusTopTwo from "../../assets/img/hall_of_fame/bonus/bonus_top_2.png";
import bonusTopThree from "../../assets/img/hall_of_fame/bonus/bonus_top_3.png";
import bonusTopFive from "../../assets/img/hall_of_fame/bonus/bonus_top_5.png";
import bonusTopTen from "../../assets/img/hall_of_fame/bonus/bonus_top_10.png";
import bonusTopHundred from "../../assets/img/hall_of_fame/bonus/bonus_top_100.png";

class BonusCups extends Component {
	render() {
		const bonusCups = [
			{ image: bonusTopOne, place: "1st", bonus: "15 000 RLT", additionalText: false },
			{ image: bonusTopTwo, place: "2nd", bonus: "10 000 RLT", additionalText: false },
			{ image: bonusTopThree, place: "3rd", bonus: "6 000 RLT", additionalText: false },
			{ image: bonusTopFive, place: "4-5th", bonus: "4 000 RLT", additionalText: false },
			{ image: bonusTopTen, place: "6-10th", bonus: "1 500 RLT", additionalText: false },
			{ image: bonusTopHundred, place: "11-100th", bonus: "500 RLT", additionalText: true },
		];
		return bonusCups.map((item) => (
			<Col key={item.place} xs={6} lg={2} className="hall-bonus-item">
				<div>
					<LazyLoad offset={100}>
						<img src={item.image} alt="tokens limit" />
					</LazyLoad>
				</div>
				<p className="hall-bonus-place-text">
					<span className="hall-bonus-place">{item.place}</span> place
				</p>
				{!item.additionalText && (
					<p className="hall-bonus-item-amount">
						<span className="hall-bonus-amount">{item.bonus}</span> bonus
					</p>
				)}
				{item.additionalText && (
					<p className="hall-bonus-item-amount">
						50 prizes <span className="hall-bonus-amount">{item.bonus}</span> each (lottery)
					</p>
				)}
			</Col>
		));
	}
}
export default BonusCups;
