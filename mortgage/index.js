(function() {
  'use strict';

  // Configuration values
  var C = {
    debug: false,
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
      'paymentAmount',
      'paymentInterestAmount',
      'paymentPrincipalAmount',
      'remainingPrincipal',
    ],
  };

  // Elements
  var E = {
    input: {
      principal: document.getElementById('principal'),
      timeYears: document.getElementById('time_years'),
      interestRate: document.getElementById('interest_rate'),
      startDate: document.getElementById('start_date'),
    },
    prePaymentForms: document.getElementById('pre_payment_forms'),
    buttonAddPrePayment: document.getElementById('add_pre_payment'),
    buttonGenerateLink: document.getElementById('generate_link'),
    outputSummary: document.getElementById('output_summary'),
    outputSchedule: document.getElementById('output_schedule'),
    svgViz: document.getElementById('viz'),
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
  E.input.principal.addEventListener('input', updateData.bind(this, 'principal', 'float'));
  E.input.timeYears.addEventListener('input', updateData.bind(this, 'timeYears', 'integer'));
  E.input.interestRate.addEventListener('input', updateData.bind(this, 'interestRate', 'float'));
  E.input.startDate.addEventListener('input', updateData.bind(this, 'startDate', 'date'));
  E.buttonAddPrePayment.addEventListener('click', addPrePayment);
  E.buttonGenerateLink.addEventListener('click', writeHashParams);
  E.inputVizTime.addEventListener('input', function(event) {
    return updateDataViz(parseInt(event.target.value, 10));
  });

  // Data model
  var M = {
    input: {
      principal: null,
      timeYears: null,
      interestRate: null,
      startDate: null,
    },
    computed: {
      periods: null,
      periodicInterest: null,
      periodicPayment: null,
      totalMortgage: null,
      totalInterest: null,
    },
    computedWithoutPrePayments: {
      totalMortgage: null,
      totalInterest: null,
    },
    schedule: [],
    prePayments: {},
  };

  // Initialization for debugging purpose
  if (C.debug) {
    document.location.hash = encodeURIComponent(JSON.stringify({
      principal: 500000,
      timeYears: 15,
      interestRate: 3.5,
      startDate: {month: 5, year: 2019},
      prePayments: {
        one: {
          prePayment: 73000,
          prePaymentDate: {month: 11, year: 2020},
        },
      },
    }));
  }

  // Initialization
  initializeInputData(parseHashParams());
  setTheme();
  computeData();

  //
  // Functions
  //

  function parseHashParams() {
    var paramsStr = document.location.hash.substr(1);

    try {
      return JSON.parse(decodeURIComponent(paramsStr));
    } catch (e) {
      if (C.debug) {
        console.error(e);
      }
    }
  }

  function objectSize(object) {
    var size = 0;
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        size++;
      }
    }
    return size;
  }

  function writeHashParams() {
    var params = {};
    for (var key in M.input) {
      if (M.input.hasOwnProperty(key) && isInputDataValueValid(key, M.input[key])) {
        params[key] = M.input[key];
      }
    }

    if (objectSize(M.prePayments) > 0) {
      params.prePayments = M.prePayments;
    }

    document.location.hash = encodeURIComponent(JSON.stringify(params));
  }

  function initializeInputData(params) {
    if (params == null) {
      return;
    }

    var key;
    for (key in M.input) {
      if (M.input.hasOwnProperty(key)) {
        M.input[key] = params[key] != null ? params[key] : null;
        E.input[key].value = toInputElementValue(key, M.input[key]);
      }
    }

    if (params.prePayments != null) {
      for (key in params.prePayments) {
        if (params.prePayments.hasOwnProperty(key)) {
          addPrePaymentForm(params.prePayments[key]);
        }
      }
    }
  }

  function toInputElementValue(key, value) {
    if (!isInputDataValueValid(key, value)) {
      return '';
    }

    switch (key) {
      case 'principal':
      case 'timeYears':
      case 'interestRate':
      case 'prePayment':
        return value;
      case 'startDate':
      case 'prePaymentDate':
        return formatDate(value);
    }
  }

  function updateData(key, type, event) {
    M.input[key] = parseInput(type, event.target.value);
    computeData();
  }

  function updatePrePaymentData(index, key, type) {
    return function(event) {
      var prePaymentData = M.prePayments[index];
      if (prePaymentData == null) {
        return;
      }
      prePaymentData[key] = parseInput(type, event.target.value);
      computeData();
    };
  }

  function addPrePayment(event) {
    addPrePaymentForm({});
    computeData();
  }

  function addPrePaymentForm(initialData) {
    var form = document.createElement('div');
    form.className = 'form';

    var prePaymentInput = document.createElement('input');
    prePaymentInput.className = 'pre_payment';
    prePaymentInput.type = 'text';
    prePaymentInput.placeholder = '70000';
    prePaymentInput.value = toInputElementValue(
      'prePayment',
      initialData.prePayment
    );
    prePaymentInput.addEventListener(
      'input',
      updatePrePaymentData(G.prePaymentIndex, 'prePayment', 'float')
    );

    var prePaymentDateInput = document.createElement('input');
    prePaymentDateInput.className = 'pre_payment_date';
    prePaymentDateInput.type = 'text';
    prePaymentDateInput.placeholder = '11/2020';
    prePaymentDateInput.value = toInputElementValue(
      'prePaymentDate',
      initialData.prePaymentDate
    );
    prePaymentDateInput.addEventListener(
      'input',
      updatePrePaymentData(G.prePaymentIndex, 'prePaymentDate', 'date')
    );

    var removePrePaymentButton = document.createElement('button');
    removePrePaymentButton.className = 'remove_pre_payment';
    removePrePaymentButton.textContent = 'Remove pre-payment';
    removePrePaymentButton.addEventListener(
      'click',
      removePrePayment(G.prePaymentIndex, form)
    );

    var formContent = document.createElement('div');
    formContent.className = 'form_content';
    formContent.appendChild(document.createTextNode('I will pre-pay $ '));
    formContent.appendChild(prePaymentInput);
    formContent.appendChild(document.createTextNode(' on '));
    formContent.appendChild(prePaymentDateInput);
    form.appendChild(formContent);
    form.appendChild(removePrePaymentButton);

    E.prePaymentForms.appendChild(form);
    M.prePayments[G.prePaymentIndex] = {
      prePayment: initialData.prePayment != null ? initialData.prePayment : null,
      prePaymentDate: initialData.prePaymentDate != null ? initialData.prePaymentDate : null,
    };
    G.prePaymentIndex++;
  }

  function removePrePayment(index, node) {
    return function(event) {
      node.remove();
      delete M.prePayments[index];
      computeData();
    };
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
      case 'timeYears':
        return 'Time (years)';
      case 'interestRate':
        return 'Interest rate';
      case 'startDate':
        return 'Start date';
      case 'periods':
        return '# of payments';
      case 'periodicInterest':
        return 'Periodic interest rate';
      case 'periodicPayment':
        return 'Payment amount';
      case 'totalMortgage':
        return 'Total mortgage amount';
      case 'totalInterest':
        return 'Total interest amount';
      case 'date':
        return 'Date';
      case 'paymentAmount':
        return 'Payment amount';
      case 'paymentInterestAmount':
        return 'Interest amount';
      case 'paymentPrincipalAmount':
        return 'Principal amount';
      case 'remainingPrincipal':
        return 'Remaining principal';
    }
    return key;
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
    if (value >= 0) {
      return C.currencySymbol + toFixedWithPadding(value, 2);
    }

    return '-' + formatCurrency(Math.abs(value));
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
      case 'periodicPayment':
      case 'remainingPrincipal':
      case 'paymentAmount':
      case 'paymentInterestAmount':
      case 'paymentPrincipalAmount':
        return formatCurrency(value);
      case 'totalMortgage':
      case 'totalInterest':
        return formatCurrencyWithComparison(
          value,
          M.computedWithoutPrePayments[key]
        );
      case 'timeYears':
        return formatTime(value, C.timeUnitYears);
      case 'interestRate':
        return formatPercentage(value, 2);
      case 'periodicInterest':
        return formatPercentage(value, 4);
      case 'startDate':
      case 'date':
        return formatDate(value);
    }
    return value;
  }

  function isInputDataValueValid(key, value) {
    switch (key) {
      case 'principal':
      case 'timeYears':
      // TODO: Check that prePayment is at least less than principal
      case 'prePayment':
        return value != null && !isNaN(value) && value > 0;
      case 'interestRate':
        return value != null && !isNaN(value) && value >= 0 && value <= 100;
      case 'startDate':
      // TODO: Check that prePaymentDate is after startDate and before the
      // end of the mortgage
      case 'prePaymentDate':
        return value != null && !isNaN(value.month) && !isNaN(value.year) &&
          value.month >= 1 && value.month <= 12 &&
          value.year >= 1980 && value.year <= 3000;
      // Computed values are valid by construction
      case 'periods':
      case 'periodicInterest':
      case 'periodicPayment':
      case 'totalMortgage':
      case 'totalInterest':
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
    for (key in M.input) {
      if (M.input.hasOwnProperty(key)) {
        item = buildSummaryItem(key, M.input[key]);
        E.outputSummary.appendChild(item);
      }
    }

    if (!isInputDataValid(M.input)) {
      return;
    }

    for (key in M.computed) {
      if (M.computed.hasOwnProperty(key)) {
        item = buildSummaryItem(key, M.computed[key]);
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

  function snakeCase(string) {
    return string.split('').map(function(c) {
      if (c >= 'A' && c <= 'Z') {
        return '_' + c.toLowerCase();
      }
      return c;
    }).join('');
  }

  function buildScheduleRow(data) {
    var row = document.createElement('tr');
    for (var i = 0; i < C.scheduleCols.length; i++) {
      var cell = document.createElement('td');
      var key = C.scheduleCols[i];
      cell.className = snakeCase(key);
      cell.textContent = formatDataValue(key, data[key]);
      row.appendChild(cell);
    }
    return row;
  }

  function displaySchedule() {
    E.outputSchedule.textContent = '';

    if (!isInputDataValid(M.input)) {
      return;
    }

    if (M.schedule.length < 1) {
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

    for (i = 0; i < M.schedule.length; i++) {
      var row = buildScheduleRow(M.schedule[i]);
      row.id = C.scheduleRowIdPrefix + (i + 1);
      if (dateDelta(M.schedule[i].date, toDate(G.selectedDate)) == 0) {
        row.className = C.selectedPeriodClass;
      }
      table.appendChild(row);
    }
  }

  function displayViz() {
    if (!isInputDataValid(M.input) || M.computed.periods < 1) {
      E.svgViz.style.display = 'none';
      return;
    }

    var interestToPrincipalRatio = M.computed.totalInterest / M.input.principal;

    E.svgVizHouse.setAttribute('width', C.vizAbsoluteSize);
    E.svgVizHouse.setAttribute('height', C.vizAbsoluteSize);
    E.svgVizBank.setAttribute('width', C.vizAbsoluteSize * interestToPrincipalRatio);
    E.svgVizBank.setAttribute('height', C.vizAbsoluteSize * interestToPrincipalRatio);

    E.inputVizTime.setAttribute('max', M.computed.periods - 1);
    var currentPeriod = dateDelta(M.input.startDate, toDate(G.selectedDate));
    E.inputVizTime.setAttribute('value', currentPeriod);
    updateDataViz(currentPeriod);

    E.svgViz.style.display = 'block';
  }

  function updateDataViz(period) {
    var principalProgressSum = 0;
    var interestProgressSum = 0;
    for (var i = 0; i <= period && i < M.schedule.length; i++) {
      principalProgressSum += M.schedule[i].paymentPrincipalAmount;
      interestProgressSum += M.schedule[i].paymentInterestAmount;
    }
    var principalProgressRatio = principalProgressSum / M.input.principal;
    var interestProgressRatio = interestProgressSum / M.computed.totalInterest;

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
    if (isInputDataValid(M.input)) {
      // Assuming monthly payments
      M.computed.periods = M.input.timeYears * 12;
      M.computed.periodicInterest = M.input.interestRate / 100 / 12;
      // See https://en.wikipedia.org/wiki/Amortization_calculator
      var power = Math.pow(1 + M.computed.periodicInterest, M.computed.periods);
      var numerator = M.computed.periodicInterest * power;
      var denominator = power - 1;
      M.computed.periodicPayment = M.input.principal * numerator / denominator;

      var prePayments = [];
      for (var key in M.prePayments) {
        if (M.prePayments.hasOwnProperty(key) && isInputDataValid(M.prePayments[key])) {
          prePayments.push(M.prePayments[key]);
        }
      }
      var prePaymentsByPeriod = {};
      for (var i = 0; i < prePayments.length; i++) {
        var period = dateDelta(M.input.startDate, prePayments[i].prePaymentDate);
        prePaymentsByPeriod[period] = prePayments[i].prePayment;
      }

      var computed = computeAmortizationSchedule(prePaymentsByPeriod);
      M.computed.totalMortgage = computed.totalMortgage;
      M.computed.totalInterest = computed.totalInterest;
      M.schedule = computed.schedule;

      M.computedWithoutPrePayments = computeAmortizationSchedule({});
    }

    displaySummary();
    displaySchedule();
    displayViz();
  }

  function computeAmortizationSchedule(prePaymentsByPeriod) {
    var output = {};
    output.totalMortgage = 0;
    output.schedule = [];
    var principal = M.input.principal;
    for (var i = 0; i < M.computed.periods && principal > 0; i++) {
      var prePayment = prePaymentsByPeriod[i];
      prePayment = prePayment != null ? prePayment : 0;
      var paymentInterestAmount = principal * M.computed.periodicInterest;
      var paymentAmount = Math.min(
        principal + paymentInterestAmount,
        M.computed.periodicPayment
      );
      var paymentPrincipalAmount = paymentAmount - paymentInterestAmount + prePayment;
      principal -= paymentPrincipalAmount;
      var effectivePaymentAmount = paymentAmount + prePayment;
      output.schedule.push({
        date: addMonths(M.input.startDate, i),
        paymentAmount: effectivePaymentAmount,
        paymentInterestAmount: paymentInterestAmount,
        paymentPrincipalAmount: paymentPrincipalAmount,
        remainingPrincipal: principal,
      });
      output.totalMortgage += effectivePaymentAmount;
    }

    output.totalInterest = output.totalMortgage - M.input.principal;
    return output;
  }
}());
