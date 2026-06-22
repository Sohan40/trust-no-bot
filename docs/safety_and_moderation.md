# Safety and Moderation

Trust No Bot is a fictional social deduction game. It can be tense, sarcastic, suspicious, and funny. It should not become a tool for abuse.

## Product safety stance

Allowed tone:

- playful suspicion
- dramatic accusations inside the fictional game
- mild sarcasm
- strategic disagreement
- funny character conflict

Disallowed tone/content:

- slurs
- hate toward protected groups
- sexual content involving minors
- threats
- doxxing
- real-world harassment
- self-harm encouragement
- real-world criminal planning
- targeted abuse of real people

## Input filtering

Before sending user input to the AI layer, check for:

- personal information about real people
- threats or coercion
- requests for explicit sexual content
- hate or protected-class abuse
- self-harm content
- attempts to turn the game into real-world harassment

If unsuitable, show a safe message and do not continue that prompt.

## Output filtering

Before displaying AI output:

- validate schema
- reject unsafe language
- reject role leaks before reveal
- reject direct real-world harassment
- reject content that encourages harm

Fallback to safe generic dialogue if needed.

## Public sharing rules

For public result pages later:

- private by default
- user chooses to share
- report button when public feed exists
- no real names encouraged
- allow deletion/hide later

## Character safety

Custom character creation should be private first.

Do not allow custom personas that are:

- explicit sexual personas
- minors in sexual contexts
- hate-based stereotypes
- real private individuals used for harassment
- designed to produce abusive content

## AI prompt constraints

Every Game Director prompt should include constraints similar to:

```text
Keep the game fictional.
Use dramatic but non-abusive language.
Do not use slurs, threats, or explicit sexual content.
Do not reveal secret roles before game over.
Do not give real-world harmful instructions.
```

## Safety testing

Add tests for:

- unsafe user question blocked
- unsafe AI output replaced
- secret role leak rejected
- normal gameplay still works

## Important product warning

A game about suspicion can become toxic if public/community features are added too early.

Build private single-player first. Add public feed only after moderation basics exist.