window.onload = function () {
    "use strict";

    var volumeTextElement = document.querySelector('.volume-text');
    var webcamVideoElement = document.querySelector(".webcamVideo");
    var webcamVideoStatsElement = document.querySelector(".webcamVideoStats");

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContent;
    const volumeMeterCanvas = document.querySelector('.volumeMeterCanvas');
    const volumeMeterCanvasContext = volumeMeterCanvas.getContext('2d');

    var drawVolumeMeter = (db) => {
      volumeMeterCanvasContext.clearRect(0, 0, volumeMeterCanvas.width, volumeMeterCanvas.height);
      volumeMeterCanvasContext.fillStyle = 'green';

      for(let i = 0; i <= db; i = i + 15) {
        let step = i/15;
        let y = volumeMeterCanvas.height - (step * 14);
        if(step == 14) {
          volumeMeterCanvasContext.fillStyle = 'orange';
        } else if(step == 16) {
          volumeMeterCanvasContext.fillStyle = 'red';
        }
        volumeMeterCanvasContext.fillRect(0, y, 25, 12);
      }
    }

    var setupWebcamMonitor = function (stream) {
      console.log('webcam setup', stream)
      var audioTrack = stream.getAudioTracks();
      var videoTrackSettings = stream.getVideoTracks()[0].getSettings();
      stream.removeTrack(audioTrack[0]);

      window.stream = stream;

      webcamVideoElement.srcObject = stream;
      webcamVideoStatsElement.innerText = `${videoTrackSettings.width}x${videoTrackSettings.height}@${videoTrackSettings.frameRate}`
    }
    
    var setupVolumeMeter = function (stream) {
        var audioStream = audioContent.createMediaStreamSource( stream );
        var analyser = audioContent.createAnalyser();
        analyser.smoothingTimeConstant = 0.90;
        analyser.fftSize = 32;
        audioStream.connect(analyser);

        var bufferLength = analyser.frequencyBinCount;
        var frequencyArray = new Uint8Array(bufferLength);

        var showVolume = function () {
            window.requestAnimationFrame(showVolume);

              analyser.getByteFrequencyData(frequencyArray);
              var db = 0;
              for(var i = 0; i < bufferLength; i++) {
                  var x = frequencyArray[i];
                  if(x > db) { db = x; }
              }

              

              volumeTextElement.innerText = `${Math.floor(db / 10) * 10} dB`;
              drawVolumeMeter(db);
  
        }
        showVolume();
    }

    document.querySelector('.start').onclick = function (event) {
      navigator.mediaDevices.getUserMedia({audio:true, video: { width: { ideal: 1920 }, height: { ideal: 1080 } }}).then(function(stream) {
          setupVolumeMeter(stream);
          setupWebcamMonitor(stream);
      });

      event.target.style.display = 'none';
      audioContent = new AudioContext();
    }
};