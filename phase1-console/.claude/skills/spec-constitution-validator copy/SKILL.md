








---
description: Validate specification files against project constitution to ensure compliance before code generation
disable-model-invocation: false
allowed-tools: [Read, Write, Glob, Grep]
---

# Spec Constitution Validator Skill

Validates specification files against the project constitution (`.specify/memory/constitution.md`) to ensure full compliance before code generation begins. Prevents implementation of non-compliant specs and identifies missing critical elements.

## When to Use This Skill

Invoke this skill when:
- User asks to "validate spec" or "check spec against constitution"
- Before running `/sp.plan` on a new specification
- After creating or updating a specification file
- User wants to ensure constitution compliance
- Reviewing a spec for completeness

## Input Format

User will provide:
1. **Spec file path**: Path to the specification file to validate
   - Example: `specs/add-task/spec.md`
   - Or just feature name: "add-task" (will search in specs/)

**Example inputs:**
```
Validate specs/add-task/spec.md
Check add-task spec against constitution
Validate the view tasks specification
```

## Validation Process

### Step 1: Read Constitution
1. Read `.specify/memory/constitution.md`
2. Extract current version number
3. Identify all 7 core principles
4. Note code quality standards
5. Review data model requirements
6. Check development workflow requirements

### Step 2: Read Specification File
1. Locate the spec file (search if only feature name provided)
2. Read complete specification
3. Parse structure and sections

### Step 3: Run Validation Checks

Perform comprehensive validation across these categories:

#### A. Constitution Metadata Check
- [ ] Spec references current constitution version
- [ ] Created date is present and valid format (YYYY-MM-DD)
- [ ] Feature priority assigned (P1/P2/P3)
- [ ] Phase mentioned (Phase I for current project)

#### B. Required Sections Check
- [ ] Feature Title and Metadata section exists
- [ ] User Story section exists
- [ ] Feature Description section exists
- [ ] Technical Requirements section exists
- [ ] Data Flow section exists
- [ ] Acceptance Criteria section exists
- [ ] Edge Cases & Error Handling section exists
- [ ] Example Interaction section exists
- [ ] Implementation Notes section exists

#### C. Principle I: Spec-Driven Development
- [ ] Spec is detailed enough for Claude Code autonomous implementation
- [ ] No ambiguous requirements (all "NEEDS CLARIFICATION" resolved)
- [ ] Clear acceptance criteria for verification
- [ ] Iterative refinement process mentioned

#### D. Principle III: Clean Architecture
- [ ] References correct modules: main.py, cli.py, todo.py, storage.py
- [ ] Module responsibilities clearly defined
- [ ] Separation of concerns maintained
- [ ] No mixing of UI, business logic, and storage concerns

#### E. Principle IV: Type Safety and Documentation
- [ ] Type hints explicitly required
- [ ] Docstrings explicitly required
- [ ] Google-style docstring format specified
- [ ] Type signature examples provided
- [ ] Return type annotations mentioned
- [ ] Parameter type annotations mentioned

#### F. Principle V: Robust Error Handling
- [ ] Input validation requirements listed
- [ ] Error messages are specific (not generic "show error")
- [ ] Error messages are user-friendly (no stack traces)
- [ ] Error messages are actionable (tell user how to fix)
- [ ] Edge cases identified and handled
- [ ] Exception handling strategy specified

#### G. Principle VI: Standard Library Only
- [ ] No external dependencies mentioned
- [ ] Only Python 3.13+ standard library features used
- [ ] No references to external packages (requests, flask, etc.)

#### H. Principle VII: Evolution Readiness
- [ ] Phase II evolution considerations mentioned
- [ ] Abstraction points for future persistence identified
- [ ] Interfaces/protocols considered for future phases
- [ ] Avoids Phase I decisions requiring rewrites

#### I. Code Quality Standards
- [ ] PEP 8 compliance mentioned
- [ ] Function length limit mentioned (25 lines)
- [ ] Module length limit mentioned (300 lines)
- [ ] Descriptive naming required
- [ ] DRY principle referenced
- [ ] Clean code principles applied

#### J. Data Model Compliance
- [ ] Todo fields correctly referenced (id, title, description, completed, created_at)
- [ ] Field types match constitution (id: int, title: str, etc.)
- [ ] Validation rules match constitution (title max 100 chars, etc.)
- [ ] No additional fields without justification

#### K. Acceptance Criteria Quality
- [ ] Criteria are specific and testable
- [ ] Written as checkboxes for verification
- [ ] Cover functional requirements
- [ ] Cover error handling scenarios
- [ ] Cover code quality requirements
- [ ] No vague criteria ("works well", "handles errors")

#### L. Error Message Quality
- [ ] All error scenarios have specific messages
- [ ] Messages follow format: "Error: [problem]. [how to fix]."
- [ ] Examples: "Error: Title cannot be empty. Please provide a task title."
- [ ] No generic messages like "Invalid input" without context

#### M. Implementation Guidance
- [ ] Module implementation order specified
- [ ] Type hint examples provided
- [ ] Key function signatures shown
- [ ] Integration points identified
- [ ] Testing approach mentioned

