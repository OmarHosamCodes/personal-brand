# Omar Hosam — Post-Production Studio

## Platform

web (local)

## Stack

Vite + React + TypeScript UI; Bun + Hono job server; system ffmpeg for denoise, silence trim, and intro/outro concat.

## Users

Omar Hosam, finishing framed OBS recordings into publish-ready takes.

## Product Purpose

Drop one finished OBS recording and leave with a denoised, silence-trimmed export that optionally carries the Omar Hosam intro and outro.

## Positioning

A single-task creator broadcast finishing tool — not an NLE, not a live compositor.

## Operating Context

Runs locally next to OBS. Input is already framed (horizontal 1920×1080 or vertical 1080×1920). Brand intro/outro assets come from the Omar Personal Brand Open Design renders.

## Capabilities and Constraints

- Denoise speech audio (arnndn when a model is present, otherwise afftdn).
- Smart silence removal with padding so speech edges are not clipped.
- Optional aspect-matched intro and outro concat.
- No webcam/screen re-compositing in v1.
- Do not invent metrics, audience size, or commercial claims in the UI.

## Brand Commitments

- Name: Omar Hosam / عمر حسام
- Visual world: Creator Broadcast Pipeline (kinetic orange, Syne, IBM Plex, code-surface dark stage)
- Mark: terminal dot + two rising orange slashes
