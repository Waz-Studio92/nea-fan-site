import'/src/css/style.css'

function createNav(item) {
	const {tag,text,children,id,type,class: className,for: htmlFor, ...attrs} = item;
	const el = document.createElement(tag);
	
	if (className) el.className = className;
	if (id) el.id = id;
	if (type) el.type = type;
	if (htmlFor) el.htmlFor = htmlFor;
	if (text) el.textContent = text;

	Object.assign(el, attrs);
	
	if (children) {
		children.forEach(child => el.append(createNav(child)));
	}
	return el; // 出来た要素を返す
}

document.addEventListener('DOMContentLoaded', async () => {

	// 1. コールバック関数をここにまとめる（安全なオブジェクト管理）
	const callbacks = {
		setNav: () => {
			console.log('Nav initialized');
		}
	};

	document.addEventListener('change', (e) => {
		if (e.target && e.target.id === 'nav-toggle') {
			if (e.target.checked) {
				document.body.classList.add('is-open');
			} else {
				document.body.classList.remove('is-open');
			}
		}
	});

	// SVGの生成ロジック（ここは変更なし）
	const svg = document.querySelector('.load-svg');
	const svgNs = 'http://www.w3.org/2000/svg';
	const defs = document.createElementNS(svgNs, 'defs');
	svg.appendChild(defs);

	const gradient = document.createElementNS(svgNs, 'linearGradient');
	gradient.id = 'grad1';
	gradient.setAttribute('x1', '0%');
	gradient.setAttribute('y1', '0%');
	gradient.setAttribute('x2', '100%');
	gradient.setAttribute('y2', '100%');
	defs.appendChild(gradient);

	const startColor = document.createElementNS(svgNs, 'stop');
	startColor.setAttribute('offset', '0%');
	startColor.setAttribute('stop-color', '#000080');
	gradient.appendChild(startColor);

	const endColor = document.createElementNS(svgNs, 'stop');
	endColor.setAttribute('offset', '100%');
	endColor.setAttribute('stop-color', '#80ffff');
	gradient.appendChild(endColor);

	const circle = document.createElementNS(svgNs, 'circle');
	circle.setAttribute('viewBox', '0 0 0 0');
	circle.setAttribute('width', '200');
	circle.setAttribute('height', '200');
	circle.setAttribute('cx', '95');
	circle.setAttribute('cy', '95');
	circle.setAttribute('r', '80');

	circle.setAttribute('fill', 'none');
	circle.setAttribute('stroke', 'url(#grad1)');
	circle.setAttribute('stroke-width', '25');

	svg.appendChild(circle);
	svg.classList.add('is-loading');

	try {
		// 1. 設定ファイルの読み込み
		const Res = await fetch('./assets/data/nav.json');
		if (!Res.ok) throw new Error('Config load failed');
		const config = await Res.json();

		config.parts.forEach(part => {

			const contentContainerId = part.id.replace('#', '');
			const container = document.getElementById(contentContainerId);

			const dataKey = part.dataKey;
			const dataList = config[dataKey];

			if (container && dataList) {
				const fragment = document.createDocumentFragment();

				dataList.forEach(data => {
					const el = createNav(data);
					fragment.appendChild(el);
				});

				container.appendChild(fragment);
			}

			// 💡【ここが重要！】各パーツの流し込みが終わった『直後』に、そのパーツのcallbackを呼び出す！
			if (part.callback && callbacks[part.callback]) {
				callbacks[part.callback](); // ここで setNav が実行され、toggleにイベントがつく！
			}
		});

		setTimeout(() => {
			document.body.classList.add('is-show');
		}, 100);

		setTimeout(() => {
			svg.classList.remove('is-loading');
		}, 200);

	} catch (e) {
		console.error(e);

		const errorBox = document.createElement('div');
		errorBox.className = 'error-box';
		errorBox.textContent = 'データの読み込みに失敗しました。後でもう一度お試しください。';

		document.body.appendChild(errorBox);

		setTimeout(() => {
			svg.classList.remove('is-show');
		}, 200);
	}

	function setAccordion() {
		// アコーディオン用の関数（将来用だな！）
	}

});