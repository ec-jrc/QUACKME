export function checkCorectenessOfString(value, regex, elementObj, propertyName) {
  if (isNaN(value)) {
    const found = value.match(regex);
    if (found == null) {
      return elementObj[propertyName].value;
    }
  }
  return value;
}

export function setObervationStatus(element, paramenter: boolean, originalValues, propertyName, initialElement) {
  if (paramenter) {
    element = Object.assign({}, element, { status: 'F' });
  } else {
    const selectedalert = originalValues.alerts.find((ele) => {
      return ele.property === propertyName;
    });
    if (initialElement.value !== element.value) {
      element = Object.assign({}, element, { status: 'M' });
    } else {
      element = Object.assign({}, element, { status: selectedalert.level });
    }
  }
  return element;
}
