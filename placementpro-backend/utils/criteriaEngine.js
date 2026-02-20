const filterStudents = (students, criteria) => {
  return students.filter((s) => {
    const cgpaOk = s.cgpa >= criteria.minCGPA;
    const backlogsOk = s.backlogs <= criteria.maxBacklogs;
    const branchOk =
      criteria.eligibleBranches.length === 0 ||
      criteria.eligibleBranches.includes(s.branch);
    return cgpaOk && backlogsOk && branchOk;
  });
};

const checkStudentEligibility = (student, drive) => {
  const reasons = [];
  let eligible = true;

  if (student.cgpa < drive.minCGPA) {
    eligible = false;
    reasons.push(`CGPA ${student.cgpa} is below required ${drive.minCGPA}`);
  }
  if (student.backlogs > drive.maxBacklogs) {
    eligible = false;
    reasons.push(`Backlogs ${student.backlogs} exceed allowed ${drive.maxBacklogs}`);
  }
  if (drive.eligibleBranches.length > 0 && !drive.eligibleBranches.includes(student.branch)) {
    eligible = false;
    reasons.push(`Branch ${student.branch} not eligible for this drive`);
  }

  return { eligible, reasons };
};

const rankStudents = (students) => {
  return students.sort((a, b) => {
    if (b.cgpa !== a.cgpa) return b.cgpa - a.cgpa;
    return a.backlogs - b.backlogs;
  });
};

const calculateSkillGap = (studentSkills, requiredSkills) => {
  const normalizedStudent = studentSkills.map((s) => s.toLowerCase().trim());
  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());

  const matched = normalizedRequired.filter((skill) =>
    normalizedStudent.some(
      (s) => s.includes(skill) || skill.includes(s) || levenshteinDistance(s, skill) <= 2
    )
  );
  const missing = normalizedRequired.filter((skill) => !matched.includes(skill));

  return {
    matched,
    missing,
    score: normalizedRequired.length > 0 ? Math.round((matched.length / normalizedRequired.length) * 100) : 0,
  };
};

const levenshteinDistance = (s1, s2) => {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s1[i - 1] === s2[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
};

module.exports = { filterStudents, checkStudentEligibility, rankStudents, calculateSkillGap };
