let currentIndex = 0;
const totalSlides = 5;

document.getElementById("nextBtn").onclick = () => {
    if (currentIndex < totalSlides - 1) currentIndex++;
    updateSlide();
};

document.getElementById("prevBtn").onclick = () => {
    if (currentIndex > 0) currentIndex--;
    updateSlide();
};

function updateSlide() {
    const container = document.querySelector(".slide-container");
    container.style.transform = `translateX(-${currentIndex * 60}vw)`;
}


(() => {
	const header = document.getElementById('header');
	let lastScroll = 0;

	document.addEventListener('DOMContentLoaded', () => {
		header.classList.add('animate');
	});

	window.addEventListener('scroll', () => {
		const current = window.scrollY || window.pageYOffset;
		if (current <= 0) {
			header.classList.remove('hidden');
			lastScroll = 0;
			return;
		}

		if (current > lastScroll) {
			// scrolling down
			header.classList.add('hidden');
		} else {
			// scrolling up
			header.classList.remove('hidden');
		}

		lastScroll = current;
	}, { passive: true });
})();