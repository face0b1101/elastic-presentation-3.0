import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileLines,
  faMobileScreen,
  faScaleBalanced,
  faMagnifyingGlass,
  faComments,
} from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../context/ThemeContext'
import SceneHeader from '../components/SceneHeader'
import SceneStepper from '../components/SceneStepper'
import { useSceneMotion } from '../hooks/useSceneMotion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { resolveIcon } from '../data/iconOptions'

export const BEATS = [
  {
    key: 'services',
    step: 'Services',
    titlePlain: 'Three data services. Each owns its products and its ',
    titleAccent: 'specialist.',
    subtitle: 'The data lives in the service. A domain specialist answers only within that service.',
    hold: 6500,
  },
  {
    key: 'decoupled',
    step: 'Decoupled',
    titlePlain: 'The data stays in the service. Capabilities are built ',
    titleAccent: 'on top.',
    subtitle: 'Search UIs and agents can change without moving the data. Another team can build a different capability on the same service.',
    hold: 8000,
  },
  {
    key: 'access',
    step: 'Access',
    titlePlain: 'Classic search on one service. A ',
    titleAccent: 'coordinator across all three.',
    subtitle: 'Individual search services look documents up. This app can also ask one question across every data service.',
    hold: 9000,
  },
]

const DEFAULT_SERVICES = [
  {
    id: 'intelligence',
    name: 'Intelligence',
    specialist: 'Intelligence specialist',
    products: ['Reports'],
    icon: faFileLines,
  },
  {
    id: 'df',
    name: 'Digital forensics',
    specialist: 'Digital forensics specialist',
    products: ['Messages', 'Media'],
    icon: faMobileScreen,
  },
  {
    id: 'legislation',
    name: 'Legislation',
    specialist: 'Legislation specialist',
    products: ['Acts', 'Charging guidance', 'Sentencing guidelines'],
    icon: faScaleBalanced,
  },
]

const DEFAULT_CAPABILITIES = [
  {
    id: 'classic',
    title: 'Classic search',
    desc: 'A search service on one data service',
    icon: faMagnifyingGlass,
  },
  {
    id: 'specialist',
    title: 'Domain specialist',
    desc: 'An agent built to use that data',
    icon: faComments,
  },
]

const MONO = { fontFamily: 'Space Mono, ui-monospace, monospace' }

function mergeServices(override) {
  return (override || DEFAULT_SERVICES).map((s, i) => {
    const merged = { ...(DEFAULT_SERVICES[i] || {}), ...s }
    return { ...merged, icon: resolveIcon(merged.icon, DEFAULT_SERVICES[i]?.icon || faFileLines) }
  })
}

