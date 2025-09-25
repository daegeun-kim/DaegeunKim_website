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

