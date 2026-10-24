// Approved monthly CBSE price bands; all offered subjects are included.
// Do not activate billing until trial entitlements are implemented.
export function tuitionMonthlyFee(grade: number): number {
  if (!Number.isInteger(grade) || grade < 5 || grade > 12) {
    throw new Error('Choose a class from 5 to 12');
  }
  return grade <= 7 ? 200 : grade <= 9 ? 300 : 400;
}
