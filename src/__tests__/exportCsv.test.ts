import { describe, it, expect, vi, afterEach } from 'vitest'
import { csvCell, buildCsvString, csvFilename, CSV_HEADERS } from '@/lib/exportCsv'
import type { Car } from '@/types/car'

// ─── Minimal car factory ──────────────────────────────────────────────────────

function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    id: 1,
    year: 2020,
    make: 'Ford',
    model: 'GT',
    division: 'Modern Supercars',
    piClass: 'S2',
    piRating: 900,
    country: 'USA',
    value: 500000,
    drivetrain: null, engineType: null, engineCC: null, cylinders: null,
    bodyStyle: null, statSpeed: null, statHandling: null,
    statAcceleration: null, statLaunch: null, statBraking: null,
    statOffroad: null, powerHp: null, torqueFtLb: null, weightLb: null,
    frontWeight: null, displacementL: null, rarity: null,
    source: 'Autoshow', sourceInfo: null, owned: true,
    ...overrides,
  }
}

// Column index helper — keeps tests resilient to column reordering
const col = (header: typeof CSV_HEADERS[number]) =>
  (CSV_HEADERS as readonly string[]).indexOf(header)

// ─── csvCell — null / undefined ───────────────────────────────────────────────

describe('csvCell — null and undefined', () => {
  it('returns empty string for null', () => {
    expect(csvCell(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(csvCell(undefined)).toBe('')
  })
})

// ─── csvCell — plain values ───────────────────────────────────────────────────

describe('csvCell — plain values', () => {
  it('returns a plain string unchanged', () => {
    expect(csvCell('Autoshow')).toBe('Autoshow')
  })

  it('converts a number to string', () => {
    expect(csvCell(2020)).toBe('2020')
  })

  it('returns zero as "0"', () => {
    expect(csvCell(0)).toBe('0')
  })
})

// ─── csvCell — RFC 4180 quoting ───────────────────────────────────────────────

describe('csvCell — RFC 4180 quoting', () => {
  it('wraps a value containing a comma in double-quotes', () => {
    expect(csvCell('Autoshow, DLC')).toBe('"Autoshow, DLC"')
  })

  it('wraps a value containing a double-quote and escapes it by doubling', () => {
    expect(csvCell('He said "hello"')).toBe('"He said ""hello"""')
  })

  it('wraps a value containing a newline in double-quotes', () => {
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"')
  })

  it('a plain string with no special characters is not quoted', () => {
    const result = csvCell('Modern Supercars')
    expect(result.startsWith('"')).toBe(false)
  })
})

// ─── csvCell — injection sanitisation ────────────────────────────────────────

describe('csvCell — CSV injection sanitisation', () => {
  it('prepends a single quote to a value starting with =', () => {
    expect(csvCell('=HYPERLINK("evil")')).toBe('"\'=HYPERLINK(""evil"")"')
    expect(csvCell('=HYPERLINK("evil")')).toMatch(/^"'=/)
  })

  it('prepends a single quote to a value starting with +', () => {
    expect(csvCell('+1234')).toBe("'+1234")
  })

  it('prepends a single quote to a value starting with -', () => {
    expect(csvCell('-1234')).toBe("'-1234")
  })

  it('prepends a single quote to a value starting with @', () => {
    expect(csvCell('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)")
  })

  it('a value that does NOT start with a dangerous char is not sanitised', () => {
    expect(csvCell('Autoshow')).toBe('Autoshow')
    expect(csvCell('Ford')).toBe('Ford')
  })

  it('injection sanitisation + comma: prefixes quote then wraps in CSV quotes', () => {
    expect(csvCell('=SUM(A,B)')).toBe('"\'=SUM(A,B)"')
  })
})

// ─── buildCsvString — headers ─────────────────────────────────────────────────

describe('buildCsvString — column headers', () => {
  it('headers match CSV_HEADERS constant exactly', () => {
    const csv = buildCsvString([])
    const firstLine = csv.split('\r\n')[0]
    expect(firstLine).toBe(CSV_HEADERS.join(','))
  })

  it('header row has the same number of columns as CSV_HEADERS', () => {
    const firstLine = buildCsvString([]).split('\r\n')[0]
    expect(firstLine.split(',').length).toBe(CSV_HEADERS.length)
  })

  it('Year is the first header', () => {
    const headers = buildCsvString([]).split('\r\n')[0].split(',')
    expect(headers[0]).toBe('Year')
  })

  it('Tags is the last header', () => {
    const headers = buildCsvString([]).split('\r\n')[0].split(',')
    expect(headers[headers.length - 1]).toBe('Tags')
  })
})

// ─── buildCsvString — empty input ────────────────────────────────────────────

describe('buildCsvString — empty input', () => {
  it('empty array returns headers only with no trailing newline after them', () => {
    const csv = buildCsvString([])
    expect(csv).toBe(CSV_HEADERS.join(','))
  })

  it('empty array produces no data rows', () => {
    const lines = buildCsvString([]).split('\r\n')
    expect(lines).toHaveLength(1)
  })

  it('does not throw on empty input', () => {
    expect(() => buildCsvString([])).not.toThrow()
  })
})

// ─── buildCsvString — single car ─────────────────────────────────────────────

describe('buildCsvString — single car', () => {
  it('produces headers plus exactly one data row', () => {
    const lines = buildCsvString([makeCar()]).split('\r\n')
    expect(lines).toHaveLength(2)
  })

  it('data row columns match the car fields in header order', () => {
    const car = makeCar({
      year: 2019, make: 'Porsche', model: '911 GT3',
      division: 'Modern Sports Cars', piClass: 'S1',
      piRating: 826, country: 'Germany', value: 250000,
    })
    const cells = buildCsvString([car]).split('\r\n')[1].split(',')
    expect(cells[col('Year')]).toBe('2019')
    expect(cells[col('Make')]).toBe('Porsche')
    expect(cells[col('Model')]).toBe('911 GT3')
    expect(cells[col('Division')]).toBe('Modern Sports Cars')
    expect(cells[col('Class')]).toBe('S1')
    expect(cells[col('PI')]).toBe('826')
    expect(cells[col('Country')]).toBe('Germany')
    expect(cells[col('Value (Cr)')]).toBe('250000')
  })

  it('the data row has the same number of columns as the header', () => {
    const lines = buildCsvString([makeCar()]).split('\r\n')
    expect(lines[1].split(',').length).toBe(CSV_HEADERS.length)
  })
})

// ─── buildCsvString — null value field ───────────────────────────────────────

describe('buildCsvString — null value (credits)', () => {
  it('null value field produces a blank cell, not "null" or "0"', () => {
    const cells = buildCsvString([makeCar({ value: null })]).split('\r\n')[1].split(',')
    expect(cells[col('Value (Cr)')]).toBe('')
  })

  it('null value cell is not the string "null"', () => {
    const cells = buildCsvString([makeCar({ value: null })]).split('\r\n')[1].split(',')
    expect(cells[col('Value (Cr)')]).not.toBe('null')
  })

  it('null value cell is not "0"', () => {
    const cells = buildCsvString([makeCar({ value: null })]).split('\r\n')[1].split(',')
    expect(cells[col('Value (Cr)')]).not.toBe('0')
  })

  it('zero value is preserved as "0", not treated as null', () => {
    const cells = buildCsvString([makeCar({ value: 0 })]).split('\r\n')[1].split(',')
    expect(cells[col('Value (Cr)')]).toBe('0')
  })
})

// ─── buildCsvString — garage-specific fields ─────────────────────────────────

describe('buildCsvString — garage metadata fields', () => {
  it('pinned true outputs "true"', () => {
    const cells = buildCsvString([makeCar({ pinned: true })]).split('\r\n')[1].split(',')
    expect(cells[col('Pinned')]).toBe('true')
  })

  it('pinned false outputs "false"', () => {
    const cells = buildCsvString([makeCar({ pinned: false })]).split('\r\n')[1].split(',')
    expect(cells[col('Pinned')]).toBe('false')
  })

  it('pinned undefined outputs empty string', () => {
    const cells = buildCsvString([makeCar()]).split('\r\n')[1].split(',')
    expect(cells[col('Pinned')]).toBe('')
  })

  it('tags array joined with semicolons', () => {
    const cells = buildCsvString([makeCar({ tags: ['drift', 'tuned'] })]).split('\r\n')[1].split(',')
    expect(cells[col('Tags')]).toBe('drift; tuned')
  })

  it('undefined tags outputs empty string', () => {
    const cells = buildCsvString([makeCar()]).split('\r\n')[1].split(',')
    expect(cells[col('Tags')]).toBe('')
  })

  it('addedAt ISO string is preserved', () => {
    const cells = buildCsvString([makeCar({ addedAt: '2026-01-15T10:00:00.000Z' })]).split('\r\n')[1].split(',')
    expect(cells[col('Added At')]).toBe('2026-01-15T10:00:00.000Z')
  })
})

// ─── buildCsvString — stat overrides ─────────────────────────────────────────

describe('buildCsvString — stat overrides', () => {
  it('stat override is written to the override column, not the base stat column', () => {
    const car = makeCar({ statSpeed: 7, statSpeedOverride: 9 })
    const cells = buildCsvString([car]).split('\r\n')[1].split(',')
    expect(cells[col('Speed')]).toBe('7')
    expect(cells[col('Speed Override')]).toBe('9')
  })

  it('null override outputs empty string', () => {
    const car = makeCar({ statSpeedOverride: null })
    const cells = buildCsvString([car]).split('\r\n')[1].split(',')
    expect(cells[col('Speed Override')]).toBe('')
  })
})

// ─── buildCsvString — comma in field value ────────────────────────────────────

describe('buildCsvString — comma in field value', () => {
  it('a make containing a comma is wrapped in double-quotes', () => {
    const car = makeCar({ make: 'Ford, Co.' })
    const line = buildCsvString([car]).split('\r\n')[1]
    expect(line).toContain('"Ford, Co."')
  })

  it('a division containing a comma does not break column alignment', () => {
    const car = makeCar({ division: 'Pickups & 4x4s, Offroad' })
    const lines = buildCsvString([car]).split('\r\n')
    expect(lines[1].startsWith('2020,')).toBe(true)
    expect(lines[1]).toContain('500000')
  })
})

// ─── buildCsvString — double-quote in field value ─────────────────────────────

describe('buildCsvString — double-quote in field value', () => {
  it('a model containing a double-quote has it escaped by doubling', () => {
    const car = makeCar({ model: 'GT "Le Mans"' })
    const line = buildCsvString([car]).split('\r\n')[1]
    expect(line).toContain('"GT ""Le Mans"""')
  })
})

// ─── buildCsvString — injection sanitisation ─────────────────────────────────

describe('buildCsvString — injection sanitisation in full rows', () => {
  it('a make starting with = has a single quote prepended in the output', () => {
    const car = makeCar({ make: '=EVIL()' })
    const line = buildCsvString([car]).split('\r\n')[1]
    expect(line).toContain("'=EVIL()")
  })

  it('a make starting with + has a single quote prepended', () => {
    const car = makeCar({ make: '+BadMake' })
    const line = buildCsvString([car]).split('\r\n')[1]
    expect(line).toContain("'+BadMake")
  })

  it('a model starting with - has a single quote prepended', () => {
    const car = makeCar({ model: '-BadModel' })
    const line = buildCsvString([car]).split('\r\n')[1]
    expect(line).toContain("'-BadModel")
  })

  it('a division starting with @ has a single quote prepended', () => {
    const car = makeCar({ division: '@Division' })
    const line = buildCsvString([car]).split('\r\n')[1]
    expect(line).toContain("'@Division")
  })
})

// ─── buildCsvString — line endings ───────────────────────────────────────────

describe('buildCsvString — line endings', () => {
  it('rows are separated by \\r\\n (RFC 4180)', () => {
    const csv = buildCsvString([makeCar(), makeCar({ id: 2, make: 'Porsche' })])
    expect(csv).toContain('\r\n')
  })

  it('does not use bare \\n line endings', () => {
    const csv = buildCsvString([makeCar()])
    const bareNewlines = csv.match(/(?<!\r)\n/g)
    expect(bareNewlines).toBeNull()
  })

  it('two cars produce two \\r\\n-separated data rows after the header', () => {
    const csv = buildCsvString([makeCar({ id: 1 }), makeCar({ id: 2, make: 'BMW' })])
    const lines = csv.split('\r\n')
    expect(lines).toHaveLength(3)
  })
})

// ─── buildCsvString — multiple cars ──────────────────────────────────────────

describe('buildCsvString — multiple cars', () => {
  it('produces N+1 lines for N cars (header + one row per car)', () => {
    const cars = [makeCar({ id: 1 }), makeCar({ id: 2 }), makeCar({ id: 3 })]
    expect(buildCsvString(cars).split('\r\n')).toHaveLength(4)
  })

  it('each row corresponds to the correct car (order preserved)', () => {
    const cars = [
      makeCar({ id: 1, make: 'Ford',    year: 2020 }),
      makeCar({ id: 2, make: 'Porsche', year: 2019 }),
      makeCar({ id: 3, make: 'Bugatti', year: 2018 }),
    ]
    const lines = buildCsvString(cars).split('\r\n')
    expect(lines[1]).toContain('Ford')
    expect(lines[2]).toContain('Porsche')
    expect(lines[3]).toContain('Bugatti')
  })
})

// ─── csvFilename ──────────────────────────────────────────────────────────────

describe('csvFilename', () => {
  afterEach(() => vi.useRealTimers())

  it('returns a filename matching forza-garage-YYYY-MM-DD.csv', () => {
    expect(csvFilename(new Date('2026-06-04T12:00:00.000Z'))).toBe('forza-garage-2026-06-04.csv')
  })

  it('matches the pattern forza-garage-YYYY-MM-DD.csv', () => {
    expect(csvFilename(new Date('2025-01-15T00:00:00.000Z'))).toMatch(
      /^forza-garage-\d{4}-\d{2}-\d{2}\.csv$/
    )
  })

  it('uses today\'s date when no argument is passed', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-04T09:00:00.000Z'))
    expect(csvFilename()).toBe('forza-garage-2026-06-04.csv')
  })

  it('zero-pads single-digit months and days', () => {
    expect(csvFilename(new Date('2026-01-05T00:00:00.000Z'))).toBe('forza-garage-2026-01-05.csv')
  })
})
