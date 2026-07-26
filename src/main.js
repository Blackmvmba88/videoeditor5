const video = document.querySelector('#video');
const fileInput = document.querySelector('#fileInput');
const emptyState = document.querySelector('#emptyState');
const markInButton = document.querySelector('#markIn');
const markOutButton = document.querySelector('#markOut');
const clearMarksButton = document.querySelector('#clearMarks');
const inValue = document.querySelector('#inValue');
const outValue = document.querySelector('#outValue');
const durationValue = document.querySelector('#durationValue');
const timeValue = document.querySelector('#timeValue');
const scrubber = document.querySelector('#scrubber');
const playhead = document.querySelector('#playhead');
const selection = document.querySelector('#selection');

let sourceUrl = null;
let inPoint = null;
let outPoint = null;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00.000';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function currentRatio() {
  return video.duration ? video.currentTime / video.duration : 0;
}

function render() {
  const ratio = currentRatio();
  playhead.style.left = `${ratio * 100}%`;
  scrubber.value = String(Math.round(ratio * 1000));
  timeValue.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

  inValue.textContent = inPoint === null ? '—' : formatTime(inPoint);
  outValue.textContent = outPoint === null ? '—' : formatTime(outPoint);

  const validSelection = inPoint !== null && outPoint !== null && outPoint >= inPoint;
  durationValue.textContent = validSelection ? formatTime(outPoint - inPoint) : '—';

  const start = video.duration && inPoint !== null ? (inPoint / video.duration) * 100 : 0;
  const end = video.duration && outPoint !== null ? (outPoint / video.duration) * 100 : start;
  selection.style.left = `${start}%`;
  selection.style.width = `${Math.max(0, end - start)}%`;
}

function loadFile(file) {
  if (!file) return;
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  sourceUrl = URL.createObjectURL(file);
  video.src = sourceUrl;
  emptyState.hidden = true;
  inPoint = null;
  outPoint = null;
  render();
}

function markIn() {
  if (!video.src) return;
  inPoint = video.currentTime;
  if (outPoint !== null && outPoint < inPoint) outPoint = null;
  render();
}

function markOut() {
  if (!video.src) return;
  outPoint = video.currentTime;
  if (inPoint !== null && outPoint < inPoint) inPoint = null;
  render();
}

fileInput.addEventListener('change', (event) => loadFile(event.target.files?.[0]));
markInButton.addEventListener('click', markIn);
markOutButton.addEventListener('click', markOut);
clearMarksButton.addEventListener('click', () => {
  inPoint = null;
  outPoint = null;
  render();
});

video.addEventListener('loadedmetadata', render);
video.addEventListener('timeupdate', render);
video.addEventListener('seeked', render);

scrubber.addEventListener('input', () => {
  if (!video.duration) return;
  video.currentTime = (Number(scrubber.value) / 1000) * video.duration;
});

document.addEventListener('keydown', (event) => {
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' && document.activeElement !== scrubber) return;

  if (event.code === 'Space') {
    event.preventDefault();
    if (!video.src) return;
    video.paused ? video.play() : video.pause();
  }

  if (event.key.toLowerCase() === 'i') markIn();
  if (event.key.toLowerCase() === 'o') markOut();
});

render();
