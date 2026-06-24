import '/src/css/style.scss'

function createNav(item) {
	const {
		tag,
		text,
		children,
		id,
		type,
		class: className,
		for: htmlFor,
		...attrs
	} = item;
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

	createSvgElement('stop', {
		'offset': '0%',
		'stop-color': '#000080'
	}, gradient);
	createSvgElement('stop', {
		'offset': '100%',
		'stop-color': '#80ffff'
	}, gradient);

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

	} catch (e) { // エラーハンドリング
		console.error(e);

		const errorBox = document.querySelector('#error-box');
		const errorTxt = document.createElement('p');
		errorTxt.className = 'error-box';
		errorTxt.textContent = 'データの読み込みに失敗しました。後でもう一度お試しください。';

		document.body.appendChild(errorTxt);

		setTimeout(() => {
			svg.classList.remove('is-show');
		}, 100);
	}

	// TOPへ戻るボタン
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

	// 掲示板(コメント生成用)
	const renderTimeline = (posts) => {
		const timeline = document.querySelector('#timeline');
		if (!timeline) return;

		const fragment = document.createDocumentFragment();

		const createEl = (tag, className, text = '') => {
			const el = document.createElement(tag);
			if (className) el.className = className;
			if (text) el.textContent = text;
			return el;
		};

		posts.forEach(post => {
			const postArticle = createEl('article', 'post');
			const postHeader = createEl('div', 'post-header');

			const postAccount = createEl('span', 'post-account', post.postAccount || '名無しさん');
			const postCategory = createEl('span',	'post-category', post.postCategory ? `[${post.postCategory}]` : '');
			const postDate = createEl('time',	'post-date', post.postDate);
			const postTitle = createEl('h3', 'post-title', post.postTitle ? `[${post.postTitle}]` : '');
			const postBody = createEl('p', 'post-body', post.postBody || '');
			
			postHeader.appendChild(postAccount);
			if (post.postCategory) postHeader.appendChild(postCategory);
			postHeader.appendChild(postDate);

			postArticle.appendChild(postHeader);
			if (post.postTitle) postArticle.appendChild(postTitle);
			postArticle.appendChild(postBody);

			fragment.appendChild(postArticle);
		});
		timeline.insertBefore(fragment, timeline.firstChild);
	};

	// localStorageへの保存の処理
	const savedPosts = localStorage.getItem('bbs_posts');
	let postsState = savedPosts ? JSON.parse(savedPosts) : [];

	if (postsState.length > 0) {
		renderTimeline(postsState);
	}

	const form = document.querySelector('.bbs__table');
	const textarea = document.querySelector('.textarea');
	const nameInput = document.querySelector('#name');
	const titleInput = document.querySelector('#title');
	const categorySelect = document.querySelector('#category');

	if (form && textarea && nameInput) {
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const content = textarea.value.trim();
			const nickname = nameInput.value.trim() || '名無しさん';
			const title = titleInput ? (titleInput.value.trim() || '無題') : '無題';
			let categoryText = '';
			if (categorySelect && categorySelect.selectedIndex !== 0) {
				categoryText = categorySelect.options[categorySelect.selectedIndex].text;
			} 

			if (!content) return;

			const newPost = {
				postAccount: nickname,
				postCategory: categoryText,
				postTitle: title,
				postBody: content,
				postDate: new Date().toLocaleString('ja-JP')
			};

			postsState.unshift(newPost);
			localStorage.setItem('bbs_posts', JSON.stringify(postsState));

			renderTimeline([newPost]);

			textarea.value = '';
			nameInput.value = '';
			if (titleInput) titleInput.value = '';
			if (categorySelect) categorySelect.value = '0';
			const deleteInput = document.querySelector('#delete');
			if (deleteInput) deleteInput.value = '';
		});
	}

		// アコーディオン用の関数
		function setAccordion() {}
});