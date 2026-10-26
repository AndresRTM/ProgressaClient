import { formatTime } from './formatTime'

function UnitChoice({ label, field, options, value, onChange }) {
  return (
    <div className="unit-row">
      <span>{label}</span>
      <div className="unit-options" role="group" aria-label={label}>
        {options.map(([id, text]) => (
          <button
            key={id}
            type="button"
            aria-pressed={value[field] === id}
            onClick={() => onChange({ [field]: id })}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function UnitsSettings({ value, onChange }) {
  const distance = value.distance === 'mi' ? '3.2 mi' : '5.2 km'
  const energy = value.energy === 'kj' ? '1757 kJ' : '420 kcal'
  return (
    <div className="settings-sections">
      <section className="settings-card units-card" aria-label="Measurements">
        <h2 className="settings-section-label">Measurements</h2>
        <UnitChoice
          label="Distance"
          field="distance"
          options={[
            ['km', 'km'],
            ['mi', 'mi'],
          ]}
          value={value}
          onChange={onChange}
        />
        <UnitChoice
          label="Weight"
          field="weight"
          options={[
            ['kg', 'kg'],
            ['lb', 'lb'],
          ]}
          value={value}
          onChange={onChange}
        />
        <UnitChoice
          label="Energy"
          field="energy"
          options={[
            ['kcal', 'kcal'],
            ['kj', 'kJ'],
          ]}
          value={value}
          onChange={onChange}
        />
        <UnitChoice
          label="Height"
          field="height"
          options={[
            ['cm', 'cm'],
            ['ft', 'ft & in'],
          ]}
          value={value}
          onChange={onChange}
        />
      </section>
      <section className="settings-card units-card" aria-label="Calendar and time">
        <h2 className="settings-section-label">Calendar and time</h2>
        <UnitChoice
          label="Week starts on"
          field="weekStart"
          options={[
            ['mon', 'Mon'],
            ['sun', 'Sun'],
          ]}
          value={value}
          onChange={onChange}
        />
        <UnitChoice
          label="Time format"
          field="timeFormat"
          options={[
            ['24h', '24 h'],
            ['12h', '12 h'],
          ]}
          value={value}
          onChange={onChange}
        />
      </section>
      <section className="settings-card units-example" aria-label="Measurement example">
        <h2 className="settings-section-label">Example</h2>
        <p>
          Running · {distance} · 30 min · {energy}
          <br />
          Protein 128 g · Sleep 7 h 30 min
        </p>
        <span className="sr-only">Example time: {formatTime('17:30', value.timeFormat)}</span>
      </section>
    </div>
  )
}
