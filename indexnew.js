//15/03/2019 inizio sviluppo prototipo
/****************************************** */
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
/*********** */
const request = require('request');
const requestnp=require('request-promise-native');
const querystring = require('querystring');
const parseurl = require('parseurl');
const path = require("path");
const https = require('https');
const esameDC="DIRITTO COSTITUZIONALE";
const esameEA="ECONOMIA AZIENDALE";

/*** DIALOGFLOW FULFILLMENT */
const {WebhookClient} = require('dialogflow-fulfillment');
/*** ACTIONS ON GOOGLE */
//const {dialogflow} = require('actions-on-google')
 // Create an app instance
//const appDFActions = dialogflow();

/** utilità */
const fs = require("fs");
const utf8=require('utf8');
//file di configurazione
const env = require('node-env-file');
env(__dirname + '/.env');
/* classi della logica di business */
var controller=require('./Classi/clsControllerS3.js');
var studente=require('./Classi/clsStudente.js');
var carrieraStudente=require('./Classi/clsCarriera.js');



var app = express();
var bot='HEAD'; // modificato in data 14/03/2019 in HEAD -->HEADdemo FarmaInfoBot
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

//inizializzo la sessione
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, maxAge: 180000,name:'JSESSIONID'}
  }));
//uso le variabili di sessione
app.use(function (req, res, next) {
    
    req.session.username='';
    req.session.matId='';
    req.session.stuId='';
    
  
    next();
  })
  postData = querystring.stringify({
    'searchText': 'ciao',
    'user':'',
    'pwd':'',
    'ava':'FarmaInfoBot'
    
  });
  //questo diventerà un modulo con la conessione a PLQ
   const options = {
     //modifica del 12/11/2018 : cambiato porta per supportare HTTPS
     
    hostname: '86.107.98.69', 
    /*port: 8080,*/
    port: 8443,
    rejectUnauthorized: false, 
    path: '/AVA/rest/searchService/search_2?searchText=', 
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json', 
      'Cookie':'' // +avaSession 
    }
  };
 
  app.get('/login', function(req, res, next) {
    controller.getMediaComplessiva('291783').then((libretto) => { 
      console.log('sono in getmediacomplessiva')
       var strTemp=''; 
     
       if (Array.isArray(libretto)){
          
         console.log('la media '+ libretto[0].media);
          

         }
        
       //agent.setContext({ name: 'libretto', lifespan: 5, parameters: { matID: studente.trattiCarriera[0].matId }});
       resolve(agent);
     }).catch((error) => {
       console.log('Si è verificato errore : ' +error);
     });
  
    }) 


