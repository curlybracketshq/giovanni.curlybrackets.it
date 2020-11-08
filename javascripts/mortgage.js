'use strict';

(function () {
  var DEBUG = true;
  var DATE_SEPARATOR = '/';
  var DECIMAL_SEPARATOR = '.';
  var DEFAULT_CURRENCY_SYMBOL = '$';
  var TIME_UNIT_YEARS = 'years';
  var INPUT_PRINCIPAL = document.getElementById('principal');
  var INPUT_TIME_YEARS = document.getElementById('time_years');
  var INPUT_INTEREST_RATE = document.getElementById('interest_rate');
  var INPUT_START_DATE = document.getElementById('start_date');
  var OUTPUT_SUMMARY = document.getElementById('output_summary');
  var OUTPUT_SCHEDULE = document.getElementById('output_schedule');

  function updateData(key, type, event) {
    INPUT_DATA[key] = parseInput(type, event.target.value);
    computeAmortizationSchedule();
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
    var power = Math.pow(10, precision);
    var rounded = Math.round(value * power);
    var decimal = rounded % power;
    var decimalStr = (decimal + power).toString().substr(1);
    var integerStr = ((rounded - decimal) / power).toString();
    return integerStr + DECIMAL_SEPARATOR + decimalStr;
  }

  function formatCurrency(value) {
    return DEFAULT_CURRENCY_SYMBOL + toFixedWithPadding(value, 2);
  }

  function formatPercentage(value, precision) {
    return toFixed(value, precision) + '%';
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
      case 'total_mortgage':
      case 'total_interest':
      case 'remaining_principal':
      case 'payment_amount':
      case 'payment_interest_amount':
      case 'payment_principal_amount':
        return formatCurrency(value);
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
        return !isNaN(value) && value > 0;
      case 'interest_rate':
        return !isNaN(value) && value >= 0 && value <= 100;
      case 'start_date':
        return !isNaN(value.month) && !isNaN(value.year) &&
          value.month >= 1 && value.month <= 12 &&
          value.year >= 1980 && value.year <= 3000;
    }
    return true;
  }

  function isInputDataValid() {
    var isValid = true;
    for (var key in INPUT_DATA) {
      isValid = isValid && isInputDataValueValid(key, INPUT_DATA[key]);
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

    if (isInputDataValid()) {
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

    if (!isInputDataValid()) {
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

  function computeAmortizationSchedule() {
    if (isInputDataValid()) {
      // Assuming monthly payments
      COMPUTED_DATA.periods = INPUT_DATA.time_years * 12;
      COMPUTED_DATA.periodic_interest = INPUT_DATA.interest_rate / 100 / 12;
      // See https://en.wikipedia.org/wiki/Amortization_calculator
      var power = Math.pow(1 + COMPUTED_DATA.periodic_interest, COMPUTED_DATA.periods);
      var numerator = COMPUTED_DATA.periodic_interest * power;
      var denominator = power - 1;
      COMPUTED_DATA.periodic_payment = INPUT_DATA.principal * numerator / denominator;
      COMPUTED_DATA.total_mortgage = COMPUTED_DATA.periodic_payment * COMPUTED_DATA.periods;
      COMPUTED_DATA.total_interest = COMPUTED_DATA.total_mortgage - INPUT_DATA.principal;
      SCHEDULE_DATA = [];
      var principal = INPUT_DATA.principal;
      for (var i = 0; i < COMPUTED_DATA.periods; i++) {
        var payment_amount = COMPUTED_DATA.periodic_payment;
        var payment_interest_amount = principal * COMPUTED_DATA.periodic_interest;
        var payment_principal_amount = payment_amount - payment_interest_amount;
        principal -= payment_principal_amount;
        SCHEDULE_DATA.push([
          {key: 'date', value: addMonths(INPUT_DATA.start_date, i)},
          {key: 'payment_amount', value: payment_amount},
          {key: 'payment_interest_amount', value: payment_interest_amount},
          {key: 'payment_principal_amount', value: payment_principal_amount},
          {key: 'remaining_principal', value: principal},
        ]);
      }
    }
    displaySummary();
    displaySchedule();
  }

  INPUT_PRINCIPAL.addEventListener('input', updateData.bind(this, 'principal', 'float'));
  INPUT_TIME_YEARS.addEventListener('input', updateData.bind(this, 'time_years', 'integer'));
  INPUT_INTEREST_RATE.addEventListener('input', updateData.bind(this, 'interest_rate', 'float'));
  INPUT_START_DATE.addEventListener('input', updateData.bind(this, 'start_date', 'date'));

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
  var SCHEDULE_DATA = [];

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

  computeAmortizationSchedule();
}());
