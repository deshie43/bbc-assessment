var request = new XMLHttpRequest();
request.open('GET', 'data.json');
request.responseType = 'json';
request.send();
request.onload = function() {
  var jsonData = request.response;
  var channels = getChannelNames(jsonData);
  var formatData = getBroadcastNumbers(jsonData, channels);
  var formatChannelNames = [];
  for (var i=0; i<channels.length; i++) {
    formatChannelNames.push(channelNames[channels[i]]);
  }
  formatData['formatChannels'] = formatChannelNames;
  formatData['unformatChannels'] = channels;
  showTable(formatData);
  showGraph(formatData);
}

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November',
                  'December'];

var channelNames = {'bbcone': 'BBC One', 'bbctwo': 'BBC Two',
                    'bbcthree': 'BBC Three', 'bbcfour': 'BBC Four',
                    'bbcnews24': 'BBC News 24', 'cbbc': 'CBBC',
                    'cbeebies': 'Cbeebies'}

function getChannelNames(jsonData) {
  var channels = [];
  //Extract channels from data and store in array
  for (var i in jsonData) {
    for (var j in jsonData[i]) {
        channels.push(j);
    }
    break;
  }
  return channels;
}

function getBroadcastNumbers(jsonData, channels) {
  var broadcastNumbers = {};
  var dates = [];
  for (var i=0; i<channels.length; i++) {
    broadcastNumbers[channels[i]] = [];
  }

  //Extract dates, format and store in array
  for (var i in jsonData) {
      var date = new Date(i);
      var formatDate = monthNames[date.getMonth()] + ' ' + date.getFullYear();
      dates.push(formatDate);
      //Add broadcast numbers to 2D array (each row contains data for a channel)
      for (var j in jsonData[i]) {
        broadcastNumbers[j].push(jsonData[i][j]);
      }
  }
  var formatData = {
    'broadcastNumbers': broadcastNumbers,
    'dates': dates
  }
  return formatData;
}

function showTable(formatData) {
  var body = document.getElementById('tableHolder');
  var table = document.createElement('table');
  var tableBody = document.createElement('tbody');
  var row = document.createElement('tr');
  var cell = document.createElement('th');
  var cellText = document.createTextNode('Date');
  cell.appendChild(cellText);
  row.appendChild(cell);

  var formatChannels = formatData['formatChannels'];
  var unformatChannels = formatData['unformatChannels'];

  //Add column headings to table
  for (var i=0; i<formatChannels.length; i++) {
    var cell = document.createElement('th');
    var cellText = document.createTextNode(formatChannels[i]);
    //Add attribute to sort table when heading is clicked
    var att = document.createAttribute('onclick');
    att.value = `sortTable(${i+1})`
    cell.setAttributeNode(att);
    cell.appendChild(cellText);
    row.appendChild(cell);
  }
  tableBody.appendChild(row);

  var dates = formatData['dates'];
  var broadcastNumbers = formatData['broadcastNumbers'];

  //Add rows containing broadcast data for each month
  for (var i=0; i<dates.length; i++) {
    var row = document.createElement('tr');
    var cell = document.createElement('td');
    //Add month in first column
    var cellText = document.createTextNode(dates[i]);
    cell.appendChild(cellText);
    row.appendChild(cell);
    for (var j=0; j<formatChannels.length; j++) {
      var cell = document.createElement('td');
      var cellText = document.createTextNode(broadcastNumbers[unformatChannels[j]][i]);
      cell.appendChild(cellText);
      row.appendChild(cell);
    }
    tableBody.appendChild(row);
  }
  table.appendChild(tableBody);
  body.appendChild(table);
}

function sortTable(n) {
  var table = document.querySelector('table');
  var rows = table.getElementsByTagName('tr');
  var rowContent = [];

  //Extract broadcast numbers from column to sort
  for (var i = 1; i < rows.length; i++) {
    var cell = rows[i].getElementsByTagName('td')[n].innerHTML;
    rowContent.push([cell,i]);
  }

  //If column is unsorted or in descending order sort by ascending order,
  //otherwise sort by descending order
  var sortBy = 'desc';
  for (var i = 0; i < rowContent.length-2; i++) {
    if (parseInt(rowContent[i][0]) > parseInt(rowContent[i+1][0])) {
      sortBy = 'asc';
      break;
    }
  }

  if (sortBy == 'asc') {
    rowContent.sort(function(a, b){return a[0] - b[0]});
  }
  else {
    rowContent.sort(function(a, b){return b[0] - a[0]});
  }

  var parent = rows[0].parentNode;
  var rowInner = [];
  for (var i = 1; i < rows.length; i++) {
    rowInner.push(rows[i].innerHTML);
  }

  //Sort column based on new order of rows in rowContent array
  for (var i = 1; i < rows.length; i++) {
    rows[i].innerHTML = rowInner[rowContent[i-1][1] - 1];
  }
}

function showGraph(formatData) {
  var ctx = document.getElementById('broadcastChart').getContext('2d');

  var formatchannels = formatData['formatChannels'];
  var unformatChannels = formatData['unformatChannels'];
  var dates = formatData['dates']
  var broadcastNumbers = formatData['broadcastNumbers']

  var borderColors =
      ['rgba(48, 46, 47,1)','rgba(122, 16, 16,1)','rgba(252, 57, 57, 1)',
      'rgba(223, 26, 210,1)','rgba(15, 122, 177,1)','rgba(30, 195, 54,1)',
      'rgba(226, 228, 62,1)']

  //For each channel create a dataset containing broadcast numbers in
  //chronological order
  var datasets = [];
  for (i = 0; i < formatchannels.length; i++) {
    var dataset = {
      label: formatchannels[i],
      data: broadcastNumbers[unformatChannels[i]],
      fill: false,
      borderColor: borderColors[i],
      borderWidth: 1,
      lineTension: 0
    }
    datasets.push(dataset);
  }
  
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: dates,
          datasets: datasets //Use datasets array created earlier
      },
      options: {
          responsive:true,
          maintainAspectRatio: false,
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:false
                  },
                  scaleLabel: {
                    display: true,
                    labelString: 'Monthly Broadcasts'
                  }
              }]
          }
      }
  });
}