function ThreeServices({ services, accent, headText, mutedText, panel, isDark }) {
  return (
    <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
      {services.map((service) => (
        <article
          key={service.id}
          className={`reveal flex flex-col rounded-2xl border px-5 py-5 ${panel}`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent}1f`, color: accent }}
            >
              <FontAwesomeIcon icon={service.icon} />
            </span>
            <p
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: accent, ...MONO }}
            >
              {service.specialist}
            </p>
          </div>
          <h2 className={`mt-4 font-headline font-extrabold text-2xl leading-tight ${headText}`}>
            {service.name}
          </h2>
          <p className={`mt-1 text-[10px] uppercase tracking-wider ${mutedText}`} style={MONO}>
            Data products
          </p>
          <ul className="mt-3 space-y-2">
            {service.products.map((product) => (
              <li
                key={product}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  isDark ? 'border-white/10 bg-black/20 text-white/85' : 'border-elastic-dev-blue/10 bg-elastic-light-grey text-elastic-dark-ink'
                }`}
              >
                {product}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

function Decoupled({ services, capabilities, accent, headText, mutedText, panel, isDark }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-center gap-4">
      <p
        className={`reveal text-center text-[10px] font-bold uppercase tracking-wider ${mutedText}`}
        style={MONO}
      >
        Application of the data
      </p>
      <div className="reveal grid grid-cols-2 gap-3">
        {capabilities.map((cap) => (
          <div
            key={cap.id}
            className="rounded-2xl border px-5 py-5 text-center"
            style={{
              borderColor: `${accent}55`,
              background: `linear-gradient(180deg, ${accent}18, ${accent}06)`,
            }}
          >
            <span
              className="inline-flex w-9 h-9 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${accent}22`, color: accent }}
            >
              <FontAwesomeIcon icon={cap.icon} />
            </span>
            <p className={`mt-3 font-headline font-extrabold text-lg ${headText}`}>{cap.title}</p>
            <p className={`mt-1 text-sm ${mutedText}`}>{cap.desc}</p>
          </div>
        ))}
      </div>
      <div className="reveal relative py-2 text-center">
        <div className={`absolute inset-x-0 top-1/2 h-px ${isDark ? 'bg-white/10' : 'bg-elastic-dev-blue/10'}`} />
        <span
          className={`relative px-3 text-[10px] font-bold uppercase tracking-wider ${
            isDark ? 'bg-elastic-dev-blue' : 'bg-elastic-light-grey'
          }`}
          style={{ color: accent, ...MONO }}
        >
          Data is not the application
        </span>
      </div>
      <div className="reveal grid grid-cols-3 gap-3">
        {services.map((service) => (
          <div key={service.id} className={`rounded-2xl border px-3 py-4 text-center ${panel}`}>
            <p className={`text-sm font-bold ${headText}`}>{service.name}</p>
            <p className={`mt-1 text-[11px] ${mutedText}`}>{service.products.join(' · ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Access({
  services,
  accent,
  headText,
  mutedText,
  panel,
  isDark,
  demoHref,
  demoCue,
  prefersReducedMotion,
  playKey,
}) {
  const arrowsRef = useRef(null)

  useEffect(() => {
    const el = arrowsRef.current
    if (!el) return undefined
    const arrows = el.querySelectorAll('.ds-arrow')
    if (prefersReducedMotion) {
      arrows.forEach((n) => {
        n.style.transform = 'scaleX(1)'
        n.style.opacity = '1'
      })
      return undefined
    }
    const anim = animate(arrows, {
      scaleX: [0, 1],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(200),
      ease: 'outCubic',
    })
    return () => anim?.pause?.()
  }, [playKey, prefersReducedMotion])

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 content-center">
        <div className={`reveal flex flex-col rounded-2xl border px-5 py-5 ${panel}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`} style={MONO}>
            Classic search
          </p>
          <p className={`mt-2 text-sm ${mutedText}`}>One search, one data service. Document lookup.</p>
          <div ref={arrowsRef} className="mt-6 flex flex-1 flex-col justify-center gap-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center gap-3">
                <span
                  className={`rounded-lg border px-2 py-1 text-[11px] shrink-0 ${
                    isDark ? 'border-white/15 bg-black/25 text-white/80' : 'border-elastic-dev-blue/15 bg-elastic-light-grey'
                  }`}
                >
                  Search
                </span>
                <span
                  className="ds-arrow h-px flex-1 origin-left"
                  style={{ backgroundColor: accent, transform: 'scaleX(0)', opacity: 0 }}
                />
                <span
                  className={`rounded-lg border px-2 py-1 text-[11px] shrink-0 ${
                    isDark ? 'border-white/15 bg-black/25 text-white/80' : 'border-elastic-dev-blue/15 bg-elastic-light-grey'
                  }`}
                >
                  {service.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="reveal flex flex-col rounded-2xl border px-5 py-5"
          style={{
            borderColor: `${accent}55`,
            background: `linear-gradient(180deg, ${accent}14, transparent)`,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent, ...MONO }}>
            Coordinator
          </p>
          <p className={`mt-2 text-sm ${mutedText}`}>One question. Three specialists. One answer.</p>
          <div className="mt-6 flex flex-1 flex-col items-center justify-center">
            <div
              className="rounded-full px-5 py-2 text-sm font-bold"
              style={{ backgroundColor: accent, color: isDark ? '#101C3F' : '#ffffff' }}
            >
              Ask the coordinator
            </div>
            <div className="mt-4 grid w-full grid-cols-3 gap-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`rounded-xl border px-2 py-3 text-center text-[11px] ${headText}`}
                  style={{ borderColor: `${accent}40` }}
                >
                  {service.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="reveal shrink-0 flex justify-center mt-4">
        <a
          href={demoHref}
          target="_top"
          rel="noreferrer"
          className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-bold"
          style={{ backgroundColor: accent, color: isDark ? '#101C3F' : '#ffffff' }}
        >
          {demoCue}
        </a>
      </div>
    </div>
  )
}

function DataServicesScene({ metadata = {} }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { prefersReducedMotion } = useReducedMotion()
  const rootRef = useRef(null)

  const beats = (metadata.beats || BEATS).map((b, i) => ({ ...(BEATS[i] || {}), ...b }))
  const { beat, playKey, isPlaying, goTo, replay, toggleAutoplay } = useSceneMotion(beats)
  const current = beats[beat] || BEATS[0]

  const accent = isDark ? '#48EFCF' : '#0B64DD'
  const headText = isDark ? 'text-white' : 'text-elastic-dark-ink'
  const mutedText = isDark ? 'text-white/55' : 'text-elastic-dark-ink/60'
  const panel = isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-elastic-dev-blue/12 shadow-sm'
  const eyebrow = metadata.eyebrow || 'This demo · Data services'
  const services = mergeServices(metadata.services)
  const capabilities = (metadata.capabilities || DEFAULT_CAPABILITIES).map((c, i) => {
    const merged = { ...(DEFAULT_CAPABILITIES[i] || {}), ...c }
    return { ...merged, icon: resolveIcon(merged.icon, DEFAULT_CAPABILITIES[i]?.icon || faMagnifyingGlass) }
  })
  const demoHref = metadata.demoHref || '/'
  const demoCue = metadata.demoCue || 'Over to the demo'

  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const anim = animate(el.querySelectorAll('.reveal'), {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: prefersReducedMotion ? 1 : 400,
      delay: prefersReducedMotion ? 0 : stagger(40),
      ease: 'outCubic',
    })
    return () => anim?.pause?.()
  }, [beat, playKey, prefersReducedMotion])

  return (
    <div className="h-full w-full flex flex-col px-8 pt-2 pb-3 overflow-hidden">
      <div className="max-w-[1440px] mx-auto w-full flex-1 flex flex-col min-h-0">
        <div ref={rootRef} className="flex-1 min-h-0 flex flex-col" key={`${beat}-${playKey}`}>
          <div className="reveal shrink-0">
            <SceneHeader
              eyebrow={eyebrow}
              titlePlain={current.titlePlain}
              titleAccent={current.titleAccent}
              subtitle={current.subtitle}
            />
          </div>

          {current.key === 'services' && (
            <ThreeServices
              services={services}
              accent={accent}
              headText={headText}
              mutedText={mutedText}
              panel={panel}
              isDark={isDark}
            />
          )}
          {current.key === 'decoupled' && (
            <Decoupled
              services={services}
              capabilities={capabilities}
              accent={accent}
              headText={headText}
              mutedText={mutedText}
              panel={panel}
              isDark={isDark}
            />
          )}
          {current.key === 'access' && (
            <Access
              services={services}
              accent={accent}
              headText={headText}
              mutedText={mutedText}
              panel={panel}
              isDark={isDark}
              demoHref={demoHref}
              demoCue={demoCue}
              prefersReducedMotion={prefersReducedMotion}
              playKey={playKey}
            />
          )}
        </div>

        <SceneStepper
          beats={beats}
          beat={beat}
          onGo={goTo}
          onReplay={replay}
          isPlaying={isPlaying}
          onTogglePlay={toggleAutoplay}
        />
      </div>
    </div>
  )
}

export default DataServicesScene
