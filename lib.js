// Purpose : Develop a Jira ticket from SAP input data
function jiraTicket(sap_data, severity){

    // declare the jira ticket schema
    const jiraSchema = require("./jiraSchema.json"); 
    const mapper = require("./jiraMapper.json");

    var summary = sap_data.EVENT_CLASS + " - " + sap_data.RISK_DESCRIPTION;
    
    // now perform the data dumping in real time
    // Update the jiraSchema object with SAP data
    jiraSchema.fields.summary = summary;
    jiraSchema.fields.description = sap_data.EVENT_DESCRIPTION;

    jiraSchema.fields.priority.name = severity;

    // Optional: Update the issue type
    if (sap_data.issuetype) {
    jiraSchema.fields.issuetype.name = sap_data.issuetype;
    }

    return jiraSchema
}

function severityMapper(severity){

    if(severity == "CRITICAL"){
        severity = "Highest";
    }
    else if(severity == "HIGH"){
        severity = "High";
    }
    else if(severity == "MEDIUM"){
        severity = "Medium";   
    }
    else if(severity == "LOW"){
        severity = "Low";
    }
    else{
        severity = "Lowest";
    }

    return severity
}

function elasticTicket(sap_data){

    // declare the elastic ticket schema
    const elasticSchema = require("./elasticSchema.json");

    // Update the elasticSchema with data from SAP HANA
    elasticSchema.MANDT = sap_data.MANDT;
    elasticSchema.RFC = sap_data.RFC;
    elasticSchema.REQ_NO = sap_data.REQ_NO;
    elasticSchema.ALERT_SEND_DATE = sap_data.ALERT_SEND_DATE;
    elasticSchema.ALERT_SEND_TIME = sap_data.ALERT_SEND_TIME;
    elasticSchema.EVENT_ID = sap_data.EVENT_ID;
    elasticSchema.EVENT_DESCRIPTION = sap_data.EVENT_DESCRIPTION;
    elasticSchema.PROGRAM_NAME = sap_data.PROGRAM_NAME;
    elasticSchema.SEVERITY = sap_data.SEVERITY;
    elasticSchema.RISK_DESCRIPTION = sap_data.RISK_DESCRIPTION;
    elasticSchema.EVENT_CLASS = sap_data.EVENT_CLASS;
    elasticSchema.CATEGORIES = sap_data.CATEGORIES;
    elasticSchema.RISK_OWNER = sap_data.RISK_OWNER;
    elasticSchema.ALERT_CLOSED_DATE = undefined;
    elasticSchema.ALERT_STATUS = sap_data.ALERT_STATUS;
    elasticSchema.STATUS = sap_data.STATUS;
    elasticSchema.INCIDENT_NO = sap_data.INCIDENT_NO;

    return elasticSchema
}

// Purpose : Create Jira Ticket - A task
function jira_postRequest(requestData, jiraUrl, auth){

    const axios = require('axios');

    const jira_headers = {
        'Content-Type': 'application/json'
    };

    const response = axios.post(jiraUrl,requestData,
        {
          headers: jira_headers,
          auth: {
            username: auth.username,
            password: auth.password
          }
        }
      ).then(function(response){
          console.log('Response:', response.data);
      })
      .catch(function(error){
          console.error('Error:', error);
      });
}

// Purpose : Send an entry to Elasticsearch DB
function elastic_postrequest(requestData){

    const axios = require('axios');

    const creds = require("./creds.json");

    const elastic_url = creds.elastic_url;
    const elastic_index = creds.elastic_index;
    const elastic_type = creds.elastic_type;
    const elastic_tag = requestData.REQ_NO;

    const mainUrl = elastic_url + elastic_index + elastic_type + elastic_tag;

    const elastic_headers = {
        'Content-Type': 'application/json'
    };

    const response = axios.post(mainUrl,requestData,  
        {
          headers: elastic_headers
        }
      ).then(function(response){
            console.log('Response:', response.data);
        })
        .catch(function(error){
            console.error('Error:', error);
      });
}

// Purpose : To POST using axios module.
function axiosPost(requestData){
    const axios = require('axios');
    // A module to use axios post request and to catch errors also.

    axios.post(requestData).then(function(response){
        console.log('Response:', response.data);
    })
    .catch(function(error){
        console.error('Error:', error);
    });
}

function axiosGet(issueId){
    var options = {
        method: 'GET',
        url: 'http://example.com:8080/rest/api/latest/issue/{issueIdOrKey}', 
        auth: { username: username, password: password },
        headers: {
           'Accept': 'application/json'
        }
     };
     
     request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(
           'Response: ' + response.statusCode + ' ' + response.statusMessage
        );
        console.log(body); //this would log all the info (in json) of the issue 
        // you can use a online json parser to look at this information in a formatted way
     
     });
}

module.exports = { jiraTicket, jira_postRequest, elastic_postrequest, elasticTicket, severityMapper}
