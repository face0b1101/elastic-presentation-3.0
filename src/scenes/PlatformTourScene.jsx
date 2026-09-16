import { useEffect, useMemo, useRef } from 'react'
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../context/ThemeContext'
import { useSceneMotion } from '../hooks/useSceneMotion'
import { SceneMotionProvider, useSceneMotionControls } from '../context/SceneMotionContext'
import { SceneMotionFollow, useSceneMotionFollow } from '../context/SceneMotionFollowContext'
import AboutScene from './AboutScene'
import UnifiedStrategyScene from './UnifiedStrategyScene'
import DataExplosionSceneV2 from './DataExplosionSceneV2'
import SearchChallengeScene, { BEATS as SEARCH_CHALLENGE_BEATS } from './SearchChallengeScene'
import SearchContextScene, { BEATS as SEARCH_CONTEXT_BEATS } from './SearchContextScene'
import VideoKnowledgeScene, { DEFAULT_BEATS as VIDEO_KNOWLEDGE_BEATS } from './VideoKnowledgeScene'

const MONO = { fontFamily: 'Space Mono, ui-monospace, monospace' }

// A page that shows one static view dwells this long before the tour moves on.
const PAGE_HOLD_MS = 12000

// A page whose scene has its own beats is stepped through beat by beat, reusing
// each beat's authored `hold`, which is already tuned to outlast that beat's
// entrance animation. Pinned into this band so nothing flashes past.
const STEP_MIN_MS = 5000
const STEP_MAX_MS = 10000

/**
 * The tour pages, in running order.
 *
 * - `beats`: the embedded scene's own beat list. The tour steps through it and
 *   reuses each beat's `hold`, so page timing never drifts from the scene.
 * - `stepProps`: for a scene with no beats but a one-shot reveal to trigger.
 *   One entry per step, merged into the scene's props.
 * - `hold`: dwell for a page that has neither.
 */
const PAGES = [
  {
    id: 'about',
    title: 'About Elastic',
    component: AboutScene,
  },
  {
    id: 'unified-strategy',
    title: 'Platform Overview',
    component: UnifiedStrategyScene,
    hold: 14000,
  },
  {
    id: 'data-explosion',
    title: 'Data Explosion',
    component: DataExplosionSceneV2,
    // The verdict panel renders hidden until `verdictSignal` fires, so the page
    // runs as two steps: the chart and counters land, then the verdict.
    stepProps: [{ verdictSignal: 0 }, { verdictSignal: 1 }],
    hold: 7500,
  },
  {
    id: 'search-challenge',
    title: 'Unstructured Challenge',
    component: SearchChallengeScene,
    beats: SEARCH_CHALLENGE_BEATS,
  },
  {
    id: 'search-context',
    title: 'Context Layer',
    component: SearchContextScene,
    beats: SEARCH_CONTEXT_BEATS,
  },
  {
    id: 'video-knowledge',
    title: 'Knowledge From Video',
    component: VideoKnowledgeScene,
    beats: VIDEO_KNOWLEDGE_BEATS,
  },
]

function clampStepHold(ms) {
  return Math.min(Math.max(ms, STEP_MIN_MS), STEP_MAX_MS)
}

/**
 * Flattens the pages into the one-dimensional beat list `useSceneMotion` drives:
 * one entry per (page, step) pair, each carrying its own dwell.
 */
export function buildTourSteps(pages) {
  return pages.flatMap((page, pageIndex) => {
    const stepCount = page.beats?.length || page.stepProps?.length || 1
    return Array.from({ length: stepCount }, (_, stepIndex) => ({
      key: `${page.id}-${stepIndex}`,
      step: stepCount > 1 ? `${page.title} ${stepIndex + 1}` : page.title,
      pageIndex,
      stepIndex,
      hold: page.beats
        ? clampStepHold(page.beats[stepIndex]?.hold ?? PAGE_HOLD_MS)
        : page.hold ?? PAGE_HOLD_MS,
    }))
  })
}