app.get('/', function(req, res, next) {
    
  
     res.render("index", {  message:" Benvenuto nella pagina di test "});
  
 });
 app.get('/testLocale', function(req, res, next) {
  
    res.send('ok')
    
 
});
 app.get('/testSessione', function(req, res, next) {
   
      res.setHeader('Content-Type', 'text/html')
      res.write("sono nella root ");
      res.write('<p>views: ' + req.session.views + '</p>')
      res.write('<p> id sessione ' + req.session.id  +' expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
     
      res.end()
  
  })

  /*
 qui ci sarà il codice per gestire app DF con actions

  */
 function welcome (agent) {
    agent.add(`Ciao, sono l'assistente virtuale dell’Università degli studi di Trieste. Posso aiutarti a prenotare un appello, vedere il tuo libretto, vedere i risultati di un esame. Dì ad esempio elenco esami per ascoltare i dati del tuo libretto `);
 
   console.log('sono nel welcome');
  }
  
  function fallback (agent) {
    agent.add(`I didn't understand from server`);
   console.log('sono nel fallback');
  }
  function anytext (agent) {
    agent.add(`sono in anytext`);
   console.log('sono in anytext');
  }
 function WebhookProcessing(req, res) {
    const agent = new WebhookClient({request: req, response: res});
    //10/01/2019
    //copiato codice da progetto api
    console.log('------sono su HeadDemo app ----- la richiesta proviene da '+ agent.requestSource);
    var name=req.body.queryResult.intent.name;
    var displayname=req.body.queryResult.intent.displayName;
    console.log('nome intent '+name+ ' , display name '+ displayname);
    //******************************************* */
    //recupero la sessionId della conversazione
    
    agent.sessionId=req.body.session.split('/').pop();
  //assegno all'agente il parametro di ricerca da invare sotto forma di searchText a Panloquacity
    agent.parameters['Command']=req.body.queryResult.parameters.Command;
    if (req.body.queryResult.parameters.esame){

      console.log(' ho esame =' + req.body.queryResult.parameters.esame);
      agent.parameters['esame']=req.body.queryResult.parameters.esame;
    }
    //fulfillment text
    agent.fulfillmentText=req.body.queryResult.fulfillmentText;
    console.log('----> fulfillment text =' +agent.fulfillmentText);
    console.info(` sessione agente ` + agent.sessionId +` con parametri` + agent.parameters.Command);
  
    
    let intentMap = new Map();
    //'numero di matricola #infopersonali #esse3'
    intentMap.set(displayname, callAVANEW); //la funzione callAva sostiutisce la funzione welcome 
    //intentMap.set('AnyText', callAVANEW); // callAVA anytext AnyText sostituisce 'qualunquetesto'
  
    
    agent.handleRequest(intentMap);
  }
  
  //app.post('/fulfillment', appDFActions);
  app.post("/fulfillment", function (req,res){

    console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
    console.log('DIALOGFLOW Request body: ' + JSON.stringify(req.body));
    //console.log('vedo le var di sessione di Express ?? '+ req.session.id );
    
    WebhookProcessing(req, res); 
  
  
  });
  //provo a modificare 13/01/2019 
  //cmd tolgo cmd
  function doLogin() {
    return new Promise((resolve, reject) => {
      
        //console.log('+++++++++++ sono in doLogin e il comando =' ) ;//+ cmd)
        var strUrlLogin='https://units.esse3.pp.cineca.it/e3rest/api/login';
         var options = { 
          method: 'GET',
          url: strUrlLogin,
          headers: 
              { 
                  'cache-control': 'no-cache',
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic czI2MDg1NjpRM1ZSQUFRUA=='
              },
          json: true 
      };
      let str = '';
     request(options, function (error, response, body) {
      if (error) throw new Error(error);
          
      
          if (response.statusCode==200){
              console.log('HO RISPOSTA DA ESSETRE!')
  
              //per debug
              //var str=JSON.stringify(body);
              str=JSON.stringify(body.user.codFis);
              console.log('\n\nQUESTO IL BODY dello studente con CF ' +str);
              //aggiunta del 13/01/2019
              //agent.add('da doLogin '+ str);
              //resolve(str);
              resolve(str);
             
            // return str;
          } else {
  
              //LOGIN FAILED
          
              console.log('response.statusCode ' + response.statusCode);
              console.log('login failed');
    
          }
      });  //fine request
   });
  } 

 
  /**** FUNZIONI A SUPPORTO copiate da progetto api */

function scriviSessione(path, strSessione, strValore) {
  
  fs.appendFile(path + strSessione,strValore, function (err) {
    if (err) {
      
      throw err;
    
    } else {
    console.log('DENTRO SCRIVI SESSIONE: SALVATO FILE '+ path + strSessione);
    
    }
     
  });
 
} 

function leggiSessione(path, strSessione){
  var contents='';
  try {
    fs.accessSync(__dirname+ '/sessions/'+ strSessione);
    contents = fs.readFileSync(__dirname+'/sessions/'+ strSessione, 'utf8');
    console.log('DENTRO LEGGI SESSIIONE ' +contents);
  

  }catch (err) {
    if (err.code==='ENOENT')
    console.log('DENTRO LEGGI SESSIONE :il file non esiste...')
   
  }
  return contents;

} 
 // 18/12/2018
 function getComandi(arComandi)
  {

    var comandi=arComandi;
    if (comandi.length>0){
        //prosegui con il parsing
        //caso 1: ho solo un comando, ad esempio lo stop->prosegui con il parsing
        switch (comandi.length){
          case 1:
            comandi=arComandi;
            break;

          case 2:
          //caso 2: ho due comandi, stop e img=path image, quindi devo scomporre comandi[1] 
            var temp=arComandi[1].toString();
            //temp=img=https.....
            //splitto temp in un array con due elementi divisi da uguale
            temp=temp.split("=");
            console.log('valore di temp[1]= ' +temp[1]);
            arComandi[1]=temp[1];
            comandi=arComandi;

            //scompongo arComandi[1]
            break;

          default:
            //
            console.log('sono in default');

        }
       return comandi; //ritorno array come mi serve STOP oppure STOP, PATH img
      
    } else {
      console.log('non ci sono comandi')

      //non ci sono comandi quindi non fare nulla
      return undefined;
    }
   
  } 
//callAva attuale al 10/01/2019
function callAVA(agent) {
  return new Promise((resolve, reject) => {
 
  let strRicerca='';
  let out='';
  let sessionId = agent.sessionId /*.split('/').pop()*/;
  console.log('dentro call ava il mio session id '+sessionId);
  //modifica del 02/12/2018 per bug utf8
  // faccio encoding in utf8-> utf8.encode()
  var str= utf8.encode(agent.parameters.searchText); //req.body.queryResult.parameters.searchText; //req.body.searchText;
  if (str) {
    strRicerca=querystring.escape(str); //02/12/2018: questo rimane, escape della stringa ci vuole cmq!
    options.path+=strRicerca+'&user=&pwd=&ava'+bot;

  }
 
   let data = '';
    let strOutput='';
   /*
    var ss=leggiSessione(__dirname +'/sessions/', sessionId);
    if (ss===''){
      options.headers.Cookie='JSESSIONID=';
      console.log('DENTRO CALL AVA: SESSIONE VUOTA');
    }else {
      options.headers.Cookie='JSESSIONID='+ss;
      console.log('DENTRO CALL AVA:  HO LA SESSIONE + JSESSIONID');
    }
 */
    const req = https.request(options, (res) => {
    //console.log("DENTRO CALL AVA " + sess);  
    console.log('________valore di options.cookie INIZIO ' + options.headers.Cookie);
    console.log(`STATUS DELLA RISPOSTA: ${res.statusCode}`);
    console.log(`HEADERS DELLA RISPOSTA: ${JSON.stringify(res.headers)}`);
    console.log('..............RES HEADER ' + res.headers["set-cookie"] );
  
    if (res.headers["set-cookie"]){
 
      var x = res.headers["set-cookie"].toString();
      var arr=x.split(';')
      var y=arr[0].split('=');
     
    
    
     //scriviSessione(__dirname+'/sessions/',sessionId, y[1]);
    }
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
     console.log(`BODY: ${chunk}`);
     data += chunk;
  
     let c=JSON.parse(data);
            strOutput=c.output[0].output;
          
            strOutput=strOutput.replace(/(<\/p>|<p>|<b>|<\/b>|<br>|<\/br>|<strong>|<\/strong>|<div>|<\/div>|<ul>|<li>|<\/ul>|<\/li>|&nbsp;|)/gi, '');
       
            //resolve(strOutput); <--- OLD
            //18/12/2018  02/01/2019
            let comandi=[];
            comandi=getComandi(c.output[0].commands);
           if (typeof comandi!=='undefined' && comandi.length>=1) {
              console.log('ho almeno un comando, quindi prosegui con l\' azione ' + comandi[0]);
              agent.add(comandi.toString()); // ok, anche comandi[0] va bene
             
             
           } else{
              agent.add('NO');

           }
         
        
          /**********fino qua gestione comandi 18/12/2018  */   
 
          //agent.add(comandi); //NEW
         
          resolve(agent);
           
         
    });
    res.on('end', () => {
      console.log('No more data in response.');
     
          
            options.path='/AVA/rest/searchService/search_2?searchText=';
           
            console.log('valore di options.path FINE ' +  options.path);
 
    });
  });
   req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    strOutput="si è verificato errore " + e.message;
  
  });
   // write data to request body
   req.write(postData);
  req.end();
  });
 }
 

