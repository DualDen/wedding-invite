import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { CustomBounce } from 'gsap/CustomBounce'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import sealImg from './assets/seal.png'
import './App.css'

gsap.registerPlugin(CustomEase, CustomBounce, MotionPathPlugin)

CustomEase.create('luxIn', 'M0,0 C0.12,0.8 0.22,1 1,1')
CustomEase.create('luxOut', 'M0,0 C0.33,0 0.2,1 1,1')
CustomEase.create('sealPop', 'M0,0 C0.14,1.4 0.34,1 1,1')
CustomEase.create('paperOpen', 'M0,0 C0.22,0.61 0.18,1 1,1')
CustomBounce.create('letterLand', {
  strength: 0.18,
  squash: 0.6,
  squashID: 'letterLand-squash',
})

const SPARK_COUNT = 28
const DUST_COUNT = 36

function App() {
  const rootRef = useRef<HTMLElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const startedRef = useRef(false)

  const buildTimeline = useCallback(() => {
    const root = rootRef.current
    if (!root) return

    const q = gsap.utils.selector(root)
    const rig = q('.envelope-rig')
    const lid = q('.env-lid')
    const letterSlot = q('.letter-slot')
    const letter = q('.letter')
    const letterInner = q('.letter-inner')
    const letterBits = q('.letter-anim')
    const seal = q('.seal')
    const sealLeft = q('.seal-left')
    const sealRight = q('.seal-right')
    const crack = q('.seal-crack')
    const envParts = q('.env-fade')
    const glow = q('.bg-glow')
    const flash = q('.seal-flash')
    const sparks = q('.spark')
    const dust = q('.dust')
    const hint = q('.hint')
    const vignette = q('.vignette')
    const light = q('.light-burst')

    gsap.set(rig, {
      scale: 0.22,
      yPercent: 28,
      rotationX: 28,
      rotationY: -18,
      rotationZ: -6,
      transformPerspective: 1400,
      transformOrigin: '50% 60%',
      filter: 'blur(8px)',
      autoAlpha: 0.55,
    })
    gsap.set(lid, {
      rotationX: 0,
      transformOrigin: '50% 0%',
      transformPerspective: 1200,
      zIndex: 8,
    })
    gsap.set(letterSlot, { overflow: 'hidden' })
    gsap.set(letter, {
      // Tucked in the pocket; slot overflow clips any bottom spill
      yPercent: 22,
      scale: 0.96,
      autoAlpha: 0,
      zIndex: 3,
      transformOrigin: '50% 100%',
    })
    gsap.set(letterBits, { autoAlpha: 0, y: 22, filter: 'blur(4px)' })
    gsap.set(seal, { scale: 0.85, autoAlpha: 1 })
    gsap.set([sealLeft, sealRight], { x: 0, y: 0, rotation: 0, autoAlpha: 1 })
    gsap.set(crack, { scaleY: 0, autoAlpha: 0, transformOrigin: '50% 50%' })
    gsap.set(sparks, {
      autoAlpha: 0,
      scale: 0,
      x: 0,
      y: 0,
      rotation: 0,
    })
    gsap.set(dust, { autoAlpha: 0 })
    gsap.set(flash, { scale: 0.2, autoAlpha: 0 })
    gsap.set(light, { scale: 0.4, autoAlpha: 0 })
    gsap.set(vignette, { autoAlpha: 0.7 })

    // Ambient dust drift (loop, independent)
    gsap.utils.toArray<HTMLElement>(dust).forEach((el, i) => {
      const x = gsap.utils.random(-40, 40)
      const y = gsap.utils.random(-60, 40)
      gsap.set(el, {
        x: gsap.utils.random(-160, 160),
        y: gsap.utils.random(-120, 180),
        scale: gsap.utils.random(0.35, 1.1),
      })
      gsap.to(el, {
        x: `+=${x}`,
        y: `+=${y}`,
        autoAlpha: gsap.utils.random(0.15, 0.55),
        duration: gsap.utils.random(4, 8),
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.08,
      })
    })

    const tl = gsap.timeline({
      defaults: { ease: 'luxOut' },
      paused: true,
      onComplete: () => setDone(true),
    })

    // ── 1. Intro: cinematic approach ─────────────────
    tl.to(
      hint,
      { autoAlpha: 0, y: 12, duration: 0.45, ease: 'power2.in' },
      0,
    )
      .to(
        vignette,
        { autoAlpha: 0.35, duration: 1.8, ease: 'power2.out' },
        0,
      )
      .to(
        glow,
        { opacity: 1, duration: 2, ease: 'power2.out' },
        0,
      )
      .to(
        rig,
        {
          scale: 1,
          yPercent: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: 2.1,
          ease: 'luxIn',
        },
        0.15,
      )
      .to(
        seal,
        {
          scale: 1,
          duration: 1.4,
          ease: 'sealPop',
        },
        0.9,
      )
      // soft settle bounce
      .to(
        rig,
        {
          y: -8,
          duration: 0.55,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        1.9,
      )

    // ── 2. Seal tension + crack ──────────────────────
    tl.to(
      seal,
      {
        scale: 1.08,
        duration: 0.35,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
      },
      2.55,
    )
      .to(
        crack,
        {
          scaleY: 1,
          autoAlpha: 1,
          duration: 0.18,
          ease: 'power4.out',
        },
        2.95,
      )
      .to(
        flash,
        {
          scale: 2.4,
          autoAlpha: 0.85,
          duration: 0.15,
          ease: 'power2.out',
        },
        3.0,
      )
      .to(
        flash,
        {
          scale: 3.2,
          autoAlpha: 0,
          duration: 0.45,
          ease: 'power2.in',
        },
        3.12,
      )
      // seal halves shatter
      .to(
        sealLeft,
        {
          x: -72,
          y: 48,
          rotation: -38,
          autoAlpha: 0,
          duration: 0.85,
          ease: 'power3.out',
        },
        3.05,
      )
      .to(
        sealRight,
        {
          x: 78,
          y: 52,
          rotation: 42,
          autoAlpha: 0,
          duration: 0.85,
          ease: 'power3.out',
        },
        3.05,
      )
      .to(
        crack,
        { autoAlpha: 0, duration: 0.25 },
        3.25,
      )

    // Spark burst — radial + a few MotionPath arcs
    gsap.utils.toArray<HTMLElement>(sparks).forEach((el, i) => {
      const angle = (i / SPARK_COUNT) * Math.PI * 2 + gsap.utils.random(-0.2, 0.2)
      const dist = gsap.utils.random(40, 130)
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist * 0.75 + gsap.utils.random(10, 40)

      if (i % 5 === 0) {
        // Curved golden arcs via MotionPathPlugin
        const c1x = dx * 0.3 + gsap.utils.random(-30, 30)
        const c1y = dy * 0.2 - gsap.utils.random(20, 60)
        const c2x = dx * 0.7 + gsap.utils.random(-20, 20)
        const c2y = dy * 0.55 - gsap.utils.random(10, 40)
        tl.fromTo(
          el,
          { autoAlpha: 1, scale: gsap.utils.random(0.6, 1.3), x: 0, y: 0 },
          {
            motionPath: {
              path: [
                { x: 0, y: 0 },
                { x: c1x, y: c1y },
                { x: c2x, y: c2y },
                { x: dx, y: dy + 30 },
              ],
              curviness: 1.4,
            },
            rotation: gsap.utils.random(-220, 220),
            scale: 0,
            autoAlpha: 0,
            duration: gsap.utils.random(0.75, 1.25),
            ease: 'power2.out',
          },
          3.05 + i * 0.01,
        )
      } else {
        tl.fromTo(
          el,
          {
            autoAlpha: 1,
            scale: gsap.utils.random(0.4, 1.2),
            x: 0,
            y: 0,
            rotation: 0,
          },
          {
            x: dx,
            y: dy,
            rotation: gsap.utils.random(-180, 180),
            scale: 0,
            autoAlpha: 0,
            duration: gsap.utils.random(0.55, 1.1),
            ease: 'power2.out',
          },
          3.05 + i * 0.008,
        )
      }
    })

    // camera micro-shake on break
    tl.to(
      rig,
      {
        x: '+=6',
        duration: 0.05,
        yoyo: true,
        repeat: 5,
        ease: 'none',
      },
      3.05,
    )

    // ── 3. Lid opens (3D) ────────────────────────────
    tl.to(
      lid,
      {
        rotationX: 175,
        duration: 1.25,
        ease: 'paperOpen',
        onUpdate: function () {
          // swap depth after half-open so flap goes behind letter
          const rx = Number(gsap.getProperty(lid[0], 'rotationX'))
          if (rx > 90) gsap.set(lid, { zIndex: 2 })
        },
      },
      3.55,
    )
      .to(
        light,
        {
          scale: 1.6,
          autoAlpha: 0.55,
          duration: 0.7,
          ease: 'power2.out',
        },
        3.7,
      )
      .to(
        light,
        {
          scale: 2.2,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power2.inOut',
        },
        4.3,
      )

    // ── 4. Letter rises ──────────────────────────────
    // Peek while still clipped inside the pocket (no bottom spill)
    tl.set(letter, { autoAlpha: 1, zIndex: 4 }, 4.35)
      .to(
        letter,
        {
          yPercent: 10,
          scale: 0.97,
          duration: 0.5,
          ease: 'power2.out',
        },
        4.4,
      )
      // Stop clipping + lift slot above pocket so letter can exit on top
      .set(letterSlot, { overflow: 'visible', zIndex: 20 }, 4.85)
      .to(
        letter,
        {
          yPercent: -48,
          scale: 1,
          duration: 1.15,
          ease: 'letterLand',
        },
        4.85,
      )
      // slight paper flutter
      .to(
        letterInner,
        {
          rotationZ: -1.2,
          duration: 0.35,
          yoyo: true,
          repeat: 3,
          ease: 'sine.inOut',
        },
        4.9,
      )

    // ── 5. Envelope dissolves ────────────────────────
    tl.to(
      envParts,
      {
        autoAlpha: 0,
        y: 36,
        scale: 0.9,
        rotationZ: gsap.utils.wrap([-4, 3, -2, 5, 0]),
        duration: 1.2,
        stagger: 0.04,
        ease: 'power2.inOut',
      },
      5.7,
    )
      // letter becomes the hero card (centered above dissolved envelope)
      .to(
        letter,
        {
          yPercent: -40,
          scale: 1.06,
          duration: 1.15,
          ease: 'luxIn',
        },
        5.85,
      )
      .to(
        letterInner,
        {
          boxShadow:
            '0 32px 70px rgba(0,0,0,0.42), 0 2px 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(140,120,90,0.16)',
          duration: 1,
        },
        5.85,
      )
      .to(
        vignette,
        { autoAlpha: 0.2, duration: 1.2 },
        5.9,
      )

    // ── 6. Content reveal (stagger + deblur) ─────────
    tl.to(
      letterBits,
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
      },
      5.95,
    )

    // final ambient glow pulse
    tl.to(
      glow,
      {
        opacity: 0.85,
        duration: 1.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      },
      7.0,
    )

    tlRef.current = tl
  }, [])

  useEffect(() => {
    buildTimeline()
    const root = rootRef.current
    return () => {
      tlRef.current?.kill()
      tlRef.current = null
      if (root) gsap.killTweensOf(root.querySelectorAll('*'))
    }
  }, [buildTimeline])

  // Idle float before / until user starts — after approach is handled in main TL
  useEffect(() => {
    // auto-start cinematic sequence
    const t = window.setTimeout(() => {
      if (startedRef.current) return
      startedRef.current = true
      setStarted(true)
      tlRef.current?.play(0)
    }, 700)
    return () => clearTimeout(t)
  }, [])

  const startAnimation = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    setStarted(true)
    tlRef.current?.play(0)
  }, [])

  const sparks = Array.from({ length: SPARK_COUNT }, (_, i) => i)
  const dust = Array.from({ length: DUST_COUNT }, (_, i) => i)

  return (
    <main
      ref={rootRef}
      className={`scene${started ? ' is-started' : ''}${done ? ' is-done' : ''}`}
      onClick={startAnimation}
    >
      <div className="vignette" aria-hidden />
      <div className="bg-glow" aria-hidden />

      <div className="dust-layer" aria-hidden>
        {dust.map((i) => (
          <span key={i} className="dust" />
        ))}
      </div>

      <div className="stage">
        <div className="envelope-rig">
          <div className="light-burst" aria-hidden />

          <div className="env-back env-fade" aria-hidden />

          <div className="letter-slot">
            <article className="letter" aria-label="Свадебное приглашение">
              <div className="letter-inner">
                <p className="letter-ornament letter-anim">❧</p>
                <p className="letter-kicker letter-anim">Приглашение</p>
                <h1 className="letter-names letter-anim">
                  Юлия <span>&</span> Денис
                </h1>
                <div className="letter-divider letter-anim" />
                <p className="letter-text letter-anim">
                  Мы будем счастливы разделить с вами
                  <br />
                  радость нашего особенного дня
                </p>
                <p className="letter-date letter-anim">Скоро</p>
                <p className="letter-ornament bottom letter-anim">❧</p>
              </div>
            </article>
          </div>

          <div className="env-front env-fade" aria-hidden>
            <div className="env-panel env-left" />
            <div className="env-panel env-right" />
            <div className="env-panel env-bottom" />
          </div>

          <div className="env-lid env-fade" aria-hidden>
            <div className="lid-face lid-outside" />
            <div className="lid-face lid-inside" />
          </div>

          <div className="seal env-fade" aria-hidden>
            <div className="seal-flash" />
            <div className="seal-half seal-left">
              <img src={sealImg} alt="" draggable={false} />
            </div>
            <div className="seal-half seal-right">
              <img src={sealImg} alt="" draggable={false} />
            </div>
            <div className="seal-crack" />
            <div className="spark-origin">
              {sparks.map((i) => (
                <span key={i} className="spark" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {!started && <p className="hint">Нажмите, чтобы открыть</p>}
    </main>
  )
}

export default App
