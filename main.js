(() => {
	const header = document.getElementById('header');
	let lastScroll = 0;
	const revealThreshold = 80;
	const cleanUrlMap = new Map([
		['index.html', '/'],
		['about.html', '/about/'],
		['bim_rag.html', '/bimtrieval/'],
		['bryantparksolar.html', '/bryantparksolar/'],
		['cruciform.html', '/cruciform/'],
		['explorentory.html', '/explorentory/'],
		['geoestatechat.html', '/geoestatechat/'],
		['mergeprep.html', '/mergeprep/'],
		['moireshade.html', '/moireshade/'],
		['neural_floorplan.html', '/neural_floorplan/'],
		['no_true_north.html', '/no_true_north/'],
		['parametricCity.html', '/parametricCity/'],
		['photography.html', '/photography/'],
		['residentialclustering.html', '/residentialclustering/'],
		['spiraldwelling.html', '/spiraldwelling/'],
		['streetblock.html', '/streetblock/'],
		['streetblockDL.html', '/streetblockDL/'],
		['transitmapping.html', '/transitmapping/'],
		['work11/presentation.html', '/work11/presentation/']
	]);

	document.addEventListener('DOMContentLoaded', () => {
		document.querySelectorAll('a[href]').forEach(link => {
			const href = link.getAttribute('href');
			const cleanUrl = cleanUrlMap.get(href);
			if (cleanUrl) link.setAttribute('href', cleanUrl);
		});

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