//mia nuova che non funziona 
function callAVANEW(agent) { 
    return new Promise((resolve, reject) => {
  
    let strRicerca='';
   
    let sessionId = agent.sessionId /*.split('/').pop()*/;
    console.log('dentro call ava il mio session id '+sessionId);
//questo lo tengo perchè mi serve per recuperare la stringa dall'agente
    var str= utf8.encode(agent.parameters.Command); //req.body.queryResult.parameters.searchText; //req.body.searchText;
    if (str) {
      strRicerca=querystring.escape(str); //lo tengo comunque
     // options.path+=strRicerca+'&user=&pwd=&ava='+bot;
    
      console.log('il comando da passare : '+ strRicerca);
    }  
    var strOutput=agent.fulfillmentText;
    console.log('strOutput agente prima di EsseTre :' + strOutput);
    //HO ESAME??
    if(agent.parameters.esame){

      var paramEsame=agent.parameters.esame;
      console.log('in callAvanew ho esame '+ paramEsame);
    }
    //recupero la variabile legata al contesto
    var ctx=agent.context.get('contesto');
    if (ctx){
      console.log('ho già il contesto quindi recupero id esame: lookup da params esami');
     
      var idEsame='';
    
      for(var i =0;i<ctx.parameters.esami.length;i++){
      //ciclo nell'array dei nomi degli esami, se lo trovo, prendo il corrispondente id nel array ID
        if (ctx.parameters.esami[i]===paramEsame){
          console.log('******** TROVATO ESAME IN PARAMS.ESAMI*******');
          idEsame=ctx.parameters.id[i];
          console.log('************ ID DI ESAME = '+idEsame);
          break;
        }
      }
    }else{
    //Da gestire il caso in cui il contesto non è presente
    }
    
      switch (strRicerca) {
        case 'getLibretto':
          console.log('sono nel getLibretto');
          var arIDS=[];
          var arEsami=[];
          //var ctx=agent.context.get('contesto');
          if (ctx){
            console.log('ho già il contesto');
          }else{
           //agent.context.set({ name: 'contesto', lifespan: 5, parameters: { "id": ['xxx','yyyy']}});
           agent.context.set({ name: 'contesto', lifespan: 5, parameters: { "id": ['prova'] ,"esami" :['esame']}});
           console.log('scrivo il contesto in getLibretto ');
        }
          controller.getLibretto().then((libretto)=> {
            var strTemp='';
           
            // strOutput='ecco gli esami ';
           
            if (Array.isArray(libretto)){
              
              for(var i=0; i<libretto.length; i++){
                //tolto 'esame di ' in data 29/01/2019 e aggiunti i campi per avere i dati come su EsseTre RigaLibretto
                //prova del 18/03/2019
                
                arIDS.push(libretto[i].adsceId);
                console.log('inserito in arIDS '+arIDS[i]);
                arEsami.push(libretto[i].adDes);
                console.log('inserito in arEsami '+arEsami[i]);

                strTemp+=  libretto[i].adDes+ ', frequentato  nell \'anno ' +libretto[i].aaFreqId +', anno di corso ' +
                libretto[i].annoCorso + '\n';
    
              }
              
            }
            //qui devo fare replace della @, che si trova in tmp[0]
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace '+ strOutput);
            //provo qui  prova del 18/03/2019  FUNGE!!!
            ctx=agent.context.get('contesto');
            ctx.parameters.id=arIDS;
            ctx.parameters.esami=arEsami;
            /********************************************************************************/ 
            resolve(agent);
          }).catch((error) => {
            console.log('Si è verificato errore : ' +error);
            
          
          });
          break;
          //28/01/2019
        case 'getInformazioni':
  
              //14/03/2109 il nuovo user è s262502
              controller.getCarriera('s262502').then((carriera)=> {
              var strTemp='';
              strTemp+='Ti sei immatricolato nell anno '+ carriera.aaId + ' , con numero matricola  '+ carriera.matricola + ', nel corso di laurea '+ carriera.cdsDes +', tipo di corso di laurea '+ carriera.tipoCorsoDes; + 'percorso '+carriera.pdsDes +', stato attuale :' +carriera.motStastuDes
              console.log('sono nella carriera ...');
              // console.log('ho lo studente '+studente.codFisc + 'matricola ID '+ studente.trattiCarriera[0].matId);
              // agent.setContext({ name: 'matricola', lifespan: 5, parameters: { matID: studente.trattiCarriera[0].matId }});
              
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace '+ strOutput);
              resolve(agent);
              
              }).catch((error) => {
                console.log('Si è verificato errore : ' +error);
                
            
              });
              break;
        case 'getStudente':
        controller.getLibretto().then((libretto)=> {
          var strTemp='';
          // strOutput='ecco gli esami ';
          if (Array.isArray(libretto)){
            
          
              strTemp+='sei iscritto al ' +   libretto[0].annoCorso + ' anno di corso';
              console.log('comando getStudente->getLibretto: ' + strTemp);
          }
          //qui devo fare replace della @, che si trova in tmp[0]
          var str=strOutput;
          str=str.replace(/(@)/gi, strTemp);
          strOutput=str;
          agent.add(strOutput);
          console.log('strOutput con replace '+ strOutput);
          resolve(agent);
          }).catch((error) => {
          console.log('Si è verificato errore : ' +error);
          
        
        });
          break;
        //28/01/2019
        case 'getNumeroMatricola':
          controller.getCarriera('s262502').then((carriera)=> {
            var strTemp='';
            strTemp+='' + carriera.matricola;
          console.log('chiedo il numero di matricola ...');
          // console.log('ho lo studente '+studente.codFisc + 'matricola ID '+ studente.trattiCarriera[0].matId);
          // agent.setContext({ name: 'matricola', lifespan: 5, parameters: { matID: studente.trattiCarriera[0].matId }});
            
          var str=strOutput;
          str=str.replace(/(@)/gi, strTemp);
          strOutput=str;
          agent.add(strOutput);
          console.log('strOutput con replace '+ strOutput);
          resolve(agent);
            
          }).catch((error) => {
            
            var strError='Si è verificato errore : ' +error;
            console.log(strError);
            agent.add(strError);
            resolve(agent);
          });
          break;
          //28/01/2019
          case 'getAnnoImmatricolazione':
          controller.getCarriera('s262502').then((carriera)=> {
            var strTemp='';
            var dt=carriera.dataImm; //elimino minuti e secondi
            strTemp+='' + dt.substring(0,10);
          console.log('chiedo la data immatricolazione...');
          // console.log('ho lo studente '+studente.codFisc + 'matricola ID '+ studente.trattiCarriera[0].matId);
          // agent.setContext({ name: 'matricola', lifespan: 5, parameters: { matID: studente.trattiCarriera[0].matId }});
            
          var str=strOutput;
          str=str.replace(/(@)/gi, strTemp);
          strOutput=str;
          agent.add(strOutput);
          console.log('strOutput con replace '+ strOutput);
          resolve(agent);
            
          }).catch((error) => {
            console.log('Si è verificato errore : ' +error);
            
          
          });
          break;
          //29/01/2019 
          //14/03/2019: cambiato matId da 286879 a 291783, adsceId da 5057980 a 5188667
          //15/03/2019 il comando getDirittoCostituzionale viene modificato in 
          //18/03/2019 DIVENTA OLD RIMPIAZZATO DA getInfoGenEsame
          /******** DIRITTO COSTITUZIONALE 
         
          case 'getDirittoCostituzionale':
            controller.getEsame('291783','5188667').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del getDirittoCostituzionale******************');
      
              strTemp += ' anno di corso ' + esame.annoCorso +', codice '+ esame.adCod +', corso di ' + esame.adDes + ', crediti in  CFU' + esame.peso + ', attività didattica '
              + esame.statoDes +', frequentata nel '+  esame.aaFreqId;
              if (typeof esito !=='undefined' && esito.dataEsa!=='' && esito.voto!=null){
              
            
                var dt= esame.esito.dataEsa;
                
                strTemp +=', superata in data ' + dt.substring(0,10) + ' con voto di ' + esame.esito.voto + ' trentesimi'
              }
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getDirittoCostituzionale'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getDirittoCostituzionale: ' +error);
            
          
          }); 
            break;
            */
            /****************** NUOVO : GESTIONE DINAMICA ESAMI 15/03/2019 E 18/03/2019 **/
            case 'getInfoGenEsame':
            
            //nuovo del 18/03/2019

          /*
            if (ctx){
              console.log('ho già il contesto quindi recupero id esame: lookup da params esami');
             
              var idEsame='';
            
              for(var i =0;i<ctx.parameters.esami.length;i++){
              //ciclo nell'array dei nomi degli esami, se lo trovo, prendo il corrispondente id nel array ID
                if (ctx.parameters.esami[i]===paramEsame){
                  console.log('******** TROVATO ESAME IN PARAMS.ESAMI*******');
                  idEsame=ctx.parameters.id[i];
                  console.log('************ ID DI ESAME = '+idEsame);
                  break;
                }
              }
            }else{
            
            }*/

          //  if (paramEsame===esameDC){   '5188667'
              console.log('sono dentro getInfoGenEsame con esame '+paramEsame);
              controller.getEsame('291783',idEsame).then((esame) => { 
                var strTemp=''; 
                console.log( '**************** dati del singolo esame ******************');
        
                strTemp += ' anno di corso ' + esame.annoCorso +', codice '+ esame.adCod +', corso di ' + esame.adDes + ', crediti in  CFU' + esame.peso + ', attività didattica '
                + esame.statoDes +', frequentata nel '+  esame.aaFreqId;
                if (typeof esito !=='undefined' && esito.dataEsa!=='' && esito.voto!=null){
                
                //if (typeof esame.esito !=='undefined'){
                  var dt= esame.esito.dataEsa;
                  
                  strTemp +=', superata in data ' + dt.substring(0,10) + ' con voto di ' + esame.esito.voto + ' trentesimi'
                }
                var str=strOutput;
                str=str.replace(/(@)/gi, strTemp);
                strOutput=str;
                agent.add(strOutput);
                console.log('strOutput con replace in OLDgetDirittoCostituzionale'+ strOutput);
                resolve(agent);
  
            }).catch((error) => {
              console.log('Si è verificato errore in OLDgetDirittoCostituzionale: ' +error);
              
            
            });
           /* COMMENTATO IN DATA 18/03/2019
           } else{
              //per il momento economia aziendale
              controller.getEsame('291783','5188670').then((esame) => { 
                var strTemp=''; 
                console.log( '**************** dati del getEconomiaAziendale ******************');
        
                strTemp += ' anno di corso ' + esame.annoCorso +', codice '+ esame.adCod +', corso di ' + esame.adDes + ', crediti in  CFU' + esame.peso + ', attività didattica '
                + esame.statoDes +' nel '+  esame.aaFreqId;
                if (typeof esito !=='undefined' && esito.dataEsa!=='' && esito.voto!=null){
                
                  //if (typeof esame.esito !=='undefined'){
                    var dt= esame.esito.dataEsa;
                    
                    strTemp +=', superata in data ' + dt.substring(0,10) + ' con voto di ' + esame.esito.voto + ' trentesimi'
                  }
                var str=strOutput;
                str=str.replace(/(@)/gi, strTemp);
                strOutput=str;
                agent.add(strOutput);
                console.log('strOutput con replace in getEconomiaAziendale'+ strOutput);
                resolve(agent);
 
            }).catch((error) => {
              console.log('Si è verificato errore in getEconomiaAziendale: ' +error);
              
            
            }); 
            }
           */
          break;
          
            //******** DETTAGLIO DIRITTO COSTITUZIONALE  '5188667'*/
            // COMMENTATO IN DATA 18/03/2019 diventa old
           /*case 'getAnnoDirittoCostituzionale':
            controller.GetDettaglioEsame('291783','5188667', 'annoCorso').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del ANNO getDirittoCostituzionale= ' + esame.annoCorso);
      
              strTemp +=  esame.annoCorso; 
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getDirittoCostituzionale'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getDirittoCostituzionale: ' +error);
            
          
          });
            break;*/
            //modifica del 18/03/2019
            //getAnnoEsame GENERICO -> DINAMICO
            case 'getAnnoEsame':
            controller.GetDettaglioEsame('291783',idEsame, 'annoCorso').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del ANNO getAnnoEsame= ' + esame.annoCorso);
      
              strTemp +=  esame.annoCorso; 
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getAnnoEsame'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getAnnoEsame: ' +error);
            
          
          });
            break;
              // COMMENTATO IN DATA 18/03/2019 diventa old
           /* case 'getTipoEsameDirittoCostituzionale':
            controller.GetDettaglioEsame('291783','5188667', 'tipoEsaDes').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del TIPO getTipoEsameDirittoCostituzionale ' +esame.tipoEsaDes);
      
              strTemp +=  esame.tipoEsaDes; 
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getTipoEsameDirittoCostituzionale'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getTipoEsameDirittoCostituzionale: ' +error);
            
          
          });
            break;*/
            //18/03/2019 nuovo
            case 'getTipoEsame':
            controller.GetDettaglioEsame('291783',idEsame, 'tipoEsaDes').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del TIPO getTipoEsame ' +esame.tipoEsaDes);
      
              strTemp +=  esame.tipoEsaDes; 
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getTipoEsame'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getTipoEsame: ' +error);
            
          
          });
            break;
            //peso
            //19/03/2019 commentato diventa old
           /* case 'getCreditoFormativoDirittoCostituzionale':
            controller.GetDettaglioEsame('291783','5188667', 'peso').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del peso getCreditoFormativoDirittoCostituzionale' +esame.peso);
      
              strTemp +=  esame.peso; 
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getCreditoFormativoDirittoCostituzionale'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getCreditoFormativoDirittoCostituzionale: ' +error);
            
          
          });
            break;*/
            //nuovo 19/03/2019
            case 'getCreditoFormativoEsame':
            controller.GetDettaglioEsame('291783',idEsame, 'peso').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del peso getCreditoFormativoEsame' +esame.peso);
      
              strTemp +=  esame.peso; 
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getCreditoFormativoEsame'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getCreditoFormativoEsame: ' +error);
            
          
          });
          break;
            //anno di frequenza diventato old in data 19/03/2019
            /*case 'getAnnoFrequentatoDirittoCostituzionale':
            controller.GetDettaglioEsame('291783','5188667', 'aaFreqId').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del ANNO DI FREQUENZA getAnnoFrequentatoDirittoCostituzionale' +esame.aaFreqId);
      
              strTemp +=  esame.aaFreqId;
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getAnnoFrequentatoDirittoCostituzionale'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getAnnoFrequentatoDirittoCostituzionale: ' +error);
            
          
          });
            break;*/
            //nuovo del 19/03/2019
            case 'getAnnoFrequentatoEsame':
            controller.GetDettaglioEsame('291783',idEsame, 'aaFreqId').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del ANNO DI FREQUENZA getAnnoFrequentatoEsame' +esame.aaFreqId);
      
              strTemp +=  esame.aaFreqId;
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getAnnoFrequentatoEsame'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getAnnoFrequentatoDirittoCostituzionale: ' +error);
            
          
          });
            break;
              //getDataEsameFattoDirittoCostituzionale esito.dataEsa
              case 'getDataEsameFattoDirittoCostituzionale':
              controller.GetDettaglioEsame('291783','5188667', 'esito.dataEsa').then((esame) => { 
                var strTemp=''; 
                console.log( '**************** dati del esito.dataEsa getDataEsameFattoDirittoCostituzionale' +esame.esito.dataEsa);
        
                strTemp +=  esame.esito.dataEsa; 
                var str=strOutput;
                str=str.replace(/(@)/gi, strTemp);
                strOutput=str;
                agent.add(strOutput);
                console.log('strOutput con replace in getDataEsameFattoDirittoCostituzionale'+ strOutput);
                resolve(agent);

            }).catch((error) => {
              console.log('Si è verificato errore in getDataEsameFattoDirittoCostituzionale: ' +error);
              
            
            });
              break;
              //getVotoDirittoCostituzionale
              case 'getVotoDirittoCostituzionale':
              controller.GetDettaglioEsame('291783','5188667', 'esito.voto').then((esame) => { 
                var strTemp=''; 
                console.log( '**************** dati del esito.dataEsa getVotoDirittoCostituzionale ' +esame.esito.voto);
        
                strTemp +=  esame.esito.voto; //Diritto Costituzionale è un corso dell'anno : 1
                var str=strOutput;
                str=str.replace(/(@)/gi, strTemp);
                strOutput=str;
                agent.add(strOutput);
                console.log('strOutput con replace in getVotoDirittoCostituzionale '+ strOutput);
                resolve(agent);

            }).catch((error) => {
              console.log('Si è verificato errore in getVotoDirittoCostituzionale: ' +error);
              
            
            });
              break;
            //30/01/2019
            //19/03/2019 commentato, diventa old
          // getDocenteDirittoCostituzionale
          /*case 'getDocenteDirittoCostituzionale':
          controller.GetDocente('291783','5188667').then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del DOCENTE getDocenteDirittoCostituzionale ');
    
            strTemp +=  esame; //ritorna una stringa con cognome e nome del docente
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getDocenteDirittoCostituzionale '+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getDocenteDirittoCostituzionale: ' +error);
          
        
        });
        break;*/
        //nuovo: 19/03/2019
        case 'getDocenteEsame':
        controller.GetDocente('291783',idEsame).then((esame) => { 
          var strTemp=''; 
          console.log( '**************** dati del DOCENTE getDocenteEsame ');
  
          strTemp +=  esame; //ritorna una stringa con cognome e nome del docente
          var str=strOutput;
          str=str.replace(/(@)/gi, strTemp);
          strOutput=str;
          agent.add(strOutput);
          console.log('strOutput con replace in getDocenteEsame '+ strOutput);
          resolve(agent);

      }).catch((error) => {
        console.log('Si è verificato errore in getDocenteEsame: ' +error);
        
      
      });
      break;
        //COMMENTATO IN DATA 18/03/2019 diventa old
        //getTipoCorsoDirittoCostituzionale
        /*case 'getTipoCorsoDirittoCostituzionale':
          controller.getSegmento('291783','5188667').then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del TIPO CORSO getTipoCorsoDirittoCostituzionale ');
    
            strTemp +=  esame; //ritorna una stringa con LEZ
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getTipoCorsoDirittoCostituzionale '+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getTipoCorsoDirittoCostituzionale: ' +error);
          
        
        });
        break;*/
        //nuovo del 18/03/2019
        case 'getTipoCorso':
          controller.getSegmento('291783',idEsame).then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del TIPO CORSO getTipoCorso ');
    
            strTemp +=  esame; //ritorna una stringa con LEZ
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getTipoCorso '+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getTipoCorso: ' +error);
          
        
        });
        break;
            //18/03/2019 QUESTO DIVENTA OLD
            //******** ECONOMIA AZIENDALE  */ 
            //14/03/2019 da  5057985 a 5188670
            //**********  */getEconomiaAziendale 29/01/2019 generico
            /*case 'getEconomiaAziendale':
            controller.getEsame('291783','5188670').then((esame) => { 
              var strTemp=''; 
              console.log( '**************** dati del getEconomiaAziendale ******************');
      
              strTemp += ' anno di corso ' + esame.annoCorso +', codice '+ esame.adCod +', corso di ' + esame.adDes + ', crediti in  CFU' + esame.peso + ', attività didattica '
              + esame.statoDes +' nel '+  esame.aaFreqId;
              if (typeof esito !=='undefined' && esito.dataEsa!=='' && esito.voto!=null){
              
                //if (typeof esame.esito !=='undefined'){
                  var dt= esame.esito.dataEsa;
                  
                  strTemp +=', superata in data ' + dt.substring(0,10) + ' con voto di ' + esame.esito.voto + ' trentesimi'
                }
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace in getEconomiaAziendale'+ strOutput);
              resolve(agent);

          }).catch((error) => {
            console.log('Si è verificato errore in getEconomiaAziendale: ' +error);
            
          
          });
            break;
            */
          //30/01/2019
          //5188670 getAnnoEconomia Aziendale
          case 'getAnnoEconomiaAziendale':
          controller.GetDettaglioEsame('291783','5188670', 'annoCorso').then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del ANNO getAnnoEconomia= ' + esame.annoCorso);
    
            strTemp +=  esame.annoCorso; 
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getAnnoEconomia'+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getAnnoEconomia: ' +error);
          
        
        });
          break;
          //getTipoEsameEconomiaAziendale
          case 'getTipoEsameEconomiaAziendale':
          controller.GetDettaglioEsame('291783','5188670', 'tipoEsaDes').then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del TIPO getTipoEsameEconomiaAziendale ' +esame.tipoEsaDes);
    
            strTemp +=  esame.tipoEsaDes; 
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getTipoEsameEconomiaAziendale'+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getTipoEsameEconomiaAziendale: ' +error);
          
        
        });
          break;
          //peso
          case 'getCreditoFormativoEconomiaAziendale':
          controller.GetDettaglioEsame('291783','5188670', 'peso').then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del peso getCreditoFormativoEconomiaAziendale' +esame.peso);
    
            strTemp +=  esame.peso; 
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getCreditoFormativoEconomiaAziendale'+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getCreditoFormativoEconomiaAziendale: ' +error);
          
        
        });
          break;
          //getAnnoFrequentatoEconomiaAziendale
          case 'getAnnoFrequentatoEconomiaAziendale':
          controller.GetDettaglioEsame('291783','5188670', 'aaFreqId').then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del ANNO DI FREQUENZA getAnnoFrequentatoEconomiaAziendale' +esame.aaFreqId);
    
            strTemp +=  esame.aaFreqId; 
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getAnnoFrequentatoEconomiaAziendale'+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getAnnoFrequentatoEconomiaAziendale: ' +error);
          
        
        });
          break;
          //getDataEsameFattoEconomiaAziendale
          case 'getDataEsameFattoEconomiaAziendale':
          controller.GetDettaglioEsame('291783','5188670', 'esito.dataEsa').then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del esito.dataEsa getDataEsameFattoEconomiaAziendale' +esame.esito.dataEsa);
    
            strTemp +=  esame.esito.dataEsa; 
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getDataEsameFattoEconomiaAziendale'+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getDataEsameFattoEconomiaAziendale: ' +error);
          
        
        });
          break;
          //getVotoEconomiaAziendale
          case 'getVotoEconomiaAziendale':
          controller.GetDettaglioEsame('291783','5188670', 'esito.voto').then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del esito.dataEsa getVotoEconomiaAziendale ' +esame.esito.voto);
    
            strTemp +=  esame.esito.voto; 
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getVotoEconomiaAziendale '+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getVotoEconomiaAziendale: ' +error);
          
        
        });
          break;
          //getDocenteEconomiaAziendale
          case 'getDocenteEconomiaAziendale':
          controller.GetDocente('291783','5188670').then((esame) => { 
            var strTemp=''; 
            console.log( '**************** dati del DOCENTE getDocenteEconomiaAziendale ');
    
            strTemp +=  esame; //ritorna una stringa con cognome e nome del docente
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace in getDocenteEconomiaAziendale '+ strOutput);
            resolve(agent);

        }).catch((error) => {
          console.log('Si è verificato errore in getDocenteEconomiaAziendale: ' +error);
          
        
        });
        break;
        //TIPOCORSO  getTipoCorsoEconomiaAziendale
        case 'getTipoCorsoEconomiaAziendale':
        controller.getSegmento('291783','5188670').then((esame) => { 
          var strTemp=''; 
          console.log( '**************** dati del TIPO CORSO getTipoCorsoEconomiaAziendale ');
  
          strTemp += esame; //ritorna una stringa con LEZ
          var str=strOutput;
          str=str.replace(/(@)/gi, strTemp);
          strOutput=str;
          agent.add(strOutput);
          console.log('strOutput con replace in getTipoCorsoEconomiaAziendale '+ strOutput);
          resolve(agent);

      }).catch((error) => {
        console.log('Si è verificato errore in getTipoCorsoEconomiaAziendale: ' +error);
        
      
      });
      break;
      //30/01/2019
      //getEsamiUltimoAnno ---> QUANTI ESAMI HO FATTO!!!
      case 'getEsamiUltimoAnno':
      controller.getEsamiUltimoAnno('291783',2018).then((libretto) => { 
        console.log('sono in getEsamiUltimoAnno')
        var strTemp='0'; 
        
        if (Array.isArray(libretto)){
          /*   
          for(var i=0; i<libretto.length; i++){
            
            strTemp+=  libretto[i].adDes+ ', frequentato  nell \'anno ' +libretto[i].aaFreqId +', anno di corso ' +
            libretto[i].annoCorso + '\n';

          }*/
          strTemp+=libretto.length;
          console.log('quanti esami ho fatto ='+ strTemp);
          
        } else {
            //caso in cui no ci sono esami
          strTemp="0"
        }
        //qui devo fare replace della @, che si trova in tmp[0]
        

        var str=strOutput;
        str=str.replace(/(@)/gi, strTemp);
        strOutput=str;
        agent.add(strOutput);
        
        console.log('strOutput con replace '+ strOutput);
        
        //agent.setContext({ name: 'libretto', lifespan: 5, parameters: { matID: studente.trattiCarriera[0].matId }});
        resolve(agent);
      }).catch((error) => {
        console.log('Si è verificato errore : ' +error);
        //resolve('si è verificato errore '+error);
      
      });
        break;
        //getCreditiUltimoAnno-> dal 2017 al 2018 19/03/2019
        case 'getCreditiUltimoAnno':
        controller.getEsamiUltimoAnno('291783',2017).then((libretto) => { 
          console.log('sono in getCreditiUltimoAnno')
          var strTemp='0'; 
          var conteggioCFU=0;
          if (Array.isArray(libretto)){
              
            for(var i=0; i<libretto.length; i++){
              conteggioCFU+=libretto[i].peso;
              

            }
            console.log('conteggio di CFU per anno '+conteggioCFU);
            strTemp+=conteggioCFU;
            console.log(' ho totalizzato cfu ='+ strTemp);
            
          }
          //qui devo fare replace della @, che si trova in tmp[0]
          var str=strOutput;
          str=str.replace(/(@)/gi, strTemp);
          strOutput=str;
          agent.add(strOutput);
          
          console.log('strOutput con replace '+ strOutput);
          
          //agent.setContext({ name: 'libretto', lifespan: 5, parameters: { matID: studente.trattiCarriera[0].matId }});
          resolve(agent);
        }).catch((error) => {
          console.log('Si è verificato errore : ' +error);
          
        
        });
          break;
          //MEDIA ARITMETICA
          case 'getMediaComplessiva':
          controller.getMediaComplessiva('291783').then((media) => { 
            console.log('sono in getMediaComplessiva');
              strTemp=''; 
            
            
              strTemp+=media; 
                
              console.log('la media '+ strTemp);
              
                var str=strOutput;
                str=str.replace(/(@)/gi, strTemp);
                strOutput=str;
                agent.add(strOutput);
                
                console.log('strOutput con replace '+ strOutput);
                
                //agent.setContext({ name: 'libretto', lifespan: 5, parameters: { matID: studente.trattiCarriera[0].matId }});
                resolve(agent);
            }).catch((error) => {
              console.log('Si è verificato errore : ' +error);
              
          
            });

          break;
          //28/01/2019 AGGIUNTO ANCHE LO STOP
          case 'STOP':
          if (agent.requestSource=="ACTIONS_ON_GOOGLE"){
                  
          

            let conv = agent.conv();
  
            console.log(' ---- la conversazione PRIMA ----- ' + JSON.stringify(conv));
            
            conv.close(strOutput);
            console.log(' ---- la conversazione DOPO CHIUSURA ----- ' + JSON.stringify(conv));
            
            agent.add(conv);
            //altrimenti ritorna la strOutput
          } else{
            agent.add(strOutput);
          }
          resolve(agent);
          break;
        default:
          console.log('nel default ho solo strOutput :' +responseFromPlq.strOutput);
          // agent.add(comandi.toString()); 28/01/2019
          agent.add(responseFromPlq.strOutput);
          resolve(agent);
          break;
      } //fine switch
        
      /* agent.add('il comando è '+ tmp[0]);
       resolve(agent);*/
        
       }).catch((error) => {
      
         console.log('errore '+ error);
       
      });  
  // });
  
} 

