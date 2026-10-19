// Pure maths of Cheryl's birthday: ten possible dates; Albert is told the month, Bernard the day. The three statements filter
// the list: (1) Albert: "I don't know, and I know Bernard doesn't know" keeps the months with several dates and no day that
// appears only once in the whole list; (2) Bernard: "At first I didn't know, now I know" keeps the dates whose day was not
// unique at first and is unique after (1); (3) Albert: "Then I know too" keeps the dates alone in their month after (2).
// No DOM.

// [month, day]; "orig" is the published puzzle (Singapore and Asian Schools Math Olympiad, 2015); the others were generated
// by a search and keep every statement useful (each one removes dates, and (3) is needed).
export const CHERYL_SETS = {
  orig: [[5, 15], [5, 16], [5, 19], [6, 17], [6, 18], [7, 14], [7, 16], [8, 14], [8, 15], [8, 17]],
  b: [[2, 14], [2, 17], [6, 14], [6, 15], [6, 19], [8, 13], [8, 15], [8, 17], [8, 19], [9, 17]],
  c: [[3, 17], [3, 19], [5, 12], [5, 16], [10, 15], [10, 18], [10, 19], [11, 12], [11, 17], [11, 18]],
  d: [[4, 13], [4, 15], [4, 17], [5, 12], [5, 15], [7, 14], [8, 12], [8, 13], [8, 16], [8, 17]],
};
export const MONTHS = [["", ""], ["janvier", "January"], ["février", "February"], ["mars", "March"], ["avril", "April"], ["mai", "May"], ["juin", "June"], ["juillet", "July"], ["août", "August"], ["septembre", "September"], ["octobre", "October"], ["novembre", "November"], ["décembre", "December"]];
export const dateText = ([m, d], lang = 0) => (lang ? `${MONTHS[m][1]} ${d}` : `${d} ${MONTHS[m][0]}`);

const count = (list, i, v) => list.filter((x) => x[i] === v).length;
export function cherylSteps(dates) {
  const s1 = dates.filter(([m]) => count(dates, 0, m) > 1 && dates.filter((x) => x[0] === m).every(([, d]) => count(dates, 1, d) > 1));
  const s2 = s1.filter(([, d]) => count(dates, 1, d) > 1 && count(s1, 1, d) === 1);
  const s3 = s2.filter(([m]) => count(s2, 0, m) === 1);
  return [dates, s1, s2, s3];
}
export const cherylAnswer = (dates) => { const s3 = cherylSteps(dates)[3]; return s3.length === 1 ? s3[0] : null; };
// days that appear only once in the list (the start of the reasoning)
export const uniqueDays = (dates) => [...new Set(dates.map((d) => d[1]))].filter((d) => count(dates, 1, d) === 1);
