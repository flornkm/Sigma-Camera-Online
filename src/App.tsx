import React, { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"

function App() {
  const webcamRef = useRef<Webcam>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGlitching, setIsGlitching] = useState(true)
  const [startupPhase, setStartupPhase] = useState<
    "off" | "powering" | "firmware" | "sensor" | "calibration" | "ready"
  >("off")
  const [showWebcam, setShowWebcam] = useState(false)
  const [showStartupLines, setShowStartupLines] = useState(false)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [isoValue, setIsoValue] = useState(250)
  const [isIsoChanging, setIsIsoChanging] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)
  const dialRef = useRef<HTMLDivElement>(null)
  const lastPositionRef = useRef({ x: 0, y: 0 })

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment",
  }

  useEffect(() => {
    setStartupPhase("off")

    setTimeout(() => {
      setStartupPhase("powering")
      playStartupSound()
      setTimeout(() => setShowStartupLines(true), 300)
    }, 500)

    setTimeout(() => {
      setStartupPhase("firmware")
    }, 1500)

    // Sensor initialization
    setTimeout(() => {
      setStartupPhase("sensor")
    }, 2500)

    setTimeout(() => {
      setStartupPhase("calibration")
    }, 3500)

    setTimeout(() => {
      setStartupPhase("ready")
      requestCameraPermission()
    }, 4500)

    const timer = setTimeout(() => {
      setIsGlitching(false)
    }, 4750)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const playStartupSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        400,
        audioContext.currentTime + 0.3
      )

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      )

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (e) {
      console.error("Audio context not supported", e)
    }
  }

  const requestCameraPermission = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setHasPermission(true)
        setError(null)
        setTimeout(() => {
          setShowWebcam(true)
          playShutterSound()
        }, 500)
      })
      .catch((err) => {
        console.error("Error accessing camera:", err)
        setHasPermission(false)
        setError(`Camera access denied: ${err.message}`)
      })
  }

  const playShutterSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
        audioContext.currentTime + 0.1
      )

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      )

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      console.error("Audio context not supported", e)
    }
  }

  const handleUserMediaError = (err: string | DOMException) => {
    console.error("Webcam error:", err)
    setError(`Webcam error: ${err instanceof DOMException ? err.message : err}`)
  }

  const renderStartupScreen = () => {
    switch (startupPhase) {
      case "off":
        return (
          <div className="absolute inset-0 bg-black flex items-center justify-center"></div>
        )
      case "powering":
        return (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-t-white border-r-white/30 border-b-white/10 border-l-white/50 rounded-full animate-spin"></div>
            <p className="text-white text-xs mt-4">POWERING ON</p>
            {showStartupLines && (
              <div className="absolute inset-x-0 top-20 px-8">
                <div className="text-[10px] text-green-500 font-mono space-y-1 opacity-70">
                  <p>INITIALIZING SYSTEM...</p>
                  <p>CHECKING MEMORY: 128MB OK</p>
                  <p>SENSOR: CMOS 24.2MP</p>
                  <p>LENS: DETECTED</p>
                  <p>BATTERY: 92%</p>
                  <p>STORAGE: 64GB AVAILABLE</p>
                </div>
              </div>
            )}
          </div>
        )
      case "firmware":
        return (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
            <div className="text-white text-xs mb-4">CAMERA SYSTEM</div>
            <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-progress"></div>
            </div>
            <p className="text-white text-xs mt-4">LOADING FIRMWARE v2.4.1</p>
            <div className="absolute bottom-20 left-0 right-0 flex justify-center">
              <p className="text-neutral-500 text-[8px]">DO NOT POWER OFF</p>
            </div>
          </div>
        )
      case "sensor":
        return (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
            <div className="text-white text-xs mb-4">INITIALIZING</div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-neutral-800 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                ></div>
              ))}
            </div>
            <p className="text-white text-xs mt-4">SENSOR INITIALIZATION</p>
          </div>
        )
      case "calibration":
        return (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
            <div className="text-white text-xs mb-4">CALIBRATING</div>
            <div className="mt-2 flex flex-col items-center">
              <div className="w-32 h-32 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 border border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 border border-white/40 rounded-full"></div>
                </div>
              </div>
              <p className="text-white/50 text-[8px] mt-2">
                FOCUS SYSTEM READY
              </p>
            </div>
          </div>
        )
      case "ready":
        if (hasPermission === null) {
          return (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
              <p className="text-white text-xs">REQUESTING CAMERA ACCESS...</p>
              <div className="mt-4 w-8 h-8 border-2 border-t-white border-r-white/30 border-b-white/10 border-l-white/50 rounded-full animate-spin"></div>
            </div>
          )
        }
        return null
      default:
        return null
    }
  }

  const playDialClickSound = () => {
    try {
      const now = Date.now()
      if (now - lastClickTime < 100) return

      setLastClickTime(now)

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(2000, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        1500,
        audioContext.currentTime + 0.05
      )

      gainNode.gain.setValueAtTime(0.03, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.05
      )

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.05)
    } catch (e) {
      console.error("Audio context not supported", e)
    }
  }

  const updateIsoValue = (angleDiff: number) => {
    // Update ISO value based on rotation direction
    setIsoValue((prevIso) => {
      // Clockwise rotation (positive angleDiff) increases ISO
      // Counter-clockwise rotation (negative angleDiff) decreases ISO
      const direction = angleDiff > 0 ? 1 : -1

      // Common ISO values: 100, 200, 400, 800, 1600, 3200, 6400
      const isoValues = [
        100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600,
        2000, 2500, 3200, 4000, 5000, 6400,
      ]

      // Find current ISO index
      const currentIndex = isoValues.indexOf(prevIso)

      // Calculate new index
      let newIndex = currentIndex + direction

      // Ensure index is within bounds
      if (newIndex < 0) newIndex = 0
      if (newIndex >= isoValues.length) newIndex = isoValues.length - 1

      const newValue = isoValues[newIndex]

      // Add visual feedback when ISO changes
      if (newValue !== prevIso) {
        setIsIsoChanging(true)
        setTimeout(() => setIsIsoChanging(false), 300)
      }

      return newValue
    })
  }

  const handleDialMouseDown = (e: React.MouseEvent) => {
    if (!dialRef.current) return

    setIsDragging(true)

    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const x = e.clientX - centerX
    const y = e.clientY - centerY
    lastPositionRef.current = { x, y }
  }

  const handleDialTouchStart = (e: React.TouchEvent) => {
    if (!dialRef.current || e.touches.length === 0) return

    // Prevent default to stop screen dragging
    e.preventDefault()

    setIsDragging(true)

    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const x = e.touches[0].clientX - centerX
    const y = e.touches[0].clientY - centerY
    lastPositionRef.current = { x, y }
  }

  const handleDialMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dialRef.current) return

    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const x = e.clientX - centerX
    const y = e.clientY - centerY

    const lastAngle = Math.atan2(
      lastPositionRef.current.y,
      lastPositionRef.current.x
    )
    const currentAngle = Math.atan2(y, x)

    let angleDiff = (currentAngle - lastAngle) * (180 / Math.PI)

    if (Math.abs(angleDiff) > 2) {
      playDialClickSound()
      updateIsoValue(angleDiff)
    }

    setRotationAngle((prevAngle) => prevAngle + angleDiff)

    lastPositionRef.current = { x, y }
  }

  const handleDialTouchMove = (e: TouchEvent) => {
    if (!isDragging || !dialRef.current || e.touches.length === 0) return

    // Prevent default to stop screen dragging
    e.preventDefault()

    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const x = e.touches[0].clientX - centerX
    const y = e.touches[0].clientY - centerY

    const lastAngle = Math.atan2(
      lastPositionRef.current.y,
      lastPositionRef.current.x
    )
    const currentAngle = Math.atan2(y, x)

    let angleDiff = (currentAngle - lastAngle) * (180 / Math.PI)

    if (Math.abs(angleDiff) > 2) {
      playDialClickSound()
      updateIsoValue(angleDiff)
    }

    setRotationAngle((prevAngle) => prevAngle + angleDiff)

    lastPositionRef.current = { x, y }
  }

  const handleDialEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleDialMouseMove)
    window.addEventListener("mouseup", handleDialEnd)
    // Change passive to false to allow preventDefault
    window.addEventListener("touchmove", handleDialTouchMove, {
      passive: false,
    })
    window.addEventListener("touchend", handleDialEnd)

    return () => {
      window.removeEventListener("mousemove", handleDialMouseMove)
      window.removeEventListener("mouseup", handleDialEnd)
      window.removeEventListener("touchmove", handleDialTouchMove)
      window.removeEventListener("touchend", handleDialEnd)
    }
  }, [isDragging])

  return (
    <main className="w-screen h-screen">
      <div
        className="absolute inset-0 w-full h-full object-cover mix-blend-soft-light opacity-40 z-10 pointer-events-none"
        style={{
          backgroundImage: "url('/noise.png')",
          backgroundSize: "720px",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="flex flex-row items-center justify-center h-full overflow-hidden max-[250px]:flex-col">
        <div className="flex-1 h-full w-full p-2 relative z-20">
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-neutral-900 to-neutral-800 rounded-lg p-4 shadow-inner shadow-black">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/25 opacity-10 rounded-lg" />

            {startupPhase === "ready" && showWebcam && (
              <>
                <div className="absolute truncate top-4 left-4 right-4 p-2 bg-black/50 backdrop-blur-sm text-white text-xs h-7 grid grid-cols-5 content-center justify-items-center">
                  <p className="border border-white rounded-sm px-2 align-middle">
                    1
                  </p>
                  <p>DNG</p>
                  <p>3:2</p>
                  <p className="flex items-center gap-1">
                    AF
                    <span className="text-xs bg-white text-black rounded-sm px-0.5">
                      S
                    </span>
                  </p>
                  <p className="flex items-center gap-1">AWB</p>
                </div>
                <div className="absolute truncate bottom-4 left-4 right-4 p-2 bg-black/50 backdrop-blur-sm text-white text-xs h-7 grid grid-cols-5 content-center justify-items-center">
                  <p className="truncate">1/2000</p>
                  <p>F2.8</p>
                  <p>+0.3</p>
                  <p className={isIsoChanging ? "text-yellow-300" : ""}>
                    <span className="text-[8px] mr-1">ISO</span>
                    {isoValue}
                  </p>
                  <p>STD.</p>
                </div>
              </>
            )}

            {renderStartupScreen()}

            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-75 rounded-lg">
                <p className="text-xs">
                  {error ||
                    "Camera access denied. Please allow camera access and reload the page."}
                </p>
              </div>
            )}

            {showWebcam && (
              <>
                <Webcam
                  audio={false}
                  height={720}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={1280}
                  videoConstraints={videoConstraints}
                  onUserMediaError={handleUserMediaError}
                  className="rounded-sm w-full h-full object-cover"
                />
              </>
            )}
          </div>
        </div>
        <div className="p-8">
          <div className="flex w-full gap-16 items-start">
            <div
              className={`rounded-full w-28 z-20 gap-1 flex items-center leading-none bg-black font-normal text-white h-10 px-8 relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:border before:border-white/30 before:rounded-full before:shadow-[0_0_5px_rgba(255,255,255,0.5)] ${
                isIsoChanging
                  ? "ring-2 ring-white/50 ring-offset-1 ring-offset-black/50"
                  : ""
              }`}
            >
              <span
                className={`text-[8px] mt-1.5 ${
                  isGlitching
                    ? "animate-glitch relative text-shadow-glitch"
                    : ""
                }`}
              >
                ISO
              </span>
              <span
                className={`${
                  isGlitching
                    ? "animate-glitch relative text-shadow-glitch"
                    : ""
                } ${isIsoChanging ? "text-yellow-300" : ""}`}
              >
                {isoValue}
              </span>
            </div>
            <button className="rounded-full transition-all duration-200 w-14 h-28 bg-gradient-to-r from-neutral-400 via-neutral-300 to-neutral-200 outline -outline-offset-1 outline-neutral-300 border-r-2 border-r-neutral-400 shadow-[5px_0_10px_rgba(0,0,0,0.2)] active:from-neutral-300 active:to-neutral-400/75 active:border-neutral-400 active:border active:shadow-none"></button>
          </div>
          <div className="relative ml-8 -mt-8 w-28 h-28">
            <div className="absolute inset-0 scale-105 -z-10 rounded-full bg-gradient-to-b from-neutral-400 to-neutral-600" />
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                ref={dialRef}
                className="absolute inset-0 bg-[url('/tile.png')] bg-repeat cursor-grab active:cursor-grabbing"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  touchAction: "none",
                }}
                onMouseDown={handleDialMouseDown}
                onTouchStart={handleDialTouchStart}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white to-transparent opacity-25 mix-blend-plus-lighter pointer-events-none" />
              <div className="absolute inset-0 rounded-full shadow-[inset_0_-10px_10px_rgba(0,0,0,0.5)] pointer-events-none" />
            </div>
            <div className="absolute inset-0 rounded-full border border-neutral-400 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-gradient-to-br from-neutral-500 to-neutral-300 w-12 h-12 rounded-full group relative">
                <button className="absolute inset-0.5 rounded-full bg-neutral-200 border border-neutral-500/50"></button>
              </div>
            </div>

            <div
              className="absolute w-0.5 h-0.5 rounded-full bg-black"
              style={{ left: "50%", top: "-14px" }}
            />
            <div
              className="absolute w-0.5 h-0.5 rounded-full bg-black"
              style={{ right: "-14px", top: "50%" }}
            />
            <div
              className="absolute w-0.5 h-0.5 rounded-full bg-black"
              style={{ left: "50%", bottom: "-14px" }}
            />
            <div
              className="absolute w-0.5 h-0.5 rounded-full bg-black"
              style={{ left: "-14px", top: "50%" }}
            />
          </div>
          <div className="flex w-full gap-8 pl-8 items-center mt-8 mb-2">
            <button className="rounded-full h-16 w-16 bg-gradient-to-br from-neutral-400 to-white relative before:content-[''] before:absolute before:inset-0 before:rounded-full before:p-[2px] before:-z-10 transition-all duration-200 group">
              <span className="absolute inset-1 rounded-full bg-neutral-300 border border-neutral-500/50 flex items-center justify-center group-active:scale-[0.98] transition-all duration-200 active:bg-neutral-400/25">
                <Triangle />
              </span>
            </button>
            <button className="rounded-full h-16 w-24 bg-gradient-to-br from-neutral-400 to-white relative before:content-[''] before:absolute before:inset-0 before:rounded-full before:p-[2px] before:-z-10 transition-all duration-200 group">
              <span className="absolute inset-1 rounded-full bg-neutral-300 border border-neutral-500/50 flex items-center justify-center group-active:scale-[0.98] transition-all duration-200 active:bg-neutral-400/25">
                <ThreeDots />
              </span>
            </button>
          </div>
          <button className="rounded-full ml-8 h-16 w-16 bg-gradient-to-br from-neutral-400 to-white relative before:content-[''] before:absolute before:inset-0 before:rounded-full before:p-[2px] before:-z-10 transition-all duration-200 group">
            <span className="absolute inset-1 rounded-full bg-neutral-300 border border-neutral-500/50 flex items-center justify-center group-active:scale-[0.98] transition-all duration-200 active:bg-neutral-400/25">
              <Dot />
            </span>
          </button>
        </div>
      </div>

      <style>
        {`
          .text-shadow-glitch {
            text-shadow: 1px 0 0 rgba(255, 0, 0, 0.5), -1px 0 0 rgba(0, 255, 255, 0.5);
          }
        `}
      </style>
    </main>
  )
}

