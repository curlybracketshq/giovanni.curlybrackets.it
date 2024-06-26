(function() {
  'use strict';

  // Configuration values
  var C = {
    debug: false,
    dateSeparator: '/',
    decimalSeparator: '.',
    thounsandsSeparator: ',',
    viz: {
      size: {
        width: 200,
        height: 200
      },
      cols: 10,
      rows: 20,
      margin: {
        horizontal: 10,
        vertical: 10
      },
      coin: {
        offsetVariance: 2,
        cornerRadius: 3,
        strokeWidth: 2,
      },
      color: {
        fill: '#fff8d6',
        stroke: '#fff0ad',
      },
      progressColor: {
        fill: '#ffd500',
        stroke: '#e4b61a',
      },
      disabledColor: {
        fill: '#f8f9fa',
        stroke: '#e9ecef',
      },
    },
    currencySymbol: '$',
    timeUnitYears: 'years',
    timeUnitMonths: 'months',
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
    // Mortgage input data
    input: {
      principal: document.getElementById('principal'),
      timeYears: document.getElementById('time_years'),
      interestRate: document.getElementById('interest_rate'),
      startDate: document.getElementById('start_date'),
    },
    // Pre payments
    prePayments: document.getElementById('pre_payments'),
    prePaymentForms: document.getElementById('pre_payment_forms'),
    buttonAddPrePayment: document.getElementById('add_pre_payment'),
    // Share
    share: document.getElementById('share'),
    buttonGenerateLink: document.getElementById('generate_link'),
    // Amortization schedule
    schedule: document.getElementById('schedule'),
    outputSchedule: document.getElementById('output_schedule'),
    // Vizualization
    svgViz: document.getElementById('viz'),
    outputTotalAmount: document.getElementById('output_total_amount'),
    outputMonthlyPayment: document.getElementById('output_monthly_payment'),
    outputPeriods: document.getElementById('output_periods'),
    outputSavings: document.getElementById('output_savings'),
    svgVizPrincipal: document.getElementById('viz_principal'),
    outputPrincipal: document.getElementById('output_principal'),
    svgVizInterest: document.getElementById('viz_interest'),
    outputInterest: document.getElementById('output_interest'),
    inputVizTime: document.getElementById('viz_time'),
    vizCurrentPeriod: document.getElementById('viz_current_period'),
    vizLegend: document.getElementById('viz_legend'),
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
    viz: {
      cellAmount: 0,
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

  // Generate random numbers used for computing coins offset
  var R = [];
  for (var i = 0; i < C.viz.cols * C.viz.rows; i++) {
    R.push(randomInt(1000));
  }

  // Initialization
  initPlaceholders();
  initializeInputData(parseHashParams());
  computeData();

  //
  // Functions
  //

  function hide(element) {
    element.style.display = 'none';
  }

  function show(element) {
    element.style.display = 'block';
  }

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

  function prePaymentsArray() {
    var prePayments = [];

    for (var key in M.prePayments) {
      if (M.prePayments.hasOwnProperty(key) && isInputDataValid(M.prePayments[key])) {
        prePayments.push(M.prePayments[key]);
      }
    }

    return prePayments;
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

  function initPlaceholders() {
    E.input.principal.placeholder = (randomInt(10) + 1) * 100000;
    var timeYears = [5, 15, 30][randomInt(3)];
    E.input.timeYears.placeholder = timeYears;
    var currentYear = (new Date()).getFullYear();
    var date = {
      month: randomInt(12) + 1,
      year: randomInt(currentYear, currentYear - timeYears),
    };
    E.input.startDate.placeholder = formatDate(date);
    var interestRate = (Math.random() * 4) + 2;
    E.input.interestRate.placeholder = toFixedWithPadding(interestRate, 2);
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

  function createPrePaymentInputElement(initialValue) {
    var element = document.createElement('input');
    element.className = 'pre_payment';
    element.type = 'text';
    // Assign a random value as a pre-payment example that is a fraction of the
    // input principal amount.
    var exampleValue = M.input.principal;
    while (exampleValue > 10) {
      exampleValue /= 10;
    }
    exampleValue = Math.abs(exampleValue);
    element.placeholder = randomInt(exampleValue + 1, 1) * 1000;
    element.value = toInputElementValue('prePayment', initialValue);
    element.addEventListener(
      'input',
      updatePrePaymentData(G.prePaymentIndex, 'prePayment', 'float')
    );
    return element;
  }

  function createPrePaymentDateInputElement(initialValue) {
    var element = document.createElement('input');
    element.className = 'pre_payment_date';
    element.type = 'text';
    var exampleValue = {
      month: randomInt(12) + 1,
      year: randomInt(M.input.startDate.year + M.input.timeYears, M.input.startDate.year + 2),
    };
    element.placeholder = formatDate(exampleValue);
    element.value = toInputElementValue('prePaymentDate', initialValue);
    element.addEventListener(
      'input',
      updatePrePaymentData(G.prePaymentIndex, 'prePaymentDate', 'date')
    );
    return element;
  }

  function addPrePaymentForm(initialData) {
    var form = document.createElement('div');
    form.className = 'form';

    var prePaymentInput = createPrePaymentInputElement(initialData.prePayment);
    var prePaymentDateInput = createPrePaymentDateInputElement(initialData.prePaymentDate);

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

  function truncate(value, precision) {
    var power = Math.pow(10, precision);
    return Math.floor(value / power) * power;
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
    if (isNaN(value)) {
      return;
    }

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

  function formatPeriod(value, unit) {
    if (unit != null) {
      return value.toString() + ' ' + unit;
    }

    var years = Math.floor(value / 12);
    var months = value % 12;

    var output = formatPeriod(years, C.timeUnitYears);
    if (months > 0) {
      output += ' and ' + formatPeriod(months, C.timeUnitMonths);
    }

    return output;
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
        return formatPeriod(value, C.timeUnitYears);
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

  // Convert a JS date to a date object.
  function toDate(date) {
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  }

  function displayPrePayments() {
    // Preconditions:
    // * input data is valid
    if (!isInputDataValid(M.input)) {
      hide(E.prePayments);
      return;
    }

    show(E.prePayments);
  }

  function displayShare() {
    // Preconditions:
    // * input data is valid
    if (!isInputDataValid(M.input)) {
      hide(E.share);
      return;
    }

    show(E.share);
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
    // Preconditions:
    // * input data is valid
    // * there is at least one period
    if (!isInputDataValid(M.input) || M.schedule.length < 1) {
      hide(E.schedule);
      return;
    }

    E.outputSchedule.textContent = '';

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

    show(E.schedule);
  }

  function displayViz() {
    // Preconditions:
    // * input data is valid
    // * there is at least one period
    // * principal amount > interest amount
    if (!isInputDataValid(M.input) || M.computed.periods < 1 || M.input.principal < M.computed.totalInterest) {
      hide(E.svgViz);
      return;
    }

    // Reset visualization
    E.vizLegend.textContent = '';

    var cellsNum = C.viz.cols * C.viz.rows;

    // Find the maximum amount per cell that contains the full principal amount
    var principal = M.input.principal;
    var base = 5;
    for (var i = 0; principal % cellsNum == 0 && principal > 1; i++) {
      principal /= base;
    }
    var cellAmount = Math.ceil(principal / cellsNum) * Math.pow(base, i);
    M.viz.cellAmount = truncate(cellAmount, 3);

    var legend = document.createElement('div');
    legend.textContent = 'Each coin corresponds to ' + formatCurrency(M.viz.cellAmount);
    E.vizLegend.appendChild(legend);

    E.svgVizPrincipal.setAttribute('width', C.viz.size.width + C.viz.margin.horizontal + C.viz.cols * C.viz.coin.offsetVariance * 2);
    E.svgVizPrincipal.setAttribute('height', C.viz.size.height + C.viz.margin.vertical);
    E.svgVizInterest.setAttribute('width', C.viz.size.width + C.viz.margin.horizontal + C.viz.cols * C.viz.coin.offsetVariance * 2);
    E.svgVizInterest.setAttribute('height', C.viz.size.height + C.viz.margin.vertical);

    E.inputVizTime.setAttribute('max', M.schedule.length - 1);
    var currentPeriod = dateDelta(M.input.startDate, toDate(G.selectedDate));
    E.inputVizTime.setAttribute('value', currentPeriod);
    updateDataViz(currentPeriod);

    E.outputTotalAmount.textContent = formatCurrencyWithComparison(M.computed.totalMortgage, M.computedWithoutPrePayments.totalMortgage);
    E.outputMonthlyPayment.textContent = formatCurrency(M.computed.periodicPayment);
    E.outputPeriods.textContent = formatPeriod(M.schedule.length);
    E.outputPrincipal.textContent = formatCurrency(M.input.principal);
    E.outputInterest.textContent = formatCurrency(M.computed.totalInterest);

    displaySavings();

    show(E.svgViz);
  }

  function displaySavings() {
    // Reset savings content
    E.outputSavings.textContent = '';

    var paragraph;
    if (M.computed.totalInterest < M.computedWithoutPrePayments.totalInterest) {
      var prePayments = prePaymentsArray();
      var totalPrePaymentsAmount = prePayments.reduce(function(sum, data) {
        return sum + data.prePayment;
      }, 0);
      var totalPrePaymentsPercentage = totalPrePaymentsAmount / M.input.principal * 100;
      var interestDelta = M.computedWithoutPrePayments.totalInterest - M.computed.totalInterest;
      var interestReductionPercentage = interestDelta / M.computedWithoutPrePayments.totalInterest * 100;
      paragraph = document.createElement('p');
      paragraph.textContent = "By pre-paying " + formatCurrency(totalPrePaymentsAmount) +
        " (" + formatPercentage(totalPrePaymentsPercentage, 2) +
        " of the principal), you're reducing the interest amount from " +
        formatCurrency(M.computedWithoutPrePayments.totalInterest) + " to " +
        formatCurrency(M.computed.totalInterest) + ", that's " +
        formatCurrency(interestDelta) + " less, a " +
        formatPercentage(interestReductionPercentage, 2) + " reduction.";
      E.outputSavings.appendChild(paragraph);

      var targetDate = M.schedule[M.schedule.length - 1].date;
      var periodsDelta = M.computed.periods - M.schedule.length;
      paragraph = document.createElement('p');
      paragraph.textContent = "You'll be able to pay back the loan by " +
        formatDate(targetDate) + ", that's " + formatPeriod(periodsDelta) +
        " earlier than expected.";
      E.outputSavings.appendChild(paragraph);
    } else {
      paragraph = document.createElement('p');
      paragraph.textContent = "Try to add a pre-payment to see how you can reduce interest amount and time needed to pay back your loan.";
      E.outputSavings.appendChild(paragraph);
    }
  }

  function updateDataViz(period) {
    E.svgVizPrincipal.textContent = '';
    E.vizCurrentPeriod.textContent = '';

    var principalProgress = 0;
    var interestProgress = 0;
    for (var i = 0; i <= period && i < M.schedule.length; i++) {
      principalProgress += M.schedule[i].paymentPrincipalAmount;
      interestProgress += M.schedule[i].paymentInterestAmount;
    }

    // Draw cells
    drawCoins(E.svgVizPrincipal, M.input.principal, principalProgress);
    drawCoins(E.svgVizInterest, M.computed.totalInterest, interestProgress, M.computedWithoutPrePayments.totalInterest);

    // Update current period label
    var currentPeriodText = document.createElement('div');
    currentPeriodText.textContent = 'Selected period: ' + formatDate(addMonths(M.input.startDate, period));
    E.vizCurrentPeriod.appendChild(currentPeriodText);

    // Update selected row in the amortization schedule
    E.outputSchedule.getElementsByClassName(C.selectedPeriodClass)[0].className = '';
    document.getElementById(C.scheduleRowIdPrefix + (period + 1)).className = C.selectedPeriodClass;
  }

  function drawCoins(container, amount, progressAmount, initialAmount) {
    if (initialAmount == null) {
      initialAmount = amount;
    }

    // Preconditions:
    // * amount >= progressAmount
    // * if initialAmount is present initialAmount >= amount
    if (amount < progressAmount && initialAmount < amount) {
      return;
    }

    var cellSize = {
      width: C.viz.size.width / C.viz.cols,
      height: C.viz.size.height / C.viz.rows,
    };

    var coins = [];
    for (var x = 0; x < C.viz.cols && initialAmount >= M.viz.cellAmount / 2; x++) {
      for (var y = 0; y < C.viz.rows && initialAmount >= M.viz.cellAmount / 2; y++) {
        var randomOffset = C.viz.coin.offsetVariance - R[x * C.viz.cols + y] % (C.viz.coin.offsetVariance * 2);
        var cell = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cell.setAttribute('fill', progressAmount > 0 ? C.viz.progressColor.fill : amount > 0 ? C.viz.color.fill : C.viz.disabledColor.fill);
        cell.setAttribute('stroke', progressAmount > 0 ? C.viz.progressColor.stroke : amount > 0 ? C.viz.color.stroke : C.viz.disabledColor.stroke);
        cell.setAttribute('stroke-width', C.viz.coin.strokeWidth);
        cell.setAttribute('rx', C.viz.coin.cornerRadius);
        cell.setAttribute('width', cellSize.width);
        cell.setAttribute('height', cellSize.height);
        cell.setAttribute('x', (cellSize.width + C.viz.coin.offsetVariance * 2) * x + (C.viz.margin.horizontal / 2) + randomOffset);
        cell.setAttribute('y', C.viz.size.height - cellSize.height - (cellSize.height * y) + (C.viz.margin.vertical / 2));
        coins.push(cell);
        amount -= M.viz.cellAmount;
        progressAmount -= M.viz.cellAmount;
        initialAmount -= M.viz.cellAmount;
      }
    }

    // SVG elements z-index is determined by their order in the document. In
    // this case the last coin should be the first in the document in order to
    // be displayed behind the rest of the coins in the stack
    for (var i = coins.length - 1; i >= 0; i--) {
      container.append(coins[i]);
    }
  }

  // Generates a random number in the range [min, max), where 0 is the default
  // value for min.
  function randomInt(max, min) {
    if (min == null) {
      min = 0;
    }
    return min + Math.floor(Math.random() * Math.floor(max - min));
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

      var prePayments = prePaymentsArray();
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

    displayPrePayments();
    displayShare();
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
