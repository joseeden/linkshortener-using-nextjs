---
name: security-review
agent: agent
---

Perform a security audit of this codebase to identify any potential vulnerabilities or security issues.

Provide recommendations for mitigating any identified risks. Focus on areas such as authentication, data handling, sensitive data exposure, and any new or updated dependencies introduced in the recent changes.

**Your review must:**

- Evaluate the context of the code and determine if built-in framework or library protections are sufficient to mitigate any identified risks. If so, note this in the report rather than listing it as a finding.
- Avoid reporting theoretical vulnerabilities that cannot be exploited due to the code’s structure or usage patterns.
- Only review files that are part of the codebase and not ignored by `.gitignore`.
- Check for hardcoded secrets, credentials, or API keys in all non-ignored files.
- Review `package.json` and lock files for newly introduced or outdated dependencies with known vulnerabilities.
- Review usage of third-party APIs/services for secure integration (e.g., API key management, HTTPS enforcement).
- Do not include generic or theoretical vulnerabilities unless there is evidence in the codebase that they are exploitable.

If there are no security concerns, please confirm that the changes appear to be secure based on your analysis.

The findings of this security review must be printed as a markdown formatted report that includes the following columns:

- `ID`: A unique identifier for each finding.
- `Description`: A brief description of the security issue.
- `Location`: The file path and line number where the issue was found.
- `Severity`: The severity level of the issue (Low, Medium, High).
- `Recommendation`: A clear recommendation for how to fix the issue.

**Additional:**

- The `ID` should be a sequential number starting from 1 for each finding.
- The `file path` should be the actual link to the file in the repository.
- The `file path` should be the absolute path from the root of the repository, and the line number should be included in the link if possible (e.g., `src/auth.js#L45`).
- The `line number` should indicate where the issue is located in the code.
- Sort the findings by `severity`, with High severity issues listed first.

**Examples of files to review:**

- Configuration files (e.g., `config.js`, `package.json`, lock files) if not ignored.
- Source code files containing authentication, data handling, or external service logic.
- Any file containing secrets, credentials, or sensitive information if not ignored.

**Note:** If a file (such as `.env`) is ignored by `.gitignore`, it will not be included in the analysis and must be reviewed manually for security concerns.

**Output:**

After completing the audit, save the full markdown report to a file named `security-report.md` in the root of the project directory. The file must contain:

1. A header with the report title and the date the review was performed.
2. A summary section briefly describing the scope of the review.
3. The findings table with all columns listed above.
4. A conclusion section stating the overall security posture of the codebase.

Use the `create_file` or equivalent tool to write the report to `security-report.md` at the project root.
