'use strict';

var mapObj, mapLen;
var mapOrder, curIndex;
var currentMode;

window.addEventListener('load', init);

function init() {
	initStyle();
	initData();
	loadState();
}

function initStyle() {
	const titleThs = document.querySelectorAll('th:first-child');
	const titleWidths = Array.from(titleThs).map(e => e.getBoundingClientRect().width);
	const maxWidth = Math.max(...titleWidths);
	const style = document.createElement('style');
	style.textContent = `th:first-child{box-sizing:border-box;width:${maxWidth}px;}`;
	document.head.appendChild(style);

	let total = 0;
	const legends = document.querySelectorAll('legend');
	legends.forEach(e => {
		const titleTds = e.parentElement.querySelectorAll('tr:not(.obsolete) td:first-child');
		const len = titleTds.length;
		e.textContent = e.textContent.replace('{}', len);
		total += len;
	});
	const labels = document.querySelectorAll('#workshop');
	labels.forEach(e => {
		e.textContent = e.textContent.replace('{}', total);
	});

	document.querySelector('#bt_cur').addEventListener('click', scrollToCurrent);
	document.querySelector('#bt_next').addEventListener('click', nextMap);
	document.querySelector('#bt_rstq').addEventListener('click', resetQueue);
	document.querySelector('#bt_top').addEventListener('click', scrollToTop);

	const tabTags = document.querySelectorAll('a');
	tabTags.forEach(e => e.setAttribute('tabindex', '-1'));
}

function initData() {
	mapObj = {};
	mapLen = 0;
	const validTds = document.querySelectorAll('table:not(.noselect) tr:not(.obsolete) td:first-child');
	validTds.forEach(e => {
		const map = e.firstChild.textContent;
		mapObj[map] = e.parentElement;
		mapLen++;
	});
}

function loadState() {
	const pageId = location.pathname.split('/').slice(-1);
	mapOrder = new StoredVar(`${pageId}:mapselector_order`, {
		deft_f: () => ShuffleUtil.fullShuffle(Object.keys(mapObj))
	});
	curIndex = new StoredVar(`${pageId}:mapselector_current`, {
		deft_f: () => 0,
		load_f: (v) => mapNameToIndex(v),
		save_f: (v) => mapIndexToName(v),
		on_load: checkStore,
		on_set: stylizeModes
	});
	mapOrder.load();
	curIndex.load();
}

function mapIndexToName(index) {
	return mapOrder.v[index];
}

function mapNameToIndex(name) {
	return mapOrder.v.indexOf(name);
}

function checkStore() {
	const order = mapOrder.v;
	let index = curIndex.v;
	const stored = new Set(order);
	let changed = false;
	Array.from(stored).filter(m => !mapObj[m]).forEach(map => {
		const i = order.indexOf(map);
		order.splice(i, 1);
		if (i < index) {
			index--;
		}
		changed = true;
	});
	Object.keys(mapObj).filter(m => !stored.has(m)).forEach(map => {
		order.splice(index, 0, map);
		changed = true;
	});
	if (changed) {
		mapOrder.save();
		curIndex.v = index;
	}
}

function stylizeModes() {
	const curMap = mapIndexToName(curIndex.v);
	const mapTds = mapObj[curMap].querySelectorAll('td');
	const modeTds = Array.from(mapTds).filter(e => e.textContent === '✓');
	const randMode = modeTds[Math.floor(Math.random() * modeTds.length)];

	if (currentMode) {
		currentMode.classList.remove('current');
		currentMode.removeEventListener('click', nextMap);
	}
	randMode.classList.add('current');
	randMode.addEventListener('click', nextMap);
	currentMode = randMode;
	scrollToCurrent();
}

function nextMap() {
	let index = curIndex.v;
	index++;
	if (index == mapLen) {
		ShuffleUtil.neighborShuffle(mapOrder.v);
		mapOrder.save();
		index = 0;
	}
	curIndex.v = index;
}

function resetQueue() {
	mapOrder.reset();
	curIndex.reset();
}

function scrollToCurrent() {
	currentMode.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function scrollToTop() {
	window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}

class StoredVar {
	constructor(key, funcObj) {
		this.key = key;
		this.deft_f = funcObj.deft_f;
		this.load_f = funcObj.load_f ?? (v => v);
		this.save_f = funcObj.save_f ?? (v => v);
		this.on_load = funcObj.on_load ?? (() => { });
		this.on_set = funcObj.on_set ?? (() => { });
	}

	load() {
		const json = localStorage.getItem(this.key);
		if (json != null) {
			this.value = this.load_f(JSON.parse(json));
			this.on_load();
			this.on_set();
		} else {
			this.reset();
		}
	}

	save() {
		const value = this.value;
		if (value != null) {
			const json = JSON.stringify(this.save_f(value));
			localStorage.setItem(this.key, json);
		} else {
			this.reset();
		}
	}

	reset() {
		this.v = this.deft_f();
	}

	get v() {
		return this.value;
	}

	set v(value) {
		this.value = value;
		this.on_set();
		this.save();
	}
}

class ShuffleUtil {
	static fullShuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const t = arr[i];
			arr[i] = arr[j];
			arr[j] = t;
		}
		return arr;
	}

	static neighborShuffle(arr) {
		const len = arr.length;
		const half = len / 2;
		const side = len / 4;
		const shuffled = arr.map((v, i) => {
			const lower = i <= half ? Math.max(0, i - side) : Math.min(len, i + side) - half;
			const ni = Math.random() * half + lower;
			return [ni, v];
		}).sort((v1, v2) => v1[0] - v2[0]);
		for (let i = 0; i < len; i++) {
			arr[i] = shuffled[i][1];
		}
		return arr;
	}
}
