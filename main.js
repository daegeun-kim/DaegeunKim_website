(() => {
	const header = document.getElementById('header');
	let lastScroll = 0;
	const revealThreshold = 80;

	document.addEventListener('DOMContentLoaded', () => {
		header.classList.add('animate');

		const buttons = document.querySelectorAll(".branches button");
		const items = document.querySelectorAll(".work-item");

		const setActive = (activeBtn) => {
			buttons.forEach(b => b.classList.toggle("active", b === activeBtn));
		};

		const applyFilter = (filter) => {
			items.forEach(item => {
				const cats = (item.dataset.category || "").split(/\s+/).filter(Boolean);
				const show = filter === "all" || cats.includes(filter);
				item.hidden = !show;
			});
		};

		buttons.forEach(btn => {
			btn.addEventListener("click", () => {
				const filter = btn.dataset.filter || "all";
				setActive(btn);
				applyFilter(filter);
			});
		});

		const defaultBtn = document.querySelector('.branches button[data-filter="all"]') || buttons[0];
		if (defaultBtn) {
			setActive(defaultBtn);
			applyFilter(defaultBtn.dataset.filter || "all");
		}
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
