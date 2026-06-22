# Gameplay Modes

This document defines the major modes planned for Trust No Bot.

## 1. Classic Mode

The first playable mode.

Human starts as a normal Villager in MVP.

Goal:

- identify the hidden opponent role
- survive day/night cycles
- vote correctly

Setup:

- 1 human
- 6 AI players
- 1 hidden opponent role
- 1 Detective
- 1 Doctor
- 4 Villagers

Why first:

- easiest to understand
- easiest to test
- best base for future modes

## 2. Detective Mode

Human plays as Detective.

Goal:

- inspect one player each night
- use private clues to guide votes
- decide when to reveal information publicly

UX needs:

- private clue log
- night target selector
- warning that clues are private unless user says them

## 3. Hidden Role Mode

Human plays as the hidden opponent role.

Goal:

- survive accusations
- choose night action targets
- guide the room away from voting you out

UX needs:

- night action selector
- pressure/interrogation UI
- post-game analysis showing which answers increased suspicion

## 4. Chaos Mode

Adds unusual roles and incentives.

Possible roles:

- Jester: wants to be voted out
- Lawyer: socially protects a selected player
- Influencer: vote can count more under specific conditions
- Ghost: can leave one clue after elimination
- Framer: affects investigation results

Build gradually. Add one role at a time.

## 5. Daily Challenge

A daily fixed seed game.

All users get the same:

- character set
- role setup
- initial game seed

Users still create different outcomes based on questions and votes.

Purpose:

- comparison
- sharing
- retention
- replay habit

## 6. Theme Packs

Themes should change names, flavor, and tone without changing core rules.

Initial theme ideas:

- Classic village
- Hostel friends
- Office team
- Startup team
- Cousins group
- Cyberpunk room

Keep themes separate from engine logic.

## 7. Async Multiplayer Foundation

A later stepping stone before real-time multiplayer.

Players can take turns with AI filling empty slots or moderating flow.

Do not build this until the single-player loop is fun.

## 8. Real-time Multiplayer

Long-term only.

Requirements before starting:

- server-authoritative engine
- event log
- room model
- reconnect handling
- moderation controls
- proven retention

Real-time multiplayer should not be the MVP.