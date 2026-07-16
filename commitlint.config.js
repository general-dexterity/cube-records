export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [2, "always", 72],
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 50],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "ci",
        "perf",
        "revert",
      ],
    ],
  },
};
