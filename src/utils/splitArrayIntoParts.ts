export function splitArrayIntoParts<T>(array: T[], n: number): T[][] {
  const arrayLength = array.length;
  const partSize = Math.ceil(arrayLength / n);
  const result: T[][] = [];
  let initialValue: T;

  for (let i = 0; i < arrayLength; i += partSize) {
    const part: T[] = array.slice(i, i + partSize);
    const row: T[] = Array(n).fill(initialValue);
    row.splice(0, part.length, ...part);
    result.push(row);
  }

  return result;
}
