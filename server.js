// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
var axios = require('axios')
var bodyParser = require('body-parser')
app.set('view engine', 'pug')
var fs = require('fs'); //filesystem


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

//v2: random questions from a default question vector. dqi means default question i
var dq1 = [ "Do you actually like it, or is it just a meme?" ]; 
var dq2 = [ "What makes a good pizza, in your opinion?" ];
var dq3 = [ "Have you even tried it?" ];

var a1 = [ "NA", ]; //ai means answer i
var a2 = [ "NA", ];
var a3 = [ "NA", ];
var r1 = 0; var r2 = 0; var r3 = 0;
var topic = "Pineapple on Pizza";

var formDefinition = JSON.parse(fs.readFileSync('./form_definition.json'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  // list of questions from database
  // format a questions object   
  
  //pug doc https://pugjs.org/
  // HTML -> Pug http://html2jade.org
  
  // pass this object to front end
  // response.sendFile(__dirname + '/views/index.html');
  response.render('index', {topic, a1,a2,a3,dq1,dq2,dq3})
});

app.post('/webhook/typeform', function(request, response) {  
  
  //console.log(request.body.form_response.answers);
  //store in "database"
  if ( request.body.form_response.answers[2].choice.label == "Ask?" ){
    let i = request.body.form_response.answers[4].choice.label;
    if (i == "(1)"){
      dq1.push(request.body.form_response.answers[3].text);
      a1.push("NA");
    } else if ( i == "(2)" ){
      dq2.push(request.body.form_response.answers[3].text);
      a2.push("NA");
    }else if (i == "(3)"){
      dq3.push(request.body.form_response.answers[3].text);
      a3.push("NA");
    }    
  } else {//ara toca respondre
    
    let i = request.body.form_response.answers[1].choice.label;  //faction  
    console.log(i);
    let a = request.body.form_response.answers[3].text;  //answer
    console.log(a);   
    
    
    if (i == "1"){
      
      //desar la resposta
      a1[r1%(dq1.length)] = a;
      
      //canviar de pregunta
      //r1 = Math.floor((Math.random() * 100) + 1);
      r1 += 1;
      console.log(r1%(dq1.length));
      formDefinition = JSON.stringify(formDefinition).replace(dq1[(r1-1)%(dq1.length)], dq1[r1%(dq1.length )]);
    } else if ( i == "2" ){
      
      a2[r2%(dq2.length)] = a;
      
      //r2 = Math.floor((Math.random() * 100) + 1);
      r2 += 1;
      console.log(r2%(dq2.length));
      formDefinition = JSON.stringify(formDefinition).replace(dq2[(r2-1)%(dq2.length)], dq2[r2%(dq2.length )]);
    }else if (i == "3"){
      a3[r3%(dq3.length)] = a;      
      //r3 = Math.floor((Math.random() * 100) + 1);
      r3 += 1;
      console.log(r3%(dq3.length));
      formDefinition = JSON.stringify(formDefinition).replace(dq3[(r3-1)%(dq3.length)], dq3[r3%(dq3.length)]);
    } 

    formDefinition = JSON.parse(formDefinition); //replace {QUESTION_i} placeholder in template
    
    //UPDATE FORM
    const options = {
      method: 'PUT',
      url: 'https://api.typeform.com/forms/QndLRq',
      data: formDefinition,
      headers: {
        'Authorization': `Bearer ${process.env.TF_TOKEN}`
      }
   };
    
   axios(options)
      .then(response => {
        console.log(response.statusText);
      })
      .catch(error => {
        console.log(error);
      });

  } //fi else
  
  // display on it the website
  response.sendFile( __dirname + '/views/index.html');
});


app.post('/typeform/forms', (req, res) => {
  
   formDefinition = JSON.parse(fs.readFileSync('./form_definition.json'));
  formDefinition = JSON.stringify(formDefinition).replace(/{TOPIC}/g, req.body.topic_name);
  formDefinition = JSON.parse(formDefinition); //replace {TOPIC} placeholder in template
  //topic for the header
  topic = req.body.topic_name;
  
  formDefinition = JSON.stringify(formDefinition).replace(/{TAG_1}/g, req.body.tags[0]); 
  formDefinition = JSON.parse(formDefinition);
  formDefinition = JSON.stringify(formDefinition).replace(/{TAG_2}/g, req.body.tags[1]);  
  formDefinition = JSON.parse(formDefinition);
  formDefinition = JSON.stringify(formDefinition).replace(/{TAG_3}/g, req.body.tags[2]);
  formDefinition = JSON.parse(formDefinition);
  
    //v2: random questions from a default question vector. dqi means default question i
  dq1 = [ ]; dq1.push( req.body.dfq1); 
  dq2 = [ ]; dq2.push( req.body.dfq2); 
  dq3 = [ ]; dq3.push( req.body.dfq3); 
  
  formDefinition = JSON.stringify(formDefinition).replace(/{QUESTION_1}/g, dq1[0]);
  formDefinition = JSON.parse(formDefinition);
  formDefinition = JSON.stringify(formDefinition).replace(/{QUESTION_2}/g, dq2[0]);
  formDefinition = JSON.parse(formDefinition);
  formDefinition = JSON.stringify(formDefinition).replace(/{QUESTION_3}/g, dq3[0]);
  formDefinition = JSON.parse(formDefinition);

  a1 = [ "NA", ]; //ai means answer i
  a2 = [ "NA", ];
  a3 = [ "NA", ];
  r1 = 0; r2 = 0; r3 = 0;
  
  //console.log(formDefinition);

  const options = {
    method: 'PUT',
    url: 'https://api.typeform.com/forms/QndLRq',
    data: formDefinition,
    headers: {
      'Authorization': `Bearer ${process.env.TF_TOKEN}`
    }
  };

  axios(options)
    .then((response) => {    
      res.send({ form_link: response.data._links.display });
    })
    .catch((error) => {
      //console.log(error.response.data.details);
     console.log(error.response.data);
    });
})


// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
