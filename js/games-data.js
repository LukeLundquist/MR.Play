/**
 * MR.Play game portfolio — the one place to add, edit, reorder, or remove
 * a game on the Games page. No HTML/CSS editing required.
 *
 * Loaded as a plain global (not an ES module) via <script src>, same as
 * config.js, so the site keeps working opened directly from disk (file://).
 * Must load AFTER js/config.js — the real entry below references GAME_URL
 * rather than retyping it, so config.js stays the one place that URL lives.
 *
 * Fields:
 *   id              - short, unique, URL-safe (used in ?from= style links)
 *   title           - shown on the card
 *   description     - one to two sentences, shown on the card
 *   thumbnail       - optional image path; leave null for a card with no
 *                     art yet (renders a branded placeholder instead)
 *   imageAlt        - required whenever thumbnail is set — real descriptive
 *                     alt text, never the filename
 *   isConceptArt    - true if the image is early concept/mockup art rather
 *                     than a real screenshot — shows a "Concept Preview"
 *                     badge on the card so it's never mistaken for final
 *   url             - where "Play"/"Launch" sends the player; null if not
 *                     launchable yet (coming-soon / in-development)
 *   status          - 'available' | 'coming-soon' | 'in-development'
 *   buttonLabel     - text on the launch button for an available game
 *   category        - optional short tag, e.g. "Preference Mapping"
 *   researchPurpose - optional one-line note on what the gameplay
 *                     contributes to (kept general, never overclaimed)
 */

var MRPLAY_GAMES = [
  {
    id: 'gravity-well',
    title: 'Gravity Well',
    description: 'Sort brand pairs into Similar, Neutral, or Dissimilar, rank your calls within each group, then launch each one into a spinning ring to score — a fast, physical way to map how you really see things.',
    thumbnail: 'assets/games/gravity-well.jpg',
    imageAlt: 'Gravity Well title screen: three glowing rings floating in a starfield above a sorting orb, with the tagline "A cosmos you sort with your hands."',
    isConceptArt: false,
    url: GAME_URL,
    status: 'available',
    buttonLabel: 'Play Now',
    category: 'Similarity Mapping',
    researchPurpose: 'Your sorting and ranking choices help map how closely people associate different brands or ideas with one another.'
  },
  {
    id: 'breakfast-tycoon',
    title: 'Breakfast Tycoon',
    description: 'Rank 18 restaurant profiles and budget a hypothetical $1,000 across your favorites — then your top picks become properties on a Monopoly-style board you play to build a breakfast empire.',
    thumbnail: 'assets/games/breakfast-tycoon.jpg',
    imageAlt: 'Breakfast Tycoon concept mockup: a first-person view of a Monopoly-style board path lined with breakfast-themed restaurant storefronts, holding dice and coins, with a player money HUD and a Roll button.',
    isConceptArt: true,
    url: null,
    status: 'in-development',
    buttonLabel: 'In Development',
    category: 'Preference & Ranking',
    researchPurpose: 'Your rankings and hypothetical spending help reveal what actually drives preference among a set of options, not just which one people say they like.'
  },
  {
    id: 'stormfront',
    title: 'Stormfront',
    description: 'Guide a cartoon raindrop up a stack of clouds toward the summit, answering a few quick brand questions along the way. Nothing you answer changes how the climb plays out.',
    thumbnail: 'assets/games/stormfront.jpg',
    imageAlt: 'Stormfront concept mockup: a stone archway framing a glowing sunrise over cloud-top mountains, with a character-selection row and a "Tap to ride the storm" button.',
    isConceptArt: true,
    url: null,
    status: 'in-development',
    buttonLabel: 'In Development',
    category: 'Brand Perception',
    researchPurpose: 'Your answers, given once early and again mid-climb, help capture how consistently people associate certain qualities with different brands.'
  },
  {
    id: 'temple-trail',
    title: 'Temple Trail',
    description: 'Pack your kit, then climb a tiered jungle temple — dodging playful creature setbacks and catching shortcuts on your way to the summit treasure.',
    thumbnail: 'assets/games/temple-trail.jpg',
    imageAlt: 'Temple Trail concept mockup: a tiered stone temple board game with numbered tiles, ladders, and a small explorer character, with a "Start Adventure" button.',
    isConceptArt: true,
    url: null,
    status: 'in-development',
    buttonLabel: 'In Development',
    category: 'Brand Perception',
    researchPurpose: 'Your choices while packing and climbing help reveal which qualities people associate with different brands, without ever feeling like a survey.'
  }
];
