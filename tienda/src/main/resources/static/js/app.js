'use strict';

// Número de WhatsApp de la tienda (código de país + número, sin "+" ni espacios).
// TODO: reemplazar por el número real de VIVEROS Ropa Deportiva.
const WHATSAPP = '573000000000';

const TIPO_ACCESORIO = 'Accesorio';
const ESPERA_BUSQUEDA_MS = 300;
const INTERVALO_CARRUSEL_MS = 5000;

// Colores de la ilustración de respaldo. Los nombres vienen de la base de datos
// ("Verde y amarillo") y aquí solo se traducen a hexadecimal; nunca se inyectan como HTML.
const PALETA = {
	verde: '#1f9d55', lima: '#c6ff1a', amarillo: '#ffd21a', azul: '#1e5bd8',
	celeste: '#5ec8f2', blanco: '#f4f7f2', negro: '#16191a', rojo: '#e3262f',
	naranja: '#ff7a1a', morado: '#7b3fe4', gris: '#8a948d', vinotinto: '#6d1426',
	dorado: '#d4a72c', rosado: '#ff6fae'
};
const COLOR_POR_DEFECTO = ['#c6ff1a', '#16191a'];

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// ---------- Utilidades ----------

async function api(ruta) {
	const res = await fetch(ruta, { headers: { Accept: 'application/json' } });
	if (!res.ok) {
		throw new Error('HTTP ' + res.status);
	}
	return res.json();
}

// Crea un elemento; el texto siempre va por textContent.
function el(tag, clase, texto) {
	const nodo = document.createElement(tag);
	if (clase) nodo.className = clase;
	if (texto != null) nodo.textContent = texto;
	return nodo;
}

function debounce(fn, ms) {
	let t;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn(...args), ms);
	};
}

function waUrl(mensaje) {
	return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje);
}

function formatoPrecio(precio) {
	return precio == null ? 'Precio por cotización' : pesos.format(precio);
}

// Muestra "Cargando…", un error (con botón para reintentar) o un aviso vacío.
function estado(nodo, texto, opciones = {}) {
	nodo.textContent = texto || '';
	nodo.classList.toggle('estado--error', Boolean(opciones.error));
	if (opciones.reintentar) {
		const boton = el('button', null, 'Reintentar');
		boton.type = 'button';
		boton.addEventListener('click', opciones.reintentar);
		nodo.append(boton);
	}
}

function listaColores(texto) {
	return (texto || '').split(',').map(c => c.trim()).filter(Boolean);
}

// "Verde y amarillo" -> ['#1f9d55', '#ffd21a']
function hexDeColor(nombre) {
	const partes = (nombre || '')
		.toLowerCase()
		.normalize('NFD').replace(/[̀-ͯ]/g, '')
		.split(/\s+y\s+|\s*\/\s*|\s*-\s*/)
		.map(p => PALETA[p.trim()])
		.filter(Boolean);
	if (partes.length === 0) return COLOR_POR_DEFECTO;
	return [partes[0], partes[1] || (partes[0] === PALETA.negro ? PALETA.blanco : PALETA.negro)];
}

// ---------- Ilustración de camiseta (respaldo cuando no hay imagenUrl) ----------

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgNodo(tag, atributos) {
	const nodo = document.createElementNS(SVG_NS, tag);
	for (const [k, v] of Object.entries(atributos)) nodo.setAttribute(k, v);
	return nodo;
}

function jersey(principal, secundario) {
	const svg = svgNodo('svg', { viewBox: '0 0 200 200', role: 'img', 'aria-hidden': 'true' });
	svg.append(
		svgNodo('rect', { width: 200, height: 200, fill: '#121513' }),
		svgNodo('path', {
			d: 'M60 30 L80 22 Q100 35 120 22 L140 30 L175 55 L160 85 L145 76 L145 180 L55 180 L55 76 L40 85 L25 55 Z',
			fill: principal
		}),
		svgNodo('path', { d: 'M60 30 L25 55 L40 85 L55 76 Z M140 30 L175 55 L160 85 L145 76 Z', fill: secundario }),
		svgNodo('path', { d: 'M55 128 L145 82 L145 100 L55 146 Z', fill: secundario, opacity: '.9' }),
		svgNodo('path', { d: 'M80 22 Q100 35 120 22 Q100 46 80 22 Z', fill: secundario })
	);
	return svg;
}

