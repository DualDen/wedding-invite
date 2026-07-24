import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import forestUrl from './assets/invite/forest.jpg'
import coupleUrl from './assets/invite/couple-tight.jpg'
import ovalFrameUrl from './assets/invite/oval-frame.png'
import inviteFrameUrl from './assets/invite/invite-frame.png'
import cloudsUrl from './assets/invite/clouds.png'
import starUrl from './assets/invite/star.png'
import './InviteScene.css'

/**
 * Figma frame 402×1716 — stars that sit on the forest→olive seam
 * (replacing birds). Positions from node metadata, scaled as %.
 * Sizes: design px → rem-ish via clamp in CSS classes.
 */
/** Seam stars — only outer edges so they don’t sit under hero names */
const SEAM_STARS = [
  { className: 'invite__seam-star invite__seam-star--a', size: 56 },
  { className: 'invite__seam-star invite__seam-star--c', size: 64 },
  { className: 'invite__seam-star invite__seam-star--d', size: 24 },
] as const

/**
 * Body stars — side gutters only (avoid center column with message/date/venue).
 * Safe zones: left ≤12% or right ≥78% of body width.
 */
const BODY_STARS = [
  { top: '8%', left: '3%', size: 48 },
  { top: '12%', left: '88%', size: 56 },
  { top: '22%', left: '2%', size: 28 },
  { top: '26%', left: '91%', size: 32 },
  { top: '38%', left: '4%', size: 52 },
  { top: '42%', left: '86%', size: 44 },
  { top: '54%', left: '3%', size: 36 },
  { top: '58%', left: '89%', size: 48 },
  { top: '72%', left: '5%', size: 28 },
  { top: '78%', left: '90%', size: 34 },
  { top: '88%', left: '8%', size: 40 },
] as const

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

type InviteSceneProps = {
  active: boolean
}

