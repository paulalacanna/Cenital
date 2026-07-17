/* =================================================================
   CENITAL — Lógica compartida
   · Sesión simulada (localStorage)
   · Preferencias del usuario (intereses, frecuencia, autores)
   · Inyección de navbar / footer / menú lateral
   · Filtro de Descubrir
   · Personalización del Home
   ================================================================= */
(function () {
    "use strict";

    const LS_SESSION = "cenital.session";
    const LS_PREFS   = "cenital.prefs";
    const LS_THEME   = "cenital.theme";

    /* ---------------- Tema (claro / oscuro) ---------------- */
    const Theme = {
        resolve() {
            const saved = localStorage.getItem(LS_THEME);
            if (saved === "light" || saved === "dark") return saved;
            return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        },
        current() { return document.documentElement.getAttribute("data-theme") || this.resolve(); },
        apply(t) { document.documentElement.setAttribute("data-theme", t); },
        set(t) { localStorage.setItem(LS_THEME, t); this.apply(t); syncThemeToggles(); },
        toggle() { this.set(this.current() === "dark" ? "light" : "dark"); }
    };
    // Aplica el tema lo antes posible para evitar parpadeo.
    // Las páginas de auth (tarjeta blanca sobre fondo) se fijan en claro.
    if (!(document.body && document.body.classList.contains("auth-page"))) {
        Theme.apply(Theme.resolve());
    } else {
        Theme.apply("light");
    }

    /* ---------------- Sesión ---------------- */
    const Auth = {
        get() {
            try { return JSON.parse(localStorage.getItem(LS_SESSION)) || null; }
            catch (e) { return null; }
        },
        isLoggedIn() { return !!this.get(); },
        login(user) {
            // user: { firstName, lastName, email }
            localStorage.setItem(LS_SESSION, JSON.stringify(user));
            return user;
        },
        logout() { localStorage.removeItem(LS_SESSION); localStorage.removeItem("cenital.member"); }
    };

    /* ---------------- Membresía Mejores Amigos ---------------- */
    const LS_MEMBER = "cenital.member";
    const Member = {
        get() {
            try { return JSON.parse(localStorage.getItem(LS_MEMBER)) || null; }
            catch (e) { return null; }
        },
        // Es socio solo si pagó y además tiene sesión activa.
        isMember() { return !!this.get() && Auth.isLoggedIn(); }
    };

    /* ---------------- Preferencias ---------------- */
    // `subscribedNewsletters` arranca con una selección sembrada para que un
    // lector nuevo encuentre contenido en "Mis newsletters". Una vez que el
    // usuario administra sus suscripciones, su elección (incluso vacía) manda.
    const defaultPrefs = {
        interests: [],
        readingFrequency: "",
        followedAuthors: [],
        subscribedNewsletters: ["otr", "sistema2", "rollover", "cfc", "kohan"],
        reservedEvents: [],
        readNotifications: [],   // ids de notificaciones ya leídas
        mutedNotifGroups: []     // grupos silenciados: "newsletter" | "destacado"
    };
    const Prefs = {
        get() {
            try {
                return Object.assign({}, defaultPrefs, JSON.parse(localStorage.getItem(LS_PREFS)) || {});
            } catch (e) { return Object.assign({}, defaultPrefs); }
        },
        set(prefs) {
            const merged = Object.assign({}, this.get(), prefs);
            localStorage.setItem(LS_PREFS, JSON.stringify(merged));
            return merged;
        },
        hasAny() {
            const p = this.get();
            return p.interests.length > 0 || !!p.readingFrequency || p.followedAuthors.length > 0;
        }
    };

    /* ---------------- Utilidades ---------------- */
    function initials(name) {
        return (name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
    }
    function el(html) {
        const t = document.createElement("template");
        t.innerHTML = html.trim();
        return t.content.firstElementChild;
    }
    // Toast efímero reutilizable. Crea el elemento la primera vez que se usa.
    function toast(msg) {
        let t = document.getElementById("cenital-toast");
        if (!t) { t = el('<div class="toast" id="cenital-toast"></div>'); document.body.appendChild(t); }
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toast._t);
        toast._t = setTimeout(() => t.classList.remove("show"), 2200);
    }
    // Retrato: usa la foto real de la voz si existe; si no, las iniciales.
    function portrait(extraClass, v) {
        if (v && v.image) {
            return `<div class="${extraClass} portrait photo" style="background-image:url('${v.image}')" role="img" aria-label="${v.name}"></div>`;
        }
        return `<div class="${extraClass} portrait"><span class="initials">${initials(v ? v.name : "")}</span></div>`;
    }

    const LOGO_IMG = '<img src="imagenes/Cenital.svg" alt="Cenital" class="logo-img">';
    const THEME_BTN = '<button class="theme-toggle" data-theme-toggle aria-label="Cambiar tema claro u oscuro" title="Cambiar tema">' +
        '<span class="icon-light" aria-hidden="true">☾</span><span class="icon-dark" aria-hidden="true">☀</span></button>';

    function syncThemeToggles() {
        const pressed = (document.documentElement.getAttribute("data-theme") === "dark");
        document.querySelectorAll("[data-theme-toggle]").forEach(b => b.setAttribute("aria-pressed", String(pressed)));
    }

    const NAV_ITEMS = [
        { href: "editoriales.html", label: "Editoriales", key: "editoriales" },
        { href: "amigos.html",      label: "Mejores Amigos", key: "amigos" },
        { href: "descubrir.html",   label: "Descubrir", key: "descubrir" },
        { href: "index.html#temas", label: "Temas", key: "temas" },
        { href: "especiales.html",  label: "Especiales", key: "especiales" },
        { href: "perfil.html",      label: "Mi Cenital", key: "micenital" }
    ];

    // Submenús desplegables (la flechita del diseño). Todos los items navegan.
    function submenuFor(key) {
        const D = window.CENITAL_DATA;
        switch (key) {
            case "editoriales":
                return D ? D.VOICES.map(v => ({ label: v.name, href: "editoriales.html?id=" + v.id })) : [];
            case "amigos":
                return [{ label: "Sumate", href: "amigos.html" }, { label: "Próximos encuentros", href: "amigos.html" }];
            case "descubrir":
                return D ? D.CATEGORIES.map(c => ({ label: c.label, href: "descubrir.html?categoria=" + c.key })) : [];
            case "temas":
                return D ? D.CATEGORIES.map(c => ({ label: c.label, href: "index.html#temas" })) : [];
            case "especiales":
                return D ? D.SPECIALS.slice(0, 5).map(s => ({ label: s.title, href: "especial.html?id=" + s.id })) : [];
            case "micenital":
                return Auth.isLoggedIn()
                    ? [{ label: "Perfil", href: "perfil.html" }, { label: "Mis voces", href: "perfil.html" }, { label: "Cerrar sesión", href: "#", logout: true }]
                    : [{ label: "Iniciar Sesión", href: "login.html" }, { label: "Crear cuenta", href: "crear-cuenta.html" }];
            default: return [];
        }
    }

    /* ---------------- Navbar ---------------- */
    function buildNavbar(active) {
        const session = Auth.get();
        const links = NAV_ITEMS.map(i => {
            const sub = submenuFor(i.key);
            const subHtml = sub.length
                ? `<div class="nav-dropdown" role="menu">${sub.map(s =>
                    `<a href="${s.href}" role="menuitem"${s.logout ? ' data-logout' : ''}>${s.label}</a>`).join("")}</div>`
                : "";
            return `<div class="nav-item">
                        <a href="${i.href}"${i.key === active ? ' class="active" aria-current="page"' : ''}>${i.label} <span class="caret" aria-hidden="true">&#9662;</span></a>
                        ${subHtml}
                    </div>`;
        }).join("");

        let actions;
        if (session) {
            actions = `
                <div class="nav-greeting">
                    <span class="hi">Hola,</span>
                    <span class="name">${session.firstName}</span>
                </div>
                <a href="perfil.html" class="avatar" aria-label="Ir a Mi Cenital">${initials(session.firstName + " " + (session.lastName || ""))}</a>`;
        } else {
            actions = `
                <a href="crear-cuenta.html" class="btn btn-primary btn-sm">Sumate</a>
                <a href="login.html" class="btn btn-secondary btn-sm">Iniciar Sesión</a>`;
        }

        return el(`
            <header class="navbar">
                <div class="navbar-inner">
                    <button class="nav-toggle" aria-label="Abrir menú" data-drawer-open>&#9776;</button>
                    <a href="index.html" class="logo" aria-label="Cenital, inicio">${LOGO_IMG}</a>
                    <nav class="nav-links" aria-label="Principal">${links}</nav>
                    <div class="nav-actions">${THEME_BTN}${actions}</div>
                </div>
            </header>`);
    }

    /* ---------------- Menú lateral (móvil) ---------------- */
    function buildDrawer(active) {
        const links = NAV_ITEMS.map(i =>
            `<a href="${i.href}"${i.key === active ? ' class="active"' : ''}>${i.label}</a>`
        ).join("");
        const session = Auth.get();
        const authLinks = session
            ? `<a href="perfil.html">Mi Cenital</a><a href="#" data-logout>Cerrar sesión</a>`
            : `<a href="login.html">Iniciar Sesión</a><a href="crear-cuenta.html">Sumate</a>`;

        return el(`
            <div class="drawer-overlay" data-drawer-overlay>
                <aside class="drawer" role="dialog" aria-label="Menú de navegación">
                    <div class="drawer-head">
                        <span class="logo">${LOGO_IMG}</span>
                        <button class="drawer-close" aria-label="Cerrar menú" data-drawer-close>&times;</button>
                    </div>
                    ${links}
                    <hr class="divider">
                    ${authLinks}
                    <hr class="divider">
                    <a href="#" data-theme-toggle>Cambiar tema (claro / oscuro)</a>
                </aside>
            </div>`);
    }

    /* ---------------- Footer ---------------- */
    function buildFooter() {
        const cols = [
            ["Temas", ["Ciencia y tecnología", "Ciudades", "Deportes", "Economía", "Mundo", "Opinión", "Política"]],
            ["Newsletters", ["Suscribite a nuestros newsletters"]],
            ["Especiales", ["Vox Populi", "El año del león", "Knock Out", "Poner el pecho", "Quiero plata fácil", "Ver todos"]],
            ["Podcasts", ["Escuchá nuestros podcasts", "Último Round", "La Revancha"]],
            ["Cenital", ["Nuestro periodismo", "Sumarse a apoyar", "Contacto", "Política de privacidad", "Directrices editoriales"]],
            ["Seguinos en", ["YouTube", "X (Twitter)", "Instagram", "Facebook", "Telegram", "LinkedIn"]]
        ];
        const html = cols.map(([title, items]) =>
            `<div class="footer-col"><h5>${title}</h5>${items.map(i => `<a href="#">${i}</a>`).join("")}</div>`
        ).join("");
        return el(`<footer class="footer"><div class="footer-inner">${html}</div></footer>`);
    }

    /* ---------------- Montaje del layout ---------------- */
    function mountChrome() {
        const body = document.body;
        const active = body.dataset.page || "";

        const headerSlot = document.getElementById("site-header");
        if (headerSlot) {
            headerSlot.replaceWith(buildNavbar(active));
            document.body.prepend(buildDrawer(active));
        }
        const footerSlot = document.getElementById("site-footer");
        if (footerSlot) footerSlot.replaceWith(buildFooter());

        wireDrawer();
        wireLogout();
        wireTheme();
    }

    function wireTheme() {
        document.querySelectorAll("[data-theme-toggle]").forEach(btn =>
            btn.addEventListener("click", e => {
                if (btn.tagName === "A") e.preventDefault();
                Theme.toggle();
            })
        );
        syncThemeToggles();
    }

    function wireDrawer() {
        const overlay = document.querySelector("[data-drawer-overlay]");
        if (!overlay) return;
        const open = () => overlay.classList.add("open");
        const close = () => overlay.classList.remove("open");
        document.querySelectorAll("[data-drawer-open]").forEach(b => b.addEventListener("click", open));
        document.querySelectorAll("[data-drawer-close]").forEach(b => b.addEventListener("click", close));
        overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
        document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    }

    function wireLogout() {
        document.querySelectorAll("[data-logout]").forEach(b =>
            b.addEventListener("click", e => {
                e.preventDefault();
                Auth.logout();
                window.location.href = "index.html";
            })
        );
    }

    /* ---------------- Filtro de Descubrir ---------------- */
    function initDiscover() {
        const root = document.getElementById("discover-root");
        if (!root) return;
        const D = window.CENITAL_DATA;

        const state = { categories: new Set(), frequencies: new Set(), formats: new Set(), query: "" };
        const resultsEl = root.querySelector("#discover-results");
        const countEl = root.querySelector("#discover-count");

        function matches(v) {
            if (state.categories.size && !state.categories.has(v.category)) return false;
            if (state.frequencies.size && !state.frequencies.has(v.frequency)) return false;
            if (state.formats.size && !v.formats.some(f => state.formats.has(f))) return false;
            if (state.query && !v.name.toLowerCase().includes(state.query.toLowerCase())) return false;
            return true;
        }

        function render() {
            const list = D.VOICES.filter(matches);
            countEl.textContent = list.length === D.VOICES.length
                ? `Mostrando las ${list.length} voces`
                : `Mostrando ${list.length} de ${D.VOICES.length} voces`;

            if (!list.length) {
                resultsEl.innerHTML = `
                    <div class="empty-state" style="grid-column:1/-1">
                        <strong>No encontramos voces con esos filtros</strong>
                        Probá quitar algún criterio o limpiar los filtros.
                    </div>`;
                return;
            }
            resultsEl.innerHTML = list.map(v => `
                <a class="voice-result" href="editoriales.html?id=${v.id}">
                    ${portrait("vr-img", v)}
                    <div class="vr-body">
                        <h3>${v.name}</h3>
                        <p class="vr-role">${v.role}</p>
                        <p class="vr-bio">${v.bio}</p>
                        <span class="tag tag-cat-${v.category}">${D.categoryLabel(v.category)}</span>
                    </div>
                </a>`).join("");
        }

        // Pills
        root.querySelectorAll(".pill[data-filter]").forEach(pill => {
            pill.addEventListener("click", () => {
                const group = pill.dataset.filter; // categories|frequencies|formats
                const value = pill.dataset.value;
                const set = state[group];
                if (set.has(value)) { set.delete(value); pill.setAttribute("aria-pressed", "false"); }
                else { set.add(value); pill.setAttribute("aria-pressed", "true"); }
                render();
            });
        });

        // Búsqueda
        const search = root.querySelector("#discover-search");
        if (search) search.addEventListener("input", e => { state.query = e.target.value; render(); });

        // Limpiar
        const clear = root.querySelector("#discover-clear");
        if (clear) clear.addEventListener("click", () => {
            state.categories.clear(); state.frequencies.clear(); state.formats.clear(); state.query = "";
            root.querySelectorAll(".pill[data-filter]").forEach(p => p.setAttribute("aria-pressed", "false"));
            if (search) search.value = "";
            render();
        });

        // Categoría preseleccionada por URL (ej: descubrir.html?categoria=politica),
        // como cuando se llega desde el submenú "Descubrir" del navbar.
        const urlCategoria = new URLSearchParams(window.location.search).get("categoria");
        if (urlCategoria && D.CATEGORIES.some(c => c.key === urlCategoria)) {
            state.categories.add(urlCategoria);
            const pill = root.querySelector(`.pill[data-filter="categories"][data-value="${urlCategoria}"]`);
            if (pill) pill.setAttribute("aria-pressed", "true");
        }

        render();
    }

    /* ---------------- Personalización del Home ---------------- */
    function initHomePersonalization() {
        const grid = document.getElementById("temas-grid");
        const banner = document.getElementById("perso-banner");
        if (!grid) return;
        const D = window.CENITAL_DATA;

        const heroSlot = document.getElementById("personal-hero");
        const interestsBar = document.getElementById("interests-bar");

        // Editor inline, insertado una sola vez bajo el banner y oculto por defecto.
        // Permite ajustar gustos desde la home sin ir a Mi Cenital ni navegar.
        let editor = null;
        if (banner) {
            editor = el('<div class="perso-editor" id="perso-editor" hidden></div>');
            banner.parentElement.appendChild(editor);
        }

        // Hero de bienvenida (solo con sesión): saluda y resume el estado de la portada.
        function renderHero() {
            if (!heroSlot) return;
            const session = Auth.get();
            if (!session) { heroSlot.innerHTML = ""; return; }
            const has = Prefs.get().interests.length > 0;
            heroSlot.innerHTML = `
                <div class="phero">
                    <div class="phero-left">
                        <span class="phero-greeting">¡Hola, <strong>${session.firstName}</strong>!</span>
                        <span class="phero-sub">${has
                            ? "Tu portada está ordenada según tus temas de interés."
                            : "Elegí tus temas y armamos tu portada a tu medida."}</span>
                    </div>
                    <a href="perfil.html" class="btn ${has ? "btn-outline" : "btn-primary"} btn-sm">
                        ${has ? "Editar preferencias" : "Personalizar mi Cenital"}
                    </a>
                </div>`;
        }

        // Barra "Tus temas": chips de los intereses activos como señal visual sobre
        // la grilla (solo lectura; la edición vive en el banner de arriba).
        function renderInterestsBar() {
            if (!interestsBar) return;
            const ints = Prefs.get().interests;
            if (!ints.length) { interestsBar.innerHTML = ""; return; }
            const chips = ints.map(k => `<span class="int-chip">${D.categoryLabel(k)}</span>`).join("");
            interestsBar.innerHTML = `
                <div class="int-bar">
                    <span class="int-bar-label">Tus temas</span>
                    <div class="int-bar-chips">${chips}</div>
                </div>`;
        }

        function chipsHtml(items, getKey, getLabel, selected, single) {
            return items.map(it => {
                const key = getKey(it);
                const on = single ? selected === key : selected.indexOf(key) !== -1;
                return `<button type="button" class="chip" data-key="${key}" aria-pressed="${on}">${getLabel(it)}</button>`;
            }).join("");
        }

        function renderBanner() {
            if (!banner) return;
            const prefs = Prefs.get();
            const session = Auth.get();
            if (!Prefs.hasAny()) {
                banner.innerHTML = `
                    <div class="pb-text">
                        <h3>Armá tu Cenital</h3>
                        <p>Elegí tus temas, autores y frecuencia de lectura para recibir una portada a tu medida.</p>
                    </div>
                    <button class="btn btn-primary" data-perso-toggle aria-expanded="false" aria-controls="perso-editor">Personalizar</button>`;
            } else {
                const intsLabels = prefs.interests.map(D.categoryLabel).join(", ");
                banner.innerHTML = `
                    <div class="pb-text">
                        <h3>Tu Cenital${session ? ", " + session.firstName : ""}</h3>
                        <p>Priorizamos ${intsLabels || "tus temas"}${prefs.readingFrequency ? ` · lectura ${prefs.readingFrequency}` : ""}. Ajustá tus gustos acá mismo.</p>
                    </div>
                    <button class="btn btn-outline" data-perso-toggle aria-expanded="false" aria-controls="perso-editor">Editar preferencias</button>`;
            }
            const btn = banner.querySelector("[data-perso-toggle]");
            if (btn) btn.addEventListener("click", () => toggleEditor(btn));
        }

        function toggleEditor(btn) {
            const willOpen = editor.hidden;
            if (willOpen) renderEditor();
            editor.hidden = !willOpen;
            btn.setAttribute("aria-expanded", String(willOpen));
        }

        function renderEditor() {
            const prefs = Prefs.get();
            editor.innerHTML = `
                <div class="pe-group">
                    <label>Temas de interés</label>
                    <div class="chip-group" data-pe="interests">${chipsHtml(D.CATEGORIES, c => c.key, c => c.label, prefs.interests, false)}</div>
                </div>
                <div class="pe-group">
                    <label>¿Con qué frecuencia leés?</label>
                    <div class="chip-group" data-pe="frequency">${chipsHtml(D.FREQUENCIES, f => f.key, f => f.label, prefs.readingFrequency, true)}</div>
                </div>
                <div class="pe-group">
                    <label>Voces que seguís</label>
                    <div class="chip-group" data-pe="authors">${chipsHtml(D.VOICES, v => v.id, v => v.name, prefs.followedAuthors, false)}</div>
                </div>
                <div class="pe-actions">
                    <button type="button" class="btn btn-ghost-light btn-sm" data-perso-cancel>Cancelar</button>
                    <button type="button" class="btn btn-primary btn-sm" data-perso-save>Guardar y actualizar</button>
                </div>`;

            editor.querySelectorAll("[data-pe]").forEach(group => {
                const single = group.dataset.pe === "frequency";
                group.querySelectorAll(".chip").forEach(chip => {
                    chip.addEventListener("click", () => {
                        const pressed = chip.getAttribute("aria-pressed") === "true";
                        if (single) group.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", "false"));
                        chip.setAttribute("aria-pressed", pressed ? "false" : "true");
                    });
                });
            });

            const collect = pe => Array.from(editor.querySelectorAll(`[data-pe="${pe}"] .chip[aria-pressed="true"]`)).map(c => c.dataset.key);

            editor.querySelector("[data-perso-cancel]").addEventListener("click", () => {
                editor.hidden = true;
                const btn = banner.querySelector("[data-perso-toggle]");
                if (btn) btn.setAttribute("aria-expanded", "false");
            });
            editor.querySelector("[data-perso-save]").addEventListener("click", () => {
                Prefs.set({
                    interests: collect("interests"),
                    readingFrequency: collect("frequency")[0] || "",
                    followedAuthors: collect("authors")
                });
                editor.hidden = true;
                renderHero();          // actualiza el resumen del hero
                renderBanner();        // refleja el nuevo estado y recablea el toggle
                renderInterestsBar();  // refresca los chips de "Tus temas"
                renderTemas();         // re-personaliza la portada en el lugar
                toast("Actualizamos tu portada ✓");
            });
        }

        // Ordenamiento por preferencias: intereses y autores seguidos primero.
        // Si la frecuencia es "quincenal" (lee poco) priorizamos lecturas breves.
        function renderTemas() {
            const prefs = Prefs.get();
            const has = Prefs.hasAny();

            const score = a => {
                let s = 0;
                if (prefs.interests.includes(a.category)) s += 5;
                if (prefs.followedAuthors.includes(a.author)) s += 4;
                if (a.featured) s += 1;
                if (prefs.readingFrequency === "quincenal") {
                    const mins = parseInt(a.readingTime, 10) || 99;
                    if (mins <= 5) s += 2; // contenidos breves para quien lee poco
                }
                return s;
            };

            const articles = D.ARTICLES.slice();
            if (has) articles.sort((a, b) => score(b) - score(a));

            const articleCard = a => {
                const isPref = has && (prefs.interests.includes(a.category) || prefs.followedAuthors.includes(a.author));
                const imgAttr = a.image
                    ? `class="card-img bg-cover" style="background-image:url('${a.image}')"`
                    : `class="card-img img-mono"`;
                return `
                    <a class="article-card ${isPref ? "is-pref" : ""}" href="articulo.html?id=${a.id}">
                        <div ${imgAttr}></div>
                        <div class="card-body">
                            ${isPref ? '<span class="pref-flag">Para vos</span>' : ""}
                            <span class="tag tag-cat-${a.category}">${D.categoryLabel(a.category)}</span>
                            <h3>${a.title}</h3>
                            <p class="excerpt">${a.excerpt}</p>
                            <div class="meta">
                                <span class="newsletter-name">${a.newsletter}</span>
                                <span>${a.readingTime}</span>
                            </div>
                        </div>
                    </a>`;
            };

            // Un subtítulo por cada tema; los intereses elegidos van primero.
            const cats = D.CATEGORIES.slice();
            if (has) {
                cats.sort((a, b) =>
                    (prefs.interests.includes(a.key) ? 0 : 1) - (prefs.interests.includes(b.key) ? 0 : 1));
            }

            // Banners de quiebre: cortan la repetición de la grilla cada dos temas.
            const bannerAmigos = `
                <div class="temas-break temas-break--amigos">
                    <div class="tb-content">
                        <span class="tb-tag">Mejores Amigos</span>
                        <h3 class="tb-title">Las notas más exclusivas, antes que nadie</h3>
                        <p class="tb-text">Más de 8.000 lectores sostienen Cenital sin pauta ni presiones. Sumate y accedé a charlas con la redacción y contenido exclusivo.</p>
                        <a href="amigos.html" class="btn btn-primary btn-sm">Conocer Mejores Amigos →</a>
                    </div>
                    <div class="tb-icons" aria-hidden="true">
                        <span>🔒 Sin pauta</span><span>Charlas exclusivas</span><span>+8.000 lectores</span>
                    </div>
                </div>`;
            const bannerNewsletter = `
                <div class="temas-break temas-break--newsletter">
                    <div class="tb-content">
                        <span class="tb-tag tb-tag--nl">Newsletters</span>
                        <h3 class="tb-title">El periodismo de Cenital, directo en tu correo</h3>
                        <p class="tb-text">Cada editorial es también un newsletter. Elegí los temas que más te interesan y recibilos cuando quieras.</p>
                        <a href="perfil.html" class="btn btn-outline btn-sm">Elegir mis newsletters →</a>
                    </div>
                </div>`;

            // Filtramos primero los temas con notas para que el índice del quiebre
            // sea estable (no depende de categorías vacías).
            const catsWithItems = cats
                .map(cat => ({ cat, items: articles.filter(a => a.category === cat.key) }))
                .filter(g => g.items.length > 0);

            grid.innerHTML = catsWithItems.map(({ cat, items }, index) => {
                let breakHtml = "";
                if (index === 2) breakHtml = bannerAmigos;
                if (index === 4) breakHtml = bannerNewsletter;
                return `
                    ${breakHtml}
                    <div class="temas-group">
                        <h3 class="temas-subtitle">
                            ${cat.label}
                            <span class="count">${items.length} ${items.length === 1 ? "nota" : "notas"}</span>
                        </h3>
                        <div class="articles-grid">${items.map(articleCard).join("")}</div>
                    </div>`;
            }).join("");
        }

        renderHero();
        renderBanner();
        renderInterestsBar();
        renderTemas();
    }

    /* ---------------- Exponer y arrancar ---------------- */
    window.Cenital = { Auth, Prefs, Theme, Member, initials, portrait, toast };

    document.addEventListener("DOMContentLoaded", function () {
        mountChrome();
        initDiscover();
        initHomePersonalization();
    });
})();