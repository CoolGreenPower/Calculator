chart.preloader.disabled = true;

  var indicator;
  function showIndicator() {
    indicator = chart.tooltipContainer.createChild(am4core.Container);
    indicator.background.fill = am4core.color("#fff");
    indicator.background.fillOpacity = 0.8;
    indicator.width = am4core.percent(100);
    indicator.height = am4core.percent(100);
    
    var indicatorLabel = indicator.createChild(am4core.Label);
    indicatorLabel.text = "Loading stuff...";
    indicatorLabel.align = "center";
    indicatorLabel.valign = "middle";
    indicatorLabel.fontSize = 20;
  }

  showIndicator();
