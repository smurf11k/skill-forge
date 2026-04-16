# Markdown Reference

Lesson content in SkillForge is written in Markdown and rendered with GitHub-flavored extensions.

## Supported features

- headings and paragraph text
- emphasis, inline code, and links
- ordered and unordered lists
- tables
- fenced code blocks
- task lists
- alert callouts

## Headings and text

### Source

```md
# Lesson title

## Section title

### Subsection
```

## Lists and tasks

### Source

```md
- Understand the concept
- Complete the example

1. Open the course
2. Read the lesson
3. Submit the quiz

- [x] Intro complete
- [ ] Final exercise
```

## Code blocks

Use fenced code blocks and include language identifiers for syntax highlighting.

### Source

````md
```js
function scoreToPercent(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}
```
````

### Rendered

```js
function scoreToPercent(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}
```

## Tables

### Source

```md
| Step          | Owner    | Status      |
| ------------- | -------- | ----------- |
| Draft content | Admin    | Done        |
| Review lesson | Employee | In progress |
```

### Rendered

| Step          | Owner    | Status      |
| ------------- | -------- | ----------- |
| Draft content | Admin    | Done        |
| Review lesson | Employee | In progress |

## Callouts

GitHub-style callouts are supported.

### Source

```md
> [!NOTE]
> Use this lesson as a baseline before the quiz.

> [!TIP]
> Keep each section focused on one concept.

> [!WARNING]
> Reordering published content impacts learner flow.

> [!CAUTION]
> Deleting a quiz removes its questions.
```

### Rendered

> [!NOTE]
> Use this lesson as a baseline before the quiz.

> [!TIP]
> Keep each section focused on one concept.

> [!WARNING]
> Reordering published content impacts learner flow.

> [!CAUTION]
> Deleting a quiz removes its questions.

## Authoring guidance

- Keep lesson sections short and scannable.
- Prefer one idea per heading.
- Put practical examples close to theory.
- Use callouts for policy, risk, or shortcuts.
