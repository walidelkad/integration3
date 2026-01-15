import './style.css'

// Image assets from Figma
const images = {
  adobeStock292: 'http://localhost:3845/assets/87d98c5de672d121f89524960e824c40285d7181.png',
  adobeStock527: 'http://localhost:3845/assets/2e49cbc62a975269c3defcb98bd3abd4cf682832.png',
  adobeStock650: 'http://localhost:3845/assets/d19d562e18e92e52edf80402aa52a466c5f05cbf.png',
  notebookZonder: 'http://localhost:3845/assets/a2b9ec80fed89dccd254c2e281793b4df579d8b6.png',
  image5: 'http://localhost:3845/assets/9c8cd3388c2459d03c66be6c450fa10a5ed67611.png',
  image4: 'http://localhost:3845/assets/89a0b1c5499976ab54c737e80afff7fad7e1f2f9.png',
  adobeStock581: 'http://localhost:3845/assets/55676326e0c6bce1ec69b99dd318a20b401052d6.png',
  adobeStock529: 'http://localhost:3845/assets/65e6cac565d930f044fd054800007226999e8809.png',
  image15: 'http://localhost:3845/assets/0fdbb0bf91241ef21847739b4abb6e0155f59022.png',
  adobeStock173: 'http://localhost:3845/assets/ebfd5d3ea68300af3e04498e462c5004f9fe6a4c.png',
  screenshot1: 'http://localhost:3845/assets/5cdd3b67076a4ef2535417569de29ab2fbcabcc1.png',
  screenshot2: 'http://localhost:3845/assets/c709a75e9b9f973189a5d5c7b0158d2d0cc7e80f.png',
  screenshot3: 'http://localhost:3845/assets/ea4d19e6fa6423be742096eefeea80596304b583.png',
  image24: 'http://localhost:3845/assets/2b38e57ff59fd89851bbacaef8b372b105cb8a37.png',
}

const app = document.querySelector('#app')




// Initialize interactions
initializeCanvas()
initializeNavigation()

function initializeCanvas() {
  const canvas = document.getElementById('sketch-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const img = document.getElementById('sketch-image')
  let isDrawing = false

  // Draw the image on canvas
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }

  // Eraser functionality
  canvas.addEventListener('mousedown', () => { isDrawing = true })
  canvas.addEventListener('mouseup', () => { isDrawing = false })
  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.clearRect(x - 20, y - 20, 40, 40)
  })

  // Reset button
  document.getElementById('reset-canvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  })
}

function initializeNavigation() {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const href = link.getAttribute('href')
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })
}
