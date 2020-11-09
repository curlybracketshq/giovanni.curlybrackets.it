'use strict';

(function () {
  var DEBUG = false;
  var DATE_SEPARATOR = '/';
  var DECIMAL_SEPARATOR = '.';
  var THOUNSANDS_SEPARATOR = ',';
  var DEFAULT_CURRENCY_SYMBOL = '$';
  var TIME_UNIT_YEARS = 'years';
  var INPUT_PRINCIPAL = document.getElementById('principal');
  var INPUT_TIME_YEARS = document.getElementById('time_years');
  var INPUT_INTEREST_RATE = document.getElementById('interest_rate');
  var INPUT_START_DATE = document.getElementById('start_date');
  var PRE_PAYMENT_INDEX = 0;
  var PRE_PAYMENT_FORMS = document.getElementById('pre_payment_forms');
  var BUTTON_ADD_PRE_PAYMENT = document.getElementById('add_pre_payment');
  var OUTPUT_SUMMARY = document.getElementById('output_summary');
  var OUTPUT_SCHEDULE = document.getElementById('output_schedule');

  function updateData(key, type, event) {
    INPUT_DATA[key] = parseInput(type, event.target.value);
    computeData();
  }

  function updatePrePaymentData(index, key, type, event) {
    var prePaymentData = PRE_PAYMENTS_DATA[index];
    if (prePaymentData == null) {
      return;
    }
    prePaymentData[key] = parseInput(type, event.target.value);
    computeData();
  }

  function addPrePayment(event) {
    addPrePaymentForm();
    computeData();
  }

  function addPrePaymentForm() {
    var form = document.createElement('div');
    form.className = 'form';

    var prePaymentInput = document.createElement('input');
    prePaymentInput.className = 'pre_payment';
    prePaymentInput.type = 'text';
    prePaymentInput.placeholder = '70000';
    prePaymentInput.addEventListener(
      'input',
      updatePrePaymentData.bind(this, PRE_PAYMENT_INDEX, 'pre_payment', 'float'),
    );

    var prePaymentDateInput = document.createElement('input');
    prePaymentDateInput.className = 'pre_payment_date';
    prePaymentDateInput.type = 'text';
    prePaymentDateInput.placeholder = '11/2020';
    prePaymentDateInput.addEventListener(
      'input',
      updatePrePaymentData.bind(this, PRE_PAYMENT_INDEX, 'pre_payment_date', 'date'),
    );

    var removePrePaymentButton = document.createElement('button');
    removePrePaymentButton.className = 'remove_pre_payment';
    removePrePaymentButton.textContent = 'Remove pre-payment';
    removePrePaymentButton.addEventListener(
      'click',
      removePrePayment.bind(this, PRE_PAYMENT_INDEX, form),
    );

    var formContent = document.createElement('div');
    formContent.className = 'form_content';
    formContent.appendChild(document.createTextNode('I will pre-pay $ '));
    formContent.appendChild(prePaymentInput);
    formContent.appendChild(document.createTextNode(' on '));
    formContent.appendChild(prePaymentDateInput);
    form.appendChild(formContent);
    form.appendChild(removePrePaymentButton);

    PRE_PAYMENT_FORMS.appendChild(form);
    PRE_PAYMENTS_DATA[PRE_PAYMENT_INDEX] = {
      pre_payment: null,
      pre_payment_date: {month: null, year: null},
    };
    PRE_PAYMENT_INDEX++;
  }

  function removePrePayment(index, node, event) {
    node.remove();
    delete PRE_PAYMENTS_DATA[index];
    computeData();
  }

  function queryPrePaymentInputs() {
    return document.getElementsByClassName('pre_payment');
  }

  function queryPrePaymentDateInputs() {
    return document.getElementsByClassName('pre_payment_date');
  }

  function parseInput(type, value) {
    switch (type) {
      case 'integer':
        return parseInt(value, 10);
      case 'float':
        return parseFloat(value);
      case 'date':
        var dateSections = value.split(DATE_SEPARATOR);
        return {
          month: parseInt(dateSections[0], 10),
          year: parseInt(dateSections[1], 10),
        };
    }
    return value;
  }

  function toHuman(key) {
    switch (key) {
      case 'principal':
        return 'Principal';
      case 'time_years':
        return 'Time (years)';
      case 'interest_rate':
        return 'Interest rate';
      case 'start_date':
        return 'Start date';
      case 'periods':
        return '# of payments';
      case 'periodic_interest':
        return 'Periodic interest rate';
      case 'periodic_payment':
        return 'Payment amount';
      case 'total_mortgage':
        return 'Total mortgage amount';
      case 'total_interest':
        return 'Total interest amount';
      case 'date':
        return 'Date';
      case 'payment_amount':
        return 'Payment amount';
      case 'payment_interest_amount':
        return 'Interest amount';
      case 'payment_principal_amount':
        return 'Principal amount';
      case 'remaining_principal':
        return 'Remaining principal';
    }
    return key;
  }

  function toFixed(value, precision) {
    var power = Math.pow(10, precision);
    return (Math.round(value * power) / power).toString();
  }

  function toFixedWithPadding(value, precision) {
    var signFactor = value < 0 ? -1 : 1;
    var power = Math.pow(10, precision);
    var rounded = Math.round(value * power);
    var decimal = rounded % power;
    var decimalStr = ((decimal + power * signFactor) * signFactor).toString().substr(1);
    var integer = (rounded - decimal) / power;
    return toThounsands(integer) + DECIMAL_SEPARATOR + decimalStr;
  }

  function toThounsands(value) {
    var sign = value < 0;
    var valueStr = Math.abs(value).toString().split('');
    var output = [];
    for (var i = 0; i < valueStr.length; i++) {
      if (i > 0 && i % 3 == 0) {
        output.push(THOUNSANDS_SEPARATOR);
      }
      output.push(valueStr[valueStr.length - 1 - i]);
    }
    return (sign ? '-' : '') + output.reverse().join('');
  }

  function formatCurrency(value) {
    return DEFAULT_CURRENCY_SYMBOL + toFixedWithPadding(value, 2);
  }

  function formatCurrencyWithComparison(value, oldValue) {
    if (value == oldValue) {
      return formatCurrency(value);
    }

    var delta = value - oldValue;
    var percentage = delta / oldValue * 100.0;
    return formatCurrency(value) + ' (' + formatCurrency(value - oldValue) +
      ', ' + formatPercentage(percentage, 2) + ')';
  }

  function formatPercentage(value, precision) {
    return toFixedWithPadding(value, precision) + '%';
  }

  function formatTime(value, unit) {
    return value.toString() + ' ' + unit;
  }

  function formatDate(value) {
    var month = (100 + value.month).toString().substr(1);
    return month + DATE_SEPARATOR + value.year.toString();
  }

  function formatDataValue(key, value) {
    switch (key) {
      case 'principal':
      case 'periodic_payment':
      case 'remaining_principal':
      case 'payment_amount':
      case 'payment_interest_amount':
      case 'payment_principal_amount':
        return formatCurrency(value);
      case 'total_mortgage':
      case 'total_interest':
        return formatCurrencyWithComparison(
          value,
          COMPUTED_DATA_WITHOUT_PRE_PAYMENTS[key],
        );
      case 'time_years':
        return formatTime(value, TIME_UNIT_YEARS);
      case 'interest_rate':
        return formatPercentage(value, 2);
      case 'periodic_interest':
        return formatPercentage(value, 4);
      case 'start_date':
      case 'date':
        return formatDate(value);
    }
    return value;
  }

  function isInputDataValueValid(key, value) {
    switch (key) {
      case 'principal':
      case 'time_years':
      // TODO: Check that pre_payment is at least less than principal
      case 'pre_payment':
        return !isNaN(value) && value > 0;
      case 'interest_rate':
        return !isNaN(value) && value >= 0 && value <= 100;
      case 'start_date':
      // TODO: Check that pre_payment_date is after start_date and before the
      // end of the mortgage
      case 'pre_payment_date':
        return !isNaN(value.month) && !isNaN(value.year) &&
          value.month >= 1 && value.month <= 12 &&
          value.year >= 1980 && value.year <= 3000;
      // Computed values are valid by construction
      case 'periods':
      case 'periodic_interest':
      case 'periodic_payment':
      case 'total_mortgage':
      case 'total_interest':
        return true;
    }
    return false;
  }

  function isInputDataValid(data) {
    var isValid = true;
    for (var key in data) {
      isValid = isValid && isInputDataValueValid(key, data[key]);
      if (!isValid) {
        return false;
      }
    }
    return true;
  }

  function buildSummaryItem(key, value) {
    var content = toHuman(key) + ': ';
    // Print number only if it's valid
    if (isInputDataValueValid(key, value)) {
      content += formatDataValue(key, value);
    }
    var item = document.createElement('div');
    item.textContent = content;
    return item;
  }

  function displaySummary() {
    OUTPUT_SUMMARY.textContent = '';

    var title = document.createElement('h2');
    title.textContent = 'Summary';
    OUTPUT_SUMMARY.appendChild(title);

    for (var key in INPUT_DATA) {
      var item = buildSummaryItem(key, INPUT_DATA[key]);
      OUTPUT_SUMMARY.appendChild(item);
    }

    if (isInputDataValid(INPUT_DATA)) {
      for (var key in COMPUTED_DATA) {
        var item = buildSummaryItem(key, COMPUTED_DATA[key]);
        OUTPUT_SUMMARY.appendChild(item);
      }
    }
  }

  function buildScheduleRow(columns) {
    var row = document.createElement('tr');
    for (var i = 0; i < columns.length; i++) {
      var cell = document.createElement('td');
      cell.className = columns[i].key;
      cell.textContent = formatDataValue(columns[i].key, columns[i].value);
      row.appendChild(cell);
    }
    return row;
  }

  function displaySchedule() {
    OUTPUT_SCHEDULE.textContent = '';

    if (!isInputDataValid(INPUT_DATA)) {
      return;
    }

    if (SCHEDULE_DATA.length < 1) {
      return;
    }

    var title = document.createElement('h2');
    title.textContent = 'Amortization Schedule';
    OUTPUT_SCHEDULE.appendChild(title);

    var table = document.createElement('table');
    OUTPUT_SCHEDULE.appendChild(table);

    var firstRow = SCHEDULE_DATA[0];
    var headerRow = document.createElement('tr');
    for (var i = 0; i < firstRow.length; i++) {
      var cell = document.createElement('th');
      cell.textContent = toHuman(firstRow[i].key);
      headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);

    for (var i = 0; i < SCHEDULE_DATA.length; i++) {
      var row = buildScheduleRow(SCHEDULE_DATA[i]);
      table.appendChild(row);
    }
  }

  function addMonths(startDate, months) {
    months += startDate.month - 1;
    return {
      month: months % 12 + 1,
      year: startDate.year + Math.floor(months / 12),
    }
  }

  // Returns the number of months between start and end dates.
  function subtractDate(startDate, endDate) {
    var yearDelta = endDate.year - startDate.year;
    var monthDelta = yearDelta > 0 ?
      endDate.month + (12 - startDate.month) :
      endDate.month - startDate.month;
    return monthDelta + Math.max(0, yearDelta - 1) * 12;
  }

  function computeData() {
    if (isInputDataValid(INPUT_DATA)) {
      // Assuming monthly payments
      COMPUTED_DATA.periods = INPUT_DATA.time_years * 12;
      COMPUTED_DATA.periodic_interest = INPUT_DATA.interest_rate / 100 / 12;
      // See https://en.wikipedia.org/wiki/Amortization_calculator
      var power = Math.pow(1 + COMPUTED_DATA.periodic_interest, COMPUTED_DATA.periods);
      var numerator = COMPUTED_DATA.periodic_interest * power;
      var denominator = power - 1;
      COMPUTED_DATA.periodic_payment = INPUT_DATA.principal * numerator / denominator;

      var prePayments = [];
      for (var key in PRE_PAYMENTS_DATA) {
        var prePaymentsData = PRE_PAYMENTS_DATA[key];
        if (isInputDataValid(prePaymentsData)) {
          prePayments.push(prePaymentsData);
        }
      }
      var prePaymentsByPeriod = {};
      for (var i = 0; i < prePayments.length; i++) {
        var period = subtractDate(INPUT_DATA.start_date, prePayments[i].pre_payment_date);
        prePaymentsByPeriod[period] = prePayments[i].pre_payment;
      }

      var computed = computeAmortizationSchedule(prePaymentsByPeriod);
      COMPUTED_DATA.total_mortgage = computed.total_mortgage;
      COMPUTED_DATA.total_interest = computed.total_interest;
      SCHEDULE_DATA = computed.schedule_data;

      COMPUTED_DATA_WITHOUT_PRE_PAYMENTS = computeAmortizationSchedule({});
    }

    displaySummary();
    displaySchedule();
  }

  function computeAmortizationSchedule(prePaymentsByPeriod) {
    var output = {}
    output.total_mortgage = 0;
    output.schedule_data = [];
    var principal = INPUT_DATA.principal;
    for (var i = 0; i < COMPUTED_DATA.periods && principal > 0; i++) {
      var prePayment = prePaymentsByPeriod[i];
      prePayment = prePayment != null ? prePayment : 0;
      var paymentInterestAmount = principal * COMPUTED_DATA.periodic_interest;
      var paymentAmount = Math.min(
        principal + paymentInterestAmount,
        COMPUTED_DATA.periodic_payment,
      );
      var paymentPrincipalAmount = paymentAmount - paymentInterestAmount + prePayment;
      principal -= paymentPrincipalAmount;
      var effectivePaymentAmount = paymentAmount + prePayment;
      output.schedule_data.push([
        {key: 'date', value: addMonths(INPUT_DATA.start_date, i)},
        {key: 'payment_amount', value: effectivePaymentAmount},
        {key: 'payment_interest_amount', value: paymentInterestAmount},
        {key: 'payment_principal_amount', value: paymentPrincipalAmount},
        {key: 'remaining_principal', value: principal},
      ]);
      output.total_mortgage += effectivePaymentAmount;
    }

    output.total_interest = output.total_mortgage - INPUT_DATA.principal;
    return output;
  }

  INPUT_PRINCIPAL.addEventListener('input', updateData.bind(this, 'principal', 'float'));
  INPUT_TIME_YEARS.addEventListener('input', updateData.bind(this, 'time_years', 'integer'));
  INPUT_INTEREST_RATE.addEventListener('input', updateData.bind(this, 'interest_rate', 'float'));
  INPUT_START_DATE.addEventListener('input', updateData.bind(this, 'start_date', 'date'));

  BUTTON_ADD_PRE_PAYMENT.addEventListener('click', addPrePayment);

  var INPUT_DATA = {
    principal: parseInput('float', INPUT_PRINCIPAL.value),
    time_years: parseInput('integer', INPUT_TIME_YEARS.value),
    interest_rate: parseInput('float', INPUT_INTEREST_RATE.value),
    start_date: parseInput('date', INPUT_START_DATE.value),
  };
  var COMPUTED_DATA = {
    periods: null,
    periodic_interest: null,
    periodic_payment: null,
    total_mortgage: null,
    total_interest: null,
  };
  var COMPUTED_DATA_WITHOUT_PRE_PAYMENTS = {
    total_mortgage: null,
    total_interest: null,
  };
  var SCHEDULE_DATA = [];
  var PRE_PAYMENTS_DATA = {};

  if (DEBUG) {
    INPUT_PRINCIPAL.value = 500000;
    INPUT_TIME_YEARS.value = 15;
    INPUT_INTEREST_RATE.value = 3.5;
    INPUT_START_DATE.value = '05/2019';
    INPUT_DATA = {
      principal: 500000,
      time_years: 15,
      interest_rate: 3.5,
      start_date: {month: 5, year: 2019},
    };
  }

  computeData();
}());
