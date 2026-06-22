# UI / UX Specification

## Design goal

Trust No Bot should feel like a tense chat-based social deduction game, not a form-heavy AI demo.

## Primary screens

## 1. Landing page

Purpose: explain the hook quickly.

Hero copy options:

- Can you catch the hidden AI opponent?
- Play Mafia against AI characters. Trust no bot.
- One of them has a secret role. Can you survive the vote?

Primary CTA:

- Start Game

Secondary CTA later:

- Try Daily Challenge

## 2. Lobby / setup

Inputs:

- mode
- difficulty
- theme

MVP can lock most options and show them as coming soon.

Recommended default:

- Classic Mode
- Normal difficulty
- Classic theme

## 3. Role reveal

Show the user's role clearly.

Example:

```text
Your role: Villager
Goal: Find the hidden opponent before the room loses control.
```

Do not show other secret roles.

## 4. Game screen

Recommended layout:

- top: current phase and day number
- left/top section: player cards
- center: transcript
- bottom: action panel
- side panel on desktop: role/clue/game log

Mobile layout:

- phase header
- horizontal player cards
- transcript
- sticky action panel

## 5. Player cards

Show:

- name
- alive/inactive status
- public style label
- suspicion indicator
- vote marker during voting

Do not show role before reveal.

## 6. Transcript

Requirements:

- phase separators
- speaker name
- short messages
- newest message visible
- important events visually distinct

Message types:

- dialogue
- system event
- private clue
- vote result
- elimination event

## 7. Action panel

Changes by phase:

- night: choose role action if available
- discussion: ask question
- voting: choose vote target
- game over: view results/share

The user should always know what to do next.

## 8. Voting modal

Show alive players only.

Display recent reasons/suspicion hints but not secret roles.

Confirm vote before submitting.

## 9. Result page

Show:

- winner
- revealed roles
- user's role
- key turning point
- best read
- worst vote
- share card

## 10. Share card

Text examples:

```text
I played Trust No Bot.
Result: Lost
Mistake: trusted the wrong bot
Mode: Classic
```

Keep it short enough for screenshots and WhatsApp.

## Visual style

Recommended direction:

- dark background
- glowing room/table vibe
- high-contrast player cards
- subtle motion
- not too much animation during reading

## Accessibility

- readable font sizes
- no critical information through color alone
- keyboard-friendly voting
- reduced motion support later

## UX warnings

- Do not overload the first screen with all future modes.
- Do not make users create account before first play.
- Do not hide the current phase.
- Do not make result reveal confusing.
- Do not reveal secret roles early.