window.addEventListener("DOMContentLoaded", () => {
  const lb = document.getElementById("lightbox")
  const lbImg = document.getElementById("lightboxImg")
  const prev = document.getElementById("prev")
  const next = document.getElementById("next")

  const buttons = document.querySelectorAll(".photo-filter .continent")
  const items = [...document.querySelectorAll(".item")]
  const hero = document.getElementById("heroImg")

  let imgs = []
  let index = 0

  function refreshImgs(){
    imgs = items
      .filter(it => it.style.display !== "none")
      .map(it => it.querySelector("img"))
  }

  function show(i){
    refreshImgs()
    index = (i + imgs.length) % imgs.length
    lbImg.src = imgs[index].src.replace("/thumb/", "/full/")
    lb.style.display = "flex"
  }

  document.addEventListener("click", e => {
    const img = e.target.closest(".item img")
    if(!img) return
    refreshImgs()
    show(imgs.indexOf(img))
  })

  prev.onclick = e => { e.stopPropagation(); show(index-1) }
  next.onclick = e => { e.stopPropagation(); show(index+1) }
  lb.onclick = () => lb.style.display = "none"

  document.addEventListener("keydown", e=>{
    if(lb.style.display !== "flex") return
    if(e.key === "ArrowLeft") show(index-1)
    if(e.key === "ArrowRight") show(index+1)
    if(e.key === "Escape") lb.style.display = "none"
  })

  const map = {
    "All": "all",
    "America": "amer",
    "Asia": "asia",
    "Europe": "euro"
  }

  const heroMap = {
    amer: "photographs/full/amer_thumbnail.webp",
    asia: "photographs/full/asia_thumbnail.webp",
    euro: "photographs/full/euro_thumbnail.webp"
  }

  buttons.forEach(btn=>{
    btn.onclick = () => {
      const key = map[btn.textContent.trim()]

      buttons.forEach(b=>b.classList.remove("active"))
      btn.classList.add("active")

      items.forEach(it=>{
        if(key === "all"){
          it.style.display = ""
        } else {
          const tag = it.dataset.cat || ""
          it.style.display = tag.includes(key) ? "" : "none"
        }
      })

      if(key !== "all" && heroMap[key]){
        hero.src = heroMap[key]
      }

      refreshImgs()
    }
  })
})
