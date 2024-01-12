import React from "react";
import LazyLoad from "react-lazyload";
import chartLoader from "../../assets/img/singleComponents/chart-loader.svg";
import "../../assets/scss/SingleComponents/ChartLoader.scss";

const ChartLoader = () => {
	return (
		<div className="chart-loader">
			<LazyLoad offset={100}>
				<img src={chartLoader} alt="Loader" />
			</LazyLoad>
		</div>
	);
};

export default ChartLoader;
