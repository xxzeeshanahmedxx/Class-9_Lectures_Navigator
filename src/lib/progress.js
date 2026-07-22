const RECENT_KEY = 'c9-recent';
const VIEWED_PREFIX = 'c9-v-';

function viewedKey(subjectId, chapterId) {
  return VIEWED_PREFIX + subjectId + '-' + chapterId;
}

export function markViewed(subjectId, chapterId, videoId, title) {
  const key = viewedKey(subjectId, chapterId);
  const set = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  set.add(videoId);
  localStorage.setItem(key, JSON.stringify([...set]));

  const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  const entry = { subject: subjectId, chapterId, videoId, title, timestamp: Date.now() };
  const filtered = recent.filter(r => !(r.subject === subjectId && r.chapterId === chapterId && r.videoId === videoId));
  filtered.unshift(entry);
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 10)));
}

export function isViewed(subjectId, chapterId, videoId) {
  const key = viewedKey(subjectId, chapterId);
  const set = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  return set.has(videoId);
}

export function getRecent(max = 5) {
  return (JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')).slice(0, max);
}

export function getViewedChapterCount(subjectId, chapterId) {
  const key = viewedKey(subjectId, chapterId);
  const set = JSON.parse(localStorage.getItem(key) || '[]');
  return set.length;
}
