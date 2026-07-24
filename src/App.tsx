import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './App.css'
import sealUrl from './assets/seal-cut.png'
import InviteScene from './InviteScene'

/**
 * Gatefold envelope opener → forest wedding invite.
 * Sequence: idle sealed doors → seal dissolves → doors open (3D) → invite reveal
 */
export default function App() {
  const stageRef = useRef<HTMLDivElement>(null)
  const leftDoorRef = useRef<HTMLDivElement>(null)
  const rightDoorRef = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLButtonElement>(null)
  const hintRef = useRef<HTMLSpanElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [opened, setOpened] = useState(false)
  const [busy, setBusy] = useState(false)
  const [inviteActive, setInviteActive] = useState(false)

  // Soft idle pulse on the seal
  useEffect(() => {
    if (opened || !sealRef.current) return
    const face = sealRef.current.querySelector('.seal__face')
    if (!face) return
    const t = gsap.to(face, {
      scale: 1.045,
      y: -3,
      duration: 1.9,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    return () => {
      t.kill()
    }
  }, [opened])

  const openInvite = useCallback(() => {
    if (busy || opened) return
    setBusy(true)

    const left = leftDoorRef.current
    const right = rightDoorRef.current
    const seal = sealRef.current
    const hint = hintRef.current
    if (!left || !right || !seal) return

    const face = seal.querySelector('.seal__face')
    if (face) gsap.killTweensOf(face)

    // Invite is already mounted under doors; activate mid-open for seamless reveal
    setInviteActive(true)

    const tl = gsap.timeline({
      onComplete: () => {
        setOpened(true)
        setBusy(false)
        document.body.classList.add('invite-open')
      },
    })
    tlRef.current = tl

    // 1) Seal dissolves
    if (hint) {
      tl.to(hint, { opacity: 0, duration: 0.4, ease: 'power2.out' }, 0)
    }
    tl.to(
      face || seal,
      {
        opacity: 0,
        scale: 0.86,
        filter: 'blur(3px)',
        duration: 0.9,
        ease: 'power2.out',
      },
      0.05,
    )
    tl.set(seal, { visibility: 'hidden', pointerEvents: 'none' }, 0.95)

    // 2) Doors open like French doors
    tl.to(
      left,
      {
        rotateY: -88,
        duration: 1.65,
        ease: 'power3.inOut',
      },
      0.45,
    )
    tl.to(
      right,
      {
        rotateY: 88,
        duration: 1.65,
        ease: 'power3.inOut',
      },
      0.45,
    )

    const seam = stageRef.current?.querySelector('.seam')
    if (seam) {
      tl.to(seam, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.55)
    }

    tl.to(
      [left, right],
      {
        opacity: 0,
        duration: 0.55,
        ease: 'power1.in',
      },
      1.7,
    )
    tl.set([left, right, seal], { visibility: 'hidden' }, 2.25)
  }, [busy, opened])

  useEffect(
    () => () => {
      tlRef.current?.kill()
    },
    [],
  )

  // Dev shortcut: ?open=1 skips envelope
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('open') === '1') {
      gsap.set(leftDoorRef.current, { rotateY: -90, opacity: 0, visibility: 'hidden' })
      gsap.set(rightDoorRef.current, { rotateY: 90, opacity: 0, visibility: 'hidden' })
      gsap.set(sealRef.current, { opacity: 0, visibility: 'hidden' })
      const seam = stageRef.current?.querySelector('.seam')
      if (seam) gsap.set(seam, { opacity: 0 })
      setInviteActive(true)
      setOpened(true)
      document.body.classList.add('invite-open')
    }
  }, [])

  return (
    <div className="stage" ref={stageRef} data-opened={opened || undefined}>
      {/* Full invitation (revealed under doors) */}
      <InviteScene active={inviteActive} />

      {/* Gatefold envelope doors */}
      <div className="doors" aria-hidden={opened}>
        <div className="door door--left" ref={leftDoorRef}>
          <div className="door__face">
            <div className="door__marble" />
            <div className="door__edge door__edge--inner" />
          </div>
        </div>
        <div className="door door--right" ref={rightDoorRef}>
          <div className="door__face">
            <div className="door__marble" />
            <div className="door__edge door__edge--inner" />
          </div>
        </div>
        <div className="seam" aria-hidden />
      </div>

      {/* Single seal on the center seam */}
      <button
        ref={sealRef}
        type="button"
        className="seal"
        onClick={openInvite}
        disabled={busy || opened}
        aria-label="Открыть приглашение"
      >
        <span className="seal__face">
          <img src={sealUrl} alt="Печать Ю & Д" draggable={false} />
        </span>
        <span className="seal__hint" ref={hintRef}>
          нажмите
        </span>
      </button>

      {!opened && !busy && (
        <button
          type="button"
          className="tap"
          onClick={openInvite}
          aria-label="Открыть приглашение"
        />
      )}
    </div>
  )
}
