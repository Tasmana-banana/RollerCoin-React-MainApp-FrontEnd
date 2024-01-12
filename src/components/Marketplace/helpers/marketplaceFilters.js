import getCurrencyConfig from "../../../services/getCurrencyConfig";

const generateFilters = (filters, selectedType) => {
	const rltConfig = getCurrencyConfig("RLT");

	return filters[selectedType].reduce((typeAcc, val) => {
		if (val.type === "range") {
			const min = val.name === "price" ? Math.floor(val.min / rltConfig.toSmall) : val.min;
			const max = val.name === "price" ? Math.ceil(val.max / rltConfig.toSmall) : val.max;
			typeAcc[val.name] = {
				type: val.type,
				min,
				max,
				limitMin: min,
				limitMax: max,
			};
		} else if (val.type === "list") {
			const values = val.values.reduce((valueAcc, name) => {
				valueAcc[name] = false;
				return valueAcc;
			}, {});
			typeAcc[val.name] = {
				type: val.type,
				values,
			};
		}
		return typeAcc;
	}, {});
};

const responseFilters = (filters) => {
	if (!filters) {
		return { filter: [] };
	}
	const rltConfig = getCurrencyConfig("RLT");
	const adoptedFilters = Object.keys(filters).reduce((acc, key) => {
		const currentFilter = filters[key];
		if (currentFilter.type === "range") {
			const min = key === "price" ? currentFilter.min * rltConfig.toSmall : currentFilter.min;
			const max = key === "price" ? currentFilter.max * rltConfig.toSmall : currentFilter.max;
			acc.push({ name: key, min, max });
		}
		if (currentFilter.type === "list") {
			const currentValues = Object.keys(currentFilter.values).reduce((valueAcc, valueKey) => {
				if (currentFilter.values[valueKey]) {
					valueAcc.push(valueKey);
				}
				return valueAcc;
			}, []);
			if (currentValues.length) {
				acc.push({ name: key, values: currentValues });
			}
		}
		return acc;
	}, []);
	return { filter: adoptedFilters };
};

export { generateFilters, responseFilters };