export default App

function Triangle() {
  return (
    <svg
      width="11"
      height="10"
      viewBox="0 0 11 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_i_3194_12)">
        <path
          d="M0.5 9.2235V1.24477C0.5 0.889364 0.860375 0.647426 1.18932 0.781993L10.4278 4.56139C10.8336 4.72737 10.8445 5.29795 10.4454 5.47935L1.2069 9.67868C0.875852 9.82916 0.5 9.58714 0.5 9.2235Z"
          fill="black"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_3194_12"
          x="0.5"
          y="-0.255737"
          width="10.2385"
          height="9.97981"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.85 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_3194_12"
          />
        </filter>
      </defs>
    </svg>
  )
}

function ThreeDots() {
  return (
    <svg
      width="28"
      height="4"
      viewBox="0 0 28 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_i_3194_17)">
        <circle cx="2" cy="2" r="2" fill="black" />
      </g>
      <g filter="url(#filter1_i_3194_17)">
        <circle cx="14" cy="2" r="2" fill="black" />
      </g>
      <g filter="url(#filter2_i_3194_17)">
        <circle cx="26" cy="2" r="2" fill="black" />
      </g>
      <defs>
        <filter
          id="filter0_i_3194_17"
          x="0"
          y="-1"
          width="4"
          height="5"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.85 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_3194_17"
          />
        </filter>
        <filter
          id="filter1_i_3194_17"
          x="12"
          y="-1"
          width="4"
          height="5"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.85 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_3194_17"
          />
        </filter>
        <filter
          id="filter2_i_3194_17"
          x="24"
          y="-1"
          width="4"
          height="5"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.85 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_3194_17"
          />
        </filter>
      </defs>
    </svg>
  )
}

function Dot() {
  return (
    <svg
      width="4"
      height="4"
      viewBox="0 0 4 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_i_3194_14)">
        <circle cx="2" cy="2" r="2" fill="black" />
      </g>
      <defs>
        <filter
          id="filter0_i_3194_14"
          x="0"
          y="-1"
          width="4"
          height="5"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.85 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_3194_14"
          />
        </filter>
      </defs>
    </svg>
  )
}
