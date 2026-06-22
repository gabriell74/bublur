const video = document.getElementById('webcam');
const flash = document.getElementById('flash');
const statusText = document.getElementById('status-text');

let peaceSignReleased = true;

const shutterSound = new Audio('assets/shutter.mp3');

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 0,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

function isPeaceSign(landmarks) {
  const indexOpen = landmarks[8].y < landmarks[6].y;
  const middleOpen = landmarks[12].y < landmarks[10].y;
  const ringClosed = landmarks[16].y > landmarks[14].y;
  const pinkyClosed = landmarks[20].y > landmarks[18].y;

  return indexOpen && middleOpen && ringClosed && pinkyClosed;
}

function playShutterSound() {
  shutterSound.currentTime = 0;
  shutterSound.play().catch(error => {
    console.error('Gagal memutar audio shutter:', error);
  });
}

function onResults(results) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    peaceSignReleased = true;
    video.classList.remove('blur');
    statusText.classList.remove('active');
    return;
  }

  let peaceDetected = false;

  for (const landmarks of results.multiHandLandmarks) {
    if (isPeaceSign(landmarks)) {
      peaceDetected = true;
      break;
    }
  }

  if (peaceDetected) {
    video.classList.add('blur');
    statusText.classList.add('active');

    if (peaceSignReleased) {
      peaceSignReleased = false;
      playShutterSound();
      flash.classList.add('active');
      setTimeout(() => {
        flash.classList.remove('active');
      }, 100);
    }
  } else {
    peaceSignReleased = true;
    video.classList.remove('blur');
    statusText.classList.remove('active');
  }
}

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();
