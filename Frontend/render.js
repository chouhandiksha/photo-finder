var name = '';
var encoded = null;
var fileExt = null;
var SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();
const icon = document.querySelector('i.fa.fa-microphone');


function searchFromVoice() {
  recognition.start();

  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    console.log(speechToText);

    document.getElementById("searchbar").value = speechToText;
    search();
  }
}



function search() {
  var searchTerm = document.getElementById("searchbar").value;
  var apigClient = apigClientFactory.newClient();

  var params = {
    "search-labels": searchTerm,
  };
  var body = {
    "search-labels": searchTerm
  };

  var additionalParams = {
    queryParams: {
      "search-labels": searchTerm
    },
      headers:{"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"*", "Access-Control-Allow-Methods":"*"}
  };
  apigClient.searchGet(params, body, additionalParams)
    .then(function (result) {
      console.log('success OK');
      showImages(searchTerm, result.data);
    }).catch(function (result) {
      console.log("Success not OK");
    });
}


function showImages(searchTerm, res) {
        document.getElementById("images").innerHTML=" "

  console.log(res.results);
    if (res.results.length>0){
         var tag = document.createElement("h1");
      document.getElementById("images").innerHTML+='<center><h2><font color=Blue>Here are your Photos From Gallery<font></h2></center><div>'
     }
     else{
          document.getElementById("images").innerHTML+='<center><h2><font color=Blue>No Photos Found for the choice. Please upload one!<font></h2></center><div>'

     }

        
          for (var i = 0; i < res.results.length; i++) {
              var elem = document.createElement("img");
              elem.setAttribute("src", res.results[i]);
          

            document.getElementById("images").appendChild(elem)
          

          };
            document.getElementById("images").innerHTML+='</div>'


}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


const realFileBtn = document.getElementById("realfile");
console.log(realFileBtn);