// Imagen si hay URL; si no (o si falla al cargar), la camiseta ilustrada.
function media(imagenUrl, alt, colores) {
	if (!imagenUrl) return jersey(...colores);
	const img = el('img');
	img.src = imagenUrl;
	img.alt = alt;
	img.loading = 'lazy';
	img.addEventListener('error', () => img.replaceWith(jersey(...colores)), { once: true });
	return img;
}

// ---------- Tarjetas ----------

function mensajeProducto(p, color) {
	let msg = 'Hola, me interesa el producto "' + p.nombre + '"';
	if (color) msg += ' en color ' + color;
	msg += p.precio == null ? '. Quisiera una cotización.' : '. ¿Me pueden dar más información?';
	return msg;
}

function tarjetaProducto(p) {
	const colores = listaColores(p.colores);
	let colorSel = colores[0] || null;

	const card = el('article', 'card');

	const cajaMedia = el('div', 'card__media');
	const pintarMedia = () => {
		const actual = cajaMedia.querySelector('img, svg');
		const nuevo = media(p.imagenUrl, p.nombre, hexDeColor(colorSel));
		if (actual) actual.replaceWith(nuevo); else cajaMedia.prepend(nuevo);
	};
	pintarMedia();

	const badges = el('div', 'card__badges');
	if (p.destacado) badges.append(el('span', 'badge', 'Destacado'));
	if (!p.disponible) badges.append(el('span', 'badge badge--agotado', 'Agotado'));
	cajaMedia.append(badges);

	const cuerpo = el('div', 'card__cuerpo');
	const meta = [p.tipo, p.deporte && p.deporte.nombre].filter(Boolean).join(' · ');
	cuerpo.append(el('p', 'card__meta', meta), el('h3', 'card__titulo', p.nombre));
	if (p.descripcion) cuerpo.append(el('p', 'card__desc', p.descripcion));

	const boton = el('a', 'btn btn--wa btn--bloque', p.disponible ? 'Pedir por WhatsApp' : 'Consultar disponibilidad');
	boton.target = '_blank';
	boton.rel = 'noopener';
	const actualizarBoton = () => { boton.href = waUrl(mensajeProducto(p, colorSel)); };
	actualizarBoton();

	if (colores.length > 0) {
		const bloque = el('div', 'colores');
		const etiqueta = el('p', 'colores__label', 'Color: ');
		const nombreColor = el('strong', null, colorSel);
		etiqueta.append(nombreColor);

		const swatches = el('div', 'swatches');
		swatches.setAttribute('role', 'group');
		swatches.setAttribute('aria-label', 'Color');
		colores.forEach((c, i) => {
			const [a, b] = hexDeColor(c);
			const sw = el('button', 'swatch');
			sw.type = 'button';
			sw.title = c;
			sw.setAttribute('aria-label', c);
			sw.setAttribute('aria-pressed', String(i === 0));
			sw.style.background = 'linear-gradient(135deg, ' + a + ' 50%, ' + b + ' 50%)';
			sw.addEventListener('click', () => {
				colorSel = c;
				nombreColor.textContent = c;
				swatches.querySelectorAll('.swatch').forEach(s => s.setAttribute('aria-pressed', String(s === sw)));
				if (!p.imagenUrl) pintarMedia();
				actualizarBoton();
			});
			swatches.append(sw);
		});
		bloque.append(etiqueta, swatches);
		cuerpo.append(bloque);
	}

	const pie = el('div', 'card__pie');
	pie.append(el('p', p.precio == null ? 'precio precio--cotizar' : 'precio', formatoPrecio(p.precio)), boton);
	cuerpo.append(pie);

	card.append(cajaMedia, cuerpo);
	return card;
}

function tarjetaDiseno(d) {
	const card = el('article', 'card');
	const cajaMedia = el('div', 'card__media');
	cajaMedia.append(media(d.imagenUrl, d.nombre, COLOR_POR_DEFECTO));
	if (d.masVendido) {
		const badges = el('div', 'card__badges');
		badges.append(el('span', 'badge', 'Más vendido'));
		cajaMedia.append(badges);
	}

	const cuerpo = el('div', 'card__cuerpo');
	cuerpo.append(el('p', 'card__meta', d.deporte ? d.deporte.nombre : ''), el('h3', 'card__titulo', d.nombre));

	const boton = el('a', 'btn btn--wa btn--bloque', 'Quiero este diseño');
	boton.href = waUrl(mensajeDiseno(d));
	boton.target = '_blank';
	boton.rel = 'noopener';
	const pie = el('div', 'card__pie');
	pie.append(boton);
	cuerpo.append(pie);

	card.append(cajaMedia, cuerpo);
	return card;
}

