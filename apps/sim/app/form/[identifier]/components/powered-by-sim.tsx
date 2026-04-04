export function PoweredBySim() {

  return (
    <div
      className={
        'fixed right-0 bottom-0 left-0 z-50 pb-8 text-center font-[340] text-[var(--landing-text-muted)] text-small leading-relaxed'
      }
    >
      <a
        href='https://auto2.garza-os.com'
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center gap-1.5 transition hover:opacity-80'
      >
        <span>Powered by</span>
        <span className='font-semibold text-[14px]'>Garza OS</span>
      </a>
    </div>
  )
}
