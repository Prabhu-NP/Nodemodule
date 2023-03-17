var express = require('express');
const libraries = require("./lib");
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

const PORT = 7777;

// configure the welcome page
app.get('/', function(req, res){
    res.status(200);
    res.send('JIRA SERVER HOMEPAGE');
});

app.post('/Ticket/API/:Jira', jsonParser,function(req, res){

    // Step 1 : Show a responce code and message for the webpage
    // the incoming data fro the POST request is mapped as SAP input data
    var sapInputdata = [];

    sapInputdata = req.body;

    const credentials = require("./creds.json");
    const auth = require("./jiraAuth.json");

    const jiraUrl = credentials.jira_url;
    const issueEndpoint = credentials.jira_issueEndpoint;
    // creating a Jira target url
    var jiraMainurl = jiraUrl + issueEndpoint;

    var arrayLength = sapInputdata.length;

    console.log(`Array received length is ${arrayLength}`);

    // create a for loop for sending an array of sap input data
    for(var i = 0; i < arrayLength; i++){

        var currentSap = sapInputdata[i];

        var sap_severity = libraries.severityMapper(currentSap.SEVERITY);

        console.log(`Updated Jira Severity is : ${sap_severity}`);

        // creating a custom Jira ticket form the SAP dat
        const jira_ticket = libraries.jiraTicket(currentSap, sap_severity);

        console.log(jira_ticket);

        // post the jira ticket
        libraries.jira_postRequest(jira_ticket, jiraMainurl, auth);

        // create the elastic schema entry
        const elastic_ticket = libraries.elasticTicket(currentSap);
        console.log(elastic_ticket);
        
        // post the schema to Elastic & Kibana
        libraries.elastic_postrequest(elastic_ticket);

    }

    res.status(200).send('200')

    return

});

var server = app.listen(PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
 })