function mensajeDiseno(d) {
	return 'Hola, me interesa el diseño "' + d.nombre + '"' +
		(d.deporte ? ' para ' + d.deporte.nombre : '') + '. ¿Me pueden cotizar?';
}

// ---------- Catálogo ----------

const filtros = { deporte: null, tipo: '', soloDisponibles: false, q: '' };
let peticionCatalogo = 0;

async function cargarCatalogo() {
	const grid = document.getElementById('catalogo-grid');
	const est = document.getElementById('catalogo-estado');
	const id = ++peticionCatalogo;

	const params = new URLSearchParams();
	if (filtros.deporte != null) params.set('deporte', filtros.deporte);
	if (filtros.tipo) params.set('tipo', filtros.tipo);
	if (filtros.soloDisponibles) params.set('soloDisponibles', 'true');
	if (filtros.q) params.set('q', filtros.q);

	estado(est, 'Cargando…');
	grid.setAttribute('aria-busy', 'true');
	try {
		const productos = await api('/api/productos?' + params);
		if (id !== peticionCatalogo) return; // llegó una respuesta más nueva
		grid.replaceChildren(...productos.map(tarjetaProducto));
		estado(est, productos.length === 0 ? 'No encontramos productos con esos filtros. Prueba con otra búsqueda.' : '');
	} catch (e) {
		if (id !== peticionCatalogo) return;
		grid.replaceChildren();
		estado(est, 'No pudimos cargar el catálogo. Revisa tu conexión e inténtalo de nuevo.', { error: true, reintentar: cargarCatalogo });
	} finally {
		if (id === peticionCatalogo) grid.removeAttribute('aria-busy');
	}
}

async function cargarDeportes() {
	const chips = document.getElementById('chips-deporte');
	const crearChip = (texto, valor) => {
		const chip = el('button', 'chip', texto);
		chip.type = 'button';
		chip.setAttribute('aria-pressed', String(valor === filtros.deporte));
		chip.addEventListener('click', () => {
			filtros.deporte = valor;
			chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
			cargarCatalogo();
		});
		return chip;
	};

	chips.replaceChildren(crearChip('Todos', null));
	try {
		const deportes = await api('/api/deportes');
		chips.append(...deportes.map(d => crearChip(d.nombre, d.id)));
	} catch (e) {
		// Sin deportes el catálogo sigue funcionando con "Todos".
	}
}

async function cargarTipos() {
	const select = document.getElementById('f-tipo');
	try {
		const tipos = await api('/api/tipos');
		tipos.forEach(t => {
			const opcion = el('option', null, t);
			opcion.value = t;
			select.append(opcion);
		});
	} catch (e) {
		// Se queda solo "Todos los tipos".
	}
}

function iniciarFiltros() {
	const buscar = document.getElementById('f-buscar');
	const buscarConEspera = debounce(() => {
		filtros.q = buscar.value.trim();
		cargarCatalogo();
	}, ESPERA_BUSQUEDA_MS);
	buscar.addEventListener('input', buscarConEspera);

	document.getElementById('f-tipo').addEventListener('change', e => {
		filtros.tipo = e.target.value;
		cargarCatalogo();
	});
	document.getElementById('f-disponibles').addEventListener('change', e => {
		filtros.soloDisponibles = e.target.checked;
		cargarCatalogo();
	});
}

// ---------- Galería de diseños (agrupada por deporte) ----------

async function cargarDisenos() {
	const cont = document.getElementById('disenos-cont');
	const est = document.getElementById('disenos-estado');
	estado(est, 'Cargando…');
	try {
		const disenos = await api('/api/disenos');
		const grupos = new Map();
		disenos.forEach(d => {
			const deporte = d.deporte ? d.deporte.nombre : 'Otros';
			if (!grupos.has(deporte)) grupos.set(deporte, []);
			grupos.get(deporte).push(d);
		});

		cont.replaceChildren(...[...grupos].map(([deporte, lista]) => {
			const grupo = el('div', 'grupo');
			const titulo = el('h3', 'grupo__titulo', deporte);
			titulo.append(el('span', null, lista.length === 1 ? '1 diseño' : lista.length + ' diseños'));
			const grid = el('div', 'grid');
			grid.append(...lista.map(tarjetaDiseno));
			grupo.append(titulo, grid);
			return grupo;
		}));
		estado(est, disenos.length === 0 ? 'Pronto publicaremos nuestros diseños.' : '');
	} catch (e) {
		cont.replaceChildren();
		estado(est, 'No pudimos cargar la galería de diseños.', { error: true, reintentar: cargarDisenos });
	}
}

