import'/src/css/style.scss'

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
			console.log('ナビゲーションセットアップが完了しました');
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

	// SVGの生成ロジック（改修）
	const createSvgElement = (tagName, attributes, parentElement = null) => {
		const el = document.createElementNS('http://www.w3.org/2000/svg', tagName);

		Object.entries(attributes).forEach(([Key, value]) => el.setAttribute(Key, value));
			if (parentElement) parentElement.appendChild(el);

			return el;
	};

	const svg = document.querySelector('.load-svg');

	const defs = createSvgElement('defs', {}, svg);

	const gradient = createSvgElement('linearGradient', {
		id: 'grad1', 
		'x1': '0%',
		'y1': '0%',
		'x2': '100%',
		'y2': '100%'
	}, defs);

	createSvgElement('stop', {'offset': '0%', 'stop-color': '#000080'}, gradient);
	createSvgElement('stop', {'offset': '100%', 'stop-color': '#80ffff'}, gradient);

	createSvgElement('circle', {
		'viewBox': '0 0 0 0',
		'width': '200',
		'height': '200',
		'cx': '95',
		'cy': '95',
		'r': '80',
		'fill': 'none',
		'stroke': 'url(#grad1)',
		'stroke-width': '25'
	}, svg);

	svg.classList.add('is-loading');

	try {
		// 1. 設定ファイルの読み込み
		const Res = await fetch('./assets/data/nav.json');
		if (!Res.ok) throw new Error('Config load failed');
		const config = await Res.json();

		config.parts.forEach(part => {
			
			const container = document.querySelector(part.id);
			
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
			
			if (part.callback && callbacks[part.callback]) {
				callbacks[part.callback]();
			}	
		});
		
		setTimeout(() => {
			document.body.classList.add('is-show');
		}, 100);

		setTimeout(() => {
			svg.classList.remove('is-loading');
		}, 100);

	} catch (e) {
		console.error(e);

		const errorTxt = document.createElement('p');
		errorTxt.className = 'error-box';
		errorTxt.textContent = 'データの読み込みに失敗しました。後でもう一度お試しください。';

		document.body.appendChild(errorTxt);

		setTimeout(() => {
			svg.classList.remove('is-show');
		}, 100);
	}

	const target = document.querySelector('.top-btn');
	const pickupSection = document.querySelector('.pick-up');

	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				target.classList.add('is-show');
			} else {
				target.classList.remove('is-show');
			}
		});
	}, {
		threshold: .2
	});

	if (pickupSection) {
		observer.observe(pickupSection);
	}

	// アコーディオン用の関数
	function setAccordion() {
	}

});