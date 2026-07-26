const video = document.querySelector('#video');
const fileInput = document.querySelector('#fileInput');
const emptyState = document.querySelector('#emptyState');
const markInButton = document.querySelector('#markIn');
const markOutButton = document.querySelector('#markOut');
const addSegmentButton = document.querySelector('#addSegment');
const clearMarksButton = document.querySelector('#clearMarks');
const undoButton = document.querySelector('#undo');
const redoButton = document.querySelector('#redo');
const exportPlanButton = document.querySelector('#exportPlan');
const inValue = document.querySelector('#inValue');
const outValue = document.querySelector('#outValue');
const durationValue = document.querySelector('#durationValue');
const timeValue = document.querySelector('#timeValue');
const scrubber = document.querySelector('#scrubber');
const playhead = document.querySelector('#playhead');
const selection = document.querySelector('#selection');
const segmentsLayer = document.querySelector('#segmentsLayer');
const segmentsList = document.querySelector('#segmentsList');
const segmentsEmpty = document.querySelector('#segmentsEmpty');

let sourceUrl = null;
let sourceFile = null;
let inPoint = null;
let outPoint = null;
let segments = [];
let selectedSegmentId = null;
let undoStack = [];
let redoStack = [];

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

function snapshot() {
  return structuredClone({ segments, selectedSegmentId });
}

function pushHistory() {
  undoStack.push(snapshot());
  if (undoStack.length > 100) undoStack.shift();
  redoStack = [];
}

function restore(state) {
  segments = structuredClone(state.segments);
  selectedSegmentId = state.selectedSegmentId;
  render();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
}

function renderSegments() {
  segmentsLayer.replaceChildren();
  segmentsList.replaceChildren();
  segmentsEmpty.hidden = segments.length > 0;

  for (const [index, segment] of segments.entries()) {
    const marker = document.createElement('button');
    marker.className = `segment-marker${segment.id === selectedSegmentId ? ' selected' : ''}`;
    marker.style.left = `${(segment.start / video.duration) * 100}%`;
    marker.style.width = `${((segment.end - segment.start) / video.duration) * 100}%`;
    marker.title = `Segmento ${index + 1}: ${formatTime(segment.start)} → ${formatTime(segment.end)}`;
    marker.addEventListener('click', () => {
      selectedSegmentId = segment.id;
      video.currentTime = segment.start;
      render();
    });
    segmentsLayer.append(marker);

    const row = document.createElement('div');
    row.className = `segment-row${segment.id === selectedSegmentId ? ' selected' : ''}`;
    row.innerHTML = `
      <button class="segment-main" data-id="${segment.id}">
        <strong>#${index + 1}</strong>
        <span>${formatTime(segment.start)} → ${formatTime(segment.end)}</span>
        <span>${formatTime(segment.end - segment.start)}</span>
      </button>
      <button class="danger" data-delete="${segment.id}" aria-label="Eliminar segmento ${index + 1}">×</button>
    `;
    row.querySelector('.segment-main').addEventListener('click', () => {
      selectedSegmentId = segment.id;
      video.currentTime = segment.start;
      render();
    });
    row.querySelector('[data-delete]').addEventListener('click', () => deleteSegment(segment.id));
    segmentsList.append(row);
  }
}

function render() {
  const ratio = currentRatio();
  playhead.style.left = `${ratio * 100}%`;
  scrubber.value = String(Math.round(ratio * 1000));
  timeValue.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

  inValue.textContent = inPoint === null ? '—' : formatTime(inPoint);
  outValue.textContent = outPoint === null ? '—' : formatTime(outPoint);

  const validSelection = inPoint !== null && outPoint !== null && outPoint > inPoint;
  durationValue.textContent = validSelection ? formatTime(outPoint - inPoint) : '—';
  addSegmentButton.disabled = !validSelection;

  const start = video.duration && inPoint !== null ? (inPoint / video.duration) * 100 : 0;
  const end = video.duration && outPoint !== null ? (outPoint / video.duration) * 100 : start;
  selection.style.left = `${start}%`;
  selection.style.width = `${Math.max(0, end - start)}%`;

  undoButton.disabled = undoStack.length === 0;
  redoButton.disabled = redoStack.length === 0;
  exportPlanButton.disabled = segments.length === 0;

  if (video.duration) renderSegments();
}

function loadFile(file) {
  if (!file) return;
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  sourceFile = file;
  sourceUrl = URL.createObjectURL(file);
  video.src = sourceUrl;
  emptyState.hidden = true;
  inPoint = null;
  outPoint = null;
  segments = [];
  selectedSegmentId = null;
  undoStack = [];
  redoStack = [];
  render();
}

function markIn() {
  if (!video.src) return;
  inPoint = video.currentTime;
  if (outPoint !== null && outPoint <= inPoint) outPoint = null;
  render();
}

function markOut() {
  if (!video.src) return;
  outPoint = video.currentTime;
  if (inPoint !== null && outPoint <= inPoint) inPoint = null;
  render();
}

function addSegment() {
  if (inPoint === null || outPoint === null || outPoint <= inPoint) return;
  pushHistory();
  const segment = {
    id: crypto.randomUUID(),
    start: Number(inPoint.toFixed(3)),
    end: Number(outPoint.toFixed(3)),
  };
  segments.push(segment);
  segments.sort((a, b) => a.start - b.start);
  selectedSegmentId = segment.id;
  inPoint = null;
  outPoint = null;
  render();
}

function deleteSegment(id = selectedSegmentId) {
  if (!id) return;
  const index = segments.findIndex((segment) => segment.id === id);
  if (index < 0) return;
  pushHistory();
  segments.splice(index, 1);
  selectedSegmentId = segments[index]?.id ?? segments[index - 1]?.id ?? null;
  render();
}

function exportPlan() {
  if (!sourceFile || !segments.length) return;
  const plan = {
    version: 1,
    source: {
      name: sourceFile.name,
      size: sourceFile.size,
      type: sourceFile.type,
      durationSeconds: Number(video.duration.toFixed(3)),
    },
    segments: segments.map(({ id, ...segment }) => segment),
    totalOutputSeconds: Number(
      segments.reduce((total, segment) => total + segment.end - segment.start, 0).toFixed(3),
    ),
  };

  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${sourceFile.name.replace(/\.[^.]+$/, '')}.bmedit.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

fileInput.addEventListener('change', (event) => loadFile(event.target.files?.[0]));
markInButton.addEventListener('click', markIn);
markOutButton.addEventListener('click', markOut);
addSegmentButton.addEventListener('click', addSegment);
undoButton.addEventListener('click', undo);
redoButton.addEventListener('click', redo);
exportPlanButton.addEventListener('click', exportPlan);
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
    return;
  }

  if (event.key.toLowerCase() === 'i') markIn();
  if (event.key.toLowerCase() === 'o') markOut();

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    addSegment();
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
  }

  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (selectedSegmentId) {
      event.preventDefault();
      deleteSegment();
    }
  }
});

render();
