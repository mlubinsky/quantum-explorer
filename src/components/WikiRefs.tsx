type WikiLink = { label: string; url: string }

export function WikiRefs({ links }: { links: WikiLink[] }) {
  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '0.6rem', borderTop: '1px solid #2a2a2a' }}>
      <span style={{
        fontSize: '0.72rem', color: '#555', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        References
      </span>
      <ul style={{ margin: '0.35rem 0 0', padding: 0, listStyle: 'none' }}>
        {links.map(({ label, url }) => (
          <li key={url} style={{ marginBottom: '0.2rem' }}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#7eb8f7', fontSize: '0.82rem', textDecoration: 'none' }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e  => (e.currentTarget.style.textDecoration = 'none')}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
