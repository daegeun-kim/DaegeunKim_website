(() => {
	const header = document.getElementById('header');
	let lastScroll = 0;
	const revealThreshold = 80;

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
			header.classList.add('hidden');
		} else {
			header.classList.remove('hidden');
		}

		lastScroll = current;
	}, { passive: true });

	window.addEventListener('mousemove', e => {
		if (e.clientY <= revealThreshold) {
			header.classList.remove('hidden');
		}
	});
})();


