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

        // res.forEach( function(obj) {
          for (var i = 0; i < res.results.length; i++) {
              var elem = document.createElement("img");
              elem.setAttribute("src", res.results[i]);
          // console.log(res[i]);
            // var img = new Image();
            // img.src = obj;
            // img.setAttribute("class", "banner-img");
            // img.setAttribute("alt", "effy");

            document.getElementById("images").appendChild(elem)
            // document.getElementById("img-container").appendChild(img);
            // document.getElementById("images").style.display = "block";

          };
            document.getElementById("images").innerHTML+='</div>'

  // var newDiv = document.getElementById("images");
  // if(typeof(newDiv) != 'undefined' && newDiv != null){
  // while (newDiv.firstChild) {
  //   newDiv.removeChild(newDiv.firstChild);
  // }
  // }
  
  // // console.log(res);
  // if (res.length == 0) {
  //   var newContent = document.createTextNode("No image to display");
  //   newDiv.appendChild(newContent);
  // }
  // else {
  //   for (var i = 0; i < res.length; i++) {
  //     console.log(res[i]);
  //     var newDiv = document.getElementById("images");
  //     //newDiv.style.display = 'inline'
  //     var newimg = document.createElement("img");
  //     var classname = randomChoice(['big', 'vertical', 'horizontal', '']);
  //     if(classname){newimg.classList.add();}
  //     newimg.src = res[i];
  //     newDiv.appendChild(newimg);

  //     //var currentDiv = document.getElementById("div1");
  //     //document.body.insertBefore(newDiv, currentDiv);
  //   }
  // }
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


const realFileBtn = document.getElementById("realfile");
console.log(realFileBtn);

function upload() {
  realFileBtn.click(); 
}


function sendCustomLabel() {
  var customLabel = document.getElementById("customlabels").value;

  //var apigClient = apigClientFactory.newClient({ apiKey: "7vycwThvmz5jNVVOdmV8M4pYKg9VDtqO6Fz2AGHA" });

  var additionalParams = {
    queryParams: {
      q: searchTerm
    }
  };
  console.log(searchTerm);
  apigClient.searchGet(params, body, additionalParams)
    .then(function (result) {
      console.log('success OK');
      showImages(result.data);
    }).catch(function (result) {
      console.log("Success not OK");
    });
}



function previewFile(input) {
  var reader = new FileReader();
  name = input.files[0].name;
  files = input.files[0]
  console.log(name);
  fileExt = name.split(".").pop();
  var onlyname = name.replace(/\.[^/.]+$/, "");
  var finalName = onlyname + "_" + Date.now() + "." + fileExt;
  name = name;

  reader.onload = function (e) {
    var src = e.target.result;
    console.log(e)
    var newImage = document.createElement("img");
    newImage.src = src;
    encoded = newImage.outerHTML;
    console.log(files.type);
    label = document.getElementById("customlabels").value;
    console.log(label)
    last_index_quote = encoded.lastIndexOf('"');
    if (fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'png') {
      encodedStr = encoded.substring(33, last_index_quote);
    }
    else {
      encodedStr = encoded.substring(32, last_index_quote);
    }
    var apigClient = apigClientFactory.newClient();

    var params = {
        "Content-Type": "text/plain",
        "photo-key": name,
        "photo-bucket": "photo-bucket-b2",
        "x-amz-meta-customLabels": label,

    };
    var additionalParams = {
      headers: {
        "Content-Type": "text/plain",
      }
    };
    console.log(encodedStr);
    apigClient.uploadPut(params, encodedStr, additionalParams)
      .then(function (result) {
        console.log('success OK');
      }).catch(function (result) {
        console.log(result);
      });
  }
  reader.readAsDataURL(input.files[0]);
}


function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // reader.onload = () => resolve(reader.result)
    reader.onload = () => {
      let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  });
}



function uploadPhoto()
{
   // var file_data = $("#file_path").prop("files")[0];
   var file = document.getElementById('file_path').files[0];
   const reader = new FileReader();

   var file_data;
   // var file = document.querySelector('#file_path > input[type="file"]').files[0];
   var encoded_image = getBase64(file).then(
     data => {
     console.log(data)
     var apigClient = apigClientFactory.newClient();

     // var data = document.getElementById('file_path').value;
     // var x = data.split("\\")
     // var filename = x[x.length-1]
     var file_type = file.type + ";base64"

     var body = data;
     var params = { "Content-Type" : file.type, "photo-key" : file.name, "photo-bucket" : "photo-bucket-b2", "x-amz-meta-customLabels": "japan",
};
     var additionalParams = {};
     apigClient.uploadPut(params, body , additionalParams).then(function(res){
       if (res.status == 200)
       {
         document.getElementById("images").innerHTML = "Image Uploaded  !!!"
         document.getElementById("images").style.display = "block";
       }
     })
   });

}