### Step 4: Generate Validation Report

Output a comprehensive report with the following structure:

```markdown
# Specification Validation Report

**Spec File**: [path]
**Feature**: [feature name]
**Constitution Version**: [version from spec] (Expected: [current constitution version])
**Validation Date**: [YYYY-MM-DD]
**Overall Status**: ✅ PASS | ⚠️ PASS WITH WARNINGS | ❌ FAIL

---

## Summary

- **Total Checks**: [number]
- **Passed**: [number] ✅
- **Warnings**: [number] ⚠️
- **Failed**: [number] ❌
- **Compliance Score**: [percentage]%

---

## Critical Issues (MUST FIX) ❌

[List all failed checks that violate NON-NEGOTIABLE principles]

### Issue 1: [Description]
- **Principle Violated**: [Which constitution principle]
- **Location**: [Section name or line reference]
- **Problem**: [Specific problem]
- **Required Fix**: [Exactly what needs to be added/changed]
- **Example**: [Show correct format]

---

## Warnings (SHOULD FIX) ⚠️

[List all warnings for best practices and recommended improvements]

### Warning 1: [Description]
- **Standard**: [Which code quality standard]
- **Location**: [Section name]
- **Suggestion**: [How to improve]
- **Impact**: [Why this matters]

---

## Passed Checks ✅

[Summary of what passed - grouped by category]

- ✅ Constitution Metadata (4/4 checks)
- ✅ Required Sections (9/9 sections present)
- ✅ Spec-Driven Development compliance
- ✅ Clean Architecture compliance
- [etc.]

---

## Detailed Findings

### Constitution Metadata
- [✅/❌/⚠️] Constitution version referenced: [found/not found]
- [✅/❌/⚠️] Created date present: [date or missing]
- [✅/❌/⚠️] Priority assigned: [P1/P2/P3 or missing]
- [✅/❌/⚠️] Phase mentioned: [Phase I or missing]

### Required Sections
- [✅/❌] Feature Title and Metadata
- [✅/❌] User Story
- [✅/❌] Feature Description
- [✅/❌] Technical Requirements
- [✅/❌] Data Flow
- [✅/❌] Acceptance Criteria
- [✅/❌] Edge Cases & Error Handling
- [✅/❌] Example Interaction
- [✅/❌] Implementation Notes

### Principle I: Spec-Driven Development
- [✅/❌/⚠️] Spec detail sufficient for autonomous implementation
- [✅/❌/⚠️] No ambiguous requirements
- [✅/❌/⚠️] Clear acceptance criteria
- [✅/❌/⚠️] Iterative refinement mentioned

### Principle III: Clean Architecture
- [✅/❌/⚠️] Correct modules referenced (main.py, cli.py, todo.py, storage.py)
- [✅/❌/⚠️] Module responsibilities defined
- [✅/❌/⚠️] Separation of concerns maintained
- [✅/❌/⚠️] No concern mixing

### Principle IV: Type Safety and Documentation
- [✅/❌] Type hints required
- [✅/❌] Docstrings required
- [✅/❌] Google-style format specified
- [✅/❌] Type signature examples provided
- [✅/❌] Return types mentioned
- [✅/❌] Parameter types mentioned

### Principle V: Robust Error Handling
- [✅/❌] Input validation listed
- [✅/❌] Specific error messages (not generic)
- [✅/❌] User-friendly messages (no stack traces)
- [✅/❌] Actionable messages (how to fix)
- [✅/❌] Edge cases identified
- [✅/❌] Exception strategy specified

### Principle VI: Standard Library Only
- [✅/❌] No external dependencies
- [✅/❌] Python 3.13+ standard library only
- [✅/❌] No package references

### Principle VII: Evolution Readiness
- [✅/❌/⚠️] Phase II considerations mentioned
- [✅/❌/⚠️] Abstraction points identified
- [✅/❌/⚠️] Interfaces/protocols considered
- [✅/❌/⚠️] Avoids rewrite-requiring decisions

### Code Quality Standards
- [✅/❌] PEP 8 mentioned
- [✅/❌] Function length limit (25 lines)
- [✅/❌] Module length limit (300 lines)
- [✅/❌] Descriptive naming
- [✅/❌] DRY principle
- [✅/❌] Clean code principles

### Data Model Compliance
- [✅/❌] Correct Todo fields (id, title, description, completed, created_at)
- [✅/❌] Correct field types
- [✅/❌] Correct validation rules (title max 100 chars)
- [✅/❌] No unjustified additional fields

### Acceptance Criteria Quality
- [✅/❌] Specific and testable
- [✅/❌] Written as checkboxes
- [✅/❌] Cover functional requirements
- [✅/❌] Cover error handling
- [✅/❌] Cover code quality
- [✅/❌] No vague criteria

### Error Message Quality
- [✅/❌] Specific error scenarios
- [✅/❌] Follow format: "Error: [problem]. [fix]."
- [✅/❌] Example messages provided
- [✅/❌] No generic messages

### Implementation Guidance
- [✅/❌] Module order specified
- [✅/❌] Type hint examples provided
- [✅/❌] Function signatures shown
- [✅/❌] Integration points identified
- [✅/❌] Testing approach mentioned

---

## Recommendations

1. [Most important improvement]
2. [Second priority]
3. [Third priority]

---

## Next Steps

[Choose based on validation result:]

### If PASS ✅
Your specification is constitution-compliant and ready for implementation!

**Recommended workflow:**
1. Run `/sp.plan` to generate implementation plan
2. Review plan against constitution
3. Run `/sp.tasks` to create task breakdown
4. Begin implementation with Claude Code

### If PASS WITH WARNINGS ⚠️
Your specification meets minimum requirements but has [N] improvement opportunities.

**Recommended actions:**
1. Review warnings above and consider addressing them
2. Update spec if needed
3. Re-run validation: `/spec-constitution-validator [spec-file]`
4. Proceed with `/sp.plan` when satisfied

### If FAIL ❌
Your specification violates [N] NON-NEGOTIABLE constitution principles.

**Required actions:**
1. Fix all critical issues listed above
2. Update specification file
3. Re-run validation: `/spec-constitution-validator [spec-file]`
4. Do NOT proceed to `/sp.plan` until validation passes

---

## Constitution Reference

**Version**: [constitution version]
**Location**: `.specify/memory/constitution.md`
**Last Amended**: [date from constitution]

[List violated or relevant principles with brief quotes]
```

