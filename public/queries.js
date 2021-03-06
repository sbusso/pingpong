(function() {

  // if the environment could not be set up, don't add any checks
  if (typeof window.Pingpong === 'undefined') {
    return;
  }

  // specify some default visualization options
  var defaultVizOptions = {
    width: 650,
    height: 450,
    chartAreaWidth: "70%",
    backgroundColor: "transparent",
    lineWidth: 2,
    chartAreaLeft: 80,
    chartAreaTop: 80
  };

  // queries is a list of objects that specify which queries to run,
  // and where and how to display the results
  // the query objects roughly correspond to the format from the Keen JS SDK
  // https://keen.io/docs/clients/javascript/reference/#data-visualization
  this.queries = [];

  // wait for charting library to be available
  Keen.ready(function() {

    // push each query onto the array, specifying the anchor name of the tab you want it to show up in
    // at the end, each query will be drawn, and wired up to refresh as often as you specify (default 1 minute)

    // Performance Tab

    queries.push({
      tab: "performance",
      queryType: "average",
      title: "Average Response Time By Check, Last 120 Minutes",
      chartType: "linechart",
      queryParams: {
        eventCollection: Pingpong.collection,
        targetProperty: "request.duration",
        timeframe: "last_120_minutes",
        interval: "minutely",
        groupBy: "check.name"
      },
      refreshEvery: 60
    });

    queries.push({
      tab: "performance",
      queryType: "average",
      title: "Average Response Time By Check, Last 48 Hours",
      chartType: "linechart",
      queryParams: {
        eventCollection: Pingpong.collection,
        targetProperty: "request.duration",
        timeframe: "last_48_hours",
        interval: "hourly",
        groupBy: "check.name"
      },
      refreshEvery: 60
    });

    queries.push({
      tab: "performance",
      queryType: "maximum",
      title: "Maximum Response Time By Check, Last 120 Minutes",
      chartType: "linechart",
      queryParams: {
        eventCollection: Pingpong.collection,
        analysisType: "maximum",
        targetProperty: "request.duration",
        timeframe: "last_120_minutes",
        interval: "minutely",
        groupBy: "check.name"
      },
      refreshEvery: 60
    });

    queries.push({
      tab: "performance",
      queryType: "average",
      title: "Average Response Time All Checks, Last 120 Minutes",
      chartType: "linechart",
      queryParams: {
        eventCollection: Pingpong.collection,
        targetProperty: "request.duration",
        timeframe: "last_120_minutes",
        interval: "minutely",
      },
      refreshEvery: 60
    });

    // Status Tab

    queries.push({
      tab: "status",
      queryType: "count",
      title: "Response Status Count, Last 120 Minutes",
      chartType: "linechart",
      queryParams: {
        eventCollection: Pingpong.collection,
        timeframe: "last_120_minutes",
        interval: "minutely",
        groupBy: "response.status"
      },
      refreshEvery: 60
    });

    queries.push({
      tab: "status",
      queryType: "count",
      title: "Response Status Count, Last 48 Hours",
      chartType: "linechart",
      queryParams: {
        eventCollection: Pingpong.collection,
        timeframe: "last_48_hours",
        interval: "hourly",
        groupBy: "response.status"
      },
      refreshEvery: 60
    });

    queries.push({
      tab: "status",
      queryType: "count",
      title: "Failure Count By Check, Last 120 Minutes",
      chartType: "linechart",
      queryParams: {
        eventCollection: Pingpong.collection,
        timeframe: "last_120_minutes",
        interval: "minutely",
        groupBy: "check.name",
        filters: [{
          "property_name": "response.status", "operator": "gte", "property_value": 400
        }]
      },
      refreshEvery: 60
    });

    queries.push({
      tab: "status",
      queryType: "count",
      title: "Failure Count By Check, Last 48 Hours",
      chartType: "linechart",
      queryParams: {
        eventCollection: Pingpong.collection,
        timeframe: "last_48_hours",
        interval: "hourly",
        groupBy: "check.name",
        filters: [{
          "property_name": "response.status", "operator": "gte", "property_value": 400
        }]
      },
      refreshEvery: 60
    });

    // setup code to refresh queries
    onReady();
  });

  function onReady() {
    function bindFunc(query, element) {
      return function() {
        if (query.run) {
          query.run(query, element);
        } else {
          var obj = new Keen.Query(query.queryType, query.queryParams);
          var viz = query.vizOptions || defaultVizOptions;
          viz.title = query.title;
          if (query.chartClass == Keen.Metric) {
            viz.label = query.title;
          }

          var request = client.run(obj, function() {
              this.draw(element[0], {
                title: query.title,
                chartType: query.chartType,
                chartOptions: viz
              });
          });
        }
      }
    }

    for (var i = 0; i < queries.length; i++) {

      var query = queries[i];
      var vizContainer = $("#" + query.tab);

      var element = $("<div>", { id: "viz-" + i, class: "chart"});
      vizContainer.append(element);

      var boundFunc = bindFunc(query, element);
      setInterval(boundFunc, 1000 * query.refreshEvery);
      boundFunc();
    }
  }

})();
