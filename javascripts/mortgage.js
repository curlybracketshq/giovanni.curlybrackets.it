(function () {
  'use strict';

  // Configuration values
  var C = {
    debug: true,
    dateSeparator: '/',
    decimalSeparator: '.',
    thounsandsSeparator: ',',
    vizAbsoluteSize: 200,
    vizRelativeSize: 100,
    currencySymbol: '$',
    timeUnitYears: 'years',
    scheduleRowIdPrefix: 'period_',
    selectedPeriodClass: 'selected_period',
    scheduleCols: [
      'date',
      'payment_amount',
      'payment_interest_amount',
      'payment_principal_amount',
      'remaining_principal',
    ],
  };

  // Elements
  var E = {
    inputPrincipal: document.getElementById('principal'),
    inputTimeYears: document.getElementById('time_years'),
    inputInterestRate: document.getElementById('interest_rate'),
    inputStartDate: document.getElementById('start_date'),
    prePaymentForms: document.getElementById('pre_payment_forms'),
    buttonAddPrePayment: document.getElementById('add_pre_payment'),
    outputSummary: document.getElementById('output_summary'),
    outputSchedule: document.getElementById('output_schedule'),
    svgVizHouse: document.getElementById('house'),
    svgVizBank: document.getElementById('bank'),
    svgVizPrincipalProgress: document.getElementById('principal_progress'),
    svgVizInterestProgress: document.getElementById('interest_progress'),
    inputVizTime: document.getElementById('viz_time'),
  };

  // Global state
  var G = {
    prePaymentIndex: 0,
    selectedDate: new Date(),
  };

  // Attach event listeners
  E.inputPrincipal.addEventListener('input', updateData.bind(this, 'principal', 'float'));
  E.inputTimeYears.addEventListener('input', updateData.bind(this, 'time_years', 'integer'));
  E.inputInterestRate.addEventListener('input', updateData.bind(this, 'interest_rate', 'float'));
  E.inputStartDate.addEventListener('input', updateData.bind(this, 'start_date', 'date'));
  E.buttonAddPrePayment.addEventListener('click', addPrePayment);
  E.inputVizTime.addEventListener('input', function (event) {
    return updateDataViz(parseInt(event.target.value, 10));
  });

  // Data model
  var INPUT_DATA = {
    principal: parseInput('float', E.inputPrincipal.value),
    time_years: parseInput('integer', E.inputTimeYears.value),
    interest_rate: parseInput('float', E.inputInterestRate.value),
    start_date: parseInput('date', E.inputStartDate.value),
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

  // Initialization for debugging purpose
  if (C.debug) {
    E.inputPrincipal.value = 500000;
    E.inputTimeYears.value = 15;
    E.inputInterestRate.value = 3.5;
    E.inputStartDate.value = '05/2019';
    INPUT_DATA = {
      principal: 500000,
      time_years: 15,
      interest_rate: 3.5,
      start_date: {month: 5, year: 2019},
    };
  }

  // Initialization
  setTheme();
  computeData();

  //
  // Functions
  //

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
    prePaymentInput.addEventListener('input', function (event) {
      updatePrePaymentData(G.prePaymentIndex, 'pre_payment', 'float', event);
    });

    var prePaymentDateInput = document.createElement('input');
    prePaymentDateInput.className = 'pre_payment_date';
    prePaymentDateInput.type = 'text';
    prePaymentDateInput.placeholder = '11/2020';
    prePaymentDateInput.addEventListener('input', function (event) {
      updatePrePaymentData(G.prePaymentIndex, 'pre_payment_date', 'date', event);
    });

    var removePrePaymentButton = document.createElement('button');
    removePrePaymentButton.className = 'remove_pre_payment';
    removePrePaymentButton.textContent = 'Remove pre-payment';
    removePrePaymentButton.addEventListener('click', function (event) {
      removePrePayment(G.prePaymentIndex, form, event);
    });

    var formContent = document.createElement('div');
    formContent.className = 'form_content';
    formContent.appendChild(document.createTextNode('I will pre-pay $ '));
    formContent.appendChild(prePaymentInput);
    formContent.appendChild(document.createTextNode(' on '));
    formContent.appendChild(prePaymentDateInput);
    form.appendChild(formContent);
    form.appendChild(removePrePaymentButton);

    E.prePaymentForms.appendChild(form);
    PRE_PAYMENTS_DATA[G.prePaymentIndex] = {
      pre_payment: null,
      pre_payment_date: {month: null, year: null},
    };
    G.prePaymentIndex++;
  }

  function removePrePayment(index, node, event) {
    node.remove();
    delete PRE_PAYMENTS_DATA[index];
    computeData();
  }

  function parseInput(type, value) {
    switch (type) {
      case 'integer':
        return parseInt(value, 10);
      case 'float':
        return parseFloat(value);
      case 'date':
        var dateSections = value.split(C.dateSeparator);
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
    return toThounsands(integer) + C.decimalSeparator + decimalStr;
  }

  function toThounsands(value) {
    var sign = value < 0;
    var valueStr = Math.abs(value).toString().split('');
    var output = [];
    for (var i = 0; i < valueStr.length; i++) {
      if (i > 0 && i % 3 == 0) {
        output.push(C.thounsandsSeparator);
      }
      output.push(valueStr[valueStr.length - 1 - i]);
    }
    return (sign ? '-' : '') + output.reverse().join('');
  }

  function formatCurrency(value) {
    return C.currencySymbol + toFixedWithPadding(value, 2);
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
    return month + C.dateSeparator + value.year.toString();
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
          COMPUTED_DATA_WITHOUT_PRE_PAYMENTS[key]
        );
      case 'time_years':
        return formatTime(value, C.timeUnitYears);
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
    for (var key in data) {
      if (data.hasOwnProperty(key) && !isInputDataValueValid(key, data[key])) {
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
    E.outputSummary.textContent = '';

    var title = document.createElement('h2');
    title.textContent = 'Summary';
    E.outputSummary.appendChild(title);

    var key, item;
    for (key in INPUT_DATA) {
      if (INPUT_DATA.hasOwnProperty(key)) {
        item = buildSummaryItem(key, INPUT_DATA[key]);
        E.outputSummary.appendChild(item);
      }
    }

    if (!isInputDataValid(INPUT_DATA)) {
      return;
    }

    for (key in COMPUTED_DATA) {
      if (COMPUTED_DATA.hasOwnProperty(key)) {
        item = buildSummaryItem(key, COMPUTED_DATA[key]);
        E.outputSummary.appendChild(item);
      }
    }
  }

  // Convert a JS date to a date object.
  function toDate(date) {
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  }

  function buildScheduleRow(data) {
    var row = document.createElement('tr');
    for (var i = 0; i < C.scheduleCols.length; i++) {
      var cell = document.createElement('td');
      var key = C.scheduleCols[i];
      cell.className = key;
      cell.textContent = formatDataValue(key, data[key]);
      row.appendChild(cell);
    }
    return row;
  }

  function displaySchedule() {
    E.outputSchedule.textContent = '';

    if (!isInputDataValid(INPUT_DATA)) {
      return;
    }

    if (SCHEDULE_DATA.length < 1) {
      return;
    }

    var title = document.createElement('h2');
    title.textContent = 'Amortization Schedule';
    E.outputSchedule.appendChild(title);

    var table = document.createElement('table');
    E.outputSchedule.appendChild(table);

    var i = 0;
    var headerRow = document.createElement('tr');
    for (i = 0; i < C.scheduleCols.length; i++) {
      var cell = document.createElement('th');
      cell.textContent = toHuman(C.scheduleCols[i]);
      headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);

    for (i = 0; i < SCHEDULE_DATA.length; i++) {
      var row = buildScheduleRow(SCHEDULE_DATA[i]);
      row.id = C.scheduleRowIdPrefix + (i + 1);
      if (dateDelta(SCHEDULE_DATA[i].date, toDate(G.selectedDate)) == 0) {
        row.className = C.selectedPeriodClass;
      }
      table.appendChild(row);
    }
  }

  function displayViz() {
    if (!isInputDataValid(INPUT_DATA)) {
      return;
    }

    if (COMPUTED_DATA.periods < 1) {
      return;
    }

    var interestToPrincipalRatio = COMPUTED_DATA.total_interest / INPUT_DATA.principal;

    E.svgVizHouse.setAttribute('width', C.vizAbsoluteSize);
    E.svgVizHouse.setAttribute('height', C.vizAbsoluteSize);
    E.svgVizBank.setAttribute('width', C.vizAbsoluteSize * interestToPrincipalRatio);
    E.svgVizBank.setAttribute('height', C.vizAbsoluteSize * interestToPrincipalRatio);

    E.inputVizTime.setAttribute('max', COMPUTED_DATA.periods - 1);
    var currentPeriod = dateDelta(INPUT_DATA.start_date, toDate(G.selectedDate));
    E.inputVizTime.setAttribute('value', currentPeriod);
    updateDataViz(currentPeriod);
  }

  function updateDataViz(period) {
    var principalProgressSum = 0;
    var interestProgressSum = 0;
    for (var i = 0; i <= period && i < SCHEDULE_DATA.length; i++) {
      principalProgressSum += SCHEDULE_DATA[i].payment_principal_amount;
      interestProgressSum += SCHEDULE_DATA[i].payment_interest_amount;
    }
    var principalProgressRatio = principalProgressSum / INPUT_DATA.principal;
    var interestProgressRatio = interestProgressSum / COMPUTED_DATA.total_interest;

    E.svgVizPrincipalProgress.setAttribute('height', C.vizRelativeSize * principalProgressRatio);
    E.svgVizPrincipalProgress.setAttribute('y', C.vizRelativeSize * (1 - principalProgressRatio));
    E.svgVizInterestProgress.setAttribute('height', C.vizRelativeSize * interestProgressRatio);
    E.svgVizInterestProgress.setAttribute('y', C.vizRelativeSize * (1 - interestProgressRatio));

    // Update selected row in the amortization schedule
    E.outputSchedule.getElementsByClassName(C.selectedPeriodClass)[0].className = '';
    document.getElementById(C.scheduleRowIdPrefix + (period + 1)).className = C.selectedPeriodClass;
  }

  function setTheme() {
    var accentColor = '#0cf';
    var secondaryColor = '#c0f';

    E.svgVizPrincipalProgress.setAttribute('fill', accentColor);
    E.svgVizInterestProgress.setAttribute('fill', secondaryColor);
  }

  function addMonths(startDate, months) {
    months += startDate.month - 1;
    return {
      month: months % 12 + 1,
      year: startDate.year + Math.floor(months / 12),
    };
  }

  // Returns the number of months between start and end date.
  function dateDelta(startDate, endDate) {
    var yearDelta = endDate.year - startDate.year;
    if (yearDelta == 0) {
      return endDate.month - startDate.month;
    }

    var startMonth = yearDelta > 0 ? startDate.month : endDate.month;
    var endMonth = yearDelta > 0 ? endDate.month : startDate.month;
    var monthDelta = endMonth + (12 - startMonth);
    var sign = yearDelta > 0 ? 1 : -1;
    return sign * (monthDelta + Math.max(0, Math.abs(yearDelta) - 1) * 12);
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
        if (PRE_PAYMENTS_DATA.hasOwnProperty(key) && isInputDataValid(PRE_PAYMENTS_DATA[key])) {
          prePayments.push(PRE_PAYMENTS_DATA[key]);
        }
      }
      var prePaymentsByPeriod = {};
      for (var i = 0; i < prePayments.length; i++) {
        var period = dateDelta(INPUT_DATA.start_date, prePayments[i].pre_payment_date);
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
    displayViz();
  }

  function computeAmortizationSchedule(prePaymentsByPeriod) {
    var output = {};
    output.total_mortgage = 0;
    output.schedule_data = [];
    var principal = INPUT_DATA.principal;
    for (var i = 0; i < COMPUTED_DATA.periods && principal > 0; i++) {
      var prePayment = prePaymentsByPeriod[i];
      prePayment = prePayment != null ? prePayment : 0;
      var paymentInterestAmount = principal * COMPUTED_DATA.periodic_interest;
      var paymentAmount = Math.min(
        principal + paymentInterestAmount,
        COMPUTED_DATA.periodic_payment
      );
      var paymentPrincipalAmount = paymentAmount - paymentInterestAmount + prePayment;
      principal -= paymentPrincipalAmount;
      var effectivePaymentAmount = paymentAmount + prePayment;
      output.schedule_data.push({
        date: addMonths(INPUT_DATA.start_date, i),
        payment_amount: effectivePaymentAmount,
        payment_interest_amount: paymentInterestAmount,
        payment_principal_amount: paymentPrincipalAmount,
        remaining_principal: principal,
      });
      output.total_mortgage += effectivePaymentAmount;
    }

    output.total_interest = output.total_mortgage - INPUT_DATA.principal;
    return output;
  }
}());
