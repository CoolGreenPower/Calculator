"use strict";
// import Env from "jest-jasmine2/build/jasmine/Env";
//
// export {Environment, System, CoolGreenExcel}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// contains data that holds for every customer. One of fridge or ac customer
class Customer {
    constructor() {
        this._averageSavings = .3;
        this._co2PerKWh = 0.0004554;
        this._annualRateIncrease = 1.03;
        this._totalEnergySavings = 0;
        this._totalCostSavings = 0;
        this._totalCO2Reduction = 0;
        let cumulative = 0;
        for (let i = 0; i < 10; i += 1) {
            cumulative += Math.pow(1.03, i);
        }
        this._tenYearCumulative = cumulative;
    }
    get location() {
        return this._location;
    }
    set location(value) {
        this._location = value;
    }
    startingHTML(description) {
        let startingHTML = '<div class="container">\n' +
            '<p>' + description + '</p>' +
            '    <div class="row">\n' +
            '        <div class="col-sm-7" id="map">\n' +
            '            <div id="chartdiv" style="height: 35vh;"></div>\n' +
            '        </div>\n' +
            '        <div class="col-sm-4 m-3" id="sliders">\n' +
            '<h5 id="location"></h5>' +
            '        </div>\n' +
            '    </div>\n' +
            ' <p></p>' +
            '        <div class="row" id="systems">\n' +
            '            <div class="col-sm-3 m-4" id="addSection">\n' +
            '                <button id="add">add system</button>\n' +
            '            </div>\n' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-sm-2 m-3">' +
            '<button id="calculate">Calculate</button>\n' +
            '</div>' +
            '<div class="col-sm-4 m-3" >' +
            '<p id="results"></p> ' +
            '</div>' +
            '    </div>\n' +
            '</div>';
        $("#coolgreenpowercalculator").append(startingHTML);
        $('#add').click(() => {
            this.addSystem();
        });
        $('#calculate').click(() => {
            this.results();
        });
    }
    generateSlider(tag, label, min, max, step) {
        return '<div class="card-block"> <label for="' + tag + 'Slider">'
            + label + '<span id="' + tag + '"></span></label> <br> <input id="'
            + tag + 'Slider" type="range" class="custom-range" min="' + min
            + '" max="' + max + '" step="' + step + '"> </div>';
    }
    convertDollar(value) {
        return (value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
    results() {
        if (this.allValid()) {
            let resultsString = '';
            this.calculateSavings();
            resultsString += '<h4>Annual Reductions:</h4>' +
                '<p>Total cost reduction is $' +
                this.convertDollar(this._totalCostSavings) +
                '<p>Total energy reduction is ' +
                this._totalEnergySavings.toFixed(0) +
                ' kWh</p><p>Total greenhouse gas reduction is ' +
                this._totalCO2Reduction.toFixed(2) +
                ' tons of CO2</p><h4>10 Year Projections:</h4><p>Total cost reduction is $' +
                this.convertDollar(this._totalCostSavings * this._tenYearCumulative) +
                '</p><p>Total energy reduction is ' +
                (this._totalEnergySavings * 10).toFixed(0) +
                ' KwH</p><p>Total greenhouse gas reduction is ' +
                (this._totalCO2Reduction * 10).toFixed(2) +
                ' tons of CO2</p>';
            $("#results").html(resultsString);
            $('#results').append('<div id="email">' +
                '<p>Would you like to email the results?</p>' +
                '    <input type="text" id="emailAddress" name="emailAddress"></input>\n' +
                '<button id="sendEmail">send email</button>' +
                ' </div><p id="sent"></p>');
            $('#sendEmail').click(() => {
                Emailer.sendResults(this.makeHTML(resultsString), 'CoolGreenPower Calculator');
            });
        }
        else {
            $("#results").html("Missing Information");
        }
    }
    get kWhPrice() {
        return this._kWhPrice;
    }
    set kWhPrice(value) {
        this._kWhPrice = value;
    }
}
// represents variables that hold across systems, mainly price
class FridgeCustomer extends Customer {
    constructor() {
        super();
        this.listOfSystems = [];
    }
    downloadSizes() {
        return __awaiter(this, void 0, void 0, function* () {
            this._systemSizes = yield CoolGreenDisplay.downloadCSV('https://coolgreenpublicdata.blob.core.windows.net/calc/fridgeData.csv');
        });
    }
    addInteractive() {
        $("#sliders").append(this.generateSlider('rate', 'Electric Rate (per kWh) - $', 0.02, 0.6, 0.01));
        $("#rateSlider").on('input', () => {
            this.kWhPrice = Number($("#rateSlider").val());
            $("#rate").text(String(this.kWhPrice));
        });
    }
    addSystem() {
        this.listOfSystems.push(new FridgeSystem(1, 3, 660, 12));
        let index = (this.listOfSystems.length - 1);
        this.generateSystem(index);
        $("#size" + index + "Slider").on('input', () => {
            this.listOfSystems[index].size = Number($("#size" + index + "Slider").val());
            this.listOfSystems[index].power = Number(this._systemSizes[this.listOfSystems[index].size].MonthlyKWh);
            $("#size" + index).text(this._systemSizes[this.listOfSystems[index].size].RefrigeratorSize);
            $("#power" + index).text(String(this.listOfSystems[index].power));
            $("#power" + index + "Slider").val(this.listOfSystems[index].power);
        });
        $("#power" + index + "Slider").on('input', () => {
            this.listOfSystems[index].power = Number($("#power" + index + "Slider").val());
            $("#power" + index).text(String(this.listOfSystems[index].power));
        });
        $("#months" + index + "Slider").on('input', () => {
            this.listOfSystems[index].months = Number($("#months" + index + "Slider").val());
            $("#months" + index).text(String(this.listOfSystems[index].months));
        });
        $("#num" + index + "Slider").on('input', () => {
            this.listOfSystems[index].num = Number($("#num" + index + "Slider").val());
            $("#num" + index).text(String(this.listOfSystems[index].num));
        });
        $("#remove" + index).click(() => {
            $("#system" + index).remove();
            this.listOfSystems.splice(index, 1);
        });
        $("#size" + index).text(String(this._systemSizes[this.listOfSystems[index].size].RefrigeratorSize));
        $("#power" + index).text(String(this.listOfSystems[index].power));
        $("#months" + index).text(String(this.listOfSystems[index].months));
        $("#num" + index).text(String(this.listOfSystems[index].num));
        $("#size" + index + "Slider").val(this.listOfSystems[index].size);
        $("#power" + index + "Slider").val(this.listOfSystems[index].power);
        $("#months" + index + "Slider").val(this.listOfSystems[index].months);
        $("#num" + index + "Slider").val(this.listOfSystems[index].num);
    }
    allValid() {
        if (this.listOfSystems.length > 0 && this.kWhPrice > 0) {
            for (let system of this.listOfSystems) {
                if (!system.validSystem()) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    calculateSavings() {
        this._totalCO2Reduction = 0;
        this._totalCostSavings = 0;
        this._totalEnergySavings = 0;
        for (let system of this.listOfSystems) {
            this._totalCostSavings += system.savings(this.kWhPrice);
            this._totalEnergySavings += system.kWHourSavings();
            this._totalCO2Reduction += system.co2Reduction(this._co2PerKWh);
        }
    }
    generateSystem(num) {
        $('#addSection').before('<div id="system' + num + '" class="col-sm-3 card m-4">' +
            this.generateSlider(('size' + num), 'Size of Cooler is - ', 0, this._systemSizes.length - 1, 1) +
            this.generateSlider(('power' + num), 'Monthly Power Usage (kWh) Per System - ', 50, 3000, 50) +
            this.generateSlider(('months' + num), 'Months of Operation Per Year - ', 1, 12, 1) +
            this.generateSlider(('num' + num), 'Number of Systems - ', 1, 20, 1) +
            '<button id="remove' + num + '">Remove System</button>' +
            '</div>');
    }
    initialDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.downloadSizes();
            this.startingHTML('Select a city from the map or insert your own data. Then add systems to estimate your cost reduction with COOLNOMIX on your refrigeration system!');
            this.addInteractive();
        });
    }
    makeHTML(results) {
        results += "<p></p><p><h4>Input Data:</h4></p><p>City: "
            + this.location
            + "</p><p>Electric Rate: "
            + this.kWhPrice
            + "</p><p><h4>Systems: </h4></p>";
        let systemNum = 1;
        for (let system of this.listOfSystems) {
            results += "<p><strong>System "
                + systemNum
                + ": </strong></p><p>Size of Cooler is: "
                + $("#size" + (systemNum - 1)).text()
                + "</p><p>Monthly Power Usage (kWh) Per System: "
                + system.power
                + "</p><p>Months of Operation Per Year: "
                + system.months
                + "</p><p>Number of Systems: "
                + system.num
                + "</p>";
            systemNum += 1;
        }
        return results;
    }
}
// represents the environmental variables that hold across the systems
// given by the user through the form
class ACCustomer extends Customer {
    constructor(coolingDegreeDays, daysOfOperation, kWhPrice) {
        super();
        this.listOfSystems = [];
        this._degreeHourDay = 24;
        this._designTemperature = 96;
        this._coolingDegreeDays = coolingDegreeDays;
        this._daysOfOperation = daysOfOperation;
        this.kWhPrice = kWhPrice;
        this._equivalentFullLoad = (coolingDegreeDays * this._degreeHourDay) / (this._designTemperature - 65);
    }
    addInteractive() {
        $("#sliders").append(this.generateSlider('rate', 'Electric Rate (per kWh) - $', 0.02, 0.6, 0.01), this.generateSlider('cdd', 'Cooling Degree Days - ', 300, 5000, 50), this.generateSlider('days', 'Days of AC Operation Per Week - ', 3, 7, 1));
        $("#rateSlider").on('input', () => {
            this.kWhPrice = Number($("#rateSlider").val());
            $("#rate").text(String(this.kWhPrice));
        });
        $("#cddSlider").on('input', () => {
            this.coolingDegreeDays = Number($("#cddSlider").val());
            $("#cdd").text(String(this.coolingDegreeDays));
        });
        $("#daysSlider").on('input', () => {
            this.daysOfOperation = Number($("#daysSlider").val());
            $("#days").text(String(this.daysOfOperation));
        });
    }
    generateSystem(num) {
        $('#addSection').before('<div id="system' + num + '" class="col-sm-3 card m-4">' +
            this.generateSlider(('age' + num), 'System Age (Years) - ', 1, 50, 1) +
            this.generateSlider(('seer' + num), 'SEER - ', 8, 25, 1) +
            this.generateSlider(('tons' + num), 'Tons of Cooling - ', 2, 100, 1) +
            this.generateSlider(('num' + num), 'Number of Systems - ', 1, 20, 1) +
            '<button id="remove' + num + '">Remove System</button>' +
            '</div>');
    }
    addSystem() {
        this.listOfSystems.push(new ACSystem(5, 9, 1, 13));
        let index = (this.listOfSystems.length - 1);
        this.generateSystem(index);
        $("#age" + index + "Slider").on('input', () => {
            this.listOfSystems[index].age = Number($("#age" + index + "Slider").val());
            $("#seer" + index).text(String(this.listOfSystems[index].seer));
            $("#seer" + index + "Slider").val(this.listOfSystems[index].seer);
            $("#age" + index).text(String(this.listOfSystems[index].age));
        });
        $("#seer" + index + "Slider").on('input', () => {
            this.listOfSystems[index].seer = Number($("#seer" + index + "Slider").val());
            $("#seer" + index).text(String(this.listOfSystems[index].seer));
        });
        $("#tons" + index + "Slider").on('input', () => {
            this.listOfSystems[index].tons = Number($("#tons" + index + "Slider").val());
            $("#tons" + index).text(String(this.listOfSystems[index].tons));
        });
        $("#num" + index + "Slider").on('input', () => {
            this.listOfSystems[index].num = Number($("#num" + index + "Slider").val());
            $("#num" + index).text(String(this.listOfSystems[index].num));
        });
        $("#remove" + index).click(() => {
            $("#system" + index).remove();
            this.listOfSystems.splice(index, 1);
        });
        $("#age" + index).text(String(this.listOfSystems[index].age));
        $("#tons" + index).text(String(this.listOfSystems[index].tons));
        $("#seer" + index).text(String(this.listOfSystems[index].seer));
        $("#num" + index).text(String(this.listOfSystems[index].num));
        $("#seer" + index + "Slider").val(this.listOfSystems[index].seer);
        $("#age" + index + "Slider").val(this.listOfSystems[index].age);
        $("#tons" + index + "Slider").val(this.listOfSystems[index].tons);
        $("#num" + index + "Slider").val(this.listOfSystems[index].num);
    }
    allValid() {
        if (this.listOfSystems.length > 0 && this.kWhPrice > 0 && this.coolingDegreeDays > 0 && this.daysOfOperation > 0) {
            for (let system of this.listOfSystems) {
                if (!system.validSystem()) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    calculateSavings() {
        for (let system of this.listOfSystems) {
            this._totalCostSavings += system.savings(this.daysOfOperation, this._equivalentFullLoad, this.kWhPrice);
            this._totalEnergySavings += system.kWHourSavings(this.daysOfOperation, this._equivalentFullLoad);
            this._totalCO2Reduction += system.co2Reduction(this.daysOfOperation, this._equivalentFullLoad, this._co2PerKWh);
        }
    }
    set coolingDegreeDays(value) {
        this._coolingDegreeDays = value;
        this._equivalentFullLoad = (value * this._degreeHourDay) / (this._designTemperature - 65);
    }
    set daysOfOperation(value) {
        this._daysOfOperation = value;
    }
    get coolingDegreeDays() {
        return this._coolingDegreeDays;
    }
    get daysOfOperation() {
        return this._daysOfOperation;
    }
    initialDisplay() {
        this.startingHTML('Select a city from the map or insert your own data. Then add systems to estimate your cost reduction with COOLNOMIX on your air conditioning system!');
        this.addInteractive();
    }
    makeHTML(results) {
        results += "<p></p><p><h4>Input Data:</h4></p><p>City: "
            + this.location
            + "</p><p>Electric Rate: "
            + this.kWhPrice
            + "</p><p>Cooling Degree Days: "
            + this.coolingDegreeDays
            + "</p><p>Days of AC Operation Per Week: "
            + this.daysOfOperation
            + "</p><p><h4>Systems: </h4></p>";
        let systemNum = 1;
        for (let system of this.listOfSystems) {
            results += "<p><strong>System "
                + systemNum
                + ": </strong></p><p>System Age (Years): "
                + system.age
                + "</p><p>SEER: "
                + system.seer
                + "</p><p>Tons of Cooling: "
                + system.tons
                + "</p><p>Number of Systems: "
                + system.num
                + "</p>";
            systemNum += 1;
        }
        return results;
    }
}
// Represents a system, either a fridge system or an AC system
class System {
    constructor(num) {
        this.efficiencyGain = .3;
        this._num = num;
    }
    get num() {
        return this._num;
    }
    set num(value) {
        this._num = value;
    }
}
// represents a fridge system
class FridgeSystem extends System {
    constructor(num, size, power, months) {
        super(num);
        this._size = size;
        this._power = power;
        this._months = months;
    }
    // total kWhour used in a year
    kWHourYearTotal() {
        this._kwhYearUsage = 12 * this.power * this._num;
        return this._kwhYearUsage;
    }
    // estimated energy savings with coolnomix
    kWHourSavings() {
        this._kwhYearSaving = this.kWHourYearTotal() * this.efficiencyGain;
        return this._kwhYearSaving;
    }
    // estimated co2 reduction per year
    co2Reduction(co2PerKWh) {
        this._yearCO2Saving = this.kWHourSavings() * co2PerKWh;
        return this._yearCO2Saving;
    }
    // estimated dollar value of the savings
    savings(kWhPrice) {
        this._yearPriceSaving = this.kWHourSavings() * kWhPrice;
        return this._yearPriceSaving;
    }
    get size() {
        return this._size;
    }
    set size(value) {
        this._size = value;
    }
    get power() {
        return this._power;
    }
    set power(value) {
        this._power = value;
    }
    get months() {
        return this._months;
    }
    set months(value) {
        this._months = value;
    }
    validSystem() {
        return (this.size > -1 && this.power > -1 && this.months > -1 && this.num > -1);
    }
}
// represents one system owned by customer
// can have multiple units
class ACSystem extends System {
    constructor(tons, age, numSystem, seer) {
        super(numSystem);
        this.btuConversion = 12000;
        this._tons = tons;
        this._age = age;
        if (seer != null) {
            this._seer = seer;
            if (seer > 12) {
                this.efficiencyGain -= 0.05;
            }
        }
    }
    // total kWhour used in a year
    kWHourYearTotal(daysOfOperation, equivalentFullLoad) {
        let btuHour = this._tons * this.btuConversion;
        let btuYear = btuHour * equivalentFullLoad;
        let kWHourYearPer = ((btuYear / this._seer) / 1000) *
            (daysOfOperation / 7);
        this._kwhYearUsage = kWHourYearPer * this._num;
        return this._kwhYearUsage;
    }
    // estimated energy savings with coolnomix
    kWHourSavings(daysOfOperation, equivalentFullLoad) {
        this._kwhYearSaving = this.kWHourYearTotal(daysOfOperation, equivalentFullLoad) * this.efficiencyGain;
        return this._kwhYearSaving;
    }
    // estimated co2 reduction per year
    co2Reduction(daysOfOperation, equivalentFullLoad, co2PerKWh) {
        this._yearCO2Saving = this.kWHourSavings(daysOfOperation, equivalentFullLoad) * co2PerKWh;
        return this._yearCO2Saving;
    }
    // estimated dollar value of the savings
    savings(daysOfOperation, equivalentFullLoad, kWhPrice) {
        this._yearPriceSaving = this.kWHourSavings(daysOfOperation, equivalentFullLoad) * kWhPrice;
        return this._yearPriceSaving;
    }
    validSystem() {
        return (this.age > -1 && this.seer > -1 && this.tons > -1 && this.num > -1);
    }
    set tons(value) {
        this._tons = value;
    }
    set seer(value) {
        this._seer = value;
    }
    set age(value) {
        if (value < 14) {
            this.seer = 13;
        }
        else if (value > 14 && value < 28) {
            this.seer = 10;
        }
        else if (value > 28 && value < 33) {
            this.seer = 8;
        }
        else if (value > 33 && value < 39) {
            this.seer = 7;
        }
        else if (value > 40) {
            this.seer = 6;
        }
        this._age = value;
    }
    get tons() {
        return this._tons;
    }
    get seer() {
        return this._seer;
    }
    get age() {
        return this._age;
    }
}
// Contains methods for verifying email with regex and sending it with JQuery Ajax
class Emailer {
    static validEmail(text) {
        var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
        return re.test(text);
    }
    //Function to email the calcultor results
    static sendResults(summary, subject) {
        let email = $('#emailAddress').val();
        if (this.validEmail(email)) {
            var key = 'WWRVm63jNPVpeyZQM2KqjA';
            var fromEmail = 'calculator@coolgreenpower.com';
            var url = "https://mandrillapp.com/api/1.0/messages/send.json";
            $.ajax({
                type: "POST",
                url: url,
                data: {
                    'key': key,
                    'message': {
                        'from_email': fromEmail,
                        'to': [
                            {
                                'email': email,
                                'name': '',
                                'type': 'to'
                            }
                        ],
                        'subject': subject,
                        'html': summary
                    }
                }
            });
            $('#sent').text("Results sent to " + email);
            $('#email').hide();
        }
        else {
            $('#sent').text('There is an issue with your email, please check to make sure it is filled in properly');
        }
    }
}
// Gets the data from any CSVs, draws the HTML, then draws the map
class CoolGreenDisplay {
    // draw the map and set the circle properties
    drawMap() {
        // Create map instance
        this.chart = am4core.create("chartdiv", am4maps.MapChart);
        // Set map definition
        this.chart.geodata = am4geodata_usaLow;
        // Set projection
        this.chart.projection = new am4maps.projections.Miller();
        // add zoom control
        this.chart.zoomControl = new am4maps.ZoomControl();
        // Create map polygon series
        this.polygonSeries = this.chart.series.push(new am4maps.MapPolygonSeries());
        this.polygonSeries.useGeodata = true;
            // Configure series
            this.polygonTemplate = this.polygonSeries.mapPolygons.template;
            this.polygonTemplate.tooltipText = "{name}";
            this.polygonTemplate.fill = am4core.color("#4eb69b");
            // Create image series
            this.imageSeries = this.chart.series.push(new am4maps.MapImageSeries());
            // Create a circle image in image series template so it gets replicated to all new images
            this.imageSeriesTemplate = this.imageSeries.mapImages.template;
            this.circle = this.imageSeriesTemplate.createChild(am4core.Circle);
            this.circle.radius = 5;
            this.circle.fill = am4core.color("#d65b39");
            this.circle.nonScaling = true;
            this.circle.tooltipText = "{title}";
            // Set property fields
            this.imageSeriesTemplate.propertyFields.latitude = "latitude";
            this.imageSeriesTemplate.propertyFields.longitude = "longitude";
    }
    static downloadCSV(url) {
        return __awaiter(this, void 0, void 0, function* () {
            // create response object, with header data and option to stream data
            let response = yield fetch(url);
            // get the body of the response, create a reader object, and read it
            let responseResults = yield response.body.getReader().read();
            // decode the uint8array to string
            let responseResults2 = new TextDecoder("utf-8").decode(responseResults.value);
            // parse the string to an array
            return $.csv.toObjects(responseResults2);
        });
    }
    drawWithCities() {
        return __awaiter(this, void 0, void 0, function* () {
            let cityUrl = 'https://coolgreenpublicdata.blob.core.windows.net/calc/Web%20Calculator%20Final.csv';
            this.excelObj = yield CoolGreenDisplay.downloadCSV(cityUrl);
            this.drawMap();
            this.imageSeries.data = [];
            this.excelObj.forEach((obj) => {
                if (obj.Lat != "") {
                    this.imageSeries.data.push({
                        "latitude": (Number(obj.Lat) + 0.000001),
                        "longitude": (Number(obj.Lon) + 0.000001),
                        "title": obj.City,
                        "state": obj.Location,
                        "cdd": Number(obj.CDD),
                        "rate": Number(obj.Rate).toFixed(2)
                    });
                }
            });
        });
    }
    triggerAC() {
        return __awaiter(this, void 0, void 0, function* () {
            let cust = new ACCustomer(0, 5, 0);
            cust.initialDisplay();
            yield this.drawWithCities();
            this.imageSeriesTemplate.events.on("hit", (ev) => {
                let data = ev.target.dataItem.dataContext;
                cust.coolingDegreeDays = data.cdd;
                cust.kWhPrice = data.rate;
                cust.location = data.title + ", " + data.state;
                $("#location").text(cust.location);
                $("#rate").text(cust.kWhPrice);
                $("#rateSlider").val(cust.kWhPrice);
                $("#cdd").text(cust.coolingDegreeDays);
                $("#cddSlider").val(cust.coolingDegreeDays);
                $("#days").text(String(cust.daysOfOperation));
                $("#daysSlider").val(cust.daysOfOperation);
            });
        });
    }
    triggerFridge() {
        return __awaiter(this, void 0, void 0, function* () {
            let cust = new FridgeCustomer();
            // await Promise.all([cust.initialDisplay(), this.drawWithCities()]);
            yield cust.initialDisplay();
            yield this.drawWithCities();
            this.imageSeriesTemplate.events.on("hit", function (ev) {
                let data = ev.target.dataItem.dataContext;
                cust.kWhPrice = data.rate;
                cust.location = data.title + ", " + data.state;
                $("#location").text(cust.location);
                $("#rate").text(cust.kWhPrice);
                $("#rateSlider").val(cust.kWhPrice);
            });
        });
    }
}