function PlatformTourScene({ metadata = {} }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { setControls } = useSceneMotionControls()
  const following = useSceneMotionFollow() != null

  const pages = useMemo(
    () => PAGES.map((page, i) => ({ ...page, ...(metadata.pages?.[i] || {}) })),
    [metadata.pages],
  )
  const steps = useMemo(() => buildTourSteps(pages), [pages])

  const { beat, playKey, isPlaying, goTo, play, toggleAutoplay } = useSceneMotion(steps, {
    loop: true,
    // A dwell here is reading time for a whole page, not cover for an entrance
    // animation, so reduced motion must not collapse it to a strobe.
    shortenForReducedMotion: false,
  })

  // The tour is a self-running loop, so it starts itself rather than waiting for
  // the nav's play button. A presenter preview follows the audience tab's beat
  // and must never drive its own.
  const startedRef = useRef(false)
  useEffect(() => {
    if (following || startedRef.current) return
    startedRef.current = true
    play()
  }, [following, play])

  // Pause/resume for the nav bar. The deck only renders a toggle for scenes that
  // supply their own icon, and a self-running slide needs a visible stop.
  useEffect(() => {
    if (following) return undefined
    setControls({
      isPlaying,
      onTogglePlay: toggleAutoplay,
      toggleIcon: faPlay,
      toggleIconActive: faPause,
      toggleTitle: 'Resume the tour',
      toggleTitleActive: 'Pause the tour',
    })
    return () => setControls(null)
  }, [following, isPlaying, toggleAutoplay, setControls])

  const current = steps[beat] || steps[0]
  const page = pages[current.pageIndex]
  const PageComponent = page.component

  const accent = isDark ? '#48EFCF' : '#0B64DD'
  const mutedText = isDark ? 'text-white/50' : 'text-elastic-dev-blue/50'
  const eyebrow = metadata.eyebrow || 'Elastic · Platform Tour'

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Page rail: where we are in the loop, and a way to jump */}
      <div className="shrink-0 flex items-center justify-center gap-2 px-8 pt-2 flex-wrap">
        <span
          className={`text-[11px] font-bold uppercase tracking-eyebrow mr-1 ${mutedText}`}
          style={MONO}
        >
          {eyebrow}
        </span>
        {pages.map((p, i) => {
          const isActive = i === current.pageIndex
          const pageSteps = steps.filter((s) => s.pageIndex === i)
          return (
            <button
              key={p.id}
              onClick={() => goTo(steps.indexOf(pageSteps[0]))}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? isDark
                    ? 'bg-elastic-teal/20 text-elastic-teal'
                    : 'bg-elastic-blue/15 text-elastic-blue'
                  : isDark
                    ? 'text-white/45 hover:text-white/75'
                    : 'text-elastic-dev-blue/45 hover:text-elastic-dev-blue/75'
              }`}
            >
              {p.title}
              {isActive && pageSteps.length > 1 && (
                <span className="flex items-center gap-1">
                  {pageSteps.map((s, stepIndex) => (
                    <i
                      key={s.key}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: accent, opacity: stepIndex === current.stepIndex ? 1 : 0.3 }}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* The page itself: a live scene, stepped by the tour.
          `key` remounts it on a page change so its entrance replays; its own
          SceneMotion provider keeps its stepper out of the deck's nav bar. */}
      <div className="flex-1 min-h-0">
        <SceneMotionProvider>
          <SceneMotionFollow beat={current.stepIndex} playKey={playKey}>
            <div key={page.id} className="h-full w-full">
              <PageComponent
                metadata={metadata.pageMetadata?.[page.id] || {}}
                {...(page.stepProps?.[current.stepIndex] || {})}
              />
            </div>
          </SceneMotionFollow>
        </SceneMotionProvider>
      </div>
    </div>
  )
}

export default PlatformTourScene
