'use strict';

var mapSet, mapLen;
var conf;
var curCheck;

window.onload = init;

function init() {
	setStyle();

	const trs = document.getElementsByTagName('tr');
	const maps = Array.from(trs).filter(e => e.firstElementChild.nodeName == 'TD' && !e.classList.contains('grouped'));
	mapSet = {}
	for (let map of maps) {
		const tdMap = map.firstElementChild;
		const hlMap = tdMap.firstElementChild;
		const mapName = hlMap ? hlMap.textContent : tdMap.textContent;
		mapSet[mapName] = map;
	}
	mapLen = maps.length;

	const pid = location.pathname.split('/').slice(-1);
	conf = {
		mapOrder: {
			key: `${pid}:mapselector_order`,
			deff: () => fullShuffle(Object.keys(mapSet))
		},
		curIndex: {
			key: `${pid}:mapselector_current`,
			deff: () => 0,
			getf: (v) => conf.mapOrder.value.indexOf(v),
			setf: (x) => conf.mapOrder.value[x]
		}
	};

	getLocal(conf.mapOrder);
	getLocal(conf.curIndex);
	checkSave();

	document.getElementById('btReset').onclick = resetMaps;
	document.getElementById('btCur').onclick = dispCurMap;
	document.getElementById('btNext').onclick = nextMap;
	dispCurMap();
}

function setStyle() {
	let max_wid = 0;
	for (let t of document.getElementsByTagName('table')) {
		const th_tds = t.children[0].children[0].children;
		const wid_title = th_tds[0].getBoundingClientRect().width;
		if (max_wid < wid_title) {
			max_wid = wid_title;
		}
	}
	const css = `th:first-child{box-sizing:border-box;width:${max_wid}px;}`;
	const style = document.createElement('style');
	style.appendChild(document.createTextNode(css));
	document.head.appendChild(style);
}

function checkSave() {
	const mapOrder = conf.mapOrder.value;
	let curIndex = conf.curIndex.value;
	const saveSet = new Set(mapOrder);
	let changed = false;
	for (let map of saveSet) {
		if (!mapSet[map]) {
			const i = mapOrder.indexOf(map);
			mapOrder.splice(i, 1);
			if (i < curIndex) {
				curIndex--;
			}
			changed = true;
		}
	}
	for (let map in mapSet) {
		if (!saveSet.has(map)) {
			mapOrder.splice(curIndex, 0, map);
			changed = true;
		}
	}
	if (changed) {
		conf.curIndex.value = curIndex;
		setLocal(conf.mapOrder);
		setLocal(conf.curIndex);
	}
}

function resetMaps() {
	resetLocal(conf.mapOrder);
	resetLocal(conf.curIndex);
	dispCurMap();
}

function nextMap() {
	let curIndex = conf.curIndex.value;
	curIndex++;
	if (curIndex == mapLen) {
		neighborShuffle(conf.mapOrder.value);
		curIndex = 0;
		setLocal(conf.mapOrder);
	}
	conf.curIndex.value = curIndex;
	setLocal(conf.curIndex);
	dispCurMap();
}

function dispCurMap() {
	const curMap = mapSet[conf.mapOrder.value[conf.curIndex.value]];
	const tds = curMap.getElementsByTagName('td');
	const checks = Array.from(tds).filter(e => e.textContent == '✓');
	const randCheck = checks[Math.trunc(Math.random() * checks.length)];

	if (curCheck) {
		curCheck.classList.remove('current');
		curCheck.onclick = null;
	}
	randCheck.classList.add('current');
	randCheck.onclick = nextMap;
	curCheck = randCheck;
	curCheck.scrollIntoView();
}

function getLocal(confVar) {
	const json = localStorage.getItem(confVar.key);
	if (json) {
		const v = JSON.parse(json);
		const getf = confVar.getf;
		confVar.value = getf ? getf(v): v;
	} else {
		resetLocal(confVar);
	}
}

function setLocal(confVar) {
	const x = confVar.value;
	const setf = confVar.setf;
	const v = setf ? setf(x): x;
	localStorage.setItem(confVar.key, JSON.stringify(v));
}

function resetLocal(confVar) {
	confVar.value = confVar.deff();
	setLocal(confVar);
}

function fullShuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const t = arr[i];
		arr[i] = arr[j];
		arr[j] = t;
	}
	return arr;
}

function neighborShuffle(arr) {
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
