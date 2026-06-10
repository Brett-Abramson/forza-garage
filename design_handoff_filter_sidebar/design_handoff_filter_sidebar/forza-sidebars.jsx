/* Forza Garage — three filter-sidebar directions
   A: Sectioned accordion rail   B: Faceted list w/ live counts   C: Compact primary + more */
(function () {
  const { useState } = React;
  const F = window.FORZA;
  const { SvgChevron, SvgSearch, SvgClose, SvgFilter, activeCount, countWith } = window.FZ;

  // ── tiny shared controls ────────────────────────────────────────────────────
  function SideSearch({ st, set }) {
    return (
      <div className="side-search">
        <SvgSearch s={14} />
        <input value={st.search} onChange={(e) => set({ search: e.target.value })} placeholder="Search make, model…" />
        {st.search && <button className="ss-clear" onClick={() => set({ search: '' })}><SvgClose s={11} /></button>}
      </div>
    );
  }

  function ClassChips({ st, set }) {
    return (
      <div className="chiprow">
        {F.PI_CLASSES.map((c) => (
          <button key={c.id}
            className={`piclass ${st.piClass === c.id ? 'on' : ''}`}
            style={st.piClass === c.id ? { background: c.bg, color: c.fg, borderColor: c.bg } : {}}
            onClick={() => set({ piClass: st.piClass === c.id ? '' : c.id })}>
            {c.label}
          </button>
        ))}
      </div>
    );
  }

  function Segmented({ value, options, onChange }) {
    return (
      <div className="segmented">
        {options.map((o) => (
          <button key={o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    );
  }

  function Disclosure({ title, count, defaultOpen, children }) {
    const [open, setOpen] = useState(defaultOpen !== false);
    return (
      <div className={`disc ${open ? 'open' : ''}`}>
        <button className="disc-head" onClick={() => setOpen(!open)}>
          <SvgChevron open={open} />
          <span className="disc-title">{title}</span>
          {count > 0 && <span className="disc-badge">{count}</span>}
        </button>
        {open && <div className="disc-body">{children}</div>}
      </div>
    );
  }

  function FilterHeader({ st, set, label }) {
    const n = activeCount(st);
    return (
      <div className="side-top">
        <div className="side-title"><SvgFilter s={14} /> {label || 'Filters'}{n > 0 && <span className="side-count">{n}</span>}</div>
        {n > 0 && <button className="side-clear" onClick={() => set(window.FZ_RESET)}>Clear all</button>}
      </div>
    );
  }

  // Active-filter removable pills (shared by B & C)
  function ActivePills({ st, set }) {
    const pills = [];
    if (st.piClass) pills.push(['Class ' + st.piClass, () => set({ piClass: '' })]);
    if (st.groupId) { const g = F.DIVISION_GROUPS.find((x) => x.id === st.groupId); pills.push([g.name, () => set({ groupId: null, division: '' })]); }
    if (st.division) pills.push([st.division, () => set({ division: '' })]);
    if (st.make) pills.push([st.make, () => set({ make: '' })]);
    if (st.drivetrain) pills.push([st.drivetrain, () => set({ drivetrain: '' })]);
    if (st.country) pills.push([st.country, () => set({ country: '' })]);
    if (st.source) pills.push([st.source, () => set({ source: '' })]);
    if (st.owned !== 'all') pills.push([st.owned === 'owned' ? 'Owned' : 'Not owned', () => set({ owned: 'all' })]);
    if (st.tags) st.tags.forEach((t) => pills.push(['#' + t, () => { const n = new Set(st.tags); n.delete(t); set({ tags: n }); }]));
    if (st.race) { const r = F.RACE_TYPES.find((x) => x.id === st.race); pills.push([r.icon + ' ' + r.name, () => set({ race: null })]); }
    if (pills.length === 0) return null;
    return (
      <div className="active-pills">
        {pills.map(([label, rm], i) => (
          <button key={i} className="apill" onClick={rm}>{label}<SvgClose s={10} /></button>
        ))}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VARIANT A — Sectioned accordion rail
  // ════════════════════════════════════════════════════════════════════════════
  function SidebarA({ st, set, cars }) {
    const grp = st.groupId ? F.DIVISION_GROUPS.find((g) => g.id === st.groupId) : null;
    return (
      <div className="side side-a">
        <FilterHeader st={st} set={set} />
        <SideSearch st={st} set={set} />
        <div className="side-scroll">
          <Disclosure title="Vehicle class" count={st.piClass ? 1 : 0}>
            <ClassChips st={st} set={set} />
          </Disclosure>

          <Disclosure title="Category" count={(st.groupId ? 1 : 0) + (st.division ? 1 : 0)}>
            <div className="chips">
              {F.DIVISION_GROUPS.map((g) => (
                <button key={g.id} className={`chip ${st.groupId === g.id ? 'on' : ''}`}
                  onClick={() => set({ groupId: st.groupId === g.id ? null : g.id, division: '' })}>
                  <span className="chip-em">{g.icon}</span>{g.name}
                </button>
              ))}
            </div>
            {grp && (
              <div className="subchips">
                {grp.divisions.filter((d) => F.DIVISIONS.includes(d)).map((d) => (
                  <button key={d} className={`subchip ${st.division === d ? 'on' : ''}`}
                    onClick={() => set({ division: st.division === d ? '' : d })}>{d}</button>
                ))}
              </div>
            )}
          </Disclosure>

          <Disclosure title="Make" count={st.make ? 1 : 0} defaultOpen={false}>
            <div className="optlist">
              {F.MAKES.map((m) => (
                <label key={m} className="opt">
                  <input type="radio" name="make-a" checked={st.make === m} onChange={() => set({ make: m })} />
                  <span>{m}</span>
                </label>
              ))}
            </div>
          </Disclosure>

          <Disclosure title="Drivetrain" count={st.drivetrain ? 1 : 0}>
            <Segmented value={st.drivetrain} onChange={(v) => set({ drivetrain: st.drivetrain === v ? '' : v })}
              options={F.DRIVETRAINS.map((d) => ({ value: d, label: d }))} />
          </Disclosure>

          <Disclosure title="Source" count={st.source ? 1 : 0} defaultOpen={false}>
            <div className="chips">
              {F.SOURCE_CHIPS.map((s) => (
                <button key={s.match} className={`chip ${st.source === s.match ? 'on' : ''}`}
                  onClick={() => set({ source: st.source === s.match ? '' : s.match })}>{s.label}</button>
              ))}
            </div>
          </Disclosure>

          <Disclosure title="Race type" count={st.race ? 1 : 0} defaultOpen={false}>
            <div className="chips">
              {F.RACE_TYPES.map((r) => (
                <button key={r.id} className={`chip amber ${st.race === r.id ? 'on' : ''}`}
                  onClick={() => set({ race: st.race === r.id ? null : r.id })}>
                  <span className="chip-em">{r.icon}</span>{r.name}
                </button>
              ))}
            </div>
          </Disclosure>

          <Disclosure title="Tags" count={st.tags ? st.tags.size : 0} defaultOpen={false}>
            <div className="chips">
              {F.AUTO_TAGS.map((t) => (
                <button key={t} className={`chip ${st.tags && st.tags.has(t) ? 'on' : ''}`}
                  onClick={() => { const n = new Set(st.tags); n.has(t) ? n.delete(t) : n.add(t); set({ tags: n }); }}>{t}</button>
              ))}
            </div>
          </Disclosure>

          <Disclosure title="Garage status" count={st.owned !== 'all' ? 1 : 0}>
            <Segmented value={st.owned} onChange={(v) => set({ owned: v })}
              options={[{ value: 'all', label: 'All' }, { value: 'owned', label: 'Owned' }, { value: 'not-owned', label: 'Not owned' }]} />
          </Disclosure>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VARIANT B — Faceted list with live result counts
  // ════════════════════════════════════════════════════════════════════════════
  function FacetRow({ label, count, active, onClick, swatch }) {
    return (
      <button className={`facet ${active ? 'on' : ''}`} onClick={onClick} disabled={count === 0 && !active}>
        <span className="facet-box">{active && <span className="facet-tick" />}</span>
        {swatch && <span className="facet-sw" style={{ background: swatch.bg, color: swatch.fg }}>{swatch.label}</span>}
        <span className="facet-label">{label}</span>
        <span className="facet-count">{count}</span>
      </button>
    );
  }
  function SidebarB({ st, set, cars }) {
    const toggleTag = (t) => { const n = new Set(st.tags); n.has(t) ? n.delete(t) : n.add(t); set({ tags: n }); };
    return (
      <div className="side side-b">
        <FilterHeader st={st} set={set} />
        <SideSearch st={st} set={set} />
        <ActivePills st={st} set={set} />
        <div className="side-scroll">
          <Disclosure title="Vehicle class" count={st.piClass ? 1 : 0}>
            {F.PI_CLASSES.map((c) => (
              <FacetRow key={c.id} label={`Class ${c.id}`} swatch={c}
                count={countWith(cars, st, { piClass: c.id })}
                active={st.piClass === c.id}
                onClick={() => set({ piClass: st.piClass === c.id ? '' : c.id })} />
            ))}
          </Disclosure>

          <Disclosure title="Category" count={st.groupId ? 1 : 0}>
            {F.DIVISION_GROUPS.map((g) => (
              <FacetRow key={g.id} label={`${g.icon}  ${g.name}`}
                count={countWith(cars, st, { groupId: g.id, division: '' })}
                active={st.groupId === g.id}
                onClick={() => set({ groupId: st.groupId === g.id ? null : g.id, division: '' })} />
            ))}
          </Disclosure>

          <Disclosure title="Drivetrain" count={st.drivetrain ? 1 : 0}>
            {F.DRIVETRAINS.map((d) => (
              <FacetRow key={d} label={d}
                count={countWith(cars, st, { drivetrain: d })}
                active={st.drivetrain === d}
                onClick={() => set({ drivetrain: st.drivetrain === d ? '' : d })} />
            ))}
          </Disclosure>

          <Disclosure title="Make" count={st.make ? 1 : 0} defaultOpen={false}>
            {F.MAKES.map((m) => (
              <FacetRow key={m} label={m}
                count={countWith(cars, st, { make: m })}
                active={st.make === m}
                onClick={() => set({ make: st.make === m ? '' : m })} />
            ))}
          </Disclosure>

          <Disclosure title="Source" count={st.source ? 1 : 0} defaultOpen={false}>
            {F.SOURCE_CHIPS.map((s) => (
              <FacetRow key={s.match} label={s.label}
                count={countWith(cars, st, { source: s.match })}
                active={st.source === s.match}
                onClick={() => set({ source: st.source === s.match ? '' : s.match })} />
            ))}
          </Disclosure>

          <Disclosure title="Tags" count={st.tags ? st.tags.size : 0} defaultOpen={false}>
            {F.AUTO_TAGS.map((t) => (
              <FacetRow key={t} label={t}
                count={countWith(cars, st, { tags: new Set([...(st.tags || []), t]) })}
                active={st.tags && st.tags.has(t)}
                onClick={() => toggleTag(t)} />
            ))}
          </Disclosure>

          <Disclosure title="Garage status" count={st.owned !== 'all' ? 1 : 0}>
            {[{ v: 'owned', l: 'Owned' }, { v: 'not-owned', l: 'Not owned' }].map((o) => (
              <FacetRow key={o.v} label={o.l}
                count={countWith(cars, st, { owned: o.v })}
                active={st.owned === o.v}
                onClick={() => set({ owned: st.owned === o.v ? 'all' : o.v })} />
            ))}
          </Disclosure>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VARIANT C — Compact primary + "More filters" drawer
  // ════════════════════════════════════════════════════════════════════════════
  function SidebarC({ st, set, cars, page }) {
    const [moreOpen, setMoreOpen] = useState(false);
    const grp = st.groupId ? F.DIVISION_GROUPS.find((g) => g.id === st.groupId) : null;
    const isGarage = page === 'garage';
    // owned/not is redundant on the garage page — they're already viewing owned cars
    const moreCount = (st.country ? 1 : 0) + (st.source ? 1 : 0) + (st.tags ? st.tags.size : 0) + (st.make ? 1 : 0) + (st.drivetrain ? 1 : 0);
    return (
      <div className="side side-c">
        <FilterHeader st={st} set={set} />
        <ActivePills st={st} set={set} />
        <div className="side-scroll">
          {/* primary, always visible */}
          <div className="c-block">
            <div className="c-label">Class</div>
            <ClassChips st={st} set={set} />
          </div>
          <div className="c-block">
            <div className="c-label">Category</div>
            <div className="chips">
              {F.DIVISION_GROUPS.map((g) => (
                <button key={g.id} className={`chip ${st.groupId === g.id ? 'on' : ''}`}
                  onClick={() => set({ groupId: st.groupId === g.id ? null : g.id, division: '' })}>
                  <span className="chip-em">{g.icon}</span>{g.name}
                </button>
              ))}
            </div>
            {grp && (
              <div className="subchips">
                {grp.divisions.filter((d) => F.DIVISIONS.includes(d)).map((d) => (
                  <button key={d} className={`subchip ${st.division === d ? 'on' : ''}`}
                    onClick={() => set({ division: st.division === d ? '' : d })}>{d}</button>
                ))}
              </div>
            )}
          </div>
          <div className="c-block">
            <div className="c-label">Race type</div>
            <div className="chips">
              {F.RACE_TYPES.map((r) => (
                <button key={r.id} className={`chip amber ${st.race === r.id ? 'on' : ''}`}
                  onClick={() => set({ race: st.race === r.id ? null : r.id })}>
                  <span className="chip-em">{r.icon}</span>{r.name}
                </button>
              ))}
            </div>
          </div>
          {!isGarage && (
            <div className="c-block">
              <div className="c-label">Garage status</div>
              <Segmented value={st.owned} onChange={(v) => set({ owned: v })}
                options={[{ value: 'all', label: 'All' }, { value: 'owned', label: 'Owned' }, { value: 'not-owned', label: 'Not owned' }]} />
            </div>
          )}

          {/* secondary, behind a disclosure */}
          <button className={`more-btn ${moreOpen ? 'open' : ''}`} onClick={() => setMoreOpen(!moreOpen)}>
            <SvgChevron open={moreOpen} /> More filters {moreCount > 0 && <span className="disc-badge">{moreCount}</span>}
          </button>
          {moreOpen && (
            <div className="more-body">
              <div className="c-block">
                <div className="c-label">Make</div>
                <select className="c-select" value={st.make} onChange={(e) => set({ make: e.target.value })}>
                  <option value="">All makes</option>
                  {F.MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="c-block">
                <div className="c-label">Drivetrain</div>
                <Segmented value={st.drivetrain} onChange={(v) => set({ drivetrain: st.drivetrain === v ? '' : v })}
                  options={F.DRIVETRAINS.map((d) => ({ value: d, label: d }))} />
              </div>
              <div className="c-block">
                <div className="c-label">Country</div>
                <select className="c-select" value={st.country} onChange={(e) => set({ country: e.target.value })}>
                  <option value="">All countries</option>
                  {F.COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="c-block">
                <div className="c-label">Source</div>
                <div className="chips">
                  {F.SOURCE_CHIPS.map((s) => (
                    <button key={s.match} className={`chip ${st.source === s.match ? 'on' : ''}`}
                      onClick={() => set({ source: st.source === s.match ? '' : s.match })}>{s.label}</button>
                  ))}
                </div>
              </div>
              <div className="c-block">
                <div className="c-label">Tags</div>
                <div className="chips">
                  {F.AUTO_TAGS.map((t) => (
                    <button key={t} className={`chip ${st.tags && st.tags.has(t) ? 'on' : ''}`}
                      onClick={() => { const n = new Set(st.tags); n.has(t) ? n.delete(t) : n.add(t); set({ tags: n }); }}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  window.FZ = Object.assign(window.FZ || {}, { SidebarA, SidebarB, SidebarC });
})();