## Output Format

Always structure the report in this order:
1. **Header** - File, feature, status
2. **Summary** - Counts and compliance score
3. **Critical Issues** - MUST FIX (if any)
4. **Warnings** - SHOULD FIX (if any)
5. **Passed Checks** - What worked
6. **Detailed Findings** - All checks by category
7. **Recommendations** - Top 3 improvements
8. **Next Steps** - Based on pass/warning/fail status
9. **Constitution Reference** - Version and relevant principles

## Compliance Score Calculation

```
Compliance Score = (Passed Checks / Total Checks) × 100%

Status Assignment:
- ✅ PASS: 100% compliance, no critical issues
- ⚠️ PASS WITH WARNINGS: 85-99% compliance, no critical issues
- ❌ FAIL: <85% compliance OR any critical issue present
```

## Critical vs Warning Classification

**Critical Issues (MUST FIX):**
- Violates NON-NEGOTIABLE principles (Spec-Driven Development)
- Missing required sections
- External dependencies in Phase I
- No error handling requirements
- No type hints/docstrings required
- Ambiguous requirements preventing implementation
- Wrong module architecture
- Missing acceptance criteria

**Warnings (SHOULD FIX):**
- Missing evolution considerations
- Vague acceptance criteria (but present)
- Missing function/module length limits (but clean code mentioned)
- No specific implementation order
- Could be more detailed in error messages

## Special Checks

### Check for "NEEDS CLARIFICATION" Markers
- Scan spec for any `[NEEDS CLARIFICATION: ...]` markers
- If found: Critical issue - spec not ready for implementation

### Check for Constitution Version Mismatch
- Compare spec's referenced version vs current constitution version
- If mismatch: Warning - suggest updating spec to reference current version

### Check for Vague Language
- Flag terms like: "should work well", "handle appropriately", "etc.", "and so on"
- Suggest specific replacements

### Check Error Message Examples
- Ensure error messages in spec are complete sentences
- Verify they include both problem and solution
- Confirm they're user-friendly (not technical jargon)

## Example Workflow

**User Input:**
```
Validate specs/add-task/spec.md
```

**Your Process:**
1. Read `.specify/memory/constitution.md` (v1.0.0)
2. Read `specs/add-task/spec.md`
3. Run all validation checks (categories A-M)
4. Calculate compliance score
5. Determine status (PASS/WARNING/FAIL)
6. Generate detailed report
7. Provide specific next steps

**Output:**
Complete validation report with specific issues, suggestions, and actionable next steps.

## Error Handling

If spec file not found:
```
❌ Error: Specification file not found

Searched locations:
- specs/add-task/spec.md
- specs/add-task/
- ./add-task/spec.md

Please provide a valid spec file path or ensure the spec exists.
Example: specs/add-task/spec.md
```

If constitution not found:
```
❌ Error: Constitution file not found at .specify/memory/constitution.md

Cannot validate spec without constitution reference.
Please ensure constitution exists or run /sp.constitution first.
```

## Quality Assurance

Before outputting report, verify:
- [ ] All 13 validation categories checked (A-M)
- [ ] Compliance score calculated correctly
- [ ] Status matches score and critical issues
- [ ] Critical issues have specific fixes
- [ ] Warnings have suggestions
- [ ] Next steps are actionable
- [ ] Report is well-formatted and readable

## Notes

- Be strict on NON-NEGOTIABLE principles (Spec-Driven Development)
- Be helpful with warnings (suggest improvements, don't just criticize)
- Provide specific examples of correct formats
- Reference exact constitution sections
- Calculate compliance score accurately
- Always give actionable next steps
- Make reports scannable (use headers, bullets, checkboxes)
- Flag vague language and suggest specifics
