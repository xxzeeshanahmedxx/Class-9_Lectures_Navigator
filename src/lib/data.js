import subjects from '../data/subjects.json';
import mathData from '../data/math.json';
import physicsData from '../data/physics.json';
import chemistryData from '../data/chemistry.json';
import urduData from '../data/urdu.json';
import computerData from '../data/computer.json';
import biologyData from '../data/biology.json';
import englishData from '../data/english.json';

const dataMap = {
  math: mathData, physics: physicsData, chemistry: chemistryData,
  urdu: urduData, computer: computerData, biology: biologyData, english: englishData,
};

export function getData(subjectId) {
  return dataMap[subjectId] || { chapters: [] };
}

export function getSubject(subjectId) {
  return subjects.find(s => s.id === subjectId);
}

export { subjects };