// ---------- Accesorios ----------

async function cargarAccesorios() {
	const grid = document.getElementById('accesorios-grid');
	const est = document.getElementById('accesorios-estado');
	estado(est, 'Cargando…');
	try {
		const productos = await api('/api/productos?' + new URLSearchParams({ tipo: TIPO_ACCESORIO }));
		grid.replaceChildren(...productos.map(tarjetaProducto));
		estado(est, productos.length === 0 ? 'Por ahora no hay accesorios disponibles.' : '');
	} catch (e) {
		grid.replaceChildren();
		estado(est, 'No pudimos cargar los accesorios.', { error: true, reintentar: cargarAccesorios });
	}
}

// ---------- Carrusel del banner (más vendidos) ----------

const carrusel = { slides: [], actual: 0, timer: null };

function mostrarSlide(i) {
	const { slides } = carrusel;
	carrusel.actual = (i + slides.length) % slides.length;
	const d = slides[carrusel.actual];

	// Click en el uniforme: abre WhatsApp con el nombre del diseño.
	const enlace = el('a', 'carrusel__uniforme entra');
	enlace.href = waUrl(mensajeDiseno(d));
	enlace.target = '_blank';
	enlace.rel = 'noopener';
	enlace.setAttribute('aria-label', 'Pedir el diseño ' + d.nombre + ' por WhatsApp');
	enlace.append(media(d.imagenUrl, d.nombre, COLOR_POR_DEFECTO));

	document.getElementById('carrusel-marco').replaceChildren(enlace);
	document.getElementById('carrusel-nombre').textContent = d.nombre;
	document.getElementById('carrusel-deporte').textContent = d.deporte ? d.deporte.nombre : '';
	document.querySelectorAll('#carrusel-puntos button').forEach((b, j) => {
		b.setAttribute('aria-current', String(j === carrusel.actual));
	});
}

function reiniciarAutoplay() {
	clearInterval(carrusel.timer);
	if (carrusel.slides.length > 1) {
		carrusel.timer = setInterval(() => mostrarSlide(carrusel.actual + 1), INTERVALO_CARRUSEL_MS);
	}
}

async function cargarCarrusel() {
	const marco = document.getElementById('carrusel-marco');
	const est = el('p', 'estado', 'Cargando…');
	marco.replaceChildren(est);
	try {
		carrusel.slides = await api('/api/disenos?masVendidos=true');
	} catch (e) {
		estado(est, 'No pudimos cargar los diseños.', { error: true, reintentar: cargarCarrusel });
		return;
	}
	if (carrusel.slides.length === 0) {
		estado(est, 'Pronto verás aquí nuestros más vendidos.');
		return;
	}

	const puntos = document.getElementById('carrusel-puntos');
	puntos.replaceChildren(...carrusel.slides.map((d, i) => {
		const b = el('button');
		b.type = 'button';
		b.setAttribute('aria-label', 'Ver ' + d.nombre);
		b.addEventListener('click', () => { mostrarSlide(i); reiniciarAutoplay(); });
		return b;
	}));
	document.getElementById('carrusel-ctrl').hidden = carrusel.slides.length < 2;
	mostrarSlide(0);
	reiniciarAutoplay();
}

function iniciarCarrusel() {
	document.getElementById('carrusel-prev').addEventListener('click', () => { mostrarSlide(carrusel.actual - 1); reiniciarAutoplay(); });
	document.getElementById('carrusel-next').addEventListener('click', () => { mostrarSlide(carrusel.actual + 1); reiniciarAutoplay(); });
	const caja = document.querySelector('.carrusel');
	caja.addEventListener('mouseenter', () => clearInterval(carrusel.timer));
	caja.addEventListener('mouseleave', reiniciarAutoplay);
}

// ---------- Inicio ----------

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('[data-wa]').forEach(a => { a.href = waUrl(a.dataset.wa); });

	iniciarFiltros();
	iniciarCarrusel();

	cargarDeportes();
	cargarTipos();
	cargarCatalogo();
	cargarDisenos();
	cargarAccesorios();
	cargarCarrusel();
});