export default function InviteScene({ active }: InviteSceneProps) {
  const rootRef = useRef<HTMLElement>(null)
  const heroBgRef = useRef<HTMLDivElement>(null)
  const heroFloatRef = useRef<HTMLDivElement>(null)
  const cloudsRef = useRef<HTMLDivElement>(null)
  const bodyStarsRef = useRef<HTMLDivElement>(null)
  const parallaxRef = useRef({ scrollY: 0, ptrX: 0, ptrY: 0 })

  useEffect(() => {
    if (!active || !rootRef.current) return

    const root = rootRef.current
    const reduce = prefersReducedMotion()

    const ctx = gsap.context(() => {
      gsap.set(root, { opacity: 1 })

      if (reduce) {
        gsap.set(
          [
            '.invite__hero-copy',
            '.invite__portrait',
            '.invite__names',
            '.invite__seam-star',
            '.invite__message',
            '.invite__date',
            '.invite__venue',
            '.invite__cta',
          ],
          { opacity: 1, y: 0 },
        )
        return
      }

      gsap.fromTo(
        root.querySelector('.invite__hero-bg img'),
        { scale: 1.12 },
        { scale: 1, duration: 2.4, ease: 'power2.out' },
      )

      if (heroFloatRef.current) {
        const float = heroFloatRef.current
        gsap.set(float, { x: 0, y: 0, scale: 1.08, rotation: 0 })
        gsap.to(float, {
          x: 18,
          duration: 11,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
        gsap.to(float, {
          y: -14,
          duration: 8.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 0.6,
        })
        gsap.to(float, {
          scale: 1.14,
          duration: 14,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.2,
        })
        gsap.to(float, {
          rotation: 0.55,
          duration: 16,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 0.3,
        })
      }

      gsap.fromTo(
        ['.invite__hero-copy', '.invite__portrait', '.invite__names'],
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.14,
          ease: 'power3.out',
          delay: 0.55,
        },
      )

      gsap.fromTo(
        '.invite__seam-star',
        { opacity: 0, scale: 0.7 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.5,
        },
      )

      gsap.fromTo(
        ['.invite__message', '.invite__date', '.invite__venue', '.invite__cta'],
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.4,
        },
      )

      // Twinkle all decorative stars
      gsap.utils
        .toArray<HTMLElement>('.invite__seam-star, .invite__body-star')
        .forEach((el, i) => {
          gsap.to(el, {
            opacity: 0.45 + (i % 3) * 0.15,
            scale: 0.9,
            duration: 1.35 + (i % 4) * 0.28,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: (i % 5) * 0.22,
          })
          gsap.to(el, {
            y: '-=6',
            duration: 2.8 + (i % 3) * 0.45,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 0.12,
          })
        })

      if (cloudsRef.current) {
        gsap.to(cloudsRef.current.querySelector('img'), {
          x: 18,
          duration: 10,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }
    }, root)

    return () => ctx.revert()
  }, [active])

  useEffect(() => {
    if (!active || !rootRef.current) return
    if (prefersReducedMotion()) return

    const root = rootRef.current
    const bg = heroBgRef.current
    let raf = 0
    let ptrTargetX = 0
    let ptrTargetY = 0

    const setHeroBgX = bg ? gsap.quickSetter(bg, 'x', 'px') : null
    const setHeroBgY = bg ? gsap.quickSetter(bg, 'y', 'px') : null
    // Do NOT parallax heroFg — names (esp. Денис) were sliding under the olive band
    const setBodyStarsY = bodyStarsRef.current
      ? gsap.quickSetter(bodyStarsRef.current, 'y', 'px')
      : null

    const applyParallax = () => {
      raf = 0
      const p = parallaxRef.current
      p.ptrX += (ptrTargetX - p.ptrX) * 0.06
      p.ptrY += (ptrTargetY - p.ptrY) * 0.06

      setHeroBgX?.(p.ptrX)
      setHeroBgY?.(p.scrollY * 0.42 + p.ptrY)
      // Subtle side-only drift for body stars (keeps them off center text)
      setBodyStarsY?.(p.scrollY * 0.12)

      if (
        Math.abs(ptrTargetX - p.ptrX) > 0.15 ||
        Math.abs(ptrTargetY - p.ptrY) > 0.15
      ) {
        raf = requestAnimationFrame(applyParallax)
      }
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(applyParallax)
    }

    const onScroll = () => {
      parallaxRef.current.scrollY = root.scrollTop
      schedule()
    }

    const onPointer = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5
      ptrTargetX = nx * -22
      ptrTargetY = ny * -14
      schedule()
    }

    const onPointerLeave = () => {
      ptrTargetX = 0
      ptrTargetY = 0
      schedule()
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    root.addEventListener('pointermove', onPointer, { passive: true })
    root.addEventListener('pointerleave', onPointerLeave)
    onScroll()

    return () => {
      root.removeEventListener('scroll', onScroll)
      root.removeEventListener('pointermove', onPointer)
      root.removeEventListener('pointerleave', onPointerLeave)
      cancelAnimationFrame(raf)
    }
  }, [active])

  const mapsUrl = 'https://go.2gis.com/o569l'

  return (
    <section
      ref={rootRef}
      className="invite"
      data-active={active || undefined}
      aria-hidden={!active}
    >
      <header className="invite__hero">
        <div className="invite__hero-bg" ref={heroBgRef} aria-hidden>
          <div className="invite__hero-bg-float" ref={heroFloatRef}>
            <img src={forestUrl} alt="" draggable={false} />
            <div className="invite__hero-shade" />
          </div>
        </div>

        <div className="invite__hero-fg">
          {/* Figma: Great Vibes 24px, left≈58, top≈76, w≈287 */}
          <p className="invite__hero-copy">
            свадебное приглашение для дорогих людей
          </p>

          {/* Figma: frame 236×302 at (85,121) on 402 → ~58.7% width */}
          <div className="invite__portrait">
            <div className="invite__portrait-photo">
              <img src={coupleUrl} alt="Юлия и Денис" draggable={false} />
            </div>
            <img
              className="invite__portrait-frame"
              src={ovalFrameUrl}
              alt=""
              draggable={false}
              aria-hidden
            />
          </div>

          {/*
            Figma node 2008:17 «Юлия Денис»
            Great Vibes 48px, #fff8d0, 278×124 at (62,414)
            Two lines only — second line heavily indented (no &)
          */}
          <h1 className="invite__names" aria-label="Юлия и Денис">
            <span className="invite__name invite__name--yulia">Юлия</span>
            <span className="invite__name invite__name--denis">Денис</span>
          </h1>
        </div>
      </header>

      {/* In-flow seam band (Figma stars instead of birds) — reserves height */}
      <div className="invite__seam" aria-hidden>
        {SEAM_STARS.map((s) => (
          <img
            key={s.className}
            className={s.className}
            src={starUrl}
            alt=""
            draggable={false}
            style={{ width: s.size }}
          />
        ))}
      </div>

      <div className="invite__body">
        <div className="invite__body-stars" ref={bodyStarsRef} aria-hidden>
          {BODY_STARS.map((s, i) => (
            <img
              key={i}
              className="invite__body-star"
              src={starUrl}
              alt=""
              draggable={false}
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
              }}
            />
          ))}
        </div>

        {/* Figma: frame 283×420 at (59,625); text Cormorant 24/20 #535c39 */}
        <div className="invite__message">
          <img
            className="invite__message-frame"
            src={inviteFrameUrl}
            alt=""
            draggable={false}
            aria-hidden
          />
          <div className="invite__message-text">
            <p className="invite__message-title">Дорогие гости</p>
            <p>
              в этот важный день,
              <br />
              мы хотим видеть
              <br />
              вас рядом
            </p>
            <p>
              мы будем очень рады,
              <br />
              если вы примете
              <br />
              приглашение
            </p>
          </div>
        </div>

        {/* Figma: Great Vibes 55px date parts at y1120 */}
        <div className="invite__date" aria-label="20 августа 2026">
          <span>20</span>
          <i aria-hidden />
          <span>08</span>
          <i aria-hidden />
          <span>26</span>
        </div>

        <div className="invite__venue">
          <p className="invite__venue-label">семейный вечер в ресторане</p>
          <p className="invite__venue-name">BERЁZKA</p>
          <p className="invite__venue-time">16:00</p>
        </div>

        <a
          className="invite__cta"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          посмотреть маршрут
        </a>

        <div className="invite__clouds" ref={cloudsRef} aria-hidden>
          <img src={cloudsUrl} alt="" draggable={false} />
        </div>
      </div>
    </section>
  )
}