app.listen(process.env.PORT || 3000, function() {
    console.log("App started on port " + process.env.PORT );
  });


    //11/01/2019 -> modificata il 28/01/2019
    function getUni(agent) { 
        return new Promise((resolve, reject) => {
      
    //31/01/2019 sposto qua, se no diventano globali dell'applicazione
      var responseFromPlq={
        'strOutput':'',
        'cmd':[]
      };
        console.log('dentro getUni con options path '+ options.path + ', hostname ' + options.hostname);
       
      
        let data = '';
        let strOutput='';
        
        //options.path+=strRicerca+'&user=&pwd=&?ava='+bot;

        
        const req = https.request(options, (res) => {
          //console.log("DENTRO CALL AVA " + sess);  
          console.log('________valore di options.cookie INIZIO ' + options.headers.Cookie);
          console.log(`STATUS DELLA RISPOSTA: ${res.statusCode}`);
          console.log(`HEADERS DELLA RISPOSTA: ${JSON.stringify(res.headers)}`);
          console.log('..............RES HEADER ' + res.headers["set-cookie"] );
        
          if (res.headers["set-cookie"]){
       
            var x = res.headers["set-cookie"].toString();
            var arr=x.split(';')
            var y=arr[0].split('=');
           
          
          
           //scriviSessione(__dirname+'/sessions/',sessionId, y[1]);
          }
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
           console.log(`BODY: ${chunk}`);
           data += chunk;
           //spostato qua
           let comandi=[];
           let c=JSON.parse(data);
                  strOutput=c.output[0].output;
                //28/01/2019
                 // strOutput=strOutput.replace(/(<\/p>|<p>|<b>|<\/b>|<br>|<\/br>|<strong>|<\/strong>|<div>|<\/div>|<ul>|<li>|<\/ul>|<\/li>|&nbsp;|)/gi, '');
                  responseFromPlq.strOutput=strOutput.replace(/(<\/p>|<p>|<b>|<\/b>|<br>|<\/br>|<strong>|<\/strong>|<div>|<\/div>|<ul>|<li>|<\/ul>|<\/li>|&nbsp;|)/gi, '');
                  //resolve(strOutput); <--- OLD
                  //18/12/2018  02/01/2019
                  
                  comandi=getComandi(c.output[0].commands);
                 if (typeof comandi!=='undefined' && comandi.length>=1) {
                    console.log('ho almeno un comando, quindi prosegui con l\' azione ' + comandi[0]);
                   // 28/01/2019 commento questo sotto
                  // comandi.push(strOutput); //+ ',' + comandi.toString()

                  //responseFromPlq.cmd.push(comandi);
                  responseFromPlq.cmd=comandi;
                  console.log(' responseFromPlq.cmd=comandi ->'+ responseFromPlq.cmd);

                   console.log('ora in getUni i comandi sono '+ comandi);
                   //in origine 28/01/2019
                 //  resolve(comandi.toString());
                 resolve(responseFromPlq);
                 } else{
                   
                 // strOutput=c.output[0].output;
                 // comandi=['NO'];
                 /* comandi=strOutput;
                  console.log('qui ho solo la strOutput ' + comandi);*/
                 // responseFromPlq.strOutput=strOutput;
                  responseFromPlq.strOutput=strOutput.replace(/(<\/p>|<p>|<b>|<\/b>|<br>|<\/br>|<strong>|<\/strong>|<div>|<\/div>|<ul>|<li>|<\/ul>|<\/li>|&nbsp;|)/gi, '');
                 //31/01/2019 AGGIUNTO QUESTO PER BUG-> ZZZSTART CHIUDE LA CONVERSAZIONE
                  responseFromPlq.cmd='';
                  console.log('qui ho solo la strOutput ' + responseFromPlq.strOutput);
                 }
               
              
                /**********fino qua gestione comandi 18/12/2018  */   
       
                
               //così funziona, resolve(agent);
               //modifica del 28/01/2019
                //resolve(comandi);
                resolve(responseFromPlq);
                 
               
          });
          res.on('end', () => {
            console.log('No more data in response.');
           
                
                  options.path='/AVA/rest/searchService/search_2?searchText=';
                 
                  console.log('valore di options.path FINE ' +  options.path);
       
          });
        });
         req.on('error', (e) => {
          console.error(`problem with request: ${e.message}`);
          strOutput="si è verificato errore " + e.message;
        
        });
         // write data to request body
         req.write(postData);
        req.end();
        });
      } 