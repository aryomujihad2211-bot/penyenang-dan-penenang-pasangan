/**
 * PENENANG & PENYENANG PASANGAN
 * Master Application Logic, Canvas Universe, Ambient Audio Synth, & Reactive Stitch
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONTENT VARIATION BANK (DATA DINAMIS ANTI-BOSAN)
     ========================================================================== */
  const CONTENT_BANK = {
    // Bank Puisi Berbeda untuk Setiap Putaran (Replay Cycle)
    poems: [
      {
        theme: "Bintang & Ketenangan Jiwa",
        lines: [
          "Di antara bentangan langit malam yang hening,",
          "Namamu berbisik lembut, mengusir semua bising.",
          "Kala lelah merayap di pundak manismu yang letih,",
          "Ingatlah, semesta dan hatiku memelukmu tanpa pamrih.",
          "Tidurlah dengan damai, {nama}, ribuan bintang malam ini milikmu."
        ]
      },
      {
        theme: "Pelukan & Rumah Paling Nyaman",
        lines: [
          "Malam tidak pernah benar-benar dingin atau sepi,",
          "Selama rindu dan kasih ini masih terhembus rapi.",
          "Untukmu, {nama}, tempat di mana segala gundahku reda,",
          "Senyumanmu adalah rumah paling kurindukan di dunia.",
          "Pejamkan matamu sayang, biarkan doaku sampai ke mimpimu."
        ]
      },
      {
        theme: "Cakrawala Harapan & Janji Abadi",
        lines: [
          "Seberkas bintang jatuh melintas di kelam cakrawala,",
          "Membawa satu doa tulus yang takkan pernah jeda.",
          "Bahwa bahagia berhak menetap abadi di binar matamu, {nama},",
          "Tak peduli seberapa berat hari yang telah terlewati,",
          "Esok mentari baru dan peluk hangatku akan menyambutmu kembali."
        ]
      }
    ],

    // Variasi Teks Bujukan Lucu Tombol "Tidak"
    rejectionPleas: [
      "Yakin nih gak mau? Nanti nyesel lho... 🥺",
      "Masa ditolak sih? Stitch udah dandan wangi gini! 😢💙",
      "Ayolah sayang, pencet 'Iya' dong, cuma sekali klik aja kok~ 💕",
      "Tombol 'Tidak'-nya lagi ngambek, harus pencet 'Iya' pokoknya! 😜",
      "Stitch bakal pasang muka gemoy terus sampai kamu pencet 'Iya'! 🥰",
      "Ih tega banget masa ditolak... Coba sentuh tombol 'Iya' sekali aja deh! 🌸"
    ],

    // Variasi Ucapan Selamat Tidur / Pamit
    farewellMessages: [
      "Tidurlah dengan nyenyak kesayanganku. Biarkan semua lelahmu hanyut bersama debu bintang malam ini. Sampai jumpa di hari esok yang lebih indah! 🌙✨",
      "Lepaskan seluruh beban pikiran hari ini. Kamu sudah berjuang sangat hebat. Selamat beristirahat dalam pelukan malam yang damai. 🧸💙",
      "Mimpikan hal-hal yang manis ya sayang. Stitch dan aku selalu menjagamu dari kejauhan. Good night, my favorite person! 💤💫"
    ],

    // Kata-kata yang tidak pantas (Sentiment Negative Filter)
    harshWords: [
      "anjing", "babi", "bangsat", "kontol", "memek", "brengsek", "tolol", 
      "bodoh", "goblok", "benci", "jelek", "mati", "bacot", "tai", "kampret",
      "sialan", "beban", "males", "malas", "marah", "muak", "najis"
    ],

    // Kata-kata romantis / positif penguat
    sweetWords: [
      "sayang", "cinta", "tenang", "peluk", "rindu", "damai", "bahagia",
      "kamu", "kita", "nyaman", "indah", "malam", "terima kasih", "suka",
      "kasih", "senang", "bintang", "tidur", "mimpi", "sejuk", "hangat"
    ]
  };

  /* ==========================================================================
     2. GLOBAL APP STATE
     ========================================================================== */
  const AppState = {
    partnerName: "",
    currentScreen: "screen-welcome",
    cycleCount: 0,
    pleaIndex: 0,
    audioPlaying: false,
    audioInitialized: false,
    dodgeCount: 0
  };

  /* ==========================================================================
     3. AMBIENT WEB AUDIO SYNTHESIZER (ZERO-DEPENDENCY AUDIO)
     ========================================================================== */
  class AmbientSoundEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.isPlaying = false;
      this.intervalId = null;
    }

    init() {
      if (this.ctx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    // Mainkan Lofi Night Calm Chord Pad (Pentatonic Peaceful Arpeggios)
    playCalmPad() {
      if (!this.ctx) this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.isPlaying = true;
      const chordProgression = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G6
      ];

      let chordIdx = 0;

      const triggerChord = () => {
        if (!this.isPlaying) return;
        const freqs = chordProgression[chordIdx];
        chordIdx = (chordIdx + 1) % chordProgression.length;

        freqs.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          // Warm Soft Low-pass Filter
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, this.ctx.currentTime);

          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          // Soft ambient fade in and fade out
          const now = this.ctx.currentTime;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 1.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now + i * 0.15);
          osc.stop(now + 5.0);
        });
      };

      triggerChord();
      this.intervalId = setInterval(triggerChord, 4600);
    }

    stopCalmPad() {
      this.isPlaying = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }

    // Dentang Bintang / Sparkle Celestial Chime
    playSparkleChime() {
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const now = this.ctx.currentTime;

      freqs.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.001, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.05, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.9);
      });
    }

    // Detak Jantung Romantis
    playHeartbeat() {
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      [0, 0.22].forEach(delay => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, now + delay);
        osc.frequency.exponentialRampToValueAtTime(35, now + delay + 0.15);

        gain.gain.setValueAtTime(0.09, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.25);
      });
    }
  }

  const soundEngine = new AmbientSoundEngine();

  /* ==========================================================================
     4. STARFIELD & SHOOTING STAR CANVAS ENGINE
     ========================================================================== */
  class UniverseCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.stars = [];
      this.shootingStars = [];
      this.maxStars = 120;
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.resize();
      this.initStars();
      this.bindEvents();
      this.animate();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.initStars();
      });
    }

    initStars() {
      this.stars = [];
      for (let i = 0; i < this.maxStars; i++) {
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 1.6 + 0.4,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          color: Math.random() > 0.8 ? '#fde68a' : (Math.random() > 0.5 ? '#e0f2fe' : '#ffffff')
        });
      }
    }

    spawnShootingStar() {
      const startX = Math.random() * (this.width * 0.8) + (this.width * 0.1);
      const startY = Math.random() * (this.height * 0.3);
      const angle = (Math.PI / 4) + (Math.random() * 0.2 - 0.1); // ~45 degrees
      const speed = Math.random() * 8 + 10;
      const length = Math.random() * 90 + 70;

      this.shootingStars.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: length,
        life: 0,
        maxLife: Math.random() * 30 + 35
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render & Twinkle Stars
      for (let star of this.stars) {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.25) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = star.color;
        this.ctx.globalAlpha = star.alpha;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = star.color;
        this.ctx.fill();
      }

      // Randomly spawn shooting stars occasionally
      if (Math.random() < 0.015 && this.shootingStars.length < 3) {
        this.spawnShootingStar();
      }

      // Render Shooting Stars
      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
        const s = this.shootingStars[i];
        s.x += s.dx;
        s.y += s.dy;
        s.life++;

        const tailX = s.x - (s.dx / 12) * s.length;
        const tailY = s.y - (s.dy / 12) * s.length;

        const grad = this.ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, 'rgba(254, 240, 138, 1)');
        grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.7)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.beginPath();
        this.ctx.moveTo(s.x, s.y);
        this.ctx.lineTo(tailX, tailY);
        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = 2.2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#fef08a';
        this.ctx.stroke();

        if (s.life >= s.maxLife || s.x > this.width || s.y > this.height) {
          this.shootingStars.splice(i, 1);
        }
      }

      this.ctx.globalAlpha = 1.0;
      this.ctx.shadowBlur = 0;
      requestAnimationFrame(() => this.animate());
    }
  }

  /* ==========================================================================
     5. STITCH SVG VECTOR ENGINE (MULTI-STATE EXPRESSIONS)
     ========================================================================== */
  const StitchRenderer = {
    // 1. Stitch Melambai Ramah (Welcome & Farewell)
    getWavingSVG() {
      return `
        <svg class="stitch-svg" width="160" height="150" viewBox="0 0 200 180">
          <defs>
            <radialGradient id="stitchBlue" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stop-color="#5a95f0"/>
              <stop offset="100%" stop-color="#3665b8"/>
            </radialGradient>
            <radialGradient id="stitchEarPink" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#f8a5b7"/>
              <stop offset="100%" stop-color="#de6f87"/>
            </radialGradient>
            <radialGradient id="stitchBelly" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#9dcbff"/>
              <stop offset="100%" stop-color="#72aaf2"/>
            </radialGradient>
          </defs>

          <!-- Telinga Kiri -->
          <g class="stitch-ear-left">
            <path d="M70,85 C25,45 10,10 20,5 C35,0 75,55 85,80 Z" fill="url(#stitchBlue)"/>
            <path d="M65,80 C32,45 22,20 28,15 C38,10 70,55 78,76 Z" fill="url(#stitchEarPink)"/>
          </g>

          <!-- Telinga Kanan -->
          <g class="stitch-ear-right">
            <path d="M130,85 C175,45 190,10 180,5 C165,0 125,55 115,80 Z" fill="url(#stitchBlue)"/>
            <path d="M135,80 C168,45 178,20 172,15 C162,10 130,55 122,76 Z" fill="url(#stitchEarPink)"/>
          </g>

          <!-- Tubuh & Kepala -->
          <g class="stitch-body-group">
            <ellipse cx="100" cy="140" rx="42" ry="32" fill="url(#stitchBlue)"/>
            <ellipse cx="100" cy="138" rx="28" ry="22" fill="url(#stitchBelly)"/>

            <!-- Kaki Duduk Lucu -->
            <ellipse cx="68" cy="162" rx="14" ry="10" fill="url(#stitchBlue)"/>
            <circle cx="68" cy="162" r="6" fill="url(#stitchBelly)"/>
            <ellipse cx="132" cy="162" rx="14" ry="10" fill="url(#stitchBlue)"/>
            <circle cx="132" cy="162" r="6" fill="url(#stitchBelly)"/>

            <!-- Kepala Bulat Imut -->
            <ellipse cx="100" cy="95" rx="46" ry="38" fill="url(#stitchBlue)"/>

            <!-- Lingkaran Mata Biru Muda -->
            <ellipse cx="80" cy="94" rx="15" ry="17" fill="url(#stitchBelly)"/>
            <ellipse cx="120" cy="94" rx="15" ry="17" fill="url(#stitchBelly)"/>

            <!-- Bola Mata Berbinar -->
            <g class="stitch-pupil">
              <ellipse cx="82" cy="94" rx="9" ry="12" fill="#131a2c"/>
              <circle cx="85" cy="90" r="3.5" fill="#ffffff"/>
              <circle cx="80" cy="97" r="1.5" fill="#ffffff"/>

              <ellipse cx="118" cy="94" rx="9" ry="12" fill="#131a2c"/>
              <circle cx="121" cy="90" r="3.5" fill="#ffffff"/>
              <circle cx="116" cy="97" r="1.5" fill="#ffffff"/>
            </g>

            <!-- Hidung Biru Tua -->
            <ellipse cx="100" cy="106" rx="9" ry="6" fill="#1e3a8a"/>

            <!-- Senyuman Manis -->
            <path d="M88,116 Q100,126 112,116" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round" fill="none"/>
            <ellipse cx="100" cy="119" rx="5" ry="2.5" fill="#f87171" opacity="0.6"/>

            <!-- Tangan Kiri Diam -->
            <ellipse cx="66" cy="135" rx="9" ry="12" fill="url(#stitchBlue)"/>

            <!-- Tangan Kanan Melambai Ceria -->
            <g class="stitch-waving-arm">
              <path d="M130,132 Q150,110 148,96 Q140,94 132,112 Z" fill="url(#stitchBlue)"/>
              <circle cx="148" cy="96" r="6" fill="url(#stitchBlue)"/>
            </g>
          </g>
        </svg>
      `;
    },

    // 2. Stitch Mengintip dari Atas Form (Name Input)
    getPeekingSVG() {
      return `
        <svg class="stitch-svg" width="160" height="110" viewBox="0 0 200 130">
          <defs>
            <radialGradient id="stitchBluePeek" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stop-color="#5a95f0"/>
              <stop offset="100%" stop-color="#3665b8"/>
            </radialGradient>
            <radialGradient id="stitchEarPinkPeek" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#f8a5b7"/>
              <stop offset="100%" stop-color="#de6f87"/>
            </radialGradient>
            <radialGradient id="stitchBellyPeek" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#9dcbff"/>
              <stop offset="100%" stop-color="#72aaf2"/>
            </radialGradient>
          </defs>

          <!-- Telinga Mengarah ke Samping Penasaran -->
          <g class="stitch-ear-left">
            <path d="M65,75 C20,40 5,8 15,3 C30,-2 70,48 80,70 Z" fill="url(#stitchBluePeek)"/>
            <path d="M60,70 C28,38 18,15 24,11 C34,7 65,48 73,67 Z" fill="url(#stitchEarPinkPeek)"/>
          </g>
          <g class="stitch-ear-right">
            <path d="M135,75 C180,40 195,8 185,3 C170,-2 130,48 120,70 Z" fill="url(#stitchBluePeek)"/>
            <path d="M140,70 C172,38 182,15 176,11 C166,7 135,48 127,67 Z" fill="url(#stitchEarPinkPeek)"/>
          </g>

          <g class="stitch-body-group">
            <!-- Kepala Mengintip -->
            <ellipse cx="100" cy="80" rx="46" ry="36" fill="url(#stitchBluePeek)"/>
            <ellipse cx="80" cy="78" rx="14" ry="16" fill="url(#stitchBellyPeek)"/>
            <ellipse cx="120" cy="78" rx="14" ry="16" fill="url(#stitchBellyPeek)"/>

            <!-- Mata Melirik ke Bawah (Ke Form Input) -->
            <g class="stitch-pupil">
              <ellipse cx="82" cy="82" rx="8" ry="10" fill="#131a2c"/>
              <circle cx="84" cy="80" r="3" fill="#ffffff"/>
              <ellipse cx="118" cy="82" rx="8" ry="10" fill="#131a2c"/>
              <circle cx="120" cy="80" r="3" fill="#ffffff"/>
            </g>

            <ellipse cx="100" cy="90" rx="8" ry="5.5" fill="#1e3a8a"/>
            <path d="M90,98 Q100,105 110,98" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round" fill="none"/>

            <!-- Dua Cakar Mungil Menempel di Bibir Kartu -->
            <rect x="66" y="106" width="18" height="12" rx="6" fill="url(#stitchBluePeek)"/>
            <circle cx="70" cy="114" r="2" fill="#1e3a8a"/>
            <circle cx="75" cy="115" r="2" fill="#1e3a8a"/>
            <circle cx="80" cy="114" r="2" fill="#1e3a8a"/>

            <rect x="116" y="106" width="18" height="12" rx="6" fill="url(#stitchBluePeek)"/>
            <circle cx="120" cy="114" r="2" fill="#1e3a8a"/>
            <circle cx="125" cy="115" r="2" fill="#1e3a8a"/>
            <circle cx="130" cy="114" r="2" fill="#1e3a8a"/>
          </g>
        </svg>
      `;
    },

    // 3. Stitch Memeluk Love Besar (Phrase Screen)
    getLoveSVG() {
      return `
        <svg class="stitch-svg" width="170" height="160" viewBox="0 0 200 190">
          <defs>
            <radialGradient id="stitchBlueLove" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stop-color="#5a95f0"/>
              <stop offset="100%" stop-color="#3665b8"/>
            </radialGradient>
            <radialGradient id="stitchEarLove" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#f8a5b7"/>
              <stop offset="100%" stop-color="#de6f87"/>
            </radialGradient>
            <radialGradient id="heartGrad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stop-color="#ff758c"/>
              <stop offset="60%" stop-color="#ff4365"/>
              <stop offset="100%" stop-color="#c9184a"/>
            </radialGradient>
          </defs>

          <!-- Telinga Melebar Bahagia -->
          <g class="stitch-ear-left">
            <path d="M70,80 C20,40 5,8 15,3 C30,-2 75,50 85,75 Z" fill="url(#stitchBlueLove)"/>
            <path d="M65,75 C28,38 18,15 24,11 C34,7 70,50 78,72 Z" fill="url(#stitchEarLove)"/>
          </g>
          <g class="stitch-ear-right">
            <path d="M130,80 C180,40 195,8 185,3 C170,-2 125,50 115,75 Z" fill="url(#stitchBlueLove)"/>
            <path d="M135,75 C172,38 182,15 176,11 C166,7 130,50 122,72 Z" fill="url(#stitchEarLove)"/>
          </g>

          <!-- Kepala & Mata Berbinar Cinta -->
          <g class="stitch-body-group">
            <ellipse cx="100" cy="85" rx="46" ry="38" fill="url(#stitchBlueLove)"/>
            <ellipse cx="80" cy="84" rx="14" ry="16" fill="#8bc2ff"/>
            <ellipse cx="120" cy="84" rx="14" ry="16" fill="#8bc2ff"/>

            <!-- Mata Berbentuk Hati Berbinar -->
            <path d="M80,82 C77,77 71,78 71,83 C71,88 80,93 80,93 C80,93 89,88 89,83 C89,78 83,77 80,82 Z" fill="#ff4365"/>
            <path d="M120,82 C117,77 111,78 111,83 C111,88 120,93 120,93 C120,93 129,88 129,83 C129,78 123,77 120,82 Z" fill="#ff4365"/>

            <ellipse cx="100" cy="94" rx="8" ry="5.5" fill="#1e3a8a"/>
            <!-- Senyuman Lebar Bahagia -->
            <path d="M86,102 Q100,114 114,102" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round" fill="none"/>

            <!-- Hati Raksasa Berdenyut di Pelukan Stitch -->
            <g class="stitch-heart-big">
              <path d="M100,115 C75,80 40,105 55,135 C65,155 100,178 100,178 C100,178 135,155 145,135 C160,105 125,80 100,115 Z" fill="url(#heartGrad)"/>
              <!-- Kilau Cinta di Permukaan Hati -->
              <ellipse cx="78" cy="115" rx="12" ry="6" fill="#ffffff" opacity="0.35" transform="rotate(-30 78 115)"/>
            </g>

            <!-- Tangan Memeluk Erat Hati -->
            <ellipse cx="60" cy="138" rx="10" ry="14" fill="url(#stitchBlueLove)" transform="rotate(30 60 138)"/>
            <ellipse cx="140" cy="138" rx="10" ry="14" fill="url(#stitchBlueLove)" transform="rotate(-30 140 138)"/>
          </g>
        </svg>
      `;
    },

    // 4. Stitch Sedih / Menangis (Q&A Kata Kasar Terdeteksi)
    getSadSVG() {
      return `
        <svg class="stitch-svg" width="160" height="150" viewBox="0 0 200 180">
          <defs>
            <radialGradient id="stitchBlueSad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stop-color="#4a76bc"/>
              <stop offset="100%" stop-color="#2a4b85"/>
            </radialGradient>
            <radialGradient id="stitchEarPinkSad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#e391a3"/>
              <stop offset="100%" stop-color="#b8556b"/>
            </radialGradient>
          </defs>

          <!-- Telinga Menurun Layu -->
          <g class="stitch-ear-left" style="transform: rotate(25deg); transform-origin: 60px 85px;">
            <path d="M60,85 C20,95 5,120 12,126 C25,132 55,95 65,90 Z" fill="url(#stitchBlueSad)"/>
            <path d="M55,88 C26,98 16,118 20,121 C27,124 50,96 58,92 Z" fill="url(#stitchEarPinkSad)"/>
          </g>
          <g class="stitch-ear-right" style="transform: rotate(-25deg); transform-origin: 140px 85px;">
            <path d="M140,85 C180,95 195,120 188,126 C175,132 145,95 135,90 Z" fill="url(#stitchBlueSad)"/>
            <path d="M145,88 C174,98 184,118 180,121 C173,124 150,96 142,92 Z" fill="url(#stitchEarPinkSad)"/>
          </g>

          <g class="stitch-body-group">
            <ellipse cx="100" cy="140" rx="38" ry="30" fill="url(#stitchBlueSad)"/>
            <!-- Kepala Tertunduk Sedih -->
            <ellipse cx="100" cy="95" rx="44" ry="36" fill="url(#stitchBlueSad)"/>

            <!-- Mata Berkaca-kaca Sedih -->
            <ellipse cx="80" cy="94" rx="14" ry="16" fill="#6f98d4"/>
            <ellipse cx="120" cy="94" rx="14" ry="16" fill="#6f98d4"/>

            <ellipse cx="82" cy="98" rx="8" ry="9" fill="#131a2c"/>
            <circle cx="85" cy="95" r="3" fill="#93c5fd"/>

            <ellipse cx="118" cy="98" rx="8" ry="9" fill="#131a2c"/>
            <circle cx="115" cy="95" r="3" fill="#93c5fd"/>

            <!-- Air Mata Kristal Mengalir -->
            <path d="M78,105 C75,108 73,115 76,120 C79,120 81,114 78,105 Z" fill="#93c5fd" class="stitch-tear-drop"/>
            <path d="M122,105 C125,108 127,115 124,120 C121,120 119,114 122,105 Z" fill="#93c5fd" class="stitch-tear-drop" style="animation-delay: 0.8s;"/>

            <ellipse cx="100" cy="106" rx="8" ry="5.5" fill="#1e3a8a"/>

            <!-- Mulut Bergetar Sedih (Lengkung Terbalik) -->
            <path d="M90,120 Q100,113 110,120" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round" fill="none"/>

            <!-- Tangan Mengusap Dada -->
            <ellipse cx="78" cy="138" rx="9" ry="13" fill="url(#stitchBlueSad)"/>
            <ellipse cx="122" cy="138" rx="9" ry="13" fill="url(#stitchBlueSad)"/>
          </g>
        </svg>
      `;
    },

    // 5. Stitch Bahagia & Melompat (Q&A Kata Romantis Diterima)
    getHappySVG() {
      return `
        <svg class="stitch-svg stitch-happy-jump" width="160" height="150" viewBox="0 0 200 180">
          <defs>
            <radialGradient id="stitchBlueHappy" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stop-color="#5fa0f8"/>
              <stop offset="100%" stop-color="#3b72cb"/>
            </radialGradient>
            <radialGradient id="stitchEarPinkHappy" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffa6b9"/>
              <stop offset="100%" stop-color="#eb768f"/>
            </radialGradient>
          </defs>

          <!-- Telinga Terangkat Ceria -->
          <path d="M65,75 C15,35 0,2 10,0 C25,-3 70,45 80,70 Z" fill="url(#stitchBlueHappy)"/>
          <path d="M60,70 C22,35 12,12 18,9 C28,6 65,45 73,67 Z" fill="url(#stitchEarPinkHappy)"/>

          <path d="M135,75 C185,35 200,2 190,0 C175,-3 130,45 120,70 Z" fill="url(#stitchBlueHappy)"/>
          <path d="M140,70 C178,35 188,12 182,9 C172,6 135,45 127,67 Z" fill="url(#stitchEarPinkHappy)"/>

          <!-- Tubuh & Kepala -->
          <ellipse cx="100" cy="130" rx="38" ry="30" fill="url(#stitchBlueHappy)"/>
          <ellipse cx="100" cy="85" rx="46" ry="38" fill="url(#stitchBlueHappy)"/>

          <!-- Mata Menyipit Bahagia (Kurva Senyum) -->
          <path d="M74,84 Q82,74 90,84" stroke="#131a2c" stroke-width="4.5" stroke-linecap="round" fill="none"/>
          <path d="M110,84 Q118,74 126,84" stroke="#131a2c" stroke-width="4.5" stroke-linecap="round" fill="none"/>

          <!-- Pipi Merona Pink -->
          <circle cx="72" cy="94" r="7" fill="#fb7185" opacity="0.6"/>
          <circle cx="128" cy="94" r="7" fill="#fb7185" opacity="0.6"/>

          <ellipse cx="100" cy="92" rx="8" ry="5.5" fill="#1e3a8a"/>

          <!-- Senyuman Terbuka Lebar -->
          <path d="M86,98 Q100,118 114,98 Z" fill="#be123c"/>
          <path d="M92,109 Q100,116 108,109" fill="#fda4af"/>

          <!-- Kedua Tangan Terangkat ke Atas Hore -->
          <ellipse cx="58" cy="110" rx="9" ry="16" fill="url(#stitchBlueHappy)" transform="rotate(-35 58 110)"/>
          <ellipse cx="142" cy="110" rx="9" ry="16" fill="url(#stitchBlueHappy)" transform="rotate(35 142 110)"/>
        </svg>
      `;
    },

    // 6. Stitch Mempersembahkan Hadiah (Cincin & Bunga Screen)
    getGiftSVG() {
      return `
        <svg class="stitch-svg" width="160" height="150" viewBox="0 0 200 180">
          <defs>
            <radialGradient id="stitchBlueGift" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stop-color="#5593ed"/>
              <stop offset="100%" stop-color="#3466b9"/>
            </radialGradient>
            <radialGradient id="stitchEarPinkGift" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fba1b4"/>
              <stop offset="100%" stop-color="#e36d85"/>
            </radialGradient>
          </defs>

          <!-- Telinga Lembut -->
          <path d="M70,80 C25,45 10,12 20,7 C35,2 75,55 85,78 Z" fill="url(#stitchBlueGift)"/>
          <path d="M65,76 C32,45 22,22 28,17 C38,12 70,55 78,74 Z" fill="url(#stitchEarPinkGift)"/>

          <path d="M130,80 C175,45 190,12 180,7 C165,2 125,55 115,78 Z" fill="url(#stitchBlueGift)"/>
          <path d="M135,76 C168,45 178,22 172,17 C162,12 130,55 122,74 Z" fill="url(#stitchEarPinkGift)"/>

          <g class="stitch-body-group">
            <ellipse cx="100" cy="138" rx="40" ry="30" fill="url(#stitchBlueGift)"/>
            <ellipse cx="100" cy="90" rx="46" ry="36" fill="url(#stitchBlueGift)"/>

            <!-- Mata Berbinar Penuh Harap -->
            <ellipse cx="80" cy="88" rx="14" ry="16" fill="#8bc2ff"/>
            <ellipse cx="120" cy="88" rx="14" ry="16" fill="#8bc2ff"/>

            <g class="stitch-pupil">
              <ellipse cx="82" cy="88" rx="8" ry="11" fill="#131a2c"/>
              <circle cx="85" cy="84" r="3.5" fill="#ffffff"/>
              <circle cx="80" cy="91" r="1.5" fill="#ffffff"/>

              <ellipse cx="118" cy="88" rx="8" ry="11" fill="#131a2c"/>
              <circle cx="121" cy="84" r="3.5" fill="#ffffff"/>
              <circle cx="116" cy="91" r="1.5" fill="#ffffff"/>
            </g>

            <ellipse cx="100" cy="98" rx="8" ry="5.5" fill="#1e3a8a"/>
            <!-- Senyum Manis Menawan -->
            <path d="M88,106 Q100,118 112,106" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round" fill="none"/>

            <!-- Kedua Tangan Menyodorkan ke Depan -->
            <ellipse cx="70" cy="132" rx="11" ry="14" fill="url(#stitchBlueGift)" transform="rotate(20 70 132)"/>
            <ellipse cx="130" cy="132" rx="11" ry="14" fill="url(#stitchBlueGift)" transform="rotate(-20 130 132)"/>

            <!-- Pita Berkilau di Bawah Tangan -->
            <path d="M80,140 Q100,146 120,140 Q100,154 80,140" fill="#fbcfe8"/>
          </g>
        </svg>
      `;
    }
  };

  /* ==========================================================================
     6. APP NAVIGATION & SCREEN CONTROLLER
     ========================================================================== */
  function navigateTo(screenId, themeClass) {
    const screens = document.querySelectorAll('.app-screen');
    screens.forEach(s => s.classList.remove('active'));

    const targetScreen = document.getElementById(screenId);
    if (!targetScreen) return;

    // Smooth background gradient theme transition
    document.body.className = themeClass;

    // Small delay for clean entrance transition
    setTimeout(() => {
      targetScreen.classList.add('active');
    }, 60);

    AppState.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Audio chime on navigation
    soundEngine.playSparkleChime();
  }

  /* ==========================================================================
     7. INITIALIZATION & DOM EVENT BINDINGS
     ========================================================================== */
  function initApp() {
    // 1. Initialize Universe Canvas
    new UniverseCanvas('universe-canvas');

    // 2. Render initial Stitch animations
    document.getElementById('stitch-welcome-container').innerHTML = StitchRenderer.getWavingSVG();
    document.getElementById('stitch-name-container').innerHTML = StitchRenderer.getPeekingSVG();
    document.getElementById('stitch-phrase-container').innerHTML = StitchRenderer.getLoveSVG();
    document.getElementById('stitch-gate-container').innerHTML = StitchRenderer.getWavingSVG();
    document.getElementById('stitch-qna-container').innerHTML = StitchRenderer.getHappySVG();
    document.getElementById('stitch-gift-container').innerHTML = StitchRenderer.getGiftSVG();
    document.getElementById('stitch-replay-container').innerHTML = StitchRenderer.getWavingSVG();
    document.getElementById('stitch-exit-container').innerHTML = StitchRenderer.getWavingSVG();

    // 3. Audio Controls
    const audioBtn = document.getElementById('audio-toggle-btn');
    const soundWave = document.getElementById('sound-wave');
    const audioStatusText = document.getElementById('audio-status-text');

    function toggleAudio() {
      if (!AppState.audioPlaying) {
        soundEngine.playCalmPad();
        AppState.audioPlaying = true;
        soundWave.classList.add('playing');
        audioStatusText.textContent = "Alunan Musik 🎵";
      } else {
        soundEngine.stopCalmPad();
        AppState.audioPlaying = false;
        soundWave.classList.remove('playing');
        audioStatusText.textContent = "Hening 🔇";
      }
    }

    audioBtn.addEventListener('click', toggleAudio);

    // 4. FRAME 1: Welcome Screen Buttons
    document.getElementById('btn-start-play').addEventListener('click', () => {
      // Auto-start ambient music if not already started
      if (!AppState.audioPlaying) {
        toggleAudio();
      }
      navigateTo('screen-name', 'theme-frame-2');
      setTimeout(() => {
        document.getElementById('partner-name-input').focus();
      }, 300);
    });

    document.getElementById('btn-welcome-exit').addEventListener('click', () => {
      showExitScreen();
    });

    document.getElementById('quick-exit-btn').addEventListener('click', () => {
      showExitScreen();
    });

    // 5. FRAME 2: Name Input Submission
    const nameForm = document.getElementById('form-name');
    const nameInput = document.getElementById('partner-name-input');
    const nameErrorMsg = document.getElementById('name-error-msg');

    function handleNameSubmit() {
      const nameVal = nameInput.value.trim();
      if (!nameVal || nameVal.length < 2) {
        nameErrorMsg.textContent = "Nama manisnya diisi dulu yaa, minimal 2 huruf... 🥺💙";
        soundEngine.playHeartbeat();
        return;
      }
      nameErrorMsg.textContent = "";
      AppState.partnerName = nameVal;

      // Update personalized titles across screens
      document.getElementById('poetry-partner-title').textContent = `Untukmu, ${AppState.partnerName} Tersayang`;
      document.getElementById('qna-header-title').textContent = `Apa yang Membuat Hatimu Damai, ${AppState.partnerName}?`;

      navigateTo('screen-phrase', 'theme-frame-3');
    }

    nameForm.addEventListener('submit', handleNameSubmit);
    document.getElementById('btn-submit-name').addEventListener('click', handleNameSubmit);

    // 6. FRAME 3: Affirmation Phrase & Love Animation
    const btnTriggerLove = document.getElementById('btn-trigger-love');
    const btnNextFromPhrase = document.getElementById('btn-next-from-phrase');

    btnTriggerLove.addEventListener('click', () => {
      soundEngine.playHeartbeat();
      btnTriggerLove.classList.add('hidden');
      btnNextFromPhrase.classList.remove('hidden');

      // Sparkle chime after heart pulse
      setTimeout(() => {
        soundEngine.playSparkleChime();
      }, 600);
    });

    btnNextFromPhrase.addEventListener('click', () => {
      navigateTo('screen-gate', 'theme-frame-4');
    });

    // 7. FRAME 4: Gerbang "Iya" vs "Tidak" (Playful Looping)
    const btnGateYes = document.getElementById('btn-gate-yes');
    const btnGateNo = document.getElementById('btn-gate-no');
    const gateFeedback = document.getElementById('gate-loop-feedback');

    btnGateYes.addEventListener('click', () => {
      gateFeedback.textContent = "Yayy! Pilihan yang sempurna sayang... 💕✨";
      soundEngine.playSparkleChime();
      setTimeout(() => {
        navigateTo('screen-qna', 'theme-frame-5');
      }, 700);
    });

    btnGateNo.addEventListener('click', () => {
      // Loop through cute rejection pleas
      const plea = CONTENT_BANK.rejectionPleas[AppState.pleaIndex % CONTENT_BANK.rejectionPleas.length];
      AppState.pleaIndex++;
      gateFeedback.textContent = plea;
      soundEngine.playHeartbeat();

      // Playful dodge movement
      AppState.dodgeCount++;
      const randomX = (Math.random() - 0.5) * 40;
      const randomY = (Math.random() - 0.5) * 20;
      btnGateNo.style.transform = `translate(${randomX}px, ${randomY}px)`;
    });

    // 8. FRAME 5: Q&A Sentiment Filter
    const btnSubmitQna = document.getElementById('btn-submit-qna');
    const qnaUserText = document.getElementById('qna-user-text');
    const qnaFeedbackMsg = document.getElementById('qna-feedback-msg');
    const qnaStitchContainer = document.getElementById('stitch-qna-container');

    btnSubmitQna.addEventListener('click', () => {
      const userText = qnaUserText.value.trim().toLowerCase();

      if (!userText || userText.length < 3) {
        qnaFeedbackMsg.className = "qna-feedback-box feedback-sad";
        qnaFeedbackMsg.textContent = "Tuliskan sepatah atau dua patah kata dulu ya sayang... 🥺💙";
        return;
      }

      // Check for harsh/profane words
      const hasHarsh = CONTENT_BANK.harshWords.some(word => userText.includes(word));

      if (hasHarsh) {
        // Stitch becomes sad / crying
        qnaStitchContainer.innerHTML = StitchRenderer.getSadSVG();
        qnaFeedbackMsg.className = "qna-feedback-box feedback-sad";
        qnaFeedbackMsg.textContent = "Eh, Stitch jadi sedih... Di sini tempat kita menenangkan jiwa, gunakan kata-kata yang lembut dan penuh kehangatan yaa... 🥺💙";
        soundEngine.playHeartbeat();
      } else {
        // Stitch becomes happy / celebration
        qnaStitchContainer.innerHTML = StitchRenderer.getHappySVG();
        qnaFeedbackMsg.className = "qna-feedback-box feedback-happy";
        qnaFeedbackMsg.textContent = "Kata-katamu begitu menyejukkan hati... Terima kasih telah membagikan keindahan ini. ✨";
        soundEngine.playSparkleChime();

        setTimeout(() => {
          renderPoetryScreen();
          navigateTo('screen-poetry', 'theme-frame-6');
        }, 1400);
      }
    });

    // 9. FRAME 6: Render Dynamic Poetry Screen
    function renderPoetryScreen() {
      const poemObj = CONTENT_BANK.poems[AppState.cycleCount % CONTENT_BANK.poems.length];
      document.getElementById('poetry-theme-tag').textContent = poemObj.theme;
      
      const linesContainer = document.getElementById('poetry-lines-container');
      linesContainer.innerHTML = '';

      poemObj.lines.forEach((lineText, idx) => {
        const formattedLine = lineText.replace('{nama}', AppState.partnerName || 'Sayang');
        const p = document.createElement('p');
        p.className = 'poem-line';
        p.textContent = formattedLine;
        linesContainer.appendChild(p);

        // Sequential line fade-in
        setTimeout(() => {
          p.classList.add('visible');
        }, 500 + idx * 800);
      });
    }

    document.getElementById('btn-next-poetry').addEventListener('click', () => {
      navigateTo('screen-gift', 'theme-frame-7');
    });

    // 10. FRAME 7: Interactive Gifts (Ring & Bouquet)
    const ringEl = document.getElementById('interactive-ring');
    const bouquetEl = document.getElementById('interactive-bouquet');

    ringEl.addEventListener('click', () => {
      soundEngine.playSparkleChime();
      ringEl.style.transform = "scale(1.2) rotate(-5deg)";
      setTimeout(() => { ringEl.style.transform = ""; }, 400);
    });

    bouquetEl.addEventListener('click', () => {
      soundEngine.playSparkleChime();
      bouquetEl.style.transform = "scale(1.2) rotate(5deg)";
      setTimeout(() => { bouquetEl.style.transform = ""; }, 400);
    });

    document.getElementById('btn-next-gift').addEventListener('click', () => {
      navigateTo('screen-replay', 'theme-frame-8');
    });

    // 11. FRAME 8: Replay Engine
    document.getElementById('btn-replay-yes').addEventListener('click', () => {
      // Advance to next poem and fresh dynamic content
      AppState.cycleCount++;
      document.getElementById('session-cycle-indicator').textContent = `✨ Putaran Ke-${AppState.cycleCount + 1}`;

      // Reset dynamic inputs
      qnaUserText.value = "";
      qnaFeedbackMsg.textContent = "";
      qnaFeedbackMsg.className = "qna-feedback-box";
      gateFeedback.textContent = "";
      btnGateNo.style.transform = "";
      btnTriggerLove.classList.remove('hidden');
      btnNextFromPhrase.classList.add('hidden');

      // Return to phrase or gate with fresh dynamic content
      navigateTo('screen-phrase', 'theme-frame-3');
    });

    document.getElementById('btn-replay-no').addEventListener('click', () => {
      showExitScreen();
    });

    // 12. Layar Pamit / Exit Screen
    function showExitScreen() {
      const farewellMsg = CONTENT_BANK.farewellMessages[AppState.cycleCount % CONTENT_BANK.farewellMessages.length];
      document.getElementById('exit-farewell-message').textContent = farewellMsg;
      navigateTo('screen-exit', 'theme-frame-exit');
    }

    document.getElementById('btn-restart-app').addEventListener('click', () => {
      navigateTo('screen-welcome', 'theme-frame-1');
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
