/* Forza Garage — shared UI: slim top bar, car card, table, result strip, icons, filter logic */
(function () {
  const { useState } = React;
  const F = window.FORZA;

  // ── Filtering ───────────────────────────────────────────────────────────────
  function applyFilters(cars, st) {
    const q = st.search.trim().toLowerCase();
    return cars.filter((c) => {
      if (q && !(`${c.make} ${c.model} ${c.division}`.toLowerCase().includes(q))) return false;
      if (st.piClass && c.piClass !== st.piClass) return false;
      if (st.groupId) {
        const grp = F.DIVISION_GROUPS.find((g) => g.id === st.groupId);
        if (grp && !grp.divisions.includes(c.division)) return false;
      }
      if (st.division && c.division !== st.division) return false;
      if (st.make && c.make !== st.make) return false;
      if (st.drivetrain && c.drivetrain !== st.drivetrain) return false;
      if (st.country && c.country !== st.country) return false;
      if (st.source && c.source !== st.source) return false;
      if (st.owned === 'owned' && !c.owned) return false;
      if (st.owned === 'not-owned' && c.owned) return false;
      if (st.tags && st.tags.size > 0) {
        for (const t of st.tags) if (!c.tags.includes(t)) return false;
      }
      if (st.race) {
        const r = F.RACE_TYPES.find((x) => x.id === st.race);
        if (r && !r.tags.some((t) => c.tags.includes(t))) return false;
      }
      return true;
    });
  }

  function activeCount(st) {
    return [
      st.piClass !== '',
      st.division !== '' || st.groupId !== null,
      st.make !== '',
      st.drivetrain !== '',
      st.country !== '',
      st.source !== '',
      st.owned !== 'all',
      st.tags && st.tags.size > 0,
      st.race !== null,
    ].filter(Boolean).length;
  }

  // Count cars that WOULD match if a single facet value were applied on top of current state
  function countWith(cars, st, patch) {
    return applyFilters(cars, { ...st, ...patch }).length;
  }

  // ── Icons (match Nav.tsx / RaceIcons language: 16px, currentColor) ──────────
  const I = {
    garage: 'M1 6l7-4 7 4v8H1z M5 9h6v5H5z',
    database: null, // drawn inline below
    search: 'M11 11l3 3 M7.5 13a5.5 5.5 0 100-11 5.5 5.5 0 000 11z',
  };
  function SvgSearch(p) {
    return (
      <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" />
      </svg>
    );
  }
  function SvgGrid(p) {
    return (
      <svg width={p.s || 15} height={p.s || 15} viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    );
  }
  function SvgTable(p) {
    return (
      <svg width={p.s || 15} height={p.s || 15} viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="2" width="14" height="2.4" rx="0.6" /><rect x="1" y="6.8" width="14" height="2.4" rx="0.6" /><rect x="1" y="11.6" width="14" height="2.4" rx="0.6" />
      </svg>
    );
  }
  function SvgChevron(p) {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: p.open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .18s' }}>
        <path d="M6 4l4 4-4 4" />
      </svg>
    );
  }
  function SvgFilter(p) {
    return (
      <svg width={p.s || 15} height={p.s || 15} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M1.5 3.5h13 M3.5 8h9 M6 12.5h4" />
      </svg>
    );
  }
  function SvgClose(p) {
    return (
      <svg width={p.s || 12} height={p.s || 12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 3l10 10 M13 3L3 13" />
      </svg>
    );
  }
  function SvgPanelLeft(p) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" /><path d="M6 2.5v11" strokeWidth="1.5" />
      </svg>
    );
  }

  // Nav link icons
  function NavIcon({ kind }) {
    if (kind === 'garage') return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 6l7-4 7 4v8H1z" /><rect x="5" y="9" width="6" height="5" rx="0.5" /><rect x="6.5" y="9" width="1" height="5" /></svg>;
    if (kind === 'races') return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 2h16v2H0zM0 7h10v2H0zM0 12h13v2H0z" /></svg>;
    if (kind === 'builds') return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h5v2H2zM2 7h9v2H2zM2 11h7v2H2z" /><circle cx="13" cy="4" r="2" /></svg>;
    return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><ellipse cx="8" cy="4" rx="6" ry="2" /><path d="M2 4v3c0 1.1 2.7 2 6 2s6-.9 6-2V4" /><path d="M2 7v3c0 1.1 2.7 2 6 2s6-.9 6-2V7" /><path d="M2 10v2c0 1.1 2.7 2 6 2s6-.9 6-2v-2" /></svg>;
  }

  // ── Slim top bar (the retained header) ──────────────────────────────────────
  function TopBar({ page, search, setSearch, view, setView, onToggleSidebar, sidebarOpen, showInlineSearch, filterCount }) {
    const links = [
      { id: 'garage', label: 'My Garage', kind: 'garage' },
      { id: 'races', label: 'Races', kind: 'races' },
      { id: 'builds', label: 'Builds', kind: 'builds' },
      { id: 'cars', label: 'Car Database', kind: 'database' },
    ];
    const activePage = page === 'garage' ? 'garage' : 'cars';
    return (
      <nav className="topbar">
        <button className="tb-toggle" onClick={onToggleSidebar} title="Toggle filters" aria-label="Toggle filters">
          <SvgPanelLeft />
          {!sidebarOpen && filterCount > 0 && <span className="tb-badge">{filterCount}</span>}
        </button>
        <span className="tb-brand">Forza<span className="acc">Garage</span></span>
        <div className="tb-links">
          {links.map((l) => (
            <span key={l.id} className={`tb-link ${l.id === activePage ? 'active' : ''}`}>
              <NavIcon kind={l.kind} />
              <span className="tb-link-label">{l.label}</span>
            </span>
          ))}
        </div>
        <div className="tb-right">
          {showInlineSearch && (
            <div className="tb-search">
              <SvgSearch s={13} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search make, model…" />
            </div>
          )}
          <div className="tb-viewtoggle">
            <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} title="Grid"><SvgGrid s={14} /></button>
            <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')} title="Table"><SvgTable s={14} /></button>
          </div>
          <span className="tb-avatar">YT</span>
        </div>
      </nav>
    );
  }

  // ── Car card (CarCard.tsx) ──────────────────────────────────────────────────
  function classColors(piClass) {
    return F.PI_CLASSES.find((c) => c.id === piClass) || { bg: '#555', fg: '#fff' };
  }
  function CarCard({ car }) {
    const cc = classColors(car.piClass);
    const accent = F.DIVISION_ACCENT[car.division] || 'var(--fh-border)';
    return (
      <div className={`carcard ${car.owned ? 'owned' : ''}`}>
        <div className="cc-head" style={{ borderTopColor: accent }}>
          <span className="cc-class" style={{ background: cc.bg, color: cc.fg }}>{car.piClass}</span>
          <span className="cc-pi">{car.piRating}</span>
          {car.pinned && <span className="cc-star" title="Favourite">★</span>}
          {car.owned && <span className="cc-owned">Owned</span>}
        </div>
        <div className="cc-body">
          <div className="cc-meta">{car.year} · {car.make}</div>
          <div className="cc-model">{car.model}</div>
          <div className="cc-div">{car.division}</div>
          <div className="cc-specs">
            <span>{car.drivetrain}</span><span>{car.country}</span>
          </div>
          <div className="cc-src">
            <span className={`src-${car.source.replace(/\s+/g, '')}`}>{car.source}</span>
            <span className="dot">·</span>
            <span className="cc-cr">{car.value.toLocaleString()} Cr</span>
          </div>
        </div>
        {!car.owned && <div className="cc-foot"><button className="cc-add">Add to garage</button></div>}
      </div>
    );
  }

  // ── Table (GarageView table view) — sortable headers ────────────────────────
  function SortTh({ label, k, sort, onSort, className }) {
    const active = sort.key === k;
    return (
      <th className={`${className || ''} sortable ${active ? 'sorted' : ''}`} onClick={() => onSort(k)}>
        <span className="th-in">{label}<span className="th-arrow">{active ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span></span>
      </th>
    );
  }
  function CarTable({ cars, sort, onSort }) {
    return (
      <div className="cartable-wrap">
        <table className="cartable">
          <thead>
            <tr>
              <SortTh label="Class" k="piClass" sort={sort} onSort={onSort} />
              <SortTh label="PI" k="piRating" sort={sort} onSort={onSort} />
              <SortTh label="Year" k="year" sort={sort} onSort={onSort} />
              <SortTh label="Make" k="make" sort={sort} onSort={onSort} />
              <SortTh label="Model" k="model" sort={sort} onSort={onSort} />
              <SortTh label="Division" k="division" sort={sort} onSort={onSort} className="hide-md" />
              <SortTh label="Drive" k="drivetrain" sort={sort} onSort={onSort} className="hide-lg" />
              <SortTh label="Country" k="country" sort={sort} onSort={onSort} className="hide-lg" />
              <SortTh label="Source" k="source" sort={sort} onSort={onSort} className="hide-xl" />
              <SortTh label="Value" k="value" sort={sort} onSort={onSort} className="ta-r hide-xl" />
              <th>Garage</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => {
              const cc = classColors(car.piClass);
              return (
                <tr key={car.id} className={car.owned ? 'row-owned' : ''}>
                  <td><span className="cc-class sm" style={{ background: cc.bg, color: cc.fg }}>{car.piClass}</span></td>
                  <td className="tnum">{car.piRating}</td>
                  <td className="tnum muted">{car.year}</td>
                  <td>{car.make}</td>
                  <td className="strong">{car.model}</td>
                  <td className="hide-md muted">{car.division}</td>
                  <td className="hide-lg muted">{car.drivetrain}</td>
                  <td className="hide-lg muted">{car.country}</td>
                  <td className="hide-xl muted">{car.source}</td>
                  <td className="ta-r tnum hide-xl muted">{car.value.toLocaleString()}</td>
                  <td>{car.owned ? <span className="t-owned">Owned</span> : <button className="t-add">＋ Add</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Page header + owned progress (shared content top) ───────────────────────
  function ContentHeader({ page, cars, filtered }) {
    const ownedCount = cars.filter((c) => c.owned).length;
    const pct = cars.length ? (ownedCount / cars.length) * 100 : 0;
    return (
      <header className="content-head">
        <div className="ch-row">
          <div>
            <h1 className="ch-title">{page === 'garage' ? 'My Garage' : 'Car Database'}</h1>
            <p className="ch-sub">
              {page === 'garage'
                ? `${ownedCount} cars in your collection`
                : `Browse all ${cars.length} cars — mark the ones you own to build your garage.`}
            </p>
          </div>
          <div className="ch-progress">
            <div className="chp-num"><b>{ownedCount}</b><span> / {cars.length} owned</span></div>
            <div className="chp-bar"><div style={{ width: pct + '%' }} /></div>
          </div>
        </div>
      </header>
    );
  }

  // ── Results region (grid/table + count + empty state) ───────────────────────
  function Results({ cars, view, sort, onSort }) {
    if (cars.length === 0) {
      return (
        <div className="empty">
          <div className="empty-emoji">🚗</div>
          <div className="empty-title">No cars found</div>
          <div className="empty-sub">Try adjusting your filters</div>
        </div>
      );
    }
    return (
      <div className="results">
        {view === 'grid'
          ? <div className="grid">{cars.map((c) => <CarCard key={c.id} car={c} />)}</div>
          : <CarTable cars={cars} sort={sort} onSort={onSort} />}
      </div>
    );
  }

  window.FZ = Object.assign(window.FZ || {}, {
    applyFilters, activeCount, countWith,
    SvgSearch, SvgGrid, SvgTable, SvgChevron, SvgFilter, SvgClose, SvgPanelLeft, NavIcon,
    TopBar, CarCard, CarTable, ContentHeader, Results, classColors,
  });
})();
