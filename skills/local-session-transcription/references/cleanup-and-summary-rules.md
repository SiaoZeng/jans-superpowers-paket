# Cleanup and Summary Rules — Local Session Transcription

## Cleanup Scope

Cleanup is the second step after raw STT. It is not part of the raw transcription step.

Allowed cleanup:

- remove filler sounds and hesitation markers such as `嗯`, `呃`, `啊`, `喔`, `hm`, `äh`
- remove non-semantic repeated starts and loops, e.g. repeated fragments caused by ASR instability
- reduce spoken-language clutter such as repeated `就是`, `那個`, `這個`, when it does not carry meaning
- repair punctuation, sentence boundaries, and paragraphing
- correct obvious ASR terms when the transcript context strongly supports the correction
- normalize known program names or acronyms when context is clear, e.g. `地方型 SBIR`

Forbidden cleanup:

- do not invent facts, names, dates, amounts, policy rules, or action items
- do not silently add external knowledge
- do not remove meaningful hedging or caveats if they affect interpretation
- do not translate unless explicitly requested
- do not collapse multiple distinct points into one vague paragraph

## Ambiguity Handling

If the raw transcript is ambiguous:

- keep the safest wording
- mark uncertainty in prose if needed
- avoid overconfident correction of names, acronyms, or legal/policy terms

## Paragraphing

Create paragraphs by topic and discourse function:

- opening/context
- purpose and audience
- process explanation
- requirements and eligibility
- amounts and funding logic
- deadlines and follow-up
- conclusion

## Detailed Summary Rules

`Teil 1` must summarize the full transcript and should be more detailed than a short abstract.

Include all available operational details:

- who the session is for
- what program or process is being explained
- why it matters
- eligibility requirements
- funding caps, percentages, self-funding, or payment schedules
- dates, deadlines, and phases
- review criteria or evaluation focus
- recommended preparation steps
- limitations or caveats
- next actions

Do not summarize only the beginning. Always scan the full cleaned transcript before writing the summary.